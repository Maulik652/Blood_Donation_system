const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const User = require('../models/User');
const Request = require('../models/Request');
const Event = require('../models/Event');

const parsePagination = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 50, 1), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

// @desc    Get all donors
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAllUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const [users, total] = await Promise.all([
    User.find({ role: 'user' }).select('-password').sort('-createdAt').skip(skip).limit(limit),
    User.countDocuments({ role: 'user' }),
  ]);

  res.json({
    success: true,
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// @desc    Get all hospitals
// @route   GET /api/admin/hospitals
// @access  Private (Admin)
const getAllHospitals = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const [hospitals, total] = await Promise.all([
    User.find({ role: 'hospital' }).select('-password').sort('-createdAt').skip(skip).limit(limit),
    User.countDocuments({ role: 'hospital' }),
  ]);

  res.json({
    success: true,
    hospitals,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// @desc    Get all requests
// @route   GET /api/admin/requests
// @access  Private (Admin)
const getAllRequests = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const [requests, total] = await Promise.all([
    Request.find()
      .populate('donor', 'name email phone')
      .populate('hospital', 'name email phone location')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit),
    Request.countDocuments(),
  ]);

  res.json({
    success: true,
    requests,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
const deleteUser = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid user id');
  }

  if (req.user._id.toString() === req.params.id) {
    res.status(400);
    throw new Error('Admin cannot delete own account');
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Don't allow deleting admins
  if (user.role === 'admin') {
    res.status(403);
    throw new Error('Cannot delete admin users');
  }

  const reconcileDeletion = async (session = null) => {
    const options = session ? { session } : undefined;

    if (user.role === 'hospital') {
      await Request.deleteMany({ hospital: user._id }, options);
    } else {
      await Request.updateMany(
        { donor: user._id, status: { $in: ['pending', 'accepted', 'rejected'] } },
        {
          $set: { donor: null, status: 'pending', acceptedAt: null, completedAt: null },
        },
        options
      );

      await Request.updateMany(
        { donor: user._id, status: 'completed' },
        { $set: { donor: null } },
        options
      );
    }

    await Event.updateMany(
      { registeredUsers: user._id },
      { $pull: { registeredUsers: user._id }, $inc: { registeredCount: -1 } },
      options
    );

    await Event.updateMany(
      { registeredCount: { $lt: 0 } },
      { $set: { registeredCount: 0 } },
      options
    );

    await user.deleteOne(options);
  };

  let completedWithTransaction = false;

  if (mongoose.connection.readyState === 1) {
    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        await reconcileDeletion(session);
      });
      completedWithTransaction = true;
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

  if (!completedWithTransaction) {
    await reconcileDeletion();
  }

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
});

// @desc    Get statistics
// @route   GET /api/admin/statistics
// @access  Private (Admin)
const getStatistics = asyncHandler(async (req, res) => {
  const totalDonors = await User.countDocuments({ role: 'user' });
  const totalHospitals = await User.countDocuments({ role: 'hospital' });
  const totalRequests = await Request.countDocuments();
  const acceptedRequests = await Request.countDocuments({ status: 'accepted' });

  res.json({
    success: true,
    statistics: {
      totalDonors,
      totalHospitals,
      totalRequests,
      acceptedRequests
    }
  });
});

module.exports = {
  getAllUsers,
  getAllHospitals,
  getAllRequests,
  deleteUser,
  getStatistics
};