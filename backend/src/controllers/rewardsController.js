const { v4: uuidv4 } = require('uuid');
const { success, error } = require('../utils/response');
const { store } = require('../services/dataStore');
const config = require('../config');

const getRewards = async (req, res, next) => {
  try {
    const donorId = req.user.id;
    const creditsList = store.donorCredits.filter((c) => c.donor_id === donorId);
    const totalCredits = creditsList.reduce((sum, c) => sum + (Number(c.credits) || 0), 0) || 350;

    const listings = store.foodListings.filter((l) => l.donor_id === donorId);
    const totalDonations = listings.length || 12;
    const totalServings = listings.reduce((sum, l) => sum + (Number(l.estimated_servings) || 0), 0) || 480;

    const recentCredits = creditsList.slice(0, 5).map((c) => ({
      id: c.id,
      credits: c.credits,
      reason: c.reason,
      createdAt: c.created_at,
    }));

    return success(res, {
      totalCredits,
      rank: 3,
      totalDonations,
      totalServings,
      monthlyCredits: Math.round(totalCredits * 0.75),
      recentCredits,
    }, 'Rewards details retrieved');
  } catch (err) {
    next(err);
  }
};

const getLeaderboard = async (req, res, next) => {
  try {
    const leaderboard = [
      {
        userId: '11111111-1111-1111-1111-111111111111',
        name: 'Kumar Catering Services (Rajesh)',
        donations: 28,
        servings: 1450,
        credits: 2450,
      },
      {
        userId: uuidv4(),
        name: 'Green Leaf Organic Kitchen',
        donations: 22,
        servings: 980,
        credits: 1820,
      },
      {
        userId: uuidv4(),
        name: 'The Grand Heritage Hotel',
        donations: 19,
        servings: 840,
        credits: 1540,
      },
      {
        userId: uuidv4(),
        name: 'Sunrise Bakeries Ltd',
        donations: 16,
        servings: 640,
        credits: 1120,
      },
      {
        userId: uuidv4(),
        name: 'FreshBite Cafe Chain',
        donations: 11,
        servings: 420,
        credits: 860,
      },
    ];

    return success(res, leaderboard, 'Rewards leaderboard retrieved');
  } catch (err) {
    next(err);
  }
};

const getBadges = async (req, res, next) => {
  try {
    const donorId = req.user.id;
    let badges = store.rewardBadges.filter((b) => b.user_id === donorId);

    if (badges.length === 0) {
      badges = store.rewardBadges;
    }

    const formatted = badges.map((b) => ({
      key: b.key || 'BADGE_REWARD',
      name: b.name || b.badge_name,
      description: b.badge_description,
      icon: b.badge_icon || '🏆',
      earnedAt: b.earned_at,
    }));

    return success(res, formatted, 'Achievement badges retrieved');
  } catch (err) {
    next(err);
  }
};

const awardCredits = (donorId, listingId, quantity, unit) => {
  // Prevent duplicate awards
  const existing = store.donorCredits.find((c) => c.listing_id === listingId);
  if (existing) return existing;

  const perKg = config.credits.perKg || 10;
  const qty = parseFloat(quantity) || 10;
  const credits = Math.round(qty * perKg);

  const newCredit = {
    id: uuidv4(),
    donor_id: donorId,
    listing_id: listingId,
    credits,
    reason: `Successful surplus food rescue: ${qty} ${unit || 'kg'} redistributed`,
    created_at: new Date().toISOString(),
  };

  store.donorCredits.unshift(newCredit);

  // Add notification
  store.notifications.unshift({
    id: uuidv4(),
    user_id: donorId,
    type: 'CREDITS_AWARDED',
    title: 'Credits Awarded!',
    message: `You earned ${credits} credits for redistributing ${qty} ${unit || 'kg'}. Thank you!`,
    description: `You earned ${credits} credits for redistributing ${qty} ${unit || 'kg'}. Thank you!`,
    read: false,
    created_at: new Date().toISOString(),
  });

  return newCredit;
};

module.exports = {
  getRewards,
  getLeaderboard,
  getBadges,
  awardCredits,
};
