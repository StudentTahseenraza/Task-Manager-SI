const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Task = require('../models/Task');
const connectDB = require('../config/db');

dotenv.config();

connectDB();

const seedUsers = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Task.deleteMany();

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin'
    });

    // Create manager user
    const manager = await User.create({
      name: 'Manager User',
      email: 'manager@example.com',
      password: 'manager123',
      role: 'manager'
    });

    // Create regular users
    const user1 = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'user123',
      role: 'user',
      managerId: manager._id
    });

    const user2 = await User.create({
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'user123',
      role: 'user',
      managerId: manager._id
    });

    // Create tasks
    await Task.create([
      {
        title: 'Complete project documentation',
        description: 'Write comprehensive documentation for the task management system',
        status: 'In Progress',
        priority: 'High',
        dueDate: new Date('2024-04-15'),
        createdBy: admin._id,
        assignedTo: user1._id
      },
      {
        title: 'Fix authentication bug',
        description: 'Resolve the JWT token expiration issue',
        status: 'Todo',
        priority: 'High',
        dueDate: new Date('2024-04-10'),
        createdBy: manager._id,
        assignedTo: user2._id
      },
      {
        title: 'Design dashboard UI',
        description: 'Create mockups for the analytics dashboard',
        status: 'Done',
        priority: 'Medium',
        dueDate: new Date('2024-04-05'),
        createdBy: user1._id,
        assignedTo: user1._id
      }
    ]);

    console.log('✅ Data seeded successfully!');
    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

seedUsers();