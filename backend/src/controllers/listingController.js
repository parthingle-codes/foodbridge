const { v4: uuidv4 } = require('uuid');
const { success, error, created } = require('../utils/response');
const { store, calculateDistanceKm } = require('../services/dataStore');
const { findMatches } = require('../services/matchingEngine');

const createListing = async (req, res, next) => {
  try {
    const donorId = req.user.id;
    const {
      foodName,
      category,
      foodCategory,
      quantity,
      unit,
      estimatedServings,
      foodCondition,
      preparationTime,
      preparationDateTime,
      pickupStartTime,
      pickupEndTime,
      storageInstructions,
      storageNotes,
      allergens,
      allergenNotes,
      additionalNotes,
      description,
      pickupAddress,
      landmark,
      contactPhone,
      latitude,
      longitude,
      status: reqStatus,
    } = req.body;

    if (!foodName || !quantity || !pickupAddress) {
      return error(res, 'foodName, quantity, and pickupAddress are required', 400);
    }

    const start = pickupStartTime || new Date().toISOString();
    const end = pickupEndTime || new Date(Date.now() + 4 * 3600 * 1000).toISOString();

    const allergenText = Array.isArray(allergens) ? allergens.join(', ') : (allergens || allergenNotes || 'None');

    const newListing = {
      id: uuidv4(),
      donor_id: donorId,
      food_name: foodName,
      food_category: (category || foodCategory || 'cooked_meals').toLowerCase(),
      description: additionalNotes || description || '',
      quantity: parseFloat(quantity) || 1,
      unit: unit || 'kg',
      estimated_servings: parseInt(estimatedServings) || Math.round((parseFloat(quantity) || 1) * 4),
      food_condition: foodCondition || 'freshly_prepared',
      preparation_date_time: preparationTime || preparationDateTime || new Date().toISOString(),
      pickup_start_time: start,
      pickup_end_time: end,
      storage_notes: storageInstructions || storageNotes || '',
      allergen_notes: allergenText,
      pickup_address: pickupAddress,
      landmark: landmark || '',
      contact_phone: contactPhone || req.user.phone || '',
      latitude: parseFloat(latitude) || 12.9716,
      longitude: parseFloat(longitude) || 77.5946,
      status: reqStatus || 'AVAILABLE',
      reserved_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    store.foodListings.unshift(newListing);

    // Auto-calculate matches
    let matches = [];
    try {
      matches = await findMatches(newListing.id);
    } catch (e) {
      matches = [];
    }

    return created(res, {
      ...newListing,
      category: newListing.food_category,
      storageInstructions: newListing.storage_notes,
      allergens: newListing.allergen_notes,
      matches,
    }, 'Food listing published successfully');
  } catch (err) {
    next(err);
  }
};

const getListings = async (req, res, next) => {
  try {
    const { status, category, page = 1, limit = 20 } = req.query;

    let listings = [...store.foodListings];

    if (status) {
      listings = listings.filter((l) => l.status.toUpperCase() === status.toUpperCase());
    }

    if (category) {
      listings = listings.filter((l) => (l.food_category || '').toLowerCase() === category.toLowerCase());
    }

    const donorUserMap = {};
    store.users.forEach((u) => {
      donorUserMap[u.id] = u.full_name || u.name;
    });

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const offset = (pageNum - 1) * limitNum;
    const paged = listings.slice(offset, offset + limitNum);

    const formatted = paged.map((l) => ({
      id: l.id,
      foodName: l.food_name,
      category: l.food_category,
      quantity: l.quantity,
      unit: l.unit,
      estimatedServings: l.estimated_servings,
      foodCondition: l.food_condition,
      status: l.status,
      pickupStartTime: l.pickup_start_time,
      pickupEndTime: l.pickup_end_time,
      pickupAddress: l.pickup_address,
      latitude: l.latitude,
      longitude: l.longitude,
      donorName: donorUserMap[l.donor_id] || 'Community Donor',
      storageInstructions: l.storage_notes,
      allergenNotes: l.allergen_notes,
      createdAt: l.created_at,
    }));

    return success(res, formatted, 'Food listings retrieved');
  } catch (err) {
    next(err);
  }
};

const getListingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const listing = store.foodListings.find((l) => l.id === id);

    if (!listing) {
      return error(res, 'Listing not found', 404);
    }

    const donor = store.findUserById(listing.donor_id);
    const images = store.foodImages.filter((img) => img.listing_id === id);
    const checks = store.foodSafetyChecks.filter((c) => c.listing_id === id);

    let matches = [];
    try {
      matches = await findMatches(id);
    } catch (e) {
      matches = [];
    }

    return success(res, {
      ...listing,
      foodName: listing.food_name,
      category: listing.food_category,
      storageInstructions: listing.storage_notes,
      allergenNotes: listing.allergen_notes,
      donorName: donor ? donor.full_name : 'Donor',
      donorPhone: donor ? donor.phone : '',
      images,
      safetyChecks: checks,
      matches,
    }, 'Listing details retrieved');
  } catch (err) {
    next(err);
  }
};

const updateListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const listing = store.foodListings.find((l) => l.id === id);

    if (!listing) {
      return error(res, 'Listing not found', 404);
    }

    const {
      foodName,
      category,
      quantity,
      unit,
      estimatedServings,
      foodCondition,
      pickupStartTime,
      pickupEndTime,
      storageInstructions,
      allergens,
      pickupAddress,
      latitude,
      longitude,
      status,
    } = req.body;

    if (foodName !== undefined) listing.food_name = foodName;
    if (category !== undefined) listing.food_category = category.toLowerCase();
    if (quantity !== undefined) listing.quantity = parseFloat(quantity);
    if (unit !== undefined) listing.unit = unit;
    if (estimatedServings !== undefined) listing.estimated_servings = parseInt(estimatedServings);
    if (foodCondition !== undefined) listing.food_condition = foodCondition;
    if (pickupStartTime !== undefined) listing.pickup_start_time = pickupStartTime;
    if (pickupEndTime !== undefined) listing.pickup_end_time = pickupEndTime;
    if (storageInstructions !== undefined) listing.storage_notes = storageInstructions;
    if (allergens !== undefined) listing.allergen_notes = Array.isArray(allergens) ? allergens.join(', ') : allergens;
    if (pickupAddress !== undefined) listing.pickup_address = pickupAddress;
    if (latitude !== undefined) listing.latitude = parseFloat(latitude);
    if (longitude !== undefined) listing.longitude = parseFloat(longitude);
    if (status !== undefined) listing.status = status;

    listing.updated_at = new Date().toISOString();

    return success(res, listing, 'Listing updated successfully');
  } catch (err) {
    next(err);
  }
};

const deleteListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const index = store.foodListings.findIndex((l) => l.id === id);

    if (index === -1) {
      return error(res, 'Listing not found', 404);
    }

    store.foodListings.splice(index, 1);
    return success(res, { id }, 'Listing deleted successfully');
  } catch (err) {
    next(err);
  }
};

const uploadListingImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const listing = store.foodListings.find((l) => l.id === id);
    if (!listing) {
      return error(res, 'Listing not found', 404);
    }

    let imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c';

    const imageRecord = {
      id: uuidv4(),
      listing_id: id,
      image_url: imageUrl,
      created_at: new Date().toISOString(),
    };
    store.foodImages.push(imageRecord);

    return created(res, imageRecord, 'Image uploaded successfully');
  } catch (err) {
    next(err);
  }
};

const updateListingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const listing = store.foodListings.find((l) => l.id === id);
    if (!listing) {
      return error(res, 'Listing not found', 404);
    }
    listing.status = status;
    listing.updated_at = new Date().toISOString();
    return success(res, listing, `Listing status updated to ${status}`);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createListing,
  getListings,
  getListingById,
  updateListing,
  deleteListing,
  uploadListingImage,
  updateListingStatus,
};
