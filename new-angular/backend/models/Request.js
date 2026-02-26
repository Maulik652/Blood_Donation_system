const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },

    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    bloodGroup: {
      type: String,
      required: [true, 'Please specify blood group'],
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },

    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed'],
      default: 'pending'
    },

    urgency: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium'
    },

    message: {
      type: String,
      required: [true, 'Please add a message']
    },

    /* ✅ ENTERPRISE TRACKING */
    acceptedAt: {
      type: Date,
      default: null
    },

    completedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Request', requestSchema);