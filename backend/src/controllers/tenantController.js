const { Tenant, User, AuditLog } = require('../models');

// 1. GET /tenants/:id - Get single tenant details
exports.getTenant = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Authorization: super_admin can access all, others only their own
    if (req.user.role !== 'super_admin' && req.user.tenantId !== id) {
      return res.status(403).json({ 
        success: false, 
        message: 'You do not have permission to access this tenant' 
      });
    }

    const tenant = await Tenant.findByPk(id);
    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Tenant retrieved successfully',
      data: tenant 
    });
  } catch (error) {
    console.error('Get Tenant Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. PUT /tenants/:id - Update tenant details
exports.updateTenant = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status, subscription_plan } = req.body;

    // Authorization: super_admin only
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only super admins can update tenants' 
      });
    }

    const tenant = await Tenant.findByPk(id);
    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    // Update subscription plan and set max users/projects accordingly
    let maxUsers = tenant.max_users;
    let maxProjects = tenant.max_projects;

    if (subscription_plan) {
      const planLimits = {
        free: { max_users: 5, max_projects: 3 },
        pro: { max_users: 25, max_projects: 15 },
        enterprise: { max_users: 100, max_projects: 50 }
      };

      if (planLimits[subscription_plan]) {
        maxUsers = planLimits[subscription_plan].max_users;
        maxProjects = planLimits[subscription_plan].max_projects;
      }
    }

    // Update tenant
    await tenant.update({
      name: name || tenant.name,
      status: status || tenant.status,
      subscription_plan: subscription_plan || tenant.subscription_plan,
      max_users: maxUsers,
      max_projects: maxProjects
    });

    // Audit log
    await AuditLog.create({
      tenant_id: id,
      user_id: req.user.userId,
      action: 'UPDATE_TENANT',
      entity_type: 'tenant',
      entity_id: id,
      ip_address: req.ip
    });

    res.status(200).json({ 
      success: true, 
      message: 'Tenant updated successfully',
      data: tenant 
    });
  } catch (error) {
    console.error('Update Tenant Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. GET /tenants - List all tenants (super admin only)
exports.listTenants = async (req, res) => {
  try {
    // Authorization: super_admin only
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only super admins can list all tenants' 
      });
    }

    const { page = 1, limit = 10, status, subscription_plan } = req.query;
    const offset = (page - 1) * limit;
    
    // Build filter object
    const whereClause = {};
    if (status) whereClause.status = status;
    if (subscription_plan) whereClause.subscription_plan = subscription_plan;

    const { count, rows } = await Tenant.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({ 
      success: true, 
      message: 'Tenants retrieved successfully',
      data: {
        tenants: rows,
        pagination: {
          total: count,
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          limit: parseInt(limit)
        }
      } 
    });
  } catch (error) {
    console.error('List Tenants Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};