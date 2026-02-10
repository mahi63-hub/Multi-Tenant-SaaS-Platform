const sequelize = require('../config/database');
const Tenant = require('./tenant');
const User = require('./user');
const Project = require('./project');
const Task = require('./task');
const AuditLog = require('./auditLog');

// --- Relationships ---

// Tenant has many...
Tenant.hasMany(User, { foreignKey: 'tenant_id', as: 'users' });
Tenant.hasMany(Project, { foreignKey: 'tenant_id', as: 'projects' });
Tenant.hasMany(Task, { foreignKey: 'tenant_id', as: 'tasks' });
Tenant.hasMany(AuditLog, { foreignKey: 'tenant_id', as: 'auditLogs' });

// User relationships
User.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant' });
User.hasMany(Project, { foreignKey: 'created_by', as: 'createdProjects' });
User.hasMany(Task, { foreignKey: 'assigned_to', as: 'assignedTasks' });
User.hasMany(AuditLog, { foreignKey: 'user_id', as: 'auditLogs' });

// Project relationships
Project.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant' });
Project.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
Project.hasMany(Task, { foreignKey: 'project_id', as: 'tasks' });

// Task relationships
Task.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant' });
Task.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });
Task.belongsTo(User, { foreignKey: 'assigned_to', as: 'assignee' });

// AuditLog relationships
AuditLog.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant' });
AuditLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  sequelize,
  Tenant,
  User,
  Project,
  Task,
  AuditLog
};