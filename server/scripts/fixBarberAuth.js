#!/usr/bin/env node

/**
 * Script to check and fix barber authentication issues
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { connectDB } = require('../config/database');

const fixBarberAuth = async () => {
  try {
    console.log('🔧 Fixing Barber Authentication Issues...\n');
    
    // Connect to database
    await connectDB();
    
    // Import models
    const User = require('../models/User');
    
    console.log('📊 Step 1: Checking existing users...');
    
    // Get all users
    const allUsers = await User.find({}).select('_id name email role').lean();
    
    console.log(`   - Total users found: ${allUsers.length}`);
    allUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} - Role: ${user.role || 'no role'} - Name: ${user.name || 'no name'}`);
    });
    
    // Check if barber user exists with correct role
    const existingBarber = await User.findOne({ email: 'jalalseidi7@gmail.com' }).exec();
    
    if (!existingBarber) {
      console.log('\n❌ Barber user does not exist. Creating new barber user...');
      
      const hashedPassword = await bcrypt.hash('password123', 10);
      const newBarber = new User({
        email: 'jalalseidi7@gmail.com',
        password: hashedPassword,
        name: 'Jalal Seidi',
        role: 'barber',
        isActive: true
      });
      
      await newBarber.save();
      console.log('✅ New barber user created successfully');
      
    } else {
      console.log(`\\n🔍 Barber user found: ${existingBarber.email}`);
      console.log(`   - Role: ${existingBarber.role}`);
      console.log(`   - Name: ${existingBarber.name}`);
      console.log(`   - Active: ${existingBarber.isActive}`);
      
      // Check if role is correct
      if (existingBarber.role !== 'barber') {
        console.log('\\n🔧 Fixing barber role...');
        existingBarber.role = 'barber';
        await existingBarber.save();
        console.log('✅ Barber role updated');
      }
      
      // Reset password to known value
      console.log('\\n🔑 Resetting barber password to "password123"...');
      const hashedPassword = await bcrypt.hash('password123', 10);
      existingBarber.password = hashedPassword;
      existingBarber.name = 'Jalal Seidi'; // Set a proper name
      existingBarber.isActive = true;
      await existingBarber.save();
      console.log('✅ Barber password and details updated');
    }
    
    // Test password verification
    console.log('\\n🧪 Step 2: Testing password verification...');
    const barber = await User.findOne({ email: 'jalalseidi7@gmail.com' }).exec();
    
    if (barber) {
      const isPasswordValid = await bcrypt.compare('password123', barber.password);
      console.log(`Password verification result: ${isPasswordValid ? '✅ VALID' : '❌ INVALID'}`);
      
      if (isPasswordValid) {
        console.log('\\n🎉 Barber authentication should work now!');
        console.log(`Barber details:`);
        console.log(`   - Email: ${barber.email}`);
        console.log(`   - Name: ${barber.name}`);
        console.log(`   - Role: ${barber.role}`);
        console.log(`   - Active: ${barber.isActive}`);
        console.log(`   - ID: ${barber._id}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error fixing barber authentication:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\\n📱 Database connection closed');
    process.exit(0);
  }
};

fixBarberAuth();
