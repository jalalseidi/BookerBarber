const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Availability = require('./models/Availability');

async function seedData() {
  try {
    // Connect to database
    await mongoose.connect('mongodb://localhost:27017/barber-booker');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Availability.deleteMany({});
    console.log('Cleared existing data');

    // Create sample barber users
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const barbers = [
      {
        email: 'mehmet@barbershop.com',
        password: hashedPassword,
        role: 'barber',
        name: 'Mehmet Özkan',
        phone: '+90 555 123 4567',
        isActive: true,
        preferredLanguage: 'tr'
      },
      {
        email: 'ali@barbershop.com', 
        password: hashedPassword,
        role: 'barber',
        name: 'Ali Demir',
        phone: '+90 555 234 5678',
        isActive: true,
        preferredLanguage: 'tr'
      },
      {
        email: 'john@barbershop.com',
        password: hashedPassword,
        role: 'barber',
        name: 'John Smith',
        phone: '+1 555 987 6543',
        isActive: true,
        preferredLanguage: 'en'
      }
    ];

    const createdBarbers = await User.insertMany(barbers);
    console.log('Created barbers:', createdBarbers.map(b => ({ id: b._id, name: b.name, email: b.email })));

    // Create sample customer users
    const customers = [
      {
        email: 'customer1@example.com',
        password: hashedPassword,
        role: 'customer',
        name: 'Test Customer 1',
        phone: '+90 555 111 2222',
        isActive: true,
        preferredLanguage: 'tr'
      },
      {
        email: 'customer2@example.com',
        password: hashedPassword,
        role: 'customer',
        name: 'Test Customer 2',
        phone: '+1 555 333 4444',
        isActive: true,
        preferredLanguage: 'en'
      }
    ];

    const createdCustomers = await User.insertMany(customers);
    console.log('Created customers:', createdCustomers.map(c => ({ id: c._id, name: c.name, email: c.email })));

    // Create availability for barbers
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const availabilities = [];

    // Create availability for each barber for the next 7 days
    for (const barber of createdBarbers) {
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        
        // Morning availability
        availabilities.push({
          barberId: barber._id,
          date: date,
          startTime: '09:00',
          endTime: '12:00',
          isAvailable: true,
          notes: 'Morning shift'
        });

        // Afternoon availability  
        availabilities.push({
          barberId: barber._id,
          date: date,
          startTime: '13:00',
          endTime: '17:00',
          isAvailable: true,
          notes: 'Afternoon shift'
        });
      }
    }

    const createdAvailabilities = await Availability.insertMany(availabilities);
    console.log('Created availabilities:', createdAvailabilities.length, 'slots');

    console.log('Seed data created successfully!');
    
    // Display summary
    const barberCount = await User.countDocuments({ role: 'barber' });
    const customerCount = await User.countDocuments({ role: 'customer' });
    const availabilityCount = await Availability.countDocuments({});
    
    console.log('\nDatabase Summary:');
    console.log(`- Barbers: ${barberCount}`);
    console.log(`- Customers: ${customerCount}`);
    console.log(`- Availability slots: ${availabilityCount}`);

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seed function
seedData();
