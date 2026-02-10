const express = require('express');
const router = express.Router({ mergeParams: true });
const taskController = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

// All task routes require authentication
router.use(protect);

// POST /api/projects/:projectId/tasks - Create task in a specific project
router.post('/', taskController.createTask);

// GET /api/projects/:projectId/tasks - List tasks in a specific project
router.get('/', (req, res, next) => {
  // Check if this is a nested route from projects
  if (req.params.projectId) {
    req.params.id = req.params.projectId;
    return taskController.getTasks(req, res);
  }
  // Otherwise list all tasks for current user
  return taskController.getTasks(req, res);
});

// PATCH /api/tasks/:taskId/status - Update task status only
router.patch('/:taskId/status', taskController.updateTaskStatus);

// PUT /api/tasks/:taskId - Update full task details
router.put('/:taskId', taskController.updateTask);

// DELETE /api/tasks/:taskId - Delete task
router.delete('/:taskId', taskController.deleteTask);

module.exports = router;