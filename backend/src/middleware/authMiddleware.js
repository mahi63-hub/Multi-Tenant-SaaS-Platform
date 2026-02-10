const jwt = require('jsonwebtoken');
const { User, Tenant } = require('../models');

exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized - no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');

    const user = await User.findByPk(decoded.userId, {
      include: [{ model: Tenant, as: 'tenant' }]
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Attach decoded JWT data to request
    req.user = {
      userId: decoded.userId,
      tenantId: decoded.tenantId,
      role: decoded.role,
      ...user.dataValues
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ success: false, message: 'Token is not valid' });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// Middleware to check if user is super admin
exports.isSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Only super admins can access this resource'
    });
  }
  next();
};

// Middleware to check if user is tenant admin or super admin
exports.isTenantAdmin = (req, res, next) => {
  if (req.user.role !== 'tenant_admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Only tenant admins can access this resource'
    });
  }
  next();
};