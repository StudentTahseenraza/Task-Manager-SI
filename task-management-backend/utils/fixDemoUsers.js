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

    // Delete existing demo users
    console.log('🗑️  Removing existing demo users...');
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

    // Create fresh demo users
    console.log('📝 Creating fresh demo users...\n');
    
    const demoUsers = [
      {
        name: 'Admin User',
        email: 'admin@taskflow.com',
        plainPassword: 'Admin@123',
        role: 'admin',
        department: 'IT',
        isActive: true
      },
      {
        name: 'Manager User',
        email: 'manager@taskflow.com',
        plainPassword: 'Manager@123',
        role: 'manager',
        department: 'Engineering',
        isActive: true
      },
      {
        name: 'Regular User',
        email: 'user@taskflow.com',
        plainPassword: 'User@123',
        role: 'user',
        department: 'Sales',
        isActive: true
      },
      {
        name: 'Viewer User',
        email: 'viewer@taskflow.com',
        plainPassword: 'Viewer@123',
        role: 'viewer',
        department: 'Marketing',
        isActive: true
      }
    ];
    
    for (const userData of demoUsers) {
      // Hash password with bcrypt
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.plainPassword, salt);
      
      const user = await User.create({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
        department: userData.department,
        isActive: userData.isActive
      });
      
      console.log(`✅ Created ${userData.role}: ${userData.email}`);
      
      // Test password verification immediately
      const isValid = await bcrypt.compare(userData.plainPassword, user.password);
      console.log(`   Password test for ${userData.email}: ${isValid ? '✓ WORKING' : '✗ FAILED'}`);
      console.log(`   Use: ${userData.email} / ${userData.plainPassword}\n`);
    }
    
    // List all users
    console.log('\n📋 All Users in Database:');
    console.log('═══════════════════════════════════════════════════════════');
    const allUsers = await User.find({}).select('name email role');
    allUsers.forEach(user => {
      console.log(`${user.name.padEnd(20)} | ${user.email.padEnd(30)} | ${user.role}`);
    });
    console.log('═══════════════════════════════════════════════════════════');
    
    console.log('\n🎉 Setup Complete!');
    console.log('\n🔐 LOGIN CREDENTIALS (COPY THESE):');
    console.log('═══════════════════════════════════════════════');
    console.log('👑 Admin:    admin@taskflow.com     / Admin@123');
    console.log('📊 Manager:  manager@taskflow.com   / Manager@123');
    console.log('👤 User:     user@taskflow.com      / User@123');
    console.log('👁️ Viewer:   viewer@taskflow.com    / Viewer@123');
    console.log('═══════════════════════════════════════════════');
    
    await mongoose.disconnect();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

fixDemoUsers();