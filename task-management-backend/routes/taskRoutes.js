const express = require('express');
const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  getAnalytics
} = require('../controllers/taskController');
const { protect, authorize, checkTaskAccess } = require('../middleware/auth');
const { validateTask, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// All task routes require authentication
router.use(protect);

router.route('/')
  .get(getTasks)
  .post(validateTask, handleValidationErrors, createTask);

router.get('/analytics', getAnalytics);

router.route('/:id')
  .get(checkTaskAccess, getTask)
  .put(checkTaskAccess, validateTask, handleValidationErrors, updateTask)
  .delete(checkTaskAccess, deleteTask);

module.exports = router;