require('dotenv').config();
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');
const { User, Tenant, Project, Task } = require('../models');

const seed = async () => {
  try {
    console.log('Starting Database Seeding...');

    // 1. Create Tenant (Demo Company)
    const [tenant] = await Tenant.findOrCreate({
      where: { subdomain: 'demo' },
      defaults: {
        name: 'Demo Company',
        subscription_plan: 'pro',
        max_users: 25,
        max_projects: 15,
        status: 'active'
      }
    });
    console.log('✅ Tenant Created:', tenant.name);

    // 2. Create Super Admin
    const salt = await bcrypt.genSalt(10);
    const superAdminPass = await bcrypt.hash('Admin@123', salt);

    const [superAdmin] = await User.findOrCreate({
      where: { email: 'superadmin@system.com' },
      defaults: {
        tenant_id: null,
        full_name: 'System Super Admin',
        password_hash: superAdminPass,
        role: 'super_admin',
        is_active: true
      }
    });
    console.log('✅ Super Admin Created');

    // 3. Create Tenant Admin
    const adminPass = await bcrypt.hash('Demo@123', salt);
    const [tenantAdmin] = await User.findOrCreate({
      where: { email: 'admin@demo.com', tenant_id: tenant.id },
      defaults: {
        full_name: 'Demo Admin',
        password_hash: adminPass,
        role: 'tenant_admin',
        is_active: true
      }
    });
    console.log('✅ Tenant Admin Created');

    // 4. Create Regular Users
    const userPass = await bcrypt.hash('User@123', salt);

    await User.findOrCreate({
      where: { email: 'user1@demo.com', tenant_id: tenant.id },
      defaults: {
        full_name: 'Demo User 1',
        password_hash: userPass,
        role: 'user',
        is_active: true
      }
    });

    await User.findOrCreate({
      where: { email: 'user2@demo.com', tenant_id: tenant.id },
      defaults: {
        full_name: 'Demo User 2',
        password_hash: userPass,
        role: 'user',
        is_active: true
      }
    });
    console.log('✅ Regular Users Created');

    // 5. Create Sample Projects
    const [projectAlpha] = await Project.findOrCreate({
      where: { name: 'Project Alpha', tenant_id: tenant.id },
      defaults: {
        description: 'First demo project',
        status: 'active',
        created_by: tenantAdmin.id
      }
    });

    const [projectBeta] = await Project.findOrCreate({
      where: { name: 'Project Beta', tenant_id: tenant.id },
      defaults: {
        description: 'Second demo project',
        status: 'active',
        created_by: tenantAdmin.id
      }
    });
    console.log('✅ Projects Created (Alpha & Beta)');

    // 6. Create Sample Tasks
    if (projectAlpha) {
      await Task.findOrCreate({
        where: { title: 'Design Homepage', project_id: projectAlpha.id, tenant_id: tenant.id },
        defaults: {
          status: 'completed',
          priority: 'high',
          assigned_to: tenantAdmin.id,
          description: 'Design the homepage mockup'
        }
      });

      await Task.findOrCreate({
        where: { title: 'Implement Auth', project_id: projectAlpha.id, tenant_id: tenant.id },
        defaults: {
          status: 'in_progress',
          priority: 'high',
          assigned_to: tenantAdmin.id,
          description: 'Implement authentication system'
        }
      });

      await Task.findOrCreate({
        where: { title: 'Setup Database', project_id: projectAlpha.id, tenant_id: tenant.id },
        defaults: {
          status: 'todo',
          priority: 'medium',
          description: 'Configure database schema'
        }
      });
    }

    // Create Sample Task for Project Beta
    if (projectBeta) {
      await Task.findOrCreate({
        where: { title: 'Initial Planning', project_id: projectBeta.id, tenant_id: tenant.id },
        defaults: {
          status: 'todo',
          priority: 'medium',
          description: 'Plan project scope and timeline'
        }
      });

      await Task.findOrCreate({
        where: { title: 'Requirements Gathering', project_id: projectBeta.id, tenant_id: tenant.id },
        defaults: {
          status: 'in_progress',
          priority: 'high',
          assigned_to: tenantAdmin.id,
          description: 'Collect requirements from stakeholders'
        }
      });

      await Task.findOrCreate({
        where: { title: 'Design Wireframes', project_id: projectBeta.id, tenant_id: tenant.id },
        defaults: {
          status: 'todo',
          priority: 'medium',
          assigned_to: tenantAdmin.id,
          description: 'Create UI/UX wireframes'
        }
      });
    }

    console.log('✅ Tasks Created');
    console.log('🚀 Seeding Completed Successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Failed:', error);
    process.exit(1);
  }
};

seed();