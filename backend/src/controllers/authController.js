const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User, Tenant, sequelize, AuditLog } = require('../models');

// Helper to generate JWT
const generateToken = (userId, tenantId, role) => {
  return jwt.sign(
    { userId, tenantId, role },
    process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    { expiresIn: '24h' }
  );
};

exports.registerTenant = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { tenantName, subdomain, adminEmail, adminPassword, adminFullName } = req.body;

    // Validation
    if (!tenantName || !subdomain || !adminEmail || !adminPassword || !adminFullName) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (adminPassword.length < 8) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }

    // Check existing subdomain
    const existingTenant = await Tenant.findOne({ where: { subdomain } });
    if (existingTenant) {
      await transaction.rollback();
      return res.status(409).json({ success: false, message: 'Subdomain already exists' });
    }

    // Create tenant
    const tenant = await Tenant.create({
      name: tenantName,
      subdomain,
      status: 'active',
      subscription_plan: 'free',
      max_users: 5,
      max_projects: 3
    }, { transaction });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(adminPassword, salt);

    // Create admin user
    const admin = await User.create({
      tenant_id: tenant.id,
      email: adminEmail,
      password_hash,
      full_name: adminFullName,
      role: 'tenant_admin',
      is_active: true
    }, { transaction });

    await transaction.commit();

    // Audit log
    await AuditLog.create({
      tenant_id: tenant.id,
      user_id: admin.id,
      action: 'REGISTER_TENANT',
      entity_type: 'tenant',
      entity_id: tenant.id,
      ip_address: req.ip
    });

    res.status(201).json({
      success: true,
      message: 'Tenant registered successfully',
      data: {
        tenantId: tenant.id,
        subdomain: tenant.subdomain,
        adminUser: {
          id: admin.id,
          email: admin.email,
          fullName: admin.full_name,
          role: admin.role
        }
      }
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error('Register Tenant Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, tenantSubdomain } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Find user by email
    const user = await User.findOne({
      where: { email },
      include: [{ model: Tenant, as: 'tenant' }]
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      await AuditLog.create({
        tenant_id: user.tenant_id,
        user_id: user.id,
        action: 'LOGIN_FAILED',
        entity_type: 'user',
        entity_id: user.id,
        ip_address: req.ip
      });
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Account is inactive' });
    }

    // Tenant validation for non-super_admin users
    if (user.role !== 'super_admin') {
      if (!tenantSubdomain) {
        return res.status(400).json({ success: false, message: 'Tenant subdomain is required' });
      }

      const tenant = await Tenant.findOne({ where: { subdomain: tenantSubdomain } });
      if (!tenant) {
        return res.status(404).json({ success: false, message: 'Tenant not found' });
      }

      if (user.tenant_id !== tenant.id) {
        return res.status(401).json({ success: false, message: 'Invalid tenant' });
      }

      if (tenant.status === 'suspended') {
        return res.status(403).json({ success: false, message: 'Tenant is suspended' });
      }
    }

    // Generate token
    const token = generateToken(user.id, user.tenant_id, user.role);

    // Audit log
    await AuditLog.create({
      tenant_id: user.tenant_id,
      user_id: user.id,
      action: 'LOGIN',
      entity_type: 'user',
      entity_id: user.id,
      ip_address: req.ip
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          tenantId: user.tenant_id
        },
        token,
        expiresIn: 86400
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.logout = async (req, res) => {
  try {
    if (req.user) {
      await AuditLog.create({
        tenant_id: req.user.tenant_id,
        user_id: req.user.id,
        action: 'LOGOUT',
        entity_type: 'user',
        entity_id: req.user.id,
        ip_address: req.ip
      });
    }
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: { exclude: ['password_hash'] },
      include: [{ model: Tenant, as: 'tenant' }]
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        isActive: user.is_active,
        tenant: user.tenant ? {
          id: user.tenant.id,
          name: user.tenant.name,
          subdomain: user.tenant.subdomain,
          subscriptionPlan: user.tenant.subscription_plan,
          maxUsers: user.tenant.max_users,
          maxProjects: user.tenant.max_projects
        } : null
      }
    });
  } catch (error) {
    console.error('Get Me Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};