const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Task = require('../models/Task');

const createDemoTasks = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB\n');

    // Get all demo users
    const admin = await User.findOne({ email: 'admin@taskflow.com' });
    const manager = await User.findOne({ email: 'manager@taskflow.com' });
    const regularUser = await User.findOne({ email: 'user@taskflow.com' });
    const viewer = await User.findOne({ email: 'viewer@taskflow.com' });

    if (!admin || !manager || !regularUser || !viewer) {
      console.log('❌ Some demo users not found. Please run fixDemoUsers.js first');
      process.exit(1);
    }

    // Clear existing demo tasks
    await Task.deleteMany({ 
      createdBy: { 
        $in: [admin._id, manager._id, regularUser._id, viewer._id] 
      } 
    });
    console.log('🗑️  Cleared existing demo tasks\n');

    // Get current date for reference
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    const nextMonth = new Date(today);
    nextMonth.setDate(today.getDate() + 30);

    // Create tasks for different users with FUTURE dates only
    const tasks = [
      // Admin's tasks
      {
        title: 'System Configuration',
        description: 'Configure server settings and deploy updates',
        status: 'Done',
        priority: 'High',
        dueDate: tomorrow, // Tomorrow
        createdBy: admin._id,
        assignedTo: admin._id
      },
      {
        title: 'User Management Dashboard',
        description: 'Create admin dashboard for user management',
        status: 'In Progress',
        priority: 'High',
        dueDate: nextWeek, // Next week
        createdBy: admin._id,
        assignedTo: admin._id
      },
      {
        title: 'Security Audit',
        description: 'Perform security audit of the system',
        status: 'Todo',
        priority: 'High',
        dueDate: nextWeek,
        createdBy: admin._id,
        assignedTo: admin._id
      },
      
      // Manager's tasks
      {
        title: 'Team Meeting',
        description: 'Weekly team sync to discuss progress',
        status: 'Todo',
        priority: 'Medium',
        dueDate: tomorrow,
        createdBy: manager._id,
        assignedTo: manager._id
      },
      {
        title: 'Review Pull Requests',
        description: 'Review team members code submissions',
        status: 'In Progress',
        priority: 'High',
        dueDate: nextWeek,
        createdBy: manager._id,
        assignedTo: manager._id
      },
      {
        title: 'Project Planning',
        description: 'Plan next sprint tasks and goals',
        status: 'Done',
        priority: 'High',
        dueDate: tomorrow,
        createdBy: manager._id,
        assignedTo: manager._id
      },
      {
        title: 'Performance Review',
        description: 'Conduct team performance reviews',
        status: 'Todo',
        priority: 'Medium',
        dueDate: nextMonth,
        createdBy: manager._id,
        assignedTo: manager._id
      },
      
      // Regular User's tasks
      {
        title: 'Complete API Integration',
        description: 'Integrate third-party API for data sync',
        status: 'In Progress',
        priority: 'High',
        dueDate: nextWeek,
        createdBy: regularUser._id,
        assignedTo: regularUser._id
      },
      {
        title: 'Write Documentation',
        description: 'Document API endpoints and usage',
        status: 'Todo',
        priority: 'Medium',
        dueDate: nextMonth,
        createdBy: regularUser._id,
        assignedTo: regularUser._id
      },
      {
        title: 'Fix Login Bug',
        description: 'Resolve authentication issue with JWT',
        status: 'Done',
        priority: 'High',
        dueDate: tomorrow,
        createdBy: regularUser._id,
        assignedTo: regularUser._id
      },
      {
        title: 'Design System Update',
        description: 'Update UI components with new design system',
        status: 'Todo',
        priority: 'Low',
        dueDate: nextMonth,
        createdBy: regularUser._id,
        assignedTo: regularUser._id
      },
      {
        title: 'Unit Testing',
        description: 'Write unit tests for core functionality',
        status: 'Todo',
        priority: 'Medium',
        dueDate: nextWeek,
        createdBy: regularUser._id,
        assignedTo: regularUser._id
      },
      
      // Viewer's tasks (read-only)
      {
        title: 'Review Analytics',
        description: 'Analyze user engagement metrics',
        status: 'Todo',
        priority: 'Medium',
        dueDate: nextWeek,
        createdBy: viewer._id,
        assignedTo: viewer._id
      },
      {
        title: 'Generate Reports',
        description: 'Create monthly performance reports',
        status: 'Todo',
        priority: 'Low',
        dueDate: nextMonth,
        createdBy: viewer._id,
        assignedTo: viewer._id
      },
      {
        title: 'Data Visualization',
        description: 'Create charts for analytics dashboard',
        status: 'In Progress',
        priority: 'Medium',
        dueDate: nextWeek,
        createdBy: viewer._id,
        assignedTo: viewer._id
      }
    ];

    console.log('📝 Creating tasks with future dates...\n');
    
    for (const task of tasks) {
      await Task.create(task);
      console.log(`   ✓ Created: ${task.title} (${task.status}) - Due: ${task.dueDate.toLocaleDateString()}`);
    }
    
    console.log(`\n✅ Created ${tasks.length} demo tasks\n`);
    
    // Show task statistics
    console.log('📊 Task Statistics:');
    const stats = await Task.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    stats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} tasks`);
    });
    
    // Show tasks by user
    console.log('\n📋 Tasks by User:');
    const tasksByUser = await Task.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $group: {
          _id: '$user.email',
          count: { $sum: 1 }
        }
      }
    ]);
    
    tasksByUser.forEach(user => {
      console.log(`   ${user._id}: ${user.count} tasks`);
    });
    
    await mongoose.disconnect();
    console.log('\n🎉 Demo tasks created successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    if (error.errors) {
      console.error('Validation errors:', error.errors);
    }
    process.exit(1);
  }
};

createDemoTasks();