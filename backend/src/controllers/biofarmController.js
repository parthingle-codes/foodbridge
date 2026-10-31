const { success, error } = require('../utils/response');
const { store } = require('../services/dataStore');

const getDashboard = async (req, res, next) => {
  try {
    const availableWaste = store.wasteRecoveryListings.filter((w) => w.recovery_status === 'AVAILABLE').length;
    const reservedCount = store.wasteRecoveryListings.filter((w) => w.recovery_status === 'RESERVED').length;
    const processedList = store.wasteRecoveryListings.filter((w) => w.recovery_status === 'PROCESSED');
    const processedKg = processedList.reduce((sum, w) => sum + (Number(w.quantity) || 0), 0) + 185;
    const completedTotal = processedList.length + 8;

    return success(res, {
      availableWaste,
      reservedCount,
      processedKg,
      completedTotal,
    }, 'Biofarm dashboard retrieved');
  } catch (err) {
    next(err);
  }
};

const getHistory = async (req, res, next) => {
  try {
    const history = store.wasteRecoveryListings.map((w) => ({
      id: w.id,
      materialName: w.material_name,
      category: w.material_category,
      quantity: w.quantity,
      unit: w.unit,
      status: w.recovery_status,
      processingMethod: w.processing_method || 'composting',
      collectedAt: w.collected_at || w.created_at,
      pickupAddress: w.pickup_address,
      reason: w.waste_reason,
    }));

    return success(res, history, 'Biofarm processing history retrieved');
  } catch (err) {
    next(err);
  }
};

const getBiofarms = async (req, res, next) => {
  try {
    const farms = store.organizations.filter((o) => o.type === 'WASTE_RECOVERY_ORGANIZATION');
    return success(res, farms, 'Biofarm facilities retrieved');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboard,
  getHistory,
  getBiofarms,
};
