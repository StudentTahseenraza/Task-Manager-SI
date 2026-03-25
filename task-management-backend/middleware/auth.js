const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authentication middleware
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User not found'
        });
      }

      if (!req.user.isActive) {
        return res.status(401).json({
          success: false,
          error: 'Account is disabled'
        });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({
        success: false,
        error: 'Not authorized'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized, no token'
    });
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// Check task access based on role and ownership
const checkTaskAccess = async (req, res, next) => {
  try {
    const Task = require('../models/Task');
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    const user = req.user;

    // Admin: full access to all tasks
    if (user.role === 'admin') {
      req.task = task;
      return next();
    }

    // Manager: access to own tasks and tasks of users they manage
    if (user.role === 'manager') {
      // Check if task is created by or assigned to the manager
      if (task.createdBy.toString() === user._id.toString() ||
          (task.assignedTo && task.assignedTo.toString() === user._id.toString())) {
        req.task = task;
        return next();
      }
      
      // Check if task belongs to a user under this manager
      const User = require('../models/User');
      const taskOwner = await User.findById(task.createdBy);
      
      if (taskOwner && taskOwner.managerId && 
          taskOwner.managerId.toString() === user._id.toString()) {
        req.task = task;
        return next();
      }
    }

    // User/Viewer: only access their own tasks
    if (task.createdBy.toString() === user._id.toString() ||
        (task.assignedTo && task.assignedTo.toString() === user._id.toString())) {
      req.task = task;
      return next();
    }

    // Check if task is public
    if (task.isPublic) {
      req.task = task;
      return next();
    }

    return res.status(403).json({
      success: false,
      error: 'Not authorized to access this task'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { protect, authorize, checkTaskAccess };