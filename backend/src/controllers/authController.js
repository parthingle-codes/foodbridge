const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const config = require('../config');
const { success, error, created } = require('../utils/response');
const { store } = require('../services/dataStore');

// Normalize role from frontend variants
const normalizeRole = (role) => {
  if (!role) return 'DONOR';
  const r = role.toString().toUpperCase().trim();
  if (r === 'NGO' || r === 'ORGANIZATION' || r === 'DISTRIBUTOR') return 'DISTRIBUTOR';
  if (r === 'VOLUNTEER') return 'VOLUNTEER';
  if (r === 'BIOFARM') return 'BIOFARM';
  if (r === 'ADMIN') return 'ADMIN';
  return 'DONOR';
};

const register = async (req, res, next) => {
  try {
    const {
      name,
      fullName,
      email,
      phone,
      password,
      role: rawRole,
      address,
      organizationName,
      registrationNumber,
      operatingHours,
      capacity,
      vehicleType,
      availableHours,
      farmName,
      processingCapacity,
      processingMethods,
    } = req.body;

    const displayName = name || fullName;

    if (!email || !password || !displayName) {
      return error(res, 'Name, email, and password are required', 400);
    }

    const role = normalizeRole(rawRole);
    const existingUser = store.findUserByEmail(email);
    if (existingUser) {
      return error(res, 'User with this email already exists', 409);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    const newUser = {
      id: userId,
      email: email.toLowerCase(),
      password_hash: passwordHash,
      full_name: displayName,
      phone: phone || null,
      role,
      sub_role: rawRole || role,
      address: address || null,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    store.users.push(newUser);

    // Create role-specific profile in store
    if (role === 'DONOR') {
      store.donorProfiles.push({
        id: uuidv4(),
        user_id: userId,
        organization_name: organizationName || displayName,
        address: address || null,
        latitude: 12.9716,
        longitude: 77.5946,
        total_donations: 0,
        total_quantity_kg: 0,
        rating: 5.0,
      });
    } else if (role === 'DISTRIBUTOR') {
      store.organizations.push({
        id: uuidv4(),
        user_id: userId,
        name: organizationName || displayName,
        type: 'NGO',
        registration_number: registrationNumber || 'NGO-' + Date.now(),
        description: `${displayName} Food Rescue Network`,
        address: address || 'Bangalore, Karnataka',
        latitude: 12.9750,
        longitude: 77.6100,
        service_radius_km: 35,
        accepted_categories: ['cooked_meals', 'raw_ingredients', 'packaged_food', 'bakery', 'fruits_vegetables', 'dairy'],
        daily_capacity_kg: parseFloat(capacity) || 200,
        current_load_kg: 0,
        operating_hours: operatingHours || { start: '08:00', end: '20:00' },
        operating_days: [1, 2, 3, 4, 5, 6, 7],
        is_verified: true,
        is_active: true,
      });
    } else if (role === 'VOLUNTEER') {
      store.volunteerProfiles.push({
        id: uuidv4(),
        user_id: userId,
        organization_id: store.organizations[0]?.id || null,
        vehicle_type: vehicleType || 'bike',
        max_carry_kg: 25,
        latitude: 12.9730,
        longitude: 77.6050,
        is_available: true,
        availability_start: '08:00',
        availability_end: '20:00',
        available_days: [1, 2, 3, 4, 5, 6, 7],
        total_deliveries: 0,
        total_distance_km: 0,
        rating: 5.0,
      });
    } else if (role === 'BIOFARM') {
      store.organizations.push({
        id: uuidv4(),
        user_id: userId,
        name: farmName || organizationName || displayName,
        type: 'WASTE_RECOVERY_ORGANIZATION',
        registration_number: registrationNumber || 'BIO-' + Date.now(),
        description: `${farmName || displayName} Organic Recovery`,
        address: address || 'Whitefield, Bangalore',
        latitude: 12.9698,
        longitude: 77.7500,
        service_radius_km: 50,
        accepted_categories: processingMethods || ['composting', 'biogas', 'approved_reuse'],
        daily_capacity_kg: parseFloat(processingCapacity) || 1000,
        current_load_kg: 0,
        operating_hours: { start: '06:00', end: '18:00' },
        operating_days: [1, 2, 3, 4, 5, 6],
        is_verified: true,
        is_active: true,
      });
    }

    const token = jwt.sign(
      { userId, email: newUser.email, role: newUser.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    return created(res, {
      token,
      user: {
        id: userId,
        name: displayName,
        fullName: displayName,
        email: newUser.email,
        phone: newUser.phone,
        role: rawRole || role.toLowerCase(),
        normalizedRole: role,
        address: newUser.address,
      },
    }, 'User registered successfully');
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return error(res, 'Email and password are required', 400);
    }

    const user = store.findUserByEmail(email);
    if (!user) {
      return error(res, 'Invalid email or password', 401);
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return error(res, 'Invalid email or password', 401);
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    return success(res, {
      token,
      user: {
        id: user.id,
        name: user.full_name,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        role: (user.sub_role || user.role).toLowerCase(),
        normalizedRole: user.role,
        address: user.address,
      },
    }, 'Login successful');
  } catch (err) {
    next(err);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = store.findUserById(userId);

    if (!user) {
      return error(res, 'User not found', 404);
    }

    let extraProfile = {};
    if (user.role === 'DONOR') {
      extraProfile = store.getDonorProfile(userId) || {};
    } else if (user.role === 'DISTRIBUTOR' || user.role === 'BIOFARM') {
      extraProfile = store.getOrganizationByUserId(userId) || {};
    } else if (user.role === 'VOLUNTEER') {
      extraProfile = store.getVolunteerProfile(userId) || {};
    }

    return success(res, {
      id: user.id,
      name: user.full_name,
      fullName: user.full_name,
      email: user.email,
      phone: user.phone,
      role: (user.sub_role || user.role).toLowerCase(),
      normalizedRole: user.role,
      address: user.address || extraProfile.address || '',
      profile: extraProfile,
    }, 'Profile retrieved successfully');
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = store.findUserById(userId);

    if (!user) {
      return error(res, 'User not found', 404);
    }

    const { name, fullName, phone, address, avatarUrl } = req.body;
    if (name || fullName) user.full_name = name || fullName;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (avatarUrl !== undefined) user.avatar_url = avatarUrl;

    return success(res, {
      id: user.id,
      name: user.full_name,
      fullName: user.full_name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
    }, 'Profile updated successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  getMe: getProfile,
  updateProfile,
};
