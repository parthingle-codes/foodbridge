const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// Generate cryptographically secure OTP
const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    otp += digits[bytes[i] % 10];
  }
  return otp;
};

// Hash OTP before storage
const hashOTP = async (otp) => {
  return bcrypt.hash(otp, 10);
};

// Verify OTP against hash
const verifyOTP = async (otp, hash) => {
  return bcrypt.compare(otp, hash);
};

module.exports = { generateOTP, hashOTP, verifyOTP };
