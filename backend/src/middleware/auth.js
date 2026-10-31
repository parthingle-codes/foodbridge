const jwt = require('jsonwebtoken');
const config = require('../config');
const db = require('../config/database');
const { store } = require('../services/dataStore');

// Authenticate JWT token
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.secret);
    } catch (e) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token.',
      });
    }

    // Check store first
    let user = store.findUserById(decoded.userId);

    // If not in store and db is connected, check postgres
    if (!user && db.isConnected) {
      const result = await db.query(
        'SELECT id, email, role, sub_role, is_active FROM users WHERE id = $1',
        [decoded.userId]
      );
      if (result.rows.length > 0) {
        user = result.rows[0];
      }
    }

    if (!user || user.is_active === false) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found or inactive.',
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      subRole: user.sub_role || user.role,
      name: user.full_name || user.name,
      fullName: user.full_name || user.name,
    };

    next();
  } catch (error) {
    next(error);
  }
};

// Authorize by role(s)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated.',
      });
    }

    // Role aliases (e.g. NGO / DISTRIBUTOR / ORGANIZATION)
    const normalizedUserRole = req.user.role.toUpperCase();
    const authorizedRoles = roles.map((r) => r.toUpperCase());

    const isMatch = authorizedRoles.some((role) => {
      if (role === normalizedUserRole) return true;
      if (
        (role === 'DISTRIBUTOR' || role === 'NGO' || role === 'ORGANIZATION') &&
        (normalizedUserRole === 'DISTRIBUTOR' || normalizedUserRole === 'NGO' || normalizedUserRole === 'ORGANIZATION')
      ) {
        return true;
      }
      return false;
    });

    if (!isMatch) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions for role ' + req.user.role,
      });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
