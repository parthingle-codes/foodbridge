const { v4: uuidv4 } = require('uuid');
const { success, error, created } = require('../utils/response');
const { store, calculateDistanceKm } = require('../services/dataStore');

const getAvailableWaste = async (req, res, next) => {
  try {
    const { materialCategory, latitude, longitude, radius } = req.query;
    const biofarm = store.getOrganizationByUserId(req.user.id) || store.organizations.find((o) => o.type === 'WASTE_RECOVERY_ORGANIZATION');
    const bLat = biofarm ? biofarm.latitude : 12.9698;
    const bLon = biofarm ? biofarm.longitude : 77.7500;

    let listings = store.wasteRecoveryListings.filter((w) => w.recovery_status === 'AVAILABLE');

    if (materialCategory) {
      listings = listings.filter((w) => (w.material_category || '').toLowerCase() === materialCategory.toLowerCase());
    }

    const formatted = listings.map((w) => {
      const orig = store.foodListings.find((l) => l.id === w.original_listing_id) || {};
      const donor = store.findUserById(orig.donor_id) || {};
      const distance = calculateDistanceKm(bLat, bLon, w.latitude, w.longitude);

      return {
        id: w.id,
        listingId: w.original_listing_id,
        materialName: w.material_name || orig.food_name || 'Surplus Organic Waste',
        category: w.material_category || orig.food_category || 'organic',
        quantity: w.quantity || orig.quantity || 15,
        unit: w.unit || orig.unit || 'kg',
        reason: w.waste_reason || 'EXPIRED_NO_RESERVATION',
        collectionDeadline: w.collection_end || orig.pickup_end_time || new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        distance,
        recoverySuitability: w.recovery_suitability || 'Suitable for composting or biogas generation.',
        sourceName: donor.full_name || 'Hospitality Donor',
        pickupAddress: w.pickup_address || orig.pickup_address || 'MG Road, Bangalore',
        status: w.recovery_status,
      };
    });

    return success(res, formatted, 'Available waste recovery opportunities retrieved');
  } catch (err) {
    next(err);
  }
};

const acceptWasteRecovery = async (req, res, next) => {
  try {
    const { id } = req.params;
    const biofarm = store.getOrganizationByUserId(req.user.id) || store.organizations.find((o) => o.type === 'WASTE_RECOVERY_ORGANIZATION');
    const waste = store.wasteRecoveryListings.find((w) => w.id === id);

    if (!waste) {
      return error(res, 'Waste recovery listing not found', 404);
    }

    waste.recovery_status = 'RESERVED';
    waste.reserved_by = biofarm ? biofarm.id : null;
    waste.updated_at = new Date().toISOString();

    const acceptance = {
      id: uuidv4(),
      waste_listing_id: id,
      biofarm_id: biofarm ? biofarm.id : null,
      status: 'ACCEPTED',
      created_at: new Date().toISOString(),
    };
    store.biofarmAcceptances.push(acceptance);

    const orig = store.foodListings.find((l) => l.id === waste.original_listing_id);
    if (orig) orig.status = 'WASTE_RESERVED';

    return success(res, { waste, acceptance }, 'Waste recovery opportunity accepted');
  } catch (err) {
    next(err);
  }
};

const reserveWasteRecovery = async (req, res, next) => {
  return acceptWasteRecovery(req, res, next);
};

const declineWasteRecovery = async (req, res, next) => {
  try {
    const { id } = req.params;
    const waste = store.wasteRecoveryListings.find((w) => w.id === id);
    if (!waste) return error(res, 'Waste listing not found', 404);

    waste.recovery_status = 'AVAILABLE';
    waste.reserved_by = null;
    return success(res, { id, status: 'AVAILABLE' }, 'Waste listing returned to available pool');
  } catch (err) {
    next(err);
  }
};

const collectWasteRecovery = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { collectedQuantity, notes } = req.body;
    const waste = store.wasteRecoveryListings.find((w) => w.id === id);

    if (!waste) return error(res, 'Waste listing not found', 404);

    waste.recovery_status = 'COLLECTED';
    waste.collected_at = new Date().toISOString();
    waste.collected_quantity = parseFloat(collectedQuantity) || waste.quantity;
    waste.notes = notes || '';

    const orig = store.foodListings.find((l) => l.id === waste.original_listing_id);
    if (orig) orig.status = 'WASTE_COLLECTED';

    const acceptance = store.biofarmAcceptances.find((b) => b.waste_listing_id === id);
    if (acceptance) {
      acceptance.status = 'COLLECTED';
      acceptance.recovered_quantity = waste.collected_quantity;
    }

    return success(res, waste, 'Biofarm collection recorded successfully');
  } catch (err) {
    next(err);
  }
};

const updateProcessing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { method, status, recoveredQuantity } = req.body;
    const waste = store.wasteRecoveryListings.find((w) => w.id === id);

    if (!waste) return error(res, 'Waste listing not found', 404);

    waste.processing_method = method || waste.processing_method || 'composting';
    waste.processing_status = status || 'completed';
    if (recoveredQuantity !== undefined) waste.recovered_quantity = parseFloat(recoveredQuantity);

    if (status === 'completed' || status === 'PROCESSED') {
      waste.recovery_status = 'PROCESSED';
      const orig = store.foodListings.find((l) => l.id === waste.original_listing_id);
      if (orig) orig.status = 'WASTE_PROCESSED';
    }

    const acceptance = store.biofarmAcceptances.find((b) => b.waste_listing_id === id);
    if (acceptance) {
      acceptance.processing_method = waste.processing_method;
      acceptance.processing_status = waste.processing_status;
    }

    return success(res, waste, 'Processing status updated successfully');
  } catch (err) {
    next(err);
  }
};

// Create a new waste recovery opportunity (e.g. from expired food)
const createWasteRecovery = async (req, res, next) => {
  try {
    const {
      listingId,
      materialCategory,
      quantity,
      unit,
      collectionStart,
      collectionEnd,
      wasteReason,
      recoverySuitability,
    } = req.body;

    const listing = store.foodListings.find((l) => l.id === listingId);

    const wasteListing = {
      id: uuidv4(),
      original_listing_id: listingId || uuidv4(),
      material_name: listing ? listing.food_name : 'Surplus Organic Waste',
      material_category: materialCategory || (listing ? listing.food_category : 'mixed'),
      quantity: parseFloat(quantity) || (listing ? listing.quantity : 20),
      unit: unit || (listing ? listing.unit : 'kg'),
      collection_start: collectionStart || new Date().toISOString(),
      collection_end: collectionEnd || new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      pickup_address: listing ? listing.pickup_address : 'Bangalore',
      latitude: listing ? listing.latitude : 12.9716,
      longitude: listing ? listing.longitude : 77.5946,
      waste_reason: wasteReason || 'EXPIRED_NO_RESERVATION',
      recovery_suitability: recoverySuitability || 'Suitable for compost/biogas recovery.',
      recovery_status: 'AVAILABLE',
      created_at: new Date().toISOString(),
    };

    store.wasteRecoveryListings.push(wasteListing);
    if (listing) listing.status = 'WASTE_RECOVERY_PENDING';

    return created(res, wasteListing, 'Waste recovery opportunity published');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAvailableWaste,
  getWasteListings: getAvailableWaste,
  acceptWasteRecovery,
  reserveWasteRecovery,
  declineWasteRecovery,
  collectWasteRecovery,
  updateProcessing,
  updateWasteStatus: updateProcessing,
  createWasteRecovery,
};
