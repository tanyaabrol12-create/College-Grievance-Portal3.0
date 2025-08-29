const mongoose = require('mongoose');

const PasswordResetSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  otp: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: Date.now,
    expires: 600 // Document expires after 10 minutes
  }
});

module.exports = mongoose.model('PasswordReset', PasswordResetSchema);
