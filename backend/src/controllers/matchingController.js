const { findMatches, createMatchRecords } = require('../services/matchingEngine');
const { success, error } = require('../utils/response');

/**
 * GET /api/matching/:listingId
 * Find and return ranked matches for a listing, persisting them in the DB.
 */
const getMatches = async (req, res, next) => {
  try {
    const { listingId } = req.params;

    if (!listingId) {
      return error(res, 'Listing ID is required', 400);
    }

    // Run matching engine
    const matches = await findMatches(listingId);

    // Persist match records
    await createMatchRecords(listingId, matches);

    return success(res, {
      listingId,
      totalMatches: matches.length,
      matches,
    }, 'Matches found successfully');
  } catch (err) {
    if (err.message === 'Listing not found') {
      return error(res, 'Listing not found', 404);
    }
    next(err);
  }
};

module.exports = {
  getMatches,
};
