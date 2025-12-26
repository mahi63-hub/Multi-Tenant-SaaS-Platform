Markdown# Enhanced SaaS Platform

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node.js](https://img.shields.io/badge/Node.js-20.x-339933.svg)

A scalable, **multi-tenant SaaS (Software as a Service) backend API** designed for high performance and security. This platform supports organization isolation, project management, and comprehensive audit logging.

**Repository:** [https://github.com/Akashkallepalli/enhanced-saas-platform](https://github.com/Akashkallepalli/enhanced-saas-platform)

## 🚀 Key Features

* **🏢 Multi-Tenancy Architecture**: Built-in support for multiple tenants (organizations) with data isolation logic.
* **🔐 Secure Authentication**: JWT-based authentication flow (`authRoutes.js`) with secure password hashing.
* **👥 User & Role Management**: Granular user controls handled via `userController.js`.
* **📂 Project & Task System**: 
    * Create and manage Projects (`projectController.js`).
    * Assign and track Tasks within projects (`taskController.js`).
* **📜 Audit Logging**: Integrated system to track critical actions (`auditLog.js`) for compliance and security.
* **🗄️ Database Migrations**: Custom migration scripts (`src/scripts/migrate.js`) to manage schema changes reliably.

## 🛠️ Tech Stack

* **Runtime**: Node.js
* **Framework**: Express.js
* **Database**: PostgreSQL (implied by relational models)
* **Architecture**: MVC (Models, Views/Routes, Controllers)

## 📂 Project Structure

```bash
├── migrations/             # SQL migration files
│   ├── 001_create_tenants.sql
│   └── ...
├── src/
│   ├── config/            # Database configuration
│   ├── controllers/       # Business logic
│   │   ├── authController.js
│   │   ├── tenantController.js
│   │   └── ...
│   ├── middleware/        # Auth and Validation middleware
│   ├── models/            # Data models (User, Tenant, AuditLog)
│   ├── routes/            # API Route definitions
│   ├── scripts/           # Utility scripts (seed, migrate)
│   └── app.js             # Application entry point
├── Dockerfile             # Container configuration
└── package.json
⚡ Getting StartedPrerequisitesNode.js (v18 or higher)PostgreSQL DatabaseGitInstallationClone the repositoryBashgit clone [https://github.com/Akashkallepalli/enhanced-saas-platform.git](https://github.com/Akashkallepalli/enhanced-saas-platform.git)
cd enhanced-saas-platform
Install dependenciesBashnpm install
Environment SetupCreate a .env file in the root directory:Code snippetPORT=3000
DB_HOST=localhost
DB_USER=postgres
DB_PASS=yourpassword
DB_NAME=saas_db
JWT_SECRET=your_secure_secret
Run MigrationsInitialize the database schema:Bashnpm run migrate
# OR
node src/scripts/migrate.js
Start the ServerBashnpm start
📡 API Endpoints OverviewModuleRouteDescriptionAuthPOST /api/auth/registerRegister a new userAuthPOST /api/auth/loginLogin and receive JWTTenantsPOST /api/tenantsCreate a new organization (Tenant)ProjectsGET /api/projectsList all projects for current tenantTasksPOST /api/tasksCreate a task in a project🤝 ContributingFork the repository.Create your feature branch (git checkout -b feature/AmazingFeature).Commit your changes (git commit -m 'Add some AmazingFeature').Push to the branch (git push origin feature/AmazingFeature).Open a Pull Request.📄 LicenseDistributed under the MIT License. See LICENSE for more information.