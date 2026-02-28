const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Request = require('../models/Request');
const User = require('../models/User');
const { sanitizeText, isInEnum } = require('../utils/validation');

const VALID_STATUSES = ['pending', 'accepted', 'rejected', 'completed'];
const VALID_URGENCY = ['Low', 'Medium', 'High', 'Critical'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const createRequest = asyncHandler(async (req, res) => {
  if (req.user.role !== 'hospital') {
    res.status(403);
    throw new Error('Only hospitals can create requests');
  }

  const { bloodGroup, urgency, message } = req.body;
  const cleanMessage = sanitizeText(message, { maxLength: 500 });

  if (!isInEnum(bloodGroup, BLOOD_GROUPS) || !cleanMessage) {
    res.status(400);
    throw new Error('Valid bloodGroup and message are required');
  }

  if (cleanMessage.length < 10) {
    res.status(400);
    throw new Error('Message must be at least 10 characters');
  }

  if (urgency && !isInEnum(urgency, VALID_URGENCY)) {
    res.status(400);
    throw new Error('Invalid urgency value');
  }

  const request = await Request.create({
    hospital: req.user._id,
    bloodGroup,
    urgency: urgency || 'Medium',
    message: cleanMessage,
  });

  const hydratedRequest = await Request.findById(request._id)
    .populate('hospital', 'name email phone location')
    .populate('donor', 'name email phone');

  res.status(201).json({ success: true, request: hydratedRequest });
});

const getMyRequests = asyncHandler(async (req, res) => {
  if (req.user.role !== 'hospital') {
    res.status(403);
    throw new Error('Only hospitals can view hospital requests');
  }

  const requests = await Request.find({ hospital: req.user._id })
    .populate('donor', 'name email phone')
    .sort('-createdAt');

  res.json({ success: true, requests });
});

const getHospitalInventory = asyncHandler(async (req, res) => {
  if (req.user.role !== 'hospital') {
    res.status(403);
    throw new Error('Only hospitals can view inventory');
  }

  const aggregated = await Request.aggregate([
    {
      $match: {
        hospital: req.user._id,
        status: 'completed',
      },
    },
    {
      $group: {
        _id: '$bloodGroup',
        units: { $sum: 1 },
      },
    },
  ]);

  const inventoryMap = new Map();
  BLOOD_GROUPS.forEach((group) => inventoryMap.set(group, 0));

  aggregated.forEach((item) => {
    inventoryMap.set(item._id, item.units || 0);
  });

  const inventory = BLOOD_GROUPS.map((bloodGroup) => ({
    bloodGroup,
    units: inventoryMap.get(bloodGroup) || 0,
  }));

  const totalUnits = inventory.reduce((sum, item) => sum + item.units, 0);

  res.json({
    success: true,
    inventory,
    summary: {
      totalUnits,
      completedRequests: totalUnits,
    },
  });
});

const getAvailableRequests = asyncHandler(async (req, res) => {
  if (req.user.role !== 'user') {
    res.status(403);
    throw new Error('Only donors can view available requests');
  }

  const requests = await Request.find({
    status: 'pending',
    donor: null,
    bloodGroup: req.user.bloodGroup,
  })
    .populate('hospital', 'name email phone location')
    .sort('-createdAt');

  res.json({ success: true, requests });
});

const updateRequestStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!VALID_STATUSES.includes(status)) {
    res.status(400);
    throw new Error('Invalid request status');
  }

  if (!isValidObjectId(req.params.id)) {
    res.status(400);
    throw new Error('Invalid request id');
  }

  const requestId = new mongoose.Types.ObjectId(req.params.id);

  if (req.user.role === 'user') {
    if (status !== 'accepted') {
      res.status(400);
      throw new Error('Donors can only accept pending requests');
    }

    if (!req.user.isAvailable) {
      res.status(400);
      throw new Error('Unavailable donors cannot accept requests');
    }

    if (req.user.lastDonationDate) {
      const lastDonationTime = new Date(req.user.lastDonationDate).getTime();
      const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;
      if (Date.now() - lastDonationTime < ninetyDaysMs) {
        res.status(400);
        throw new Error('Donor is not yet eligible based on last donation date');
      }
    }

    const acceptedRequest = await Request.findOneAndUpdate(
      {
        _id: requestId,
        status: 'pending',
        donor: null,
        bloodGroup: req.user.bloodGroup,
      },
      {
        $set: {
          status: 'accepted',
          donor: req.user._id,
          acceptedAt: new Date(),
          completedAt: null,
        },
      },
      { new: true }
    )
      .populate('donor', 'name email phone')
      .populate('hospital', 'name email phone location');

    if (!acceptedRequest) {
      const existingRequest = await Request.findById(requestId);
      if (!existingRequest) {
        res.status(404);
        throw new Error('Request not found');
      }

      if (existingRequest.bloodGroup !== req.user.bloodGroup) {
        res.status(400);
        throw new Error('Donor blood group does not match this request');
      }

      res.status(409);
      throw new Error('This request is no longer available');
    }

    res.json({ success: true, request: acceptedRequest });
    return;
  }

  if (req.user.role === 'hospital') {
    if (status !== 'completed') {
      res.status(400);
      throw new Error('Hospitals can only mark requests as completed');
    }

    const ensureCompletableRequest = async (session = null) => {
      const options = session ? { session } : undefined;
      const existing = await Request.findById(requestId, null, options);

      if (!existing) {
        res.status(404);
        throw new Error('Request not found');
      }

      if (existing.hospital.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('You can only update your own requests');
      }

      if (existing.status !== 'accepted' || !existing.donor) {
        res.status(409);
        throw new Error('Only accepted requests can be completed');
      }

      return existing;
    };

    const completeWithoutTransaction = async () => {
      const completedRequest = await Request.findOneAndUpdate(
        {
          _id: requestId,
          hospital: req.user._id,
          status: 'accepted',
          donor: { $ne: null },
        },
        {
          $set: {
            status: 'completed',
            completedAt: new Date(),
          },
        },
        { new: true }
      );

      if (!completedRequest) {
        await ensureCompletableRequest();
        res.status(409);
        throw new Error('Request completion conflict. Please retry');
      }

      try {
        const donorUpdate = await User.findByIdAndUpdate(
          completedRequest.donor,
          {
            $inc: { totalDonations: 1 },
            $set: { lastDonationDate: new Date() },
          },
          { new: true }
        );

        if (!donorUpdate) {
          throw new Error('Assigned donor not found');
        }
      } catch (error) {
        await Request.findByIdAndUpdate(completedRequest._id, {
          $set: { status: 'accepted', completedAt: null },
        });
        throw error;
      }
    };

    let transactionApplied = false;

    if (mongoose.connection.readyState === 1) {
      const session = await mongoose.startSession();

      try {
        await session.withTransaction(async () => {
          const request = await Request.findOneAndUpdate(
            {
              _id: requestId,
              hospital: req.user._id,
              status: 'accepted',
              donor: { $ne: null },
            },
            {
              $set: {
                status: 'completed',
                completedAt: new Date(),
              },
            },
            { new: true, session }
          );

          if (!request) {
            await ensureCompletableRequest(session);
            res.status(409);
            throw new Error('Request completion conflict. Please retry');
          }

          const donorUpdate = await User.findByIdAndUpdate(
            request.donor,
            {
              $inc: { totalDonations: 1 },
              $set: { lastDonationDate: new Date() },
            },
            { session, new: true }
          );

          if (!donorUpdate) {
            res.status(404);
            throw new Error('Assigned donor not found');
          }
        });

        transactionApplied = true;
      } catch (error) {
        const message = (error && error.message) || '';
        const transactionUnsupported =
          message.includes('Transaction numbers are only allowed on a replica set member or mongos') ||
          message.includes('Transaction is not supported');

        if (!transactionUnsupported) {
          throw error;
        }
      } finally {
        session.endSession();
      }
    }

    if (!transactionApplied) {
      await completeWithoutTransaction();
    }

    const updated = await Request.findById(requestId)
      .populate('donor', 'name email phone')
      .populate('hospital', 'name email phone location');

    res.json({ success: true, request: updated });
    return;
  }

  if (req.user.role === 'admin') {
    const request = await Request.findById(requestId);

    if (!request) {
      res.status(404);
      throw new Error('Request not found');
    }

    if (status === 'accepted' && !request.donor) {
      res.status(400);
      throw new Error('Accepted status requires an assigned donor');
    }

    if (status === 'completed' && !request.donor) {
      res.status(400);
      throw new Error('Completed status requires a donor');
    }

    request.status = status;

    if (status === 'accepted' && !request.acceptedAt) {
      request.acceptedAt = new Date();
    }
    if (status === 'completed') {
      request.completedAt = new Date();
    }
    if (status === 'pending') {
      request.donor = null;
      request.acceptedAt = null;
      request.completedAt = null;
    }

    await request.save();

    const updated = await Request.findById(request._id)
      .populate('donor', 'name email phone')
      .populate('hospital', 'name email phone location');

    res.json({ success: true, request: updated });
    return;
  }

  res.status(403);
  throw new Error('Not authorized to update request status');
});

const getDonationHistory = asyncHandler(async (req, res) => {
  if (req.user.role !== 'user') {
    res.status(403);
    throw new Error('Only donors can view donation history');
  }

  const requests = await Request.find({ donor: req.user._id })
    .populate('hospital', 'name email phone location')
    .sort('-updatedAt');

  res.json({ success: true, requests });
});

module.exports = {
  createRequest,
  getMyRequests,
  getHospitalInventory,
  getAvailableRequests,
  updateRequestStatus,
  getDonationHistory,
};