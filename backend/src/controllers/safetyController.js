const { v4: uuidv4 } = require('uuid');
const { success, error, created } = require('../utils/response');
const { store } = require('../services/dataStore');

const donorCheck = async (req, res, next) => {
  try {
    const { listingId } = req.params;
    const {
      preparationTimeConfirmed,
      storageCondition,
      packaging,
      foodAppearance,
      allergensListed,
      visibleContamination,
      contaminationDescription,
      safetyConfirmed,
    } = req.body;

    const listing = store.foodListings.find((l) => l.id === listingId);
    if (!listing) {
      return error(res, 'Listing not found', 404);
    }

    // Determine result
    let result = 'pass';
    if (visibleContamination === true || safetyConfirmed === false) {
      result = 'failed';
      listing.status = 'SAFETY_REJECTED';
    } else if (foodAppearance === 'concerning' || packaging === 'open') {
      result = 'flagged';
    }

    const checkRecord = {
      id: uuidv4(),
      check_type: 'DONOR_CHECK',
      listing_id: listingId,
      checked_by: req.user.id,
      checklist_answers: req.body,
      result: result.toUpperCase(),
      notes: contaminationDescription || (result === 'pass' ? 'All donor safety parameters verified' : 'Safety criteria failed'),
      checked_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    store.foodSafetyChecks.push(checkRecord);

    return created(res, {
      id: checkRecord.id,
      result,
      status: result,
      completedBy: req.user.fullName || req.user.name,
      completedAt: checkRecord.checked_at,
    }, `Donor safety check completed: ${result.toUpperCase()}`);
  } catch (err) {
    next(err);
  }
};

const pickupCheck = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const {
      packagingIntegrity,
      foodAppearanceSmell,
      temperatureAppropriate,
      transportContainer,
      visibleContamination,
      contaminationDescription,
      safetyConfirmed,
    } = req.body;

    const assignment = store.volunteerAssignments.find((a) => a.id === assignmentId || a.listing_id === assignmentId);
    const listingId = assignment ? assignment.listing_id : assignmentId;
    const listing = store.foodListings.find((l) => l.id === listingId);

    let result = 'pass';
    if (visibleContamination === true || safetyConfirmed === false || packagingIntegrity === 'compromised') {
      result = 'failed';
      if (listing) listing.status = 'SAFETY_REJECTED';
    } else if (foodAppearanceSmell === 'concerning' || temperatureAppropriate === 'no') {
      result = 'flagged';
    }

    const checkRecord = {
      id: uuidv4(),
      check_type: 'PICKUP_CHECK',
      listing_id: listingId,
      assignment_id: assignment ? assignment.id : null,
      checked_by: req.user.id,
      checklist_answers: req.body,
      result: result.toUpperCase(),
      notes: contaminationDescription || (result === 'pass' ? 'Pickup inspection passed' : 'Pickup inspection flagged/failed'),
      checked_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    store.foodSafetyChecks.push(checkRecord);

    return created(res, {
      id: checkRecord.id,
      result,
      status: result,
      completedBy: req.user.fullName || req.user.name,
      completedAt: checkRecord.checked_at,
    }, `Pickup safety check completed: ${result.toUpperCase()}`);
  } catch (err) {
    next(err);
  }
};

const getSafetyChecks = async (req, res, next) => {
  try {
    const { listingId } = req.params;
    const checks = store.foodSafetyChecks.filter((c) => c.listing_id === listingId);

    const formatted = checks.map((c) => {
      const user = store.findUserById(c.checked_by);
      return {
        id: c.id,
        checkType: c.check_type,
        listingId: c.listing_id,
        result: c.result.toLowerCase(),
        checklistAnswers: c.checklist_answers,
        notes: c.notes,
        completedBy: user ? user.full_name : 'Staff',
        completedAt: c.checked_at,
      };
    });

    return success(res, formatted, 'Safety checks retrieved');
  } catch (err) {
    next(err);
  }
};

// Generic check creator for compatibility with P0 prompt
const createSafetyCheck = async (req, res, next) => {
  try {
    const { checkType, listingId, checklistAnswers, result, notes } = req.body;
    const isDonor = checkType === 'DONOR_CHECK';
    req.params.listingId = listingId;
    req.params.assignmentId = listingId;
    return isDonor ? donorCheck(req, res, next) : pickupCheck(req, res, next);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  donorCheck,
  pickupCheck,
  getSafetyChecks,
  createSafetyCheck,
};
