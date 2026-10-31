const { v4: uuidv4 } = require('uuid');
const { success, error, created } = require('../utils/response');
const { store } = require('../services/dataStore');
const { awardCredits } = require('./rewardsController');

const getDashboard = async (req, res, next) => {
  try {
    const volId = req.user.id;
    const assignments = store.volunteerAssignments.filter((a) => a.volunteer_id === volId);

    const activeAssignments = assignments.filter((a) => a.delivery_status !== 'COMPLETED').length;
    const completedDeliveries = assignments.filter((a) => a.delivery_status === 'COMPLETED').length;
    const total = assignments.length || 1;
    const successRate = Math.round((completedDeliveries / total) * 100) || 100;

    return success(res, {
      activeAssignments,
      completedDeliveries,
      successRate,
    }, 'Volunteer dashboard stats retrieved');
  } catch (err) {
    next(err);
  }
};

const getAssignments = async (req, res, next) => {
  try {
    const volId = req.user.id;
    const userRole = req.user.role.toUpperCase();

    let assignments = [];
    if (userRole === 'VOLUNTEER') {
      assignments = store.volunteerAssignments.filter((a) => a.volunteer_id === volId);
      // If none assigned yet, include any available assignment for demo
      if (assignments.length === 0 && store.volunteerAssignments.length > 0) {
        assignments = store.volunteerAssignments;
      }
    } else {
      // Distributor gets assignments for their org
      const org = store.getOrganizationByUserId(volId);
      assignments = store.volunteerAssignments.filter((a) => a.organization_id === (org ? org.id : null));
    }

    const formatted = assignments.map((a) => {
      const listing = store.foodListings.find((l) => l.id === a.listing_id) || {};
      const org = store.organizations.find((o) => o.id === a.organization_id) || {};
      const donor = store.findUserById(listing.donor_id) || {};

      let status = 'pending';
      if (a.delivery_status === 'COMPLETED') status = 'completed';
      else if (a.pickup_status === 'COMPLETED' || listing.status === 'PICKED_UP') status = 'in_transit';
      else if (listing.status === 'PICKUP_ASSIGNED') status = 'assigned';

      return {
        id: a.id,
        listingId: a.listing_id,
        foodName: listing.food_name || 'Rescued Food Package',
        quantity: listing.quantity || 15,
        unit: listing.unit || 'kg',
        pickupAddress: listing.pickup_address || 'MG Road, Bangalore',
        destinationAddress: org.address || 'Church Street, Bangalore',
        pickupStartTime: listing.pickup_start_time || new Date().toISOString(),
        pickupEndTime: listing.pickup_end_time || new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
        status,
        donorName: donor.full_name || 'Community Donor',
        donorPhone: donor.phone || '',
        organizationName: org.name || 'Annapurna Foundation',
        pickupStatus: a.pickup_status,
        deliveryStatus: a.delivery_status,
      };
    });

    return success(res, formatted, 'Volunteer assignments retrieved');
  } catch (err) {
    next(err);
  }
};

const updateAssignmentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, pickupStatus, deliveryStatus } = req.body;

    const assignment = store.volunteerAssignments.find((a) => a.id === id);
    if (!assignment) {
      return error(res, 'Assignment not found', 404);
    }

    const listing = store.foodListings.find((l) => l.id === assignment.listing_id);

    if (status === 'in_transit' || pickupStatus === 'COMPLETED') {
      assignment.pickup_status = 'COMPLETED';
      assignment.picked_up_at = new Date().toISOString();
      if (listing) {
        listing.status = 'PICKED_UP';
        listing.picked_up_at = new Date().toISOString();
      }
    }

    if (status === 'completed' || deliveryStatus === 'COMPLETED') {
      assignment.delivery_status = 'COMPLETED';
      assignment.delivered_at = new Date().toISOString();
      if (listing) {
        listing.status = 'DELIVERED';
        listing.delivered_at = new Date().toISOString();

        // Award credits to donor automatically upon confirmed delivery!
        if (listing.donor_id) {
          awardCredits(listing.donor_id, listing.id, listing.quantity, listing.unit);
        }
      }
    }

    assignment.updated_at = new Date().toISOString();

    return success(res, assignment, `Assignment status updated to ${status || deliveryStatus || pickupStatus}`);
  } catch (err) {
    next(err);
  }
};

const createAssignment = async (req, res, next) => {
  try {
    const { listingId, volunteerId } = req.body;
    const org = store.getOrganizationByUserId(req.user.id) || store.organizations[0];

    const listing = store.foodListings.find((l) => l.id === listingId);
    if (!listing) return error(res, 'Listing not found', 404);

    const assignment = {
      id: uuidv4(),
      listing_id: listingId,
      organization_id: org.id,
      volunteer_id: volunteerId || store.volunteerProfiles[0].user_id,
      pickup_status: 'PENDING',
      delivery_status: 'PENDING',
      assigned_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    store.volunteerAssignments.push(assignment);
    listing.status = 'PICKUP_ASSIGNED';

    return created(res, assignment, 'Volunteer assignment created');
  } catch (err) {
    next(err);
  }
};

const getVolunteerProfile = async (req, res, next) => {
  try {
    const vol = store.getVolunteerProfile(req.user.id) || store.volunteerProfiles[0];
    const user = store.findUserById(req.user.id) || {};

    return success(res, {
      ...vol,
      name: user.full_name,
      email: user.email,
      phone: user.phone,
    }, 'Volunteer profile retrieved');
  } catch (err) {
    next(err);
  }
};

const updateVolunteerProfile = async (req, res, next) => {
  try {
    let vol = store.getVolunteerProfile(req.user.id);
    if (!vol) {
      vol = { id: uuidv4(), user_id: req.user.id };
      store.volunteerProfiles.push(vol);
    }

    const { vehicleType, maxCarryKg, latitude, longitude, isAvailable } = req.body;
    if (vehicleType !== undefined) vol.vehicle_type = vehicleType;
    if (maxCarryKg !== undefined) vol.max_carry_kg = parseFloat(maxCarryKg);
    if (latitude !== undefined) vol.latitude = parseFloat(latitude);
    if (longitude !== undefined) vol.longitude = parseFloat(longitude);
    if (isAvailable !== undefined) vol.is_available = isAvailable;

    return success(res, vol, 'Volunteer profile updated');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboard,
  getAssignments,
  updateAssignmentStatus,
  createAssignment,
  getVolunteerProfile,
  updateVolunteerProfile,
};
