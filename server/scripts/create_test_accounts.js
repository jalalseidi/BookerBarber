const { connectDB } = require('../config/database');
const serviceContainer = require('../services');
const User = require('../models/User');
const Availability = require('../models/Availability');

/**
 * Create proper test accounts for barbers and customers
 */
async function createTestAccounts() {
  try {
    console.log('👥 Creating test accounts...');
    
    await connectDB();
    
    const userService = serviceContainer.get('userService');
    
    // Clear existing data first (keeping the existing barber)
    console.log('📋 Current database state...');
    const currentUsers = await User.find({});
    console.log(`Found ${currentUsers.length} existing users`);
    
    // Create test customers
    const customers = [
      {
        email: 'customer1@test.com',
        password: 'password123',
        name: 'Alice Johnson',
        role: 'customer',
        phone: '+1-555-0101'
      },
      {
        email: 'customer2@test.com',
        password: 'password123',
        name: 'Bob Smith',
        role: 'customer',
        phone: '+1-555-0102'
      },
      {
        email: 'customer3@test.com',
        password: 'password123',
        name: 'Carol Davis',
        role: 'customer',
        phone: '+1-555-0103'
      }
    ];
    
    console.log('👤 Creating customer accounts...');
    for (const customerData of customers) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: customerData.email });
        if (existingUser) {
          console.log(`⚠️  Customer ${customerData.email} already exists, skipping`);
          continue;
        }
        
        const customer = await userService.create(customerData);
        console.log(`✅ Created customer: ${customer.name} (${customer.email})`);
      } catch (error) {
        console.error(`❌ Failed to create customer ${customerData.email}:`, error.message);
      }
    }
    
    // Create additional barbers (we already have one from the existing data)
    const barbers = [
      {
        email: 'barber1@test.com',
        password: 'password123',
        name: 'Mike Thompson',
        role: 'barber',
        phone: '+1-555-0201'
      },
      {
        email: 'barber2@test.com',
        password: 'password123',
        name: 'Sarah Wilson',
        role: 'barber',
        phone: '+1-555-0202'
      }
    ];
    
    console.log('💇 Creating barber accounts...');
    const createdBarbers = [];
    
    for (const barberData of barbers) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: barberData.email });
        if (existingUser) {
          console.log(`⚠️  Barber ${barberData.email} already exists, skipping`);
          createdBarbers.push(existingUser);
          continue;
        }
        
        const barber = await userService.create(barberData);
        createdBarbers.push(barber);
        console.log(`✅ Created barber: ${barber.name} (${barber.email})`);
      } catch (error) {
        console.error(`❌ Failed to create barber ${barberData.email}:`, error.message);
      }
    }
    
    // Create availability slots for all barbers (including existing ones)
    console.log('📅 Creating availability slots for barbers...');
    
    const allBarbers = await User.find({ role: 'barber' });
    console.log(`Found ${allBarbers.length} barbers to create availability for`);
    
    for (const barber of allBarbers) {
      try {
        // Remove existing availability for this barber
        await Availability.deleteMany({ barberId: barber._id });
        
        // Create availability for the next 14 days
        const availabilitySlots = [];
        const today = new Date();
        
        for (let i = 0; i < 14; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() + i);
          date.setHours(0, 0, 0, 0);
          
          // Skip Sundays for some variety
          if (date.getDay() === 0) continue;
          
          // Create morning and afternoon slots
          const slots = [
            { start: '09:00', end: '12:00' },
            { start: '14:00', end: '17:00' }
          ];
          
          for (const slot of slots) {
            availabilitySlots.push({
              barberId: barber._id,
              date: date,
              startTime: slot.start,
              endTime: slot.end,
              isAvailable: true
            });
          }
        }
        
        await Availability.insertMany(availabilitySlots);
        console.log(`✅ Created ${availabilitySlots.length} availability slots for ${barber.name}`);
        
      } catch (error) {
        console.error(`❌ Failed to create availability for ${barber.name}:`, error.message);
      }
    }
    
    // Final summary
    console.log('\n📊 Account creation summary:');
    const finalStats = {
      totalUsers: await User.countDocuments(),
      barbers: await User.countDocuments({ role: 'barber' }),
      customers: await User.countDocuments({ role: 'customer' }),
      availabilities: await Availability.countDocuments()
    };
    
    console.log('Final database state:', finalStats);
    
    // Show all users
    const allUsers = await User.find({}).select('name email role isActive phone');
    console.log('\n👥 All users in database:');
    
    const barberUsers = allUsers.filter(u => u.role === 'barber');
    const customerUsers = allUsers.filter(u => u.role === 'customer');
    
    console.log('\n💇 Barbers:');
    barberUsers.forEach((user, idx) => {
      console.log(`  ${idx + 1}. ${user.name} (${user.email}) - Phone: ${user.phone || 'N/A'}`);
    });
    
    console.log('\n👤 Customers:');
    customerUsers.forEach((user, idx) => {
      console.log(`  ${idx + 1}. ${user.name} (${user.email}) - Phone: ${user.phone || 'N/A'}`);
    });
    
    console.log('\n🔐 Test credentials:');
    console.log('Password for all test accounts: password123');
    console.log('');
    console.log('Barber accounts:');
    barberUsers.forEach(user => {
      console.log(`  ${user.email} / password123`);
    });
    console.log('');
    console.log('Customer accounts:');
    customerUsers.forEach(user => {
      console.log(`  ${user.email} / password123`);
    });
    
    console.log('\n✅ Test accounts created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating test accounts:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

// Run account creation
createTestAccounts();
