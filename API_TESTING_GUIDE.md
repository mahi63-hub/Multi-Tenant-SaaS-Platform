# API Endpoint Testing Guide

## Quick Reference - All 19 Endpoints

### Authentication
All endpoints require Bearer token in Authorization header:
```
Authorization: Bearer <JWT_TOKEN>
```

JWT Token format contains: `{ userId, tenantId, role }`

---

## TENANT MANAGEMENT (3 endpoints)

### 1. GET /tenants/:id
```bash
curl -X GET http://localhost:5000/tenants/{tenantId} \
  -H "Authorization: Bearer $TOKEN"
```
**Response**: Tenant object with details and limits

### 2. PUT /tenants/:id
```bash
curl -X PUT http://localhost:5000/tenants/{tenantId} \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Tenant Name",
    "status": "active",
    "subscription_plan": "pro"
  }'
```
**Roles**: super_admin only
**Auto-updates**: max_users and max_projects based on plan

### 3. GET /tenants?page=1&limit=10&status=active&subscription_plan=pro
```bash
curl -X GET "http://localhost:5000/tenants?page=1&limit=10&status=active" \
  -H "Authorization: Bearer $TOKEN"
```
**Roles**: super_admin only
**Filters**: status, subscription_plan
**Pagination**: page, limit

---

## USER MANAGEMENT (4 endpoints)

### 4. POST /tenants/:tenantId/users
```bash
curl -X POST http://localhost:5000/tenants/{tenantId}/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "full_name": "John Doe",
    "password": "SecurePass123",
    "role": "user"
  }'
```
**Roles**: super_admin, tenant_admin of same tenant
**Validation**:
  - Email, full_name, password all required
  - Password minimum 8 characters
  - Check subscription plan user limit
  - Prevent duplicate emails in tenant

### 5. GET /tenants/:tenantId/users?page=1&limit=10&role=user
```bash
curl -X GET "http://localhost:5000/tenants/{tenantId}/users?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```
**Roles**: super_admin, tenant_admin of same tenant
**Filters**: role (super_admin, tenant_admin, user)
**Returns**: Users without password_hash

### 6. PUT /users/:userId
```bash
curl -X PUT http://localhost:5000/users/{userId} \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Updated Name",
    "role": "tenant_admin",
    "is_active": true
  }'
```
**Roles**: super_admin, tenant_admin of same tenant
**Restrictions**: Tenant admins cannot change their own role

### 7. DELETE /users/:userId
```bash
curl -X DELETE http://localhost:5000/users/{userId} \
  -H "Authorization: Bearer $TOKEN"
```
**Roles**: super_admin, tenant_admin of same tenant
**Restrictions**: Cannot delete last tenant admin
**Cascades**: No - maintains referential integrity

---

## PROJECT MANAGEMENT (4 endpoints)

### 8. POST /projects
```bash
curl -X POST http://localhost:5000/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Q1 Website Redesign",
    "description": "Complete redesign of main website"
  }'
```
**Roles**: Any authenticated user
**Validation**:
  - Name is required
  - Check subscription plan project limit
  - Tenant isolation automatic
**Auto-set**: status='active', created_by=current_user

### 9. GET /projects?page=1&limit=10&status=active
```bash
curl -X GET "http://localhost:5000/projects?page=1&limit=10&status=active" \
  -H "Authorization: Bearer $TOKEN"
```
**Roles**: Any authenticated user (tenant isolation enforced)
**Filters**: status (active, archived, completed)
**Includes**: Creator user details (id, full_name, email)
**Pagination**: page, limit

### 10. PUT /projects/:projectId
```bash
curl -X PUT http://localhost:5000/projects/{projectId} \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Project Name",
    "description": "Updated description",
    "status": "archived"
  }'
```
**Roles**: Any user (tenant isolation enforced)
**Status Options**: active, archived, completed

### 11. DELETE /projects/:projectId
```bash
curl -X DELETE http://localhost:5000/projects/{projectId} \
  -H "Authorization: Bearer $TOKEN"
```
**Roles**: super_admin, tenant_admin of same tenant
**Cascades**: Deletes all associated tasks

---

## TASK MANAGEMENT (4 endpoints)

### 12. POST /projects/:projectId/tasks
```bash
curl -X POST http://localhost:5000/projects/{projectId}/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Design homepage mockup",
    "description": "Create high-fidelity mockups",
    "priority": "high",
    "assigned_to": "{userId}",
    "due_date": "2025-03-15"
  }'
```
**Roles**: Any authenticated user
**Validation**:
  - Title is required
  - Project must exist and belong to tenant
  - Assigned user must exist in same tenant
  - Due date format: YYYY-MM-DD
**Auto-set**: status='todo'

### 13. GET /projects/:projectId/tasks?page=1&limit=10&status=in_progress
```bash
curl -X GET "http://localhost:5000/projects/{projectId}/tasks?page=1&limit=10&status=in_progress" \
  -H "Authorization: Bearer $TOKEN"
```
**Roles**: Any authenticated user (tenant isolation)
**Filters**:
  - status: todo, in_progress, completed
  - priority: low, medium, high
  - assigned_to: user_id
**Includes**: Assignee details (id, full_name, email)

### 14. PATCH /tasks/:taskId/status
```bash
curl -X PATCH http://localhost:5000/tasks/{taskId}/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed"
  }'
```
**Roles**: Any authenticated user
**Status Options**: todo, in_progress, completed
**Purpose**: Lightweight endpoint for status-only updates

### 15. PUT /tasks/:taskId
```bash
curl -X PUT http://localhost:5000/tasks/{taskId} \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated task title",
    "description": "Updated description",
    "status": "in_progress",
    "priority": "medium",
    "assigned_to": "{newUserId}",
    "due_date": "2025-03-20"
  }'
```
**Roles**: Any authenticated user
**Validation**: New assignee must exist in same tenant

---

## SUBSCRIPTION PLAN LIMITS

### Free Plan
- Max Users: 5
- Max Projects: 3
- Response when limit reached: 403 "User/Project limit reached (X max for free plan)"

### Pro Plan
- Max Users: 25
- Max Projects: 15
- Response when limit reached: 403 "User/Project limit reached (X max for pro plan)"

### Enterprise Plan
- Max Users: 100
- Max Projects: 50
- Response when limit reached: 403 "User/Project limit reached (X max for enterprise plan)"

---

## AUDIT LOG TRACKING

Every action creates an audit log entry with:
- `tenant_id`: Which tenant performed the action
- `user_id`: Which user initiated the action
- `action`: Type of action (CREATE_USER, UPDATE_PROJECT, DELETE_TASK, etc.)
- `entity_type`: What was affected (tenant, user, project, task)
- `entity_id`: ID of the affected entity
- `ip_address`: Client IP address
- `created_at`: Timestamp of action

**Actions Logged**:
- REGISTER_TENANT (auth)
- LOGIN_FAILED (auth)
- UPDATE_TENANT
- CREATE_USER
- UPDATE_USER
- DELETE_USER
- CREATE_PROJECT
- UPDATE_PROJECT
- DELETE_PROJECT
- CREATE_TASK
- UPDATE_TASK
- UPDATE_TASK_STATUS
- DELETE_TASK

---

## ERROR RESPONSE EXAMPLES

### Missing Required Field
```json
{
  "success": false,
  "message": "Email, full name, and password are required"
}
```
**Status**: 400

### Unauthorized (Wrong Role)
```json
{
  "success": false,
  "message": "Only super admins can update tenants"
}
```
**Status**: 403

### Resource Not Found
```json
{
  "success": false,
  "message": "Project not found"
}
```
**Status**: 404

### Subscription Limit Exceeded
```json
{
  "success": false,
  "message": "User limit reached (5 max for free plan)"
}
```
**Status**: 403

### Duplicate Resource
```json
{
  "success": false,
  "message": "User with this email already exists in this tenant"
}
```
**Status**: 409

### Server Error
```json
{
  "success": false,
  "message": "Error message details"
}
```
**Status**: 500

---

## SUCCESS RESPONSE EXAMPLES

### Created Resource
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "uuid...",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "user",
    "tenant_id": "uuid...",
    "is_active": true
  }
}
```
**Status**: 201

### Retrieved Single Resource
```json
{
  "success": true,
  "message": "Tenant retrieved successfully",
  "data": {
    "id": "uuid...",
    "name": "Acme Corp",
    "subdomain": "acmecorp",
    "status": "active",
    "subscription_plan": "pro",
    "max_users": 25,
    "max_projects": 15
  }
}
```
**Status**: 200

### Retrieved List with Pagination
```json
{
  "success": true,
  "message": "Projects retrieved successfully",
  "data": {
    "projects": [
      { "id": "...", "name": "...", "status": "...", ... },
      { "id": "...", "name": "...", "status": "...", ... }
    ],
    "pagination": {
      "total": 45,
      "currentPage": 1,
      "totalPages": 5,
      "limit": 10
    }
  }
}
```
**Status**: 200

---

## TESTING CHECKLIST

- [ ] All 19 endpoints accessible with valid JWT
- [ ] Super admin can access all tenants
- [ ] Tenant admin limited to own tenant
- [ ] Regular users limited to own tenant
- [ ] Subscription limits enforced (Free 5/3, Pro 25/15, Ent 100/50)
- [ ] Audit logs created for all actions
- [ ] Passwords hashed with bcrypt
- [ ] Email validation prevents duplicates in same tenant
- [ ] Pagination works with page and limit
- [ ] Filters work correctly (status, role, priority, etc.)
- [ ] Transactions rollback on error
- [ ] Cross-tenant access prevented
- [ ] Last admin cannot be deleted
- [ ] Tasks cascade delete with project
- [ ] All error codes correct (400, 403, 404, 409, 500)

