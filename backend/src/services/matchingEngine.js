const config = require('../config');
const { store, calculateDistanceKm } = require('./dataStore');
const db = require('../config/database');

const calculateTimeOverlap = (operatingHours, pickupStart, pickupEnd) => {
  try {
    if (!operatingHours) return 0.8;
    const hours = typeof operatingHours === 'string' ? JSON.parse(operatingHours) : operatingHours;
    if (!hours.start || !hours.end) return 0.8;

    const [opStartH, opStartM] = hours.start.split(':').map(Number);
    const [opEndH, opEndM] = hours.end.split(':').map(Number);
    const opStartMin = opStartH * 60 + (opStartM || 0);
    const opEndMin = opEndH * 60 + (opEndM || 0);

    const puStart = new Date(pickupStart);
    const puEnd = new Date(pickupEnd);
    const puStartMin = puStart.getHours() * 60 + puStart.getMinutes();
    const puEndMin = puEnd.getHours() * 60 + puEnd.getMinutes();

    const overlapStart = Math.max(opStartMin, puStartMin);
    const overlapEnd = Math.min(opEndMin, puEndMin);

    if (overlapStart >= overlapEnd) return 0.1;
    const overlap = overlapEnd - overlapStart;
    const duration = Math.max(1, puEndMin - puStartMin);
    return Math.min(1, Math.max(0.2, overlap / duration));
  } catch (e) {
    return 0.8;
  }
};

const findMatches = async (listingId) => {
  let listing = store.foodListings.find((l) => l.id === listingId);

  if (!listing && db.isConnected) {
    const res = await db.query('SELECT * FROM food_listings WHERE id = $1', [listingId]);
    if (res.rows.length > 0) listing = res.rows[0];
  }

  if (!listing) {
    throw new Error('Listing not found');
  }

  const maxRadiusKm = config.matching.maxServiceRadiusKm || 50;
  const weights = config.matching.weights || { distance: 0.35, capacity: 0.25, time: 0.2, need: 0.2 };
  const listingCategory = (listing.food_category || listing.category || '').toLowerCase();
  const listingQty = parseFloat(listing.quantity) || 10;
  const listingLat = parseFloat(listing.latitude) || 12.9716;
  const listingLon = parseFloat(listing.longitude) || 77.5946;

  // Filter verified distributor organizations
  const eligibleOrgs = store.organizations.filter((org) => {
    if (!org.is_verified || !org.is_active) return false;
    if (org.type !== 'NGO' && org.type !== 'COMMUNITY_GROUP') return false;

    // Radius filter
    const dist = calculateDistanceKm(listingLat, listingLon, org.latitude, org.longitude);
    const maxOrgRadius = org.service_radius_km || maxRadiusKm;
    if (dist > maxOrgRadius) return false;

    // Capacity filter
    const remaining = (org.daily_capacity_kg || 200) - (org.current_load_kg || 0);
    if (remaining < listingQty * 0.5) return false;

    return true;
  });

  const matches = eligibleOrgs.map((org) => {
    const distKm = calculateDistanceKm(listingLat, listingLon, org.latitude, org.longitude);
    const distanceScore = Math.max(0, 1 - distKm / maxRadiusKm);

    const remainingCap = Math.max(0, (org.daily_capacity_kg || 200) - (org.current_load_kg || 0));
    const capacityScore = Math.min(1, remainingCap / (listingQty * 2));

    const timeScore = calculateTimeOverlap(org.operating_hours, listing.pickup_start_time, listing.pickup_end_time);

    const categories = (org.accepted_categories || []).map((c) => c.toLowerCase());
    const acceptsCategory = categories.length === 0 || categories.includes(listingCategory) || categories.includes('all');
    const needScore = acceptsCategory ? 1.0 : 0.4;

    const finalScore = parseFloat(
      (
        distanceScore * weights.distance +
        capacityScore * weights.capacity +
        timeScore * weights.time +
        needScore * weights.need
      ).toFixed(4)
    );

    const reasons = [];
    if (distKm <= 5) reasons.push(`Closest organization (${distKm} km)`);
    else reasons.push(`Within service radius (${distKm} km)`);

    if (remainingCap >= listingQty * 2) reasons.push(`High capacity available (${remainingCap} kg remaining)`);
    else reasons.push(`Sufficient capacity (${remainingCap} kg)`);

    if (acceptsCategory) reasons.push(`Actively redistributes ${listingCategory || 'this food category'}`);
    if (timeScore >= 0.7) reasons.push('Operating hours align with pickup window');

    return {
      organizationId: org.id,
      organizationName: org.name,
      address: org.address,
      distanceKm: distKm,
      remainingCapacityKg: remainingCap,
      operatingHours: org.operating_hours,
      matchScore: finalScore,
      score: finalScore,
      reasons,
      matchReason: reasons.join(' • '),
    };
  });

  matches.sort((a, b) => b.score - a.score);
  return matches;
};

const createMatchRecords = async (listingId, matches) => {
  matches.forEach((m, idx) => {
    const existing = store.matches.find((x) => x.listing_id === listingId && x.organization_id === m.organizationId);
    if (!existing) {
      store.matches.push({
        id: require('uuid').v4(),
        listing_id: listingId,
        organization_id: m.organizationId,
        distance_km: m.distanceKm,
        match_score: m.matchScore,
        rank: idx + 1,
        reasons: m.reasons,
        status: 'PENDING',
        created_at: new Date().toISOString(),
      });
    }
  });
  return matches;
};

module.exports = {
  findMatches,
  createMatchRecords,
  calculateTimeOverlap,
};
