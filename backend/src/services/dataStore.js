const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Haversine distance in kilometers
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return 0;
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
}

class DataStore {
  constructor() {
    this.reset();
  }

  reset() {
    const passwordHash = bcrypt.hashSync('password123', 10);

    this.users = [
      {
        id: '11111111-1111-1111-1111-111111111111',
        email: 'donor@foodbridge.demo',
        password_hash: passwordHash,
        full_name: 'Rajesh Kumar',
        phone: '+91-9876543210',
        role: 'DONOR',
        sub_role: 'INDIVIDUAL',
        address: '123 MG Road, Bangalore, Karnataka',
        is_active: true,
        created_at: new Date().toISOString(),
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        email: 'ngo1@foodbridge.demo',
        password_hash: passwordHash,
        full_name: 'Annapurna Foundation',
        phone: '+91-9876543211',
        role: 'DISTRIBUTOR',
        sub_role: 'NGO',
        address: '456 Church Street, Bangalore, Karnataka',
        is_active: true,
        created_at: new Date().toISOString(),
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        email: 'ngo2@foodbridge.demo',
        password_hash: passwordHash,
        full_name: 'Feeding India Network',
        phone: '+91-9876543212',
        role: 'DISTRIBUTOR',
        sub_role: 'NGO',
        address: '789 Jayanagar, Bangalore, Karnataka',
        is_active: true,
        created_at: new Date().toISOString(),
      },
      {
        id: '44444444-4444-4444-4444-444444444444',
        email: 'volunteer1@foodbridge.demo',
        password_hash: passwordHash,
        full_name: 'Priya Sharma',
        phone: '+91-9876543213',
        role: 'VOLUNTEER',
        sub_role: 'INDEPENDENT',
        address: '12 Indiranagar, Bangalore, Karnataka',
        is_active: true,
        created_at: new Date().toISOString(),
      },
      {
        id: '55555555-5555-5555-5555-555555555555',
        email: 'volunteer2@foodbridge.demo',
        password_hash: passwordHash,
        full_name: 'Amit Patel',
        phone: '+91-9876543214',
        role: 'VOLUNTEER',
        sub_role: 'NGO_PARTNER',
        address: '34 Koramangala, Bangalore, Karnataka',
        is_active: true,
        created_at: new Date().toISOString(),
      },
      {
        id: '66666666-6666-6666-6666-666666666666',
        email: 'biofarm@foodbridge.demo',
        password_hash: passwordHash,
        full_name: 'Green Earth Biofarm',
        phone: '+91-9876543215',
        role: 'BIOFARM',
        sub_role: 'WASTE_RECOVERY_ORGANIZATION',
        address: '101 Whitefield, Bangalore, Karnataka',
        is_active: true,
        created_at: new Date().toISOString(),
      },
      {
        id: '77777777-7777-7777-7777-777777777777',
        email: 'admin@foodbridge.demo',
        password_hash: passwordHash,
        full_name: 'System Admin',
        phone: '+91-9876543216',
        role: 'ADMIN',
        sub_role: 'ADMIN',
        address: 'HQ, Bangalore, Karnataka',
        is_active: true,
        created_at: new Date().toISOString(),
      },
    ];

    this.donorProfiles = [
      {
        id: uuidv4(),
        user_id: '11111111-1111-1111-1111-111111111111',
        organization_name: 'Kumar Catering Services',
        address: '123 MG Road, Bangalore, Karnataka',
        latitude: 12.9716,
        longitude: 77.5946,
        total_donations: 12,
        total_quantity_kg: 340,
        rating: 4.9,
      },
    ];

    this.organizations = [
      {
        id: 'aaaa1111-1111-1111-1111-111111111111',
        user_id: '22222222-2222-2222-2222-222222222222',
        name: 'Annapurna Foundation',
        type: 'NGO',
        registration_number: 'NGO-KA-2024-001',
        description: 'We distribute surplus food to underprivileged communities across Bangalore.',
        address: '456 Church Street, Bangalore, Karnataka',
        latitude: 12.9750,
        longitude: 77.6100,
        service_radius_km: 30,
        accepted_categories: ['cooked_meals', 'raw_ingredients', 'packaged_food', 'bakery', 'fruits_vegetables', 'dairy', 'beverages', 'COOKED_MEALS', 'RAW_VEGETABLES', 'BAKERY'],
        daily_capacity_kg: 200,
        current_load_kg: 30,
        operating_hours: { start: '07:00', end: '21:00' },
        operating_days: [1, 2, 3, 4, 5, 6, 7],
        is_verified: true,
        is_active: true,
      },
      {
        id: 'aaaa2222-2222-2222-2222-222222222222',
        user_id: '33333333-3333-3333-3333-333333333333',
        name: 'Feeding India Network',
        type: 'NGO',
        registration_number: 'NGO-KA-2024-002',
        description: 'Large-scale food redistribution network covering South Bangalore.',
        address: '789 Jayanagar, Bangalore, Karnataka',
        latitude: 12.9250,
        longitude: 77.5800,
        service_radius_km: 40,
        accepted_categories: ['cooked_meals', 'raw_ingredients', 'bakery', 'packaged_food', 'COOKED_MEALS', 'RAW_VEGETABLES'],
        daily_capacity_kg: 500,
        current_load_kg: 100,
        operating_hours: { start: '08:00', end: '20:00' },
        operating_days: [1, 2, 3, 4, 5, 6],
        is_verified: true,
        is_active: true,
      },
      {
        id: 'aaaa3333-3333-3333-3333-333333333333',
        user_id: '66666666-6666-6666-6666-666666666666',
        name: 'Green Earth Biofarm',
        type: 'WASTE_RECOVERY_ORGANIZATION',
        registration_number: 'BIO-KA-2024-001',
        description: 'Organic waste recovery and composting facility in outskirts of Bangalore.',
        address: '101 Whitefield, Bangalore, Karnataka',
        latitude: 12.9698,
        longitude: 77.7500,
        service_radius_km: 50,
        accepted_categories: ['cooked_meals', 'raw_ingredients', 'bakery', 'dairy', 'fruits_vegetables'],
        daily_capacity_kg: 1000,
        current_load_kg: 200,
        operating_hours: { start: '06:00', end: '18:00' },
        operating_days: [1, 2, 3, 4, 5, 6],
        is_verified: true,
        is_active: true,
      },
    ];

    this.volunteerProfiles = [
      {
        id: uuidv4(),
        user_id: '44444444-4444-4444-4444-444444444444',
        organization_id: 'aaaa1111-1111-1111-1111-111111111111',
        vehicle_type: 'bike',
        max_carry_kg: 15,
        latitude: 12.9730,
        longitude: 77.6050,
        is_available: true,
        availability_start: '08:00',
        availability_end: '20:00',
        available_days: [1, 2, 3, 4, 5, 6, 7],
        total_deliveries: 24,
        total_distance_km: 185.5,
        rating: 4.95,
      },
      {
        id: uuidv4(),
        user_id: '55555555-5555-5555-5555-555555555555',
        organization_id: 'aaaa2222-2222-2222-2222-222222222222',
        vehicle_type: 'car',
        max_carry_kg: 50,
        latitude: 12.9300,
        longitude: 77.5850,
        is_available: true,
        availability_start: '09:00',
        availability_end: '18:00',
        available_days: [1, 2, 3, 4, 5],
        total_deliveries: 15,
        total_distance_km: 142.0,
        rating: 4.88,
      },
    ];

    const tomorrow = new Date(Date.now() + 24 * 3600 * 1000);
    const tomorrowEnd = new Date(Date.now() + 28 * 3600 * 1000);

    this.foodListings = [
      {
        id: 'bbbb1111-1111-1111-1111-111111111111',
        donor_id: '11111111-1111-1111-1111-111111111111',
        food_name: 'Vegetable Biryani',
        food_category: 'cooked_meals',
        description: 'Freshly prepared vegetable biryani from a corporate event. Basmati rice with fresh vegetables.',
        quantity: 25,
        unit: 'kg',
        estimated_servings: 100,
        food_condition: 'freshly_prepared',
        preparation_date_time: new Date().toISOString(),
        pickup_start_time: tomorrow.toISOString(),
        pickup_end_time: tomorrowEnd.toISOString(),
        storage_notes: 'Stored in insulated food-grade containers. Kept at 65°C.',
        allergen_notes: 'Contains dairy, cashew nuts.',
        pickup_address: '123 MG Road, Bangalore, Karnataka',
        latitude: 12.9716,
        longitude: 77.5946,
        status: 'AVAILABLE',
        reserved_by: null,
        created_at: new Date().toISOString(),
      },
      {
        id: 'bbbb2222-2222-2222-2222-222222222222',
        donor_id: '11111111-1111-1111-1111-111111111111',
        food_name: 'Assorted Bread and Pastries',
        food_category: 'bakery',
        description: 'Day-old artisan bread loaves, croissants, and muffins from bakery.',
        quantity: 10,
        unit: 'kg',
        estimated_servings: 40,
        food_condition: 'good',
        preparation_date_time: new Date().toISOString(),
        pickup_start_time: tomorrow.toISOString(),
        pickup_end_time: tomorrowEnd.toISOString(),
        storage_notes: 'Individually wrapped and stored in cool, dry bakery boxes.',
        allergen_notes: 'Contains gluten, dairy, eggs.',
        pickup_address: '123 MG Road, Bangalore, Karnataka',
        latitude: 12.9716,
        longitude: 77.5946,
        status: 'AVAILABLE',
        reserved_by: null,
        created_at: new Date().toISOString(),
      },
      {
        id: 'bbbb3333-3333-3333-3333-333333333333',
        donor_id: '11111111-1111-1111-1111-111111111111',
        food_name: 'Fresh Harvest Mixed Vegetables',
        food_category: 'raw_ingredients',
        description: 'Farm surplus potatoes, tomatoes, beans and cabbage.',
        quantity: 50,
        unit: 'kg',
        estimated_servings: 200,
        food_condition: 'good',
        preparation_date_time: new Date().toISOString(),
        pickup_start_time: tomorrow.toISOString(),
        pickup_end_time: tomorrowEnd.toISOString(),
        storage_notes: 'Stored in ventilated wooden crates.',
        allergen_notes: 'None',
        pickup_address: '123 MG Road, Bangalore, Karnataka',
        latitude: 12.9716,
        longitude: 77.5946,
        status: 'AVAILABLE',
        reserved_by: null,
        created_at: new Date().toISOString(),
      },
    ];

    this.foodImages = [];
    this.matches = [];
    this.reservations = [];
    this.volunteerAssignments = [
      {
        id: 'vvvv1111-1111-1111-1111-111111111111',
        listing_id: 'bbbb1111-1111-1111-1111-111111111111',
        organization_id: 'aaaa1111-1111-1111-1111-111111111111',
        volunteer_id: '44444444-4444-4444-4444-444444444444',
        pickup_status: 'PENDING',
        delivery_status: 'PENDING',
        assigned_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
    ];

    this.foodSafetyChecks = [];
    this.otpVerifications = [];
    this.handoverRecords = [];

    this.wasteRecoveryListings = [
      {
        id: 'cccc1111-1111-1111-1111-111111111111',
        original_listing_id: 'bbbb2222-2222-2222-2222-222222222222',
        material_name: 'Expired Pastries and Organic Trimmings',
        material_category: 'bakery',
        quantity: 15,
        unit: 'kg',
        collection_start: new Date().toISOString(),
        collection_end: tomorrowEnd.toISOString(),
        pickup_address: '123 MG Road, Bangalore, Karnataka',
        latitude: 12.9716,
        longitude: 77.5946,
        waste_reason: 'EXPIRED_NO_RESERVATION',
        recovery_suitability: 'Ideal for microbial composting or bio-fermentation.',
        recovery_status: 'AVAILABLE',
        created_at: new Date().toISOString(),
      },
    ];

    this.biofarmAcceptances = [];

    this.notifications = [
      {
        id: uuidv4(),
        user_id: '22222222-2222-2222-2222-222222222222',
        type: 'MATCH_AVAILABLE',
        title: 'New Food Rescue Match',
        message: 'Vegetable Biryani (25 kg) is available within 3.2 km of your facility.',
        description: 'Vegetable Biryani (25 kg) is available within 3.2 km of your facility.',
        read: false,
        created_at: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        user_id: '11111111-1111-1111-1111-111111111111',
        type: 'CREDITS_AWARDED',
        title: 'Credits Received!',
        message: 'You earned 250 credits for successfully rescuing 25 kg of food.',
        description: 'You earned 250 credits for successfully rescuing 25 kg of food.',
        read: false,
        created_at: new Date().toISOString(),
      },
    ];

    this.donorCredits = [
      {
        id: uuidv4(),
        donor_id: '11111111-1111-1111-1111-111111111111',
        listing_id: null,
        credits: 350,
        reason: 'Surplus rescue delivery reward',
        created_at: new Date().toISOString(),
      },
    ];

    this.rewardBadges = [
      {
        id: uuidv4(),
        user_id: '11111111-1111-1111-1111-111111111111',
        key: 'FIRST_RESCUE',
        name: 'First Rescue Pioneer',
        badge_name: 'First Rescue Pioneer',
        badge_description: 'Successfully published and completed your first surplus food rescue donation.',
        badge_icon: '🌱',
        earned_at: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        user_id: '11111111-1111-1111-1111-111111111111',
        key: 'COMMUNITY_HERO',
        name: 'Community Hero',
        badge_name: 'Community Hero',
        badge_description: 'Diverted over 100 kg of edible surplus from landfills.',
        badge_icon: '🦸',
        earned_at: new Date().toISOString(),
      },
    ];
  }

  // Helper query methods
  findUserByEmail(email) {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id) {
    return this.users.find((u) => u.id === id);
  }

  getDonorProfile(userId) {
    return this.donorProfiles.find((dp) => dp.user_id === userId);
  }

  getOrganizationByUserId(userId) {
    return this.organizations.find((o) => o.user_id === userId);
  }

  getVolunteerProfile(userId) {
    return this.volunteerProfiles.find((vp) => vp.user_id === userId);
  }

  distance(lat1, lon1, lat2, lon2) {
    return calculateDistanceKm(lat1, lon1, lat2, lon2);
  }
}

const store = new DataStore();

module.exports = {
  store,
  calculateDistanceKm,
};
