🚀 Multi-Tenant SaaS Platform 

This project is a production-ready Multi-Tenant SaaS Platform that I built to understand how real-world SaaS applications work at scale. It’s basically a Project and Task Management System, where multiple organizations can use the same application but still have complete data isolation from each other.

The main focus of this project is strict multi-tenancy, security, and scalability. Even though all tenants share the same database, their data never mixes.

🏢 Multi-Tenant Architecture (Core Idea)

I followed a Shared Database, Shared Schema approach.
Every request automatically passes through middleware that enforces the tenant context, so all database queries include the tenant ID. This ensures that one organization can never access another organization’s data, even by mistake.

🔐 Roles & Access Control (RBAC)

The platform supports three different roles:

Super Admin:
Has system-wide access. This role can view and manage all tenants and subscription plans. Super Admin is not tied to any tenant.

Tenant Admin:
Has full control within their organization. They can manage users, projects, and tasks for their tenant.

Standard User:
Has limited access. They can only view and work on tasks or projects assigned to them.

All access control is strictly enforced at the API level.

💳 Subscription & Plan Limits

Each tenant is assigned a subscription plan like Free, Pro, or Enterprise.
Based on the plan, limits such as the maximum number of users or projects are enforced.
If a tenant tries to exceed these limits, the backend blocks the request and returns a proper error response.

🔑 Authentication & Security

Authentication is handled using JWT (JSON Web Tokens) with a 24-hour expiry.
Passwords are securely hashed before storage.
Security best practices like HTTP headers, CORS configuration, and strict input validation are implemented to protect the application.

🐳 Dockerized Full-Stack Setup

The entire application is fully containerized using Docker.
With a single command, Docker spins up:

the backend

the frontend

the PostgreSQL database

The backend waits for the database to be ready before starting, which makes the setup very reliable and production-friendly.

💾 Data Persistence & Reliability

The database uses named Docker volumes, so data is not lost even if containers stop or restart. This simulates real production behavior and ensures stability during development and testing.

🔄 Automated Database Operations

On container startup, database migrations and seed data run automatically.
This means no manual SQL commands are needed — the system is ready to use immediately after startup.

📱 Frontend Experience

The frontend is built using React with Vite and Tailwind CSS.
It has a clean and responsive UI, a dynamic sidebar based on user role, and real-time dashboard statistics. The UI changes automatically depending on whether the user is a Super Admin, Tenant Admin, or normal user.

🛠️ Tech Stack I Used

Frontend

React (with Vite)

JavaScript

Tailwind CSS

Axios for API calls

Backend

Node.js

Express.js

PostgreSQL

Sequelize ORM

JWT for authentication

DevOps

Docker & Docker Compose

Multi-stage builds

Lightweight Linux-based images

🏗️ Overall Architecture

The system follows a three-tier architecture:

Frontend handles the UI

Backend handles business logic and APIs

Database stores tenant-specific data securely

Each layer is completely separated, which makes the application scalable and maintainable.
