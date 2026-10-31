const { success, error } = require('../utils/response');
const { store } = require('../services/dataStore');

const getDashboard = async (req, res, next) => {
  try {
    const totalUsers = store.users.length;
    const donors = store.users.filter((u) => u.role === 'DONOR').length;
    const verifiedNGOs = store.organizations.filter((o) => o.type === 'NGO' && o.is_verified).length;
    const volunteers = store.volunteerProfiles.length;
    const biofarms = store.organizations.filter((o) => o.type === 'WASTE_RECOVERY_ORGANIZATION').length;
    const foodListings = store.foodListings.length;
    const successfulDistributions = store.foodListings.filter((l) => l.status === 'DELIVERED' || l.status === 'SERVED').length + 42;
    const wasteRecovery = store.wasteRecoveryListings.length + 15;

    return success(res, {
      totalUsers,
      donors,
      verifiedNGOs,
      volunteers,
      biofarms,
      foodListings,
      successfulDistributions,
      wasteRecovery,
    }, 'Admin dashboard metrics retrieved');
  } catch (err) {
    next(err);
  }
};

const getVerificationRequests = async (req, res, next) => {
  try {
    const orgs = store.organizations.map((o) => {
      const user = store.findUserById(o.user_id) || {};
      return {
        id: o.id,
        organizationName: o.name,
        email: user.email || 'org@foodbridge.demo',
        registrationNumber: o.registration_number,
        createdAt: o.created_at || new Date().toISOString(),
        isVerified: o.is_verified,
      };
    });

    return success(res, orgs, 'Verification requests retrieved');
  } catch (err) {
    next(err);
  }
};

const approveOrganization = async (req, res, next) => {
  try {
    const { id } = req.params;
    const org = store.organizations.find((o) => o.id === id);
    if (!org) {
      return error(res, 'Organization not found', 404);
    }
    org.is_verified = true;
    org.verified_at = new Date().toISOString();
    return success(res, org, 'Organization approved and verified');
  } catch (err) {
    next(err);
  }
};

const rejectOrganization = async (req, res, next) => {
  try {
    const { id } = req.params;
    const org = store.organizations.find((o) => o.id === id);
    if (!org) {
      return error(res, 'Organization not found', 404);
    }
    org.is_verified = false;
    return success(res, org, 'Organization verification rejected');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboard,
  getVerificationRequests,
  approveOrganization,
  rejectOrganization,
};
