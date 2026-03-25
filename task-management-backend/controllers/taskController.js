const Task = require('../models/Task');
const User = require('../models/User');

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res, next) => {
  try {
    req.body.createdBy = req.user.id;
    
    // If assignedTo is provided, check if user exists
    if (req.body.assignedTo) {
      const assignedUser = await User.findById(req.body.assignedTo);
      if (!assignedUser) {
        return res.status(404).json({
          success: false,
          error: 'Assigned user not found'
        });
      }
    }

    const task = await Task.create(req.body);
    
    res.status(201).json({
      success: true,
      task
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tasks with filters
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    const { status, priority, search, sortBy, sortOrder, page = 1, limit = 10, view } = req.query;
    
    // Build query based on user role
    let query = {};
    const user = req.user;
    
    if (user.role === 'admin') {
      // Admin can see all tasks
      if (view === 'my') {
        query = { createdBy: user.id };
      }
    } else if (user.role === 'manager') {
      // Manager can see their own tasks and tasks of users they manage
      const managedUsers = await User.find({ managerId: user.id }).select('_id');
      const managedUserIds = managedUsers.map(u => u._id);
      
      if (view === 'my') {
        query = { createdBy: user.id };
      } else {
        query = {
          $or: [
            { createdBy: user.id },
            { assignedTo: user.id },
            { createdBy: { $in: managedUserIds } }
          ]
        };
      }
    } else {
      // User and Viewer can only see their own tasks
      query = {
        $or: [
          { createdBy: user.id },
          { assignedTo: user.id }
        ]
      };
    }
    
    // Apply filters
    if (status) query.status = status;
    if (priority) query.priority = priority;
    
    // Apply search
    if (search) {
      query.$text = { $search: search };
    }
    
    // Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;
    
    // Sorting
    let sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort = { createdAt: -1 };
    }
    
    const tasks = await Task.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');
    
    const total = await Task.countDocuments(query);
    
    res.status(200).json({
      success: true,
      tasks,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
const getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');
    
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }
    
    res.status(200).json({
      success: true,
      task
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }
    
    // Clean up the data before update
    const updateData = { ...req.body };
    
    // Handle assignedTo - convert empty string to null
    if (updateData.assignedTo === '' || updateData.assignedTo === null || updateData.assignedTo === undefined) {
      updateData.assignedTo = null;
    }
    
    // Handle dueDate - if empty string, set to null
    if (updateData.dueDate === '' || updateData.dueDate === null) {
      updateData.dueDate = null;
    }
    
    // Add updatedBy field
    updateData.updatedBy = req.user.id;
    
    // If status is being changed to Done, set completedAt
    if (updateData.status === 'Done' && task.status !== 'Done') {
      updateData.completedAt = new Date();
    } else if (updateData.status !== 'Done') {
      updateData.completedAt = null;
    }
    
    task = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
        context: 'query'
      }
    ).populate('createdBy', 'name email')
     .populate('assignedTo', 'name email');
    
    res.status(200).json({
      success: true,
      task
    });
  } catch (error) {
    // Handle validation errors gracefully
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }
    
    await task.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get task analytics
// @route   GET /api/tasks/analytics
// @access  Private
const getAnalytics = async (req, res, next) => {
  try {
    const user = req.user;
    let query = {};
    
    // Apply role-based filtering for analytics
    if (user.role === 'admin') {
      // Admin sees all tasks
      query = {};
    } else if (user.role === 'manager') {
      // Manager sees own tasks and tasks of managed users
      const managedUsers = await User.find({ managerId: user.id }).select('_id');
      const managedUserIds = managedUsers.map(u => u._id);
      query = {
        $or: [
          { createdBy: user.id },
          { assignedTo: user.id },
          { createdBy: { $in: managedUserIds } }
        ]
      };
    } else {
      // User and Viewer see only their tasks
      query = {
        $or: [
          { createdBy: user.id },
          { assignedTo: user.id }
        ]
      };
    }
    
    // Get all tasks for the user
    const tasks = await Task.find(query);
    
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'Done').length;
    const pendingTasks = tasks.filter(task => task.status !== 'Done').length;
    const completionPercentage = totalTasks > 0 
      ? ((completedTasks / totalTasks) * 100).toFixed(2) 
      : 0;
    
    // Task breakdown by status
    const statusBreakdown = {
      Todo: tasks.filter(task => task.status === 'Todo').length,
      InProgress: tasks.filter(task => task.status === 'In Progress').length,
      Done: completedTasks
    };
    
    // Task breakdown by priority
    const priorityBreakdown = {
      Low: tasks.filter(task => task.priority === 'Low').length,
      Medium: tasks.filter(task => task.priority === 'Medium').length,
      High: tasks.filter(task => task.priority === 'High').length
    };
    
    // Tasks due soon (next 7 days)
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    const tasksDueSoon = tasks.filter(task => {
      return task.dueDate && 
             task.dueDate >= today && 
             task.dueDate <= nextWeek &&
             task.status !== 'Done';
    }).length;
    
    res.status(200).json({
      success: true,
      analytics: {
        totalTasks,
        completedTasks,
        pendingTasks,
        completionPercentage,
        statusBreakdown,
        priorityBreakdown,
        tasksDueSoon
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  getAnalytics
};