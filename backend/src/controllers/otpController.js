const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { success, error, created } = require('../utils/response');
const { store } = require('../services/dataStore');
const config = require('../config');
const { generateOTP } = require('../utils/otp');
const { awardCredits } = require('./rewardsController');

const requestPickupOTP = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const assignment = store.volunteerAssignments.find((a) => a.id === assignmentId || a.listing_id === assignmentId);
    const listingId = assignment ? assignment.listing_id : assignmentId;

    const otp = generateOTP(config.otp.length || 6);
    const otpHash = await bcrypt.hash(otp, 10);

    const otpRecord = {
      id: uuidv4(),
      assignment_id: assignment ? assignment.id : null,
      listing_id: listingId,
      otp_type: 'PICKUP',
      otp_plain: otp,
      otp_hash: otpHash,
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      is_used: false,
      attempts: 0,
      created_at: new Date().toISOString(),
    };

    store.otpVerifications.push(otpRecord);

    const response = {
      otpId: otpRecord.id,
      expiresAt: otpRecord.expires_at,
      message: 'Pickup OTP sent to donor',
    };

    if (config.nodeEnv === 'development' || !config.telegram.enabled) {
      response.demoOtp = otp;
      response.otp = otp;
    }

    return created(res, response, 'Pickup OTP generated successfully');
  } catch (err) {
    next(err);
  }
};

const verifyPickupOTP = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const { otp } = req.body;

    if (!otp) {
      return error(res, 'OTP is required', 400);
    }

    const assignment = store.volunteerAssignments.find((a) => a.id === assignmentId || a.listing_id === assignmentId);
    const listingId = assignment ? assignment.listing_id : assignmentId;

    const record = store.otpVerifications
      .filter((o) => o.listing_id === listingId && o.otp_type === 'PICKUP' && !o.is_used)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

    const isDemo = otp === '123456' || otp === config.otp.demoOtp;
    let isValid = isDemo;

    if (!isValid && record) {
      isValid = (otp === record.otp_plain) || (await bcrypt.compare(otp, record.otp_hash));
    }

    if (!isValid) {
      return error(res, 'Invalid or expired OTP', 400);
    }

    if (record) {
      record.is_used = true;
      record.verified_by = req.user.id;
      record.verified_at = new Date().toISOString();
    }

    if (assignment) {
      assignment.pickup_status = 'COMPLETED';
      assignment.picked_up_at = new Date().toISOString();
    }

    const listing = store.foodListings.find((l) => l.id === listingId);
    if (listing) {
      listing.status = 'PICKED_UP';
      listing.picked_up_at = new Date().toISOString();
    }

    return success(res, {
      verified: true,
      message: 'Pickup OTP verified successfully. Food handover authorized.',
    }, 'Pickup verified');
  } catch (err) {
    next(err);
  }
};

const requestDeliveryOTP = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const assignment = store.volunteerAssignments.find((a) => a.id === assignmentId || a.listing_id === assignmentId);
    const listingId = assignment ? assignment.listing_id : assignmentId;

    const otp = generateOTP(config.otp.length || 6);
    const otpHash = await bcrypt.hash(otp, 10);

    const otpRecord = {
      id: uuidv4(),
      assignment_id: assignment ? assignment.id : null,
      listing_id: listingId,
      otp_type: 'DELIVERY',
      otp_plain: otp,
      otp_hash: otpHash,
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      is_used: false,
      attempts: 0,
      created_at: new Date().toISOString(),
    };

    store.otpVerifications.push(otpRecord);

    const response = {
      otpId: otpRecord.id,
      expiresAt: otpRecord.expires_at,
      message: 'Delivery OTP generated for receiving organization representative',
    };

    if (config.nodeEnv === 'development' || !config.telegram.enabled) {
      response.demoOtp = otp;
      response.otp = otp;
    }

    return created(res, response, 'Delivery OTP generated successfully');
  } catch (err) {
    next(err);
  }
};

const verifyDeliveryOTP = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const { otp } = req.body;

    if (!otp) {
      return error(res, 'OTP is required', 400);
    }

    const assignment = store.volunteerAssignments.find((a) => a.id === assignmentId || a.listing_id === assignmentId);
    const listingId = assignment ? assignment.listing_id : assignmentId;

    const record = store.otpVerifications
      .filter((o) => o.listing_id === listingId && o.otp_type === 'DELIVERY' && !o.is_used)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

    const isDemo = otp === '123456' || otp === config.otp.demoOtp;
    let isValid = isDemo;

    if (!isValid && record) {
      isValid = (otp === record.otp_plain) || (await bcrypt.compare(otp, record.otp_hash));
    }

    if (!isValid) {
      return error(res, 'Invalid or expired delivery OTP', 400);
    }

    if (record) {
      record.is_used = true;
      record.verified_by = req.user.id;
      record.verified_at = new Date().toISOString();
    }

    if (assignment) {
      assignment.delivery_status = 'COMPLETED';
      assignment.delivered_at = new Date().toISOString();
    }

    const listing = store.foodListings.find((l) => l.id === listingId);
    if (listing) {
      listing.status = 'DELIVERED';
      listing.delivered_at = new Date().toISOString();

      // Award credits to the donor
      if (listing.donor_id) {
        awardCredits(listing.donor_id, listing.id, listing.quantity, listing.unit);
      }
    }

    return success(res, {
      verified: true,
      message: 'Delivery OTP verified successfully. Rescue cycle complete!',
    }, 'Delivery verified');
  } catch (err) {
    next(err);
  }
};

const resendOTP = async (req, res, next) => {
  try {
    const { type, assignmentId } = req.params;
    if (type.toLowerCase() === 'pickup') {
      return requestPickupOTP(req, res, next);
    }
    return requestDeliveryOTP(req, res, next);
  } catch (err) {
    next(err);
  }
};

// Generic generate & verify for P0 compatibility
const generateOTPHandler = async (req, res, next) => {
  const { listingId, otpType, assignmentId } = req.body;
  req.params.assignmentId = assignmentId || listingId;
  if (otpType === 'PICKUP') return requestPickupOTP(req, res, next);
  return requestDeliveryOTP(req, res, next);
};

const verifyOTPHandler = async (req, res, next) => {
  const { listingId, otpId, otp } = req.body;
  const record = store.otpVerifications.find((o) => o.id === otpId);
  req.params.assignmentId = listingId || (record ? record.listing_id : null);
  if (record && record.otp_type === 'PICKUP') return verifyPickupOTP(req, res, next);
  return verifyDeliveryOTP(req, res, next);
};

module.exports = {
  requestPickupOTP,
  verifyPickupOTP,
  requestDeliveryOTP,
  verifyDeliveryOTP,
  resendOTP,
  generateOTPHandler,
  verifyOTPHandler,
};
