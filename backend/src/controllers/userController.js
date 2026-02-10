const bcrypt = require('bcryptjs');
const { User, Tenant, AuditLog, sequelize } = require('../models');

// 1. POST /tenants/:id/users - Create new user in tenant
exports.createUser = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    // Handle both tenantId and id parameter names
    const tenantId = req.params.tenantId || req.params.id;
    const { email, full_name, password, role } = req.body;

    // Validation
    if (!email || !full_name || !password) {
      await transaction.rollback();
      return res.status(400).json({ 
        success: false, 
        message: 'Email, full name, and password are required' 
      });
    }

    if (password.length < 8) {
      await transaction.rollback();
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 8 characters' 
      });
    }

    // Authorization: super_admin or tenant_admin of same tenant
    if (req.user.role !== 'super_admin' && 
        (req.user.role !== 'tenant_admin' || req.user.tenantId !== tenantId)) {
      await transaction.rollback();
      return res.status(403).json({ 
        success: false, 
        message: 'Only super admins or tenant admins can create users' 
      });
    }

    // Check tenant exists
    const tenant = await Tenant.findByPk(tenantId);
    if (!tenant) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    // Check user limit
    const userCount = await User.count({ 
      where: { tenant_id: tenantId } 
    });
    
    if (userCount >= tenant.max_users) {
      await transaction.rollback();
      return res.status(403).json({ 
        success: false, 
        message: `User limit reached (${tenant.max_users} max for ${tenant.subscription_plan} plan)` 
      });
    }

    // Check if user already exists in this tenant
    const existingUser = await User.findOne({ 
      where: { email, tenant_id: tenantId } 
    });
    
    if (existingUser) {
      await transaction.rollback();
      return res.status(409).json({ 
        success: false, 
        message: 'User with this email already exists in this tenant' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      tenant_id: tenantId,
      email,
      password_hash,
      full_name,
      role: role || 'user',
      is_active: true
    }, { transaction });

    // Audit log
    await AuditLog.create({
      tenant_id: tenantId,
      user_id: req.user.userId,
      action: 'CREATE_USER',
      entity_type: 'user',
      entity_id: user.id,
      ip_address: req.ip
    }, { transaction });

    await transaction.commit();

    res.status(201).json({ 
      success: true, 
      message: 'User created successfully',
      data: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        tenant_id: user.tenant_id
      } 
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Create User Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. GET /tenants/:id/users - List users in tenant
exports.listTenantUsers = async (req, res) => {
  try {
    // Handle both tenantId and id parameter names
    const tenantId = req.params.tenantId || req.params.id;
    const { page = 1, limit = 10, role } = req.query;

    // Authorization: super_admin or tenant_admin of same tenant
    if (req.user.role !== 'super_admin' && 
        (req.user.role !== 'tenant_admin' || req.user.tenantId !== tenantId)) {
      return res.status(403).json({ 
        success: false, 
        message: 'You do not have permission to list users in this tenant' 
      });
    }

    const offset = (page - 1) * limit;
    const whereClause = { tenant_id: tenantId };
    
    if (role) {
      whereClause.role = role;
    }

    const { count, rows } = await User.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
      attributes: { exclude: ['password_hash'] }
    });

    res.status(200).json({ 
      success: true, 
      message: 'Users retrieved successfully',
      data: {
        users: rows,
        pagination: {
          total: count,
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          limit: parseInt(limit)
        }
      } 
    });
  } catch (error) {
    console.error('List Tenant Users Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. PUT /users/:id - Update user details
exports.updateUser = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { full_name, role, is_active } = req.body;

    // Find user
    const user = await User.findByPk(id);
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Authorization: super_admin can update anyone, tenant_admin can update users in their tenant
    if (req.user.role !== 'super_admin') {
      if (req.user.role !== 'tenant_admin' || req.user.tenantId !== user.tenant_id) {
        await transaction.rollback();
        return res.status(403).json({ 
          success: false, 
          message: 'You do not have permission to update this user' 
        });
      }
      
      // Tenant admins cannot change their own role
      if (role && id === req.user.userId) {
        await transaction.rollback();
        return res.status(403).json({ 
          success: false, 
          message: 'You cannot change your own role' 
        });
      }
    }

    // Update user
    await user.update({
      full_name: full_name || user.full_name,
      role: role || user.role,
      is_active: is_active !== undefined ? is_active : user.is_active
    }, { transaction });

    // Audit log
    await AuditLog.create({
      tenant_id: user.tenant_id,
      user_id: req.user.userId,
      action: 'UPDATE_USER',
      entity_type: 'user',
      entity_id: user.id,
      ip_address: req.ip
    }, { transaction });

    await transaction.commit();

    res.status(200).json({ 
      success: true, 
      message: 'User updated successfully',
      data: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        is_active: user.is_active,
        tenant_id: user.tenant_id
      } 
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Update User Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. DELETE /users/:id - Delete user
exports.deleteUser = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;

    // Find user
    const user = await User.findByPk(id);
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Authorization: super_admin only, or tenant_admin in same tenant
    if (req.user.role !== 'super_admin' && 
        (req.user.role !== 'tenant_admin' || req.user.tenantId !== user.tenant_id)) {
      await transaction.rollback();
      return res.status(403).json({ 
        success: false, 
        message: 'You do not have permission to delete this user' 
      });
    }

    // Prevent deleting the last tenant admin
    if (user.role === 'tenant_admin' && user.tenant_id) {
      const adminCount = await User.count({
        where: { 
          tenant_id: user.tenant_id, 
          role: 'tenant_admin',
          is_active: true 
        }
      });
      
      if (adminCount <= 1) {
        await transaction.rollback();
        return res.status(403).json({ 
          success: false, 
          message: 'Cannot delete the last tenant admin' 
        });
      }
    }

    // Audit log before deletion
    await AuditLog.create({
      tenant_id: user.tenant_id,
      user_id: req.user.userId,
      action: 'DELETE_USER',
      entity_type: 'user',
      entity_id: user.id,
      ip_address: req.ip
    }, { transaction });

    // Delete user
    await user.destroy({ transaction });

    await transaction.commit();

    res.status(200).json({ 
      success: true, 
      message: 'User deleted successfully',
      data: { id: user.id } 
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Delete User Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.listUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: { tenant_id: req.user.tenantId },
      attributes: { exclude: ['password_hash'] }
    });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};