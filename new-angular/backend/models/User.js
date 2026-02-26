const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },

    age: {
      type: Number,
      required: true,
      min: 18,
      max: 65,
    },

    role: {
      type: String,
      enum: ["user", "hospital", "admin"],
      default: "user",
    },

    phone: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      maxlength: 20,
    },

    bloodGroup: {
      type: String,
      required: true,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },

    location: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    lastDonationDate: {
      type: Date,
      default: null,
    },

    totalDonations: {
      type: Number,
      default: 0,
    },

    tokenVersion: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

userSchema.index({ role: 1, createdAt: -1 });
userSchema.index({ bloodGroup: 1, isAvailable: 1, role: 1 });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcryptjs.genSalt(10);
  this.password = await bcryptjs.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcryptjs.compare(enteredPassword, this.password);
};

module.exports = model('User', userSchema);