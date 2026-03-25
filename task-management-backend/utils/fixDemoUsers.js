const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

const fixDemoUsers = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      console.error('❌ Error: MONGODB_URI is not defined');
      process.exit(1);
    }

    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB\n');

    // Delete all existing demo users
    console.log('🗑️  Removing all demo users...');
    await User.deleteMany({ 
      email: { 
        $in: [
          'admin@taskflow.com',
          'manager@taskflow.com', 
          'user@taskflow.com',
          'viewer@taskflow.com'
        ]
      }
    });
    console.log('✅ Demo users removed\n');

    // Create fresh demo users with proper password hashing
    console.log('📝 Creating fresh demo users with proper passwords...\n');
    
    const demoUsers = [
      {
        name: 'Admin User',
        email: 'admin@taskflow.com',
        password: 'Admin@123',
        role: 'admin',
        department: 'IT',
        isActive: true
      },
      {
        name: 'Manager User',
        email: 'manager@taskflow.com',
        password: 'Manager@123',
        role: 'manager',
        department: 'Engineering',
        isActive: true
      },
      {
        name: 'Regular User',
        email: 'user@taskflow.com',
        password: 'User@123',
        role: 'user',
        department: 'Sales',
        isActive: true
      },
      {
        name: 'Viewer User',
        email: 'viewer@taskflow.com',
        password: 'Viewer@123',
        role: 'viewer',
        department: 'Marketing',
        isActive: true
      }
    ];
    
    // Create users with proper password hashing
    for (const userData of demoUsers) {
      // Hash password with bcrypt
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      const user = await User.create({
        ...userData,
        password: hashedPassword
      });
      
      console.log(`✅ Created ${userData.role}: ${userData.email}`);
      
      // Test the password immediately
      const isValid = await bcrypt.compare(userData.password, user.password);
      console.log(`   Password test: ${isValid ? '✓ Working' : '✗ Failed'}\n`);
    }
    
    // Also ensure admin@example.com has admin role
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      existingAdmin.role = 'admin';
      await existingAdmin.save();
      console.log('✅ Updated admin@example.com to admin role');
    }
    
    // List all users
    console.log('\n📋 All Users in Database:');
    console.log('═══════════════════════════════════════════════════════════');
    const allUsers = await User.find({}).select('name email role department');
    allUsers.forEach(user => {
      console.log(`${user.name.padEnd(20)} | ${user.email.padEnd(30)} | ${user.role.padEnd(10)} | ${user.department || 'N/A'}`);
    });
    console.log('═══════════════════════════════════════════════════════════');
    
    console.log('\n🎉 Setup Complete!');
    console.log('\n🔐 Login Credentials:');
    console.log('═══════════════════════════════════════════════');
    console.log('👑 Admin:    admin@taskflow.com     / Admin@123');
    console.log('📊 Manager:  manager@taskflow.com   / Manager@123');
    console.log('👤 User:     user@taskflow.com      / User@123');
    console.log('👁️ Viewer:   viewer@taskflow.com    / Viewer@123');
    console.log('👑 Admin:    admin@example.com      / your-password');
    console.log('═══════════════════════════════════════════════');
    
    await mongoose.disconnect();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

fixDemoUsers();