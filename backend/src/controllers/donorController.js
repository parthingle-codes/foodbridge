const { success, error } = require('../utils/response');
const { store } = require('../services/dataStore');
const { findMatches } = require('../services/matchingEngine');

const getDonorDashboard = async (req, res, next) => {
  try {
    const donorId = req.user.id;
    const listings = store.foodListings.filter((l) => l.donor_id === donorId);
    const profile = store.getDonorProfile(donorId) || {};

    const totalDonations = listings.length || profile.total_donations || 0;
    const foodRescued = listings.reduce((sum, l) => sum + (Number(l.quantity) || 0), 0) || profile.total_quantity_kg || 0;
    const estimatedServings = listings.reduce((sum, l) => sum + (Number(l.estimated_servings) || 0), 0) || (foodRescued * 4);

    const creditsList = store.donorCredits.filter((c) => c.donor_id === donorId);
    const creditsEarned = creditsList.reduce((sum, c) => sum + (Number(c.credits) || 0), 0);

    return success(res, {
      totalDonations,
      foodRescued,
      estimatedServings,
      creditsEarned,
    }, 'Donor dashboard stats retrieved');
  } catch (err) {
    next(err);
  }
};

const getDonorListings = async (req, res, next) => {
  try {
    const donorId = req.user.id;
    const { status } = req.query;

    let listings = store.foodListings.filter((l) => l.donor_id === donorId);

    if (status) {
      listings = listings.filter((l) => l.status.toUpperCase() === status.toUpperCase());
    }

    // Attach matches for each listing
    const results = await Promise.all(
      listings.map(async (l) => {
        let matches = [];
        try {
          matches = await findMatches(l.id);
        } catch (e) {
          matches = [];
        }
        return {
          id: l.id,
          foodName: l.food_name,
          category: l.food_category,
          quantity: l.quantity,
          unit: l.unit,
          estimatedServings: l.estimated_servings,
          status: l.status,
          pickupStartTime: l.pickup_start_time,
          pickupEndTime: l.pickup_end_time,
          pickupAddress: l.pickup_address,
          storageNotes: l.storage_notes,
          allergenNotes: l.allergen_notes,
          foodCondition: l.food_condition,
          createdAt: l.created_at,
          matches,
        };
      })
    );

    return success(res, results, 'Donor listings retrieved');
  } catch (err) {
    next(err);
  }
};

const getDonorProfile = async (req, res, next) => {
  try {
    const donorId = req.user.id;
    const profile = store.getDonorProfile(donorId) || {};
    const user = store.findUserById(donorId) || {};

    return success(res, {
      id: profile.id,
      userId: donorId,
      name: user.full_name,
      organizationName: profile.organization_name || user.full_name,
      email: user.email,
      phone: user.phone,
      address: profile.address || user.address,
      latitude: profile.latitude,
      longitude: profile.longitude,
      totalDonations: profile.total_donations,
      totalQuantityKg: profile.total_quantity_kg,
      rating: profile.rating,
    }, 'Donor profile retrieved');
  } catch (err) {
    next(err);
  }
};

const updateDonorProfile = async (req, res, next) => {
  try {
    const donorId = req.user.id;
    let profile = store.getDonorProfile(donorId);
    if (!profile) {
      profile = {
        id: require('uuid').v4(),
        user_id: donorId,
      };
      store.donorProfiles.push(profile);
    }

    const { organizationName, address, latitude, longitude } = req.body;
    if (organizationName !== undefined) profile.organization_name = organizationName;
    if (address !== undefined) profile.address = address;
    if (latitude !== undefined) profile.latitude = parseFloat(latitude);
    if (longitude !== undefined) profile.longitude = parseFloat(longitude);

    return success(res, profile, 'Donor profile updated');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDonorDashboard,
  getDonorListings,
  getDonorProfile,
  updateDonorProfile,
};
