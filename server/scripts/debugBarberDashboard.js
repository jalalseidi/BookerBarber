#!/usr/bin/env node

/**
 * Debug script for barber dashboard issues
 * This script will help identify why appointments aren't showing
 */

const mongoose = require('mongoose');
const { connectDB } = require('../config/database');

const debugBarberDashboard = async () => {
  try {
    console.log('🔍 Debugging Barber Dashboard Issues...\n');
    
    // Connect to database
    await connectDB();
    
    // Import models
    const User = require('../models/User');
    const Booking = require('../models/Booking');
    const Service = require('../models/Service');
    const Availability = require('../models/Availability');
    
    console.log('📊 Step 1: Checking database collections...');
    
    // Check users (especially barbers)
    const totalUsers = await User.countDocuments({});
    const barbers = await User.find({ role: 'barber' }).select('_id name email role').lean();
    const customers = await User.find({ role: 'customer' }).select('_id name email role').lean();
    
    console.log(`   - Total users: ${totalUsers}`);
    console.log(`   - Barbers: ${barbers.length}`);
    console.log(`   - Customers: ${customers.length}`);
    
    if (barbers.length > 0) {
      console.log('\n👨‍💼 Barbers in database:');
      barbers.forEach((barber, index) => {
        console.log(`   ${index + 1}. ${barber.name || 'No name'} (${barber.email}) - ID: ${barber._id}`);
      });
    }
    
    // Check bookings
    const totalBookings = await Booking.countDocuments({});
    console.log(`\n📅 Step 2: Checking bookings...`);
    console.log(`   - Total bookings: ${totalBookings}`);
    
    if (totalBookings > 0) {
      // Get all bookings with details
      const allBookings = await Booking.find({}).lean();
      console.log('\n📋 All bookings in database:');
      
      allBookings.forEach((booking, index) => {
        console.log(`   ${index + 1}. Booking ID: ${booking._id}`);
        console.log(`      - Customer ID: ${booking.customerId}`);
        console.log(`      - Barber ID: ${booking.barberId}`);
        console.log(`      - Service ID: ${booking.serviceId}`);
        console.log(`      - Date: ${booking.date}`);
        console.log(`      - Time: ${booking.time}`);
        console.log(`      - Status: ${booking.status}`);
        console.log(`      - Price: $${booking.totalPrice}`);
        console.log('');
      });
      
      // Check bookings by barber
      console.log('📊 Bookings grouped by barber:');
      for (const barber of barbers) {
        const barberBookings = allBookings.filter(b => b.barberId.toString() === barber._id.toString());
        console.log(`   - ${barber.name || barber.email}: ${barberBookings.length} bookings`);
        
        if (barberBookings.length > 0) {
          barberBookings.forEach(booking => {
            console.log(`     • ${booking.date} ${booking.time} - Status: ${booking.status}`);
          });
        }
      }
    } else {
      console.log('❌ No bookings found in database!');
    }
    
    // Check services
    const totalServices = await Service.countDocuments({});
    console.log(`\n🛠️ Step 3: Checking services...`);
    console.log(`   - Total services: ${totalServices}`);
    
    // Check availability
    const totalAvailability = await Availability.countDocuments({});
    console.log(`\n⏰ Step 4: Checking availability...`);
    console.log(`   - Total availability slots: ${totalAvailability}`);
    
    if (totalAvailability > 0) {
      const availabilityByBarber = await Availability.aggregate([
        { $group: { _id: '$barberId', count: { $sum: 1 } } }
      ]);
      
      console.log('   Availability by barber:');
      for (const item of availabilityByBarber) {
        const barber = barbers.find(b => b._id.toString() === item._id.toString());
        console.log(`     - ${barber?.name || 'Unknown'}: ${item.count} slots`);
      }
    }
    
    console.log('\n🔧 Step 5: Testing booking service...');
    
    // Test the booking service directly
    const container = require('../services');
    const bookingService = container.get('bookingService');
    
    if (barbers.length > 0) {
      const testBarberId = barbers[0]._id.toString();
      console.log(`Testing with barber: ${barbers[0].name || barbers[0].email} (${testBarberId})`);
      
      try {
        const result = await bookingService.getBookingsByBarber(testBarberId, {});
        console.log(`✅ BookingService.getBookingsByBarber() returned: ${result.bookings.length} bookings`);
        
        if (result.bookings.length > 0) {
          console.log('   Sample booking:', result.bookings[0]);
        }
      } catch (error) {
        console.log(`❌ Error testing booking service:`, error.message);
      }
    }
    
    console.log('\n💡 Diagnosis Summary:');
    if (barbers.length === 0) {
      console.log('❌ Issue: No barbers found in database');
      console.log('   Solution: Create barber users or run seed script');
    } else if (totalBookings === 0) {
      console.log('❌ Issue: No bookings found in database');
      console.log('   Solution: Create test bookings or wait for customers to book');
    } else {
      console.log('✅ Database seems to have data. Issue might be elsewhere.');
      console.log('   Check: Server endpoints, authentication, or frontend integration');
    }
    
  } catch (error) {
    console.error('❌ Error debugging barber dashboard:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📱 Database connection closed');
    process.exit(0);
  }
};

debugBarberDashboard();
