const { success } = require('../utils/response');
const { store } = require('../services/dataStore');

const getMarkers = async (req, res, next) => {
  try {
    const markers = [];

    // Food listings (available)
    store.foodListings.forEach((l) => {
      markers.push({
        id: l.id,
        type: 'food_listing',
        lat: l.latitude,
        lng: l.longitude,
        title: l.food_name,
        subtitle: `${l.quantity} ${l.unit} • ${l.status}`,
        details: {
          category: l.food_category,
          address: l.pickup_address,
          status: l.status,
          servings: l.estimated_servings,
        },
      });
    });

    // Organizations (NGOs)
    store.organizations.forEach((o) => {
      markers.push({
        id: o.id,
        type: o.type === 'WASTE_RECOVERY_ORGANIZATION' ? 'biofarm' : 'organization',
        lat: o.latitude,
        lng: o.longitude,
        title: o.name,
        subtitle: o.type === 'WASTE_RECOVERY_ORGANIZATION' ? 'Organic Waste Recovery' : `Capacity: ${o.daily_capacity_kg} kg`,
        details: {
          address: o.address,
          verified: o.is_verified,
          radiusKm: o.service_radius_km,
        },
      });
    });

    // Volunteers (active)
    store.volunteerProfiles.forEach((v) => {
      const user = store.findUserById(v.user_id);
      markers.push({
        id: v.id,
        type: 'volunteer',
        lat: v.latitude,
        lng: v.longitude,
        title: user ? user.full_name : 'Active Volunteer',
        subtitle: `Vehicle: ${v.vehicle_type || 'bike'} • Available`,
        details: {
          maxCarryKg: v.max_carry_kg,
          rating: v.rating,
        },
      });
    });

    return success(res, markers, 'Map markers retrieved');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMarkers,
};
