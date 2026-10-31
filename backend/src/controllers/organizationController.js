const { v4: uuidv4 } = require('uuid');
const { success, error } = require('../utils/response');
const { store, calculateDistanceKm } = require('../services/dataStore');
const { findMatches } = require('../services/matchingEngine');

const getDashboard = async (req, res, next) => {
  try {
    const org = store.getOrganizationByUserId(req.user.id) || store.organizations[0];
    const orgId = org ? org.id : null;

    const available = store.foodListings.filter((l) => l.status === 'AVAILABLE').length;
    const reserved = store.foodListings.filter((l) => l.status === 'RESERVED' && l.reserved_by === orgId).length;
    const activePickups = store.foodListings.filter((l) => (l.status === 'PICKUP_ASSIGNED' || l.status === 'PICKED_UP') && l.reserved_by === orgId).length;
    const completed = store.foodListings.filter((l) => (l.status === 'DELIVERED' || l.status === 'SERVED') && l.reserved_by === orgId).length;

    return success(res, {
      available,
      reserved,
      activePickups,
      completed,
    }, 'Organization dashboard stats');
  } catch (err) {
    next(err);
  }
};

const getAvailableFood = async (req, res, next) => {
  try {
    const org = store.getOrganizationByUserId(req.user.id) || store.organizations[0];
    const orgLat = org ? org.latitude : 12.9750;
    const orgLon = org ? org.longitude : 77.6100;

    const availableListings = store.foodListings.filter((l) => l.status === 'AVAILABLE');

    const results = await Promise.all(
      availableListings.map(async (l) => {
        const donor = store.findUserById(l.donor_id);
        const distance = calculateDistanceKm(orgLat, orgLon, l.latitude, l.longitude);

        let matchScore = 0.85;
        let matchReason = `Within service area (${distance} km)`;
        try {
          const matches = await findMatches(l.id);
          const currentMatch = matches.find((m) => m.organizationId === (org ? org.id : ''));
          if (currentMatch) {
            matchScore = currentMatch.matchScore;
            matchReason = currentMatch.matchReason;
          }
        } catch (e) {}

        return {
          id: l.id,
          foodName: l.food_name,
          category: l.food_category,
          quantity: l.quantity,
          unit: l.unit,
          estimatedServings: l.estimated_servings,
          distance,
          pickupStartTime: l.pickup_start_time,
          pickupEndTime: l.pickup_end_time,
          storageInstructions: l.storage_notes,
          allergenNotes: l.allergen_notes,
          pickupAddress: l.pickup_address,
          donorName: donor ? donor.full_name : 'Community Donor',
          donorPhone: donor ? donor.phone : '',
          matchScore,
          matchReason,
          status: l.status,
        };
      })
    );

    // Sort by matchScore desc
    results.sort((a, b) => b.matchScore - a.matchScore);

    return success(res, results, 'Available food listings retrieved');
  } catch (err) {
    next(err);
  }
};

const reserveListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const org = store.getOrganizationByUserId(req.user.id) || store.organizations[0];
    if (!org) {
      return error(res, 'Organization profile not found', 404);
    }

    const listing = store.foodListings.find((l) => l.id === id);
    if (!listing) {
      return error(res, 'Listing not found', 404);
    }

    if (listing.status !== 'AVAILABLE' && listing.status !== 'MATCHED') {
      return error(res, `Listing cannot be reserved. Current status: ${listing.status}`, 400);
    }

    listing.status = 'RESERVED';
    listing.reserved_by = org.id;
    listing.updated_at = new Date().toISOString();

    const reservation = {
      id: uuidv4(),
      listing_id: id,
      organization_id: org.id,
      status: 'RESERVED',
      notes: req.body.notes || 'Reserved by organization',
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
    };
    store.reservations.push(reservation);

    return success(res, {
      listing,
      reservation,
    }, 'Food listing reserved successfully');
  } catch (err) {
    next(err);
  }
};

const acceptListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const org = store.getOrganizationByUserId(req.user.id) || store.organizations[0];
    const listing = store.foodListings.find((l) => l.id === id);

    if (!listing) {
      return error(res, 'Listing not found', 404);
    }

    listing.status = 'ACCEPTED';
    listing.reserved_by = org ? org.id : listing.reserved_by;
    listing.updated_at = new Date().toISOString();

    // Auto assign a default volunteer if available
    let assignment = store.volunteerAssignments.find((a) => a.listing_id === id);
    if (!assignment && store.volunteerProfiles.length > 0) {
      const vol = store.volunteerProfiles[0];
      assignment = {
        id: uuidv4(),
        listing_id: id,
        organization_id: org ? org.id : store.organizations[0].id,
        volunteer_id: vol.user_id,
        pickup_status: 'PENDING',
        delivery_status: 'PENDING',
        assigned_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };
      store.volunteerAssignments.push(assignment);
      listing.status = 'PICKUP_ASSIGNED';
    }

    return success(res, { listing, assignment }, 'Listing accepted and pickup dispatched');
  } catch (err) {
    next(err);
  }
};

const declineListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const listing = store.foodListings.find((l) => l.id === id);
    if (!listing) {
      return error(res, 'Listing not found', 404);
    }

    listing.status = 'AVAILABLE';
    listing.reserved_by = null;
    listing.updated_at = new Date().toISOString();

    return success(res, { listing }, 'Listing declined and released to network');
  } catch (err) {
    next(err);
  }
};

const getReservations = async (req, res, next) => {
  try {
    const org = store.getOrganizationByUserId(req.user.id) || store.organizations[0];
    const orgId = org ? org.id : null;

    const reservedListings = store.foodListings.filter(
      (l) => l.reserved_by === orgId || l.status === 'RESERVED' || l.status === 'ACCEPTED' || l.status === 'PICKUP_ASSIGNED'
    );

    const formatted = reservedListings.map((l) => {
      const donor = store.findUserById(l.donor_id);
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
        storageInstructions: l.storage_notes,
        donorName: donor ? donor.full_name : 'Donor',
        donorPhone: donor ? donor.phone : '',
      };
    });

    return success(res, formatted, 'Reservations retrieved');
  } catch (err) {
    next(err);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const org = store.getOrganizationByUserId(req.user.id) || store.organizations[0];
    const user = store.findUserById(req.user.id);

    return success(res, {
      ...org,
      email: user ? user.email : '',
      phone: user ? user.phone : '',
      userFullName: user ? user.full_name : '',
    }, 'Organization profile retrieved');
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    let org = store.getOrganizationByUserId(req.user.id);
    if (!org) {
      org = { id: uuidv4(), user_id: req.user.id };
      store.organizations.push(org);
    }

    const {
      name,
      description,
      address,
      latitude,
      longitude,
      serviceRadiusKm,
      dailyCapacityKg,
      operatingHours,
      acceptedCategories,
    } = req.body;

    if (name !== undefined) org.name = name;
    if (description !== undefined) org.description = description;
    if (address !== undefined) org.address = address;
    if (latitude !== undefined) org.latitude = parseFloat(latitude);
    if (longitude !== undefined) org.longitude = parseFloat(longitude);
    if (serviceRadiusKm !== undefined) org.service_radius_km = parseFloat(serviceRadiusKm);
    if (dailyCapacityKg !== undefined) org.daily_capacity_kg = parseFloat(dailyCapacityKg);
    if (operatingHours !== undefined) org.operating_hours = operatingHours;
    if (acceptedCategories !== undefined) org.accepted_categories = acceptedCategories;

    return success(res, org, 'Organization profile updated');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboard,
  getAvailableFood,
  reserveListing,
  acceptListing,
  declineListing,
  getReservations,
  getProfile,
  updateProfile,
};
