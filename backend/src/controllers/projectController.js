const { Project, Task, User, Tenant, AuditLog, sequelize } = require('../models');

// 1. POST /projects - Create new project
exports.createProject = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { name, description } = req.body;

    // Validation
    if (!name) {
      await transaction.rollback();
      return res.status(400).json({ 
        success: false, 
        message: 'Project name is required' 
      });
    }

    // Get tenant info
    const tenant = await Tenant.findByPk(req.user.tenantId);
    if (!tenant) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    // Check project limit
    const projectCount = await Project.count({ 
      where: { tenant_id: req.user.tenantId } 
    });
    
    if (projectCount >= tenant.max_projects) {
      await transaction.rollback();
      return res.status(403).json({ 
        success: false, 
        message: `Project limit reached (${tenant.max_projects} max for ${tenant.subscription_plan} plan)` 
      });
    }

    // Create project
    const project = await Project.create({
      tenant_id: req.user.tenantId,
      name,
      description,
      status: 'active',
      created_by: req.user.userId
    }, { transaction });

    // Audit log
    await AuditLog.create({
      tenant_id: req.user.tenantId,
      user_id: req.user.userId,
      action: 'CREATE_PROJECT',
      entity_type: 'project',
      entity_id: project.id,
      ip_address: req.ip
    }, { transaction });

    await transaction.commit();

    res.status(201).json({ 
      success: true, 
      message: 'Project created successfully',
      data: project 
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Create Project Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. GET /projects - List projects in tenant
exports.getProjects = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { tenant_id: req.user.tenantId };
    if (status) {
      whereClause.status = status;
    }

    const { count, rows } = await Project.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
      include: [
        { 
          model: User, 
          as: 'creator', 
          attributes: ['id', 'full_name', 'email'] 
        }
      ]
    });

    res.status(200).json({ 
      success: true, 
      message: 'Projects retrieved successfully',
      data: {
        projects: rows,
        pagination: {
          total: count,
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          limit: parseInt(limit)
        }
      } 
    });
  } catch (error) {
    console.error('Get Projects Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. PUT /projects/:id - Update project
exports.updateProject = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;

    // Find project
    const project = await Project.findOne({
      where: { id, tenant_id: req.user.tenantId }
    });

    if (!project) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Authorization: super_admin can update all, others only their own
    if (req.user.role !== 'super_admin') {
      if (req.user.tenantId !== project.tenant_id) {
        await transaction.rollback();
        return res.status(403).json({ 
          success: false, 
          message: 'You do not have permission to update this project' 
        });
      }
    }

    // Update project
    await project.update({
      name: name || project.name,
      description: description || project.description,
      status: status || project.status
    }, { transaction });

    // Audit log
    await AuditLog.create({
      tenant_id: req.user.tenantId,
      user_id: req.user.userId,
      action: 'UPDATE_PROJECT',
      entity_type: 'project',
      entity_id: project.id,
      ip_address: req.ip
    }, { transaction });

    await transaction.commit();

    res.status(200).json({ 
      success: true, 
      message: 'Project updated successfully',
      data: project 
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Update Project Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. DELETE /projects/:id - Delete project
exports.deleteProject = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;

    // Find project
    const project = await Project.findOne({
      where: { id, tenant_id: req.user.tenantId }
    });

    if (!project) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Authorization: super_admin can delete all, tenant_admin can delete in their tenant
    if (req.user.role !== 'super_admin') {
      if (req.user.role !== 'tenant_admin' || req.user.tenantId !== project.tenant_id) {
        await transaction.rollback();
        return res.status(403).json({ 
          success: false, 
          message: 'You do not have permission to delete this project' 
        });
      }
    }

    // Audit log before deletion
    await AuditLog.create({
      tenant_id: project.tenant_id,
      user_id: req.user.userId,
      action: 'DELETE_PROJECT',
      entity_type: 'project',
      entity_id: project.id,
      ip_address: req.ip
    }, { transaction });

    // Delete all tasks associated with project
    await Task.destroy({
      where: { project_id: id }
    }, { transaction });

    // Delete project
    await project.destroy({ transaction });

    await transaction.commit();

    res.status(200).json({ 
      success: true, 
      message: 'Project deleted successfully',
      data: { id: project.id } 
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Delete Project Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      where: { id: req.params.id, tenant_id: req.user.tenantId },
      include: [
        { model: User, as: 'creator', attributes: ['id', 'full_name'] }
      ]
    });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};