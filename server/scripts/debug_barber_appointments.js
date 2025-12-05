const axios = require('axios');

/**
 * Debug why barbers can't see customer appointments in their dashboard
 */
async function debugBarberAppointments() {
  const API_BASE = 'http://localhost:3001';
  
  try {
    console.log('🔍 Debugging barber appointments visibility...\n');
    
    // Step 1: Create a test booking first (as customer)
    console.log('1️⃣ Creating a test booking as customer...');
    
    const customerLogin = await axios.post(`${API_BASE}/api/auth/login`, {
      email: 'customer1@test.com',
      password: 'password123'
    });
    
    const customerToken = customerLogin.data.accessToken;
    const customerId = customerLogin.data._id;
    console.log(`✅ Customer logged in: ${customerLogin.data.name} (${customerLogin.data.email})`);
    
    // Get available barbers
    const barbersResponse = await axios.get(`${API_BASE}/api/barbers`);
    const selectedBarber = barbersResponse.data.data.barbers[0]; // Use first barber
    console.log(`Selected barber: ${selectedBarber.name} (${selectedBarber.email})`);
    
    // Get services
    const servicesResponse = await axios.get(`${API_BASE}/api/services`);
    const services = servicesResponse.data.data?.services || servicesResponse.data;
    const selectedService = services[0];
    console.log(`Selected service: ${selectedService.name} - $${selectedService.price}`);
    
    // Get barber's availability
    const barberLogin = await axios.post(`${API_BASE}/api/auth/login`, {
      email: selectedBarber.email,
      password: 'password123'
    });
    const barberToken = barberLogin.data.accessToken;
    const barberId = barberLogin.data._id;
    
    const availabilityResponse = await axios.get(`${API_BASE}/api/barbers/availability`, {
      headers: { Authorization: `Bearer ${barberToken}` }
    });
    
    const availableSlot = availabilityResponse.data.data[2] || availabilityResponse.data.data[0]; // Use 3rd slot to avoid conflicts
    
    // Create a unique time by adding current seconds to avoid conflicts
    const baseTime = availableSlot.startTime;
    const [hour, minute] = baseTime.split(':').map(Number);
    const uniqueSeconds = new Date().getSeconds();
    const uniqueMinute = (minute + Math.floor(uniqueSeconds / 2)) % 60; // Spread over 30 minutes
    const uniqueTime = `${hour.toString().padStart(2, '0')}:${uniqueMinute.toString().padStart(2, '0')}`;
    
    console.log(`Using slot: ${new Date(availableSlot.date).toDateString()} ${uniqueTime}-${availableSlot.endTime}`);
    
    // Create booking
    const bookingData = {
      barberId: selectedBarber._id,
      serviceId: selectedService._id,
      date: availableSlot.date,
      time: uniqueTime,
      specialRequests: 'Debug test booking'
    };
    
    const bookingResponse = await axios.post(`${API_BASE}/api/bookings`, bookingData, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    
    const createdBooking = bookingResponse.data.data?.booking || bookingResponse.data;
    console.log(`✅ Booking created with ID: ${createdBooking._id}`);
    console.log(`   Status: ${createdBooking.status}`);
    console.log(`   Barber ID in booking: ${createdBooking.barberId}`);
    console.log(`   Customer ID in booking: ${createdBooking.customerId}`);
    
    // Step 2: Check if the barber can see this booking
    console.log('\n2️⃣ Checking barber dashboard endpoints...');
    
    // Test general bookings endpoint as barber
    console.log('\n📋 Testing general bookings endpoint as barber:');
    try {
      const barberBookingsGeneral = await axios.get(`${API_BASE}/api/bookings`, {
        headers: { Authorization: `Bearer ${barberToken}` }
      });
      
      const bookings = barberBookingsGeneral.data.data?.bookings || barberBookingsGeneral.data;
      console.log(`Found ${bookings.length} bookings via general endpoint`);
      
      if (bookings.length > 0) {
        bookings.forEach((booking, idx) => {
          console.log(`  ${idx + 1}. Booking ID: ${booking._id}`);
          console.log(`     Status: ${booking.status}`);
          console.log(`     Date: ${new Date(booking.date).toDateString()}`);
          console.log(`     Time: ${booking.time || booking.startTime + '-' + booking.endTime}`);
          console.log(`     Customer: ${booking.customerName || booking.customerId}`);
          console.log(`     Barber: ${booking.barberName || booking.barberId}`);
        });
      }
      
    } catch (error) {
      console.error('❌ General bookings endpoint failed:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message
      });
    }
    
    // Test barber-specific endpoints
    console.log('\n💇 Testing barber-specific endpoints:');
    
    // Check if there are barber-specific booking routes
    const barberEndpoints = [
      '/api/barbers/bookings',
      '/api/barbers/dashboard',
      `/api/barbers/${barberId}/bookings`,
      '/api/barber/bookings'
    ];
    
    for (const endpoint of barberEndpoints) {
      try {
        console.log(`\nTesting: ${endpoint}`);
        const response = await axios.get(`${API_BASE}${endpoint}`, {
          headers: { Authorization: `Bearer ${barberToken}` }
        });
        
        console.log(`✅ ${endpoint} - Status: ${response.status}`);
        
        if (response.data.data?.bookings) {
          const bookings = response.data.data.bookings;
          console.log(`   Found ${bookings.length} bookings`);
        } else if (response.data.bookings) {
          console.log(`   Found ${response.data.bookings.length} bookings`);
        } else if (Array.isArray(response.data)) {
          console.log(`   Found ${response.data.length} bookings`);
        } else {
          console.log('   Response structure:', Object.keys(response.data));
        }
        
      } catch (error) {
        console.log(`❌ ${endpoint} - Status: ${error.response?.status || 'Network Error'}`);
        if (error.response?.status !== 404) {
          console.log(`   Error: ${error.response?.data?.message || error.message}`);
        }
      }
    }
    
    // Step 3: Check database directly
    console.log('\n3️⃣ Checking database state...');
    
    // Check if the booking exists in database
    const { connectDB } = require('../config/database');
    const Booking = require('../models/Booking');
    const User = require('../models/User');
    
    await connectDB();
    
    const allBookings = await Booking.find({});
    console.log(`\n📊 Database contains ${allBookings.length} total bookings`);
    
    const barberBookings = await Booking.find({ barberId: barberId });
    console.log(`📊 Database contains ${barberBookings.length} bookings for this barber (${barberId})`);
    
    if (barberBookings.length > 0) {
      console.log('\nBarber bookings in database:');
      for (const booking of barberBookings) {
        const customer = await User.findById(booking.customerId);
        console.log(`  - ID: ${booking._id}`);
        console.log(`    Customer: ${customer?.name || 'Unknown'} (${booking.customerId})`);
        console.log(`    Date: ${booking.date}`);
        console.log(`    Time: ${booking.time || booking.startTime + '-' + booking.endTime}`);
        console.log(`    Status: ${booking.status}`);
      }
    }
    
    // Check if barber ID matches
    console.log(`\n🔍 Barber ID comparison:`);
    console.log(`   Logged in barber ID: ${barberId}`);
    console.log(`   Barber ID from barbers list: ${selectedBarber._id}`);
    console.log(`   IDs match: ${barberId === selectedBarber._id}`);
    
    // Step 4: Test filtering
    console.log('\n4️⃣ Testing booking filtering...');
    
    try {
      const filteredBookings = await axios.get(`${API_BASE}/api/bookings?barberId=${barberId}`, {
        headers: { Authorization: `Bearer ${barberToken}` }
      });
      
      const bookings = filteredBookings.data.data?.bookings || filteredBookings.data;
      console.log(`✅ Filtered bookings by barberId: ${bookings.length} found`);
      
    } catch (error) {
      console.error('❌ Filtered bookings failed:', error.response?.data?.message || error.message);
    }
    
    console.log('\n✅ Barber appointments debugging completed!');
    
  } catch (error) {
    console.error('❌ Debug script failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the debug
debugBarberAppointments();
