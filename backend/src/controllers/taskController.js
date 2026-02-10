const { Task, Project, User, AuditLog, sequelize } = require('../models');

// 1. POST /projects/:id/tasks - Create new task
exports.createTask = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    // Handle both projectId and id parameter names
    const projectId = req.params.projectId || req.params.id;
    const { title, description, priority, assigned_to, due_date } = req.body;

    // Validation
    if (!title) {
      await transaction.rollback();
      return res.status(400).json({ 
        success: false, 
        message: 'Task title is required' 
      });
    }

    // Check project exists and belongs to user's tenant
    const project = await Project.findOne({ 
      where: { id: projectId, tenant_id: req.user.tenantId } 
    });

    if (!project) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // If assigning to someone, verify they're in the same tenant
    if (assigned_to) {
      const assignee = await User.findOne({
        where: { id: assigned_to, tenant_id: req.user.tenantId }
      });
      
      if (!assignee) {
        await transaction.rollback();
        return res.status(404).json({ success: false, message: 'Assigned user not found in tenant' });
      }
    }

    // Create task
    const task = await Task.create({
      project_id: projectId,
      tenant_id: req.user.tenantId,
      title,
      description,
      status: 'todo',
      priority: priority || 'medium',
      assigned_to,
      due_date
    }, { transaction });

    // Audit log
    await AuditLog.create({
      tenant_id: req.user.tenantId,
      user_id: req.user.userId,
      action: 'CREATE_TASK',
      entity_type: 'task',
      entity_id: task.id,
      ip_address: req.ip
    }, { transaction });

    await transaction.commit();

    res.status(201).json({ 
      success: true, 
      message: 'Task created successfully',
      data: task 
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Create Task Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. GET /projects/:id/tasks - List tasks in project
exports.getTasks = async (req, res) => {
  try {
    // Handle both projectId and id parameter names
    const projectId = req.params.projectId || req.params.id;
    const { page = 1, limit = 10, status, priority, assigned_to } = req.query;
    const offset = (page - 1) * limit;

    // Verify project belongs to user's tenant
    const project = await Project.findOne({
      where: { id: projectId, tenant_id: req.user.tenantId }
    });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const whereClause = { 
      project_id: projectId, 
      tenant_id: req.user.tenantId 
    };

    if (status) whereClause.status = status;
    if (priority) whereClause.priority = priority;
    if (assigned_to) whereClause.assigned_to = assigned_to;

    const { count, rows } = await Task.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
      include: [
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'full_name', 'email']
        }
      ]
    });

    res.status(200).json({ 
      success: true, 
      message: 'Tasks retrieved successfully',
      data: {
        tasks: rows,
        pagination: {
          total: count,
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          limit: parseInt(limit)
        }
      } 
    });
  } catch (error) {
    console.error('Get Tasks Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. PATCH /tasks/:id/status - Update task status
exports.updateTaskStatus = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validation
    if (!status) {
      await transaction.rollback();
      return res.status(400).json({ 
        success: false, 
        message: 'Status is required' 
      });
    }

    const validStatuses = ['todo', 'in_progress', 'completed'];
    if (!validStatuses.includes(status)) {
      await transaction.rollback();
      return res.status(400).json({ 
        success: false, 
        message: `Status must be one of: ${validStatuses.join(', ')}` 
      });
    }

    // Find task
    const task = await Task.findOne({ 
      where: { id, tenant_id: req.user.tenantId } 
    });
    
    if (!task) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Update status
    await task.update({ status }, { transaction });

    // Audit log
    await AuditLog.create({
      tenant_id: req.user.tenantId,
      user_id: req.user.userId,
      action: 'UPDATE_TASK_STATUS',
      entity_type: 'task',
      entity_id: task.id,
      ip_address: req.ip
    }, { transaction });

    await transaction.commit();

    res.status(200).json({ 
      success: true, 
      message: 'Task status updated successfully',
      data: task 
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Update Task Status Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. PUT /tasks/:id - Update full task details
exports.updateTask = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { title, description, status, priority, assigned_to, due_date } = req.body;

    // Find task
    const task = await Task.findOne({ 
      where: { id, tenant_id: req.user.tenantId } 
    });

    if (!task) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // If assigning to someone, verify they're in the same tenant
    if (assigned_to && assigned_to !== task.assigned_to) {
      const assignee = await User.findOne({
        where: { id: assigned_to, tenant_id: req.user.tenantId }
      });
      
      if (!assignee) {
        await transaction.rollback();
        return res.status(404).json({ success: false, message: 'Assigned user not found in tenant' });
      }
    }

    // Update task
    await task.update({
      title: title || task.title,
      description: description || task.description,
      status: status || task.status,
      priority: priority || task.priority,
      assigned_to: assigned_to || task.assigned_to,
      due_date: due_date || task.due_date
    }, { transaction });

    // Audit log
    await AuditLog.create({
      tenant_id: req.user.tenantId,
      user_id: req.user.userId,
      action: 'UPDATE_TASK',
      entity_type: 'task',
      entity_id: task.id,
      ip_address: req.ip
    }, { transaction });

    await transaction.commit();

    res.status(200).json({ 
      success: true, 
      message: 'Task updated successfully',
      data: task 
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Update Task Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOne({ 
      where: { id: req.params.id, tenant_id: req.user.tenantId } 
    });

    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    await task.destroy();

    await AuditLog.create({
      action: 'DELETE_TASK',
      entity_type: 'Task',
      entity_id: req.params.id,
      tenant_id: req.user.tenantId,
      user_id: req.user.id
    });

    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};