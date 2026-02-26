const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateCsrfToken } = require('../utils/csrf');
const {
  sanitizeText,
  normalizeEmail,
  isStrongPassword,
  isInEnum,
} = require('../utils/validation');

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const buildToken = (userId, tokenVersion) =>
  jwt.sign({ id: userId, tv: Number(tokenVersion || 0) }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

const buildCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

const setAuthCookie = (res, token) => {
  res.cookie('token', token, buildCookieOptions());
};

const sendAuthResponse = (res, user, statusCode = 200) => {
  const token = buildToken(user._id, user.tokenVersion);
  const csrfToken = generateCsrfToken(user);
  setAuthCookie(res, token);

  res.status(statusCode).json({
    success: true,
    user: sanitizeUser(user),
    csrfToken,
  });
};

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  age: user.age,
  role: user.role,
  phone: user.phone,
  bloodGroup: user.bloodGroup,
  location: user.location,
  isAvailable: user.isAvailable,
  lastDonationDate: user.lastDonationDate,
  totalDonations: user.totalDonations,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const register = asyncHandler(async (req, res) => {
  const { name, email, password, age, role, phone, bloodGroup, location } = req.body;

  const cleanName = sanitizeText(name, { maxLength: 80 });
  const cleanEmail = normalizeEmail(email);
  const cleanPhone = sanitizeText(phone, { maxLength: 20 });
  const cleanLocation = sanitizeText(location, { maxLength: 120 });
  const normalizedAge = Number(age);

  if (!cleanName || !cleanEmail || !password || !normalizedAge || !cleanPhone || !bloodGroup || !cleanLocation) {
    res.status(400);
    throw new Error('All required fields must be provided');
  }

  if (!isInEnum(bloodGroup, BLOOD_GROUPS)) {
    res.status(400);
    throw new Error('Invalid blood group');
  }

  if (normalizedAge < 18 || normalizedAge > 65) {
    res.status(400);
    throw new Error('Age must be between 18 and 65');
  }

  if (!isStrongPassword(password)) {
    res.status(400);
    throw new Error('Password must be at least 8 characters and include letters and numbers');
  }

  const normalizedRole = role === 'hospital' ? 'hospital' : 'user';

  const existingUser = await User.findOne({ email: cleanEmail });
  if (existingUser) {
    res.status(409);
    throw new Error('Email is already registered');
  }

  const user = await User.create({
    name: cleanName,
    email: cleanEmail,
    password,
    age: normalizedAge,
    role: normalizedRole,
    phone: cleanPhone,
    bloodGroup,
    location: cleanLocation,
  });

  sendAuthResponse(res, user, 201);
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const cleanEmail = normalizeEmail(email);

  if (!cleanEmail || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }

  const user = await User.findOne({ email: cleanEmail }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  sendAuthResponse(res, user);
});

const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.token;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      await User.findByIdAndUpdate(decoded.id, { $inc: { tokenVersion: 1 } });
    } catch (error) {
      // Ignore invalid tokens during logout and continue cookie cleanup
    }
  }

  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });

  res.json({ success: true, message: 'Logged out successfully' });
});

const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json({
    success: true,
    user: sanitizeUser(user),
    csrfToken: generateCsrfToken(user),
  });
});

const getCsrfToken = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json({
    success: true,
    csrfToken: generateCsrfToken(user),
  });
});

const updateAvailability = asyncHandler(async (req, res) => {
  if (req.user.role !== 'user') {
    res.status(403);
    throw new Error('Only donors can update availability');
  }

  const { isAvailable } = req.body;

  if (typeof isAvailable !== 'boolean') {
    res.status(400);
    throw new Error('isAvailable must be a boolean value');
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { isAvailable },
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    user: sanitizeUser(updatedUser),
    csrfToken: generateCsrfToken(updatedUser),
  });
});

module.exports = {
  register,
  login,
  logout,
  getProfile,
  getCsrfToken,
  updateAvailability,
};