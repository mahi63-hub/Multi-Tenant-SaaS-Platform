const express = require('express');
const router = express.Router({ mergeParams: true });
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// All user routes require authentication
router.use(protect);

// POST /api/tenants/:tenantId/users - Create user in a specific tenant
router.post('/', userController.createUser);

// GET /api/tenants/:tenantId/users - List users in a specific tenant
router.get('/', (req, res, next) => {
  // Check if this is a nested route from tenants
  if (req.params.tenantId) {
    req.params.id = req.params.tenantId;
    return userController.listTenantUsers(req, res);
  }
  // Otherwise list users in current user's tenant
  return userController.listUsers(req, res);
});

// PUT /api/users/:userId - Update user details
router.put('/:userId', userController.updateUser);

// DELETE /api/users/:userId - Delete user
router.delete('/:userId', userController.deleteUser);

module.exports = router;