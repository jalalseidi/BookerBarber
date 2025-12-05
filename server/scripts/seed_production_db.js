const { connectDB } = require('../config/database');
const serviceContainer = require('../services');
const User = require('../models/User');
const Service = require('../models/Service');
const Availability = require('../models/Availability');
const Booking = require('../models/Booking');

/**
 * Seed production database with initial data
 */
async function seedProductionDB() {
  try {
    console.log('🌱 Seeding production database...');
    
    await connectDB();
    
    const userService = serviceContainer.get('userService');
    
    // 1. Check if database already has data
    const existingUsers = await User.countDocuments();
    const existingServices = await Service.countDocuments();
    
    if (existingUsers > 0 || existingServices > 0) {
      console.log('⚠️  Database already contains data.');
      console.log(`   Users: ${existingUsers}, Services: ${existingServices}`);
      
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      await new Promise((resolve) => {
        readline.question('Do you want to continue and add more data? (y/N): ', (answer) => {
          readline.close();
          if (answer.toLowerCase() !== 'y') {
            console.log('Seeding cancelled.');
            process.exit(0);
          }
          resolve();
        });
      });
    }
    
    // 2. Create services if they don't exist
    console.log('✂️  Setting up services...');
    
    const services = [
      {
        name: 'Classic Haircut',
        nameEn: 'Classic Haircut',
        nameTr: 'Klasik Saç Kesimi',
        description: 'Professional haircut with styling',
        descriptionEn: 'Professional haircut with styling',
        descriptionTr: 'Şekillendirme ile profesyonel saç kesimi',
        price: 30,
        duration: 30,
        category: 'haircut',
        isActive: true
      },
      {
        name: 'Beard Trim',
        nameEn: 'Beard Trim',
        nameTr: 'Sakal Düzeltme',
        description: 'Professional beard trimming and shaping',
        descriptionEn: 'Professional beard trimming and shaping',
        descriptionTr: 'Profesyonel sakal kesimi ve şekillendirme',
        price: 20,
        duration: 20,
        category: 'beard',
        isActive: true
      },
      {
        name: 'Hot Towel Shave',
        nameEn: 'Hot Towel Shave',
        nameTr: 'Sıcak Havlu Tıraş',
        description: 'Traditional hot towel shave experience',
        descriptionEn: 'Traditional hot towel shave experience',
        descriptionTr: 'Geleneksel sıcak havlu tıraş deneyimi',
        price: 25,
        duration: 25,
        category: 'shave',
        isActive: true
      },
      {
        name: 'Hair Styling',
        nameEn: 'Hair Styling',
        nameTr: 'Saç Şekillendirme',
        description: 'Professional hair styling and finishing',
        descriptionEn: 'Professional hair styling and finishing',
        descriptionTr: 'Profesyonel saç şekillendirme ve bitirme',
        price: 25,
        duration: 20,
        category: 'styling',
        isActive: true
      },
      {
        name: 'Complete Package',
        nameEn: 'Complete Package',
        nameTr: 'Komple Paket',
        description: 'Haircut, beard trim, and styling',
        descriptionEn: 'Haircut, beard trim, and styling',
        descriptionTr: 'Saç kesimi, sakal düzeltme ve şekillendirme',
        price: 60,
        duration: 60,
        category: 'package',
        isActive: true
      }
    ];
    
    for (const serviceData of services) {
      const existingService = await Service.findOne({ 
        name: serviceData.name, 
        category: serviceData.category 
      });
      
      if (!existingService) {
        const service = new Service(serviceData);
        await service.save();
        console.log(`✅ Created service: ${service.name} - $${service.price}`);
      } else {
        console.log(`⚠️  Service ${serviceData.name} already exists`);
      }
    }
    
    // 3. Create admin user if it doesn't exist
    console.log('👤 Setting up admin user...');
    
    const adminEmail = 'admin@barbershop.com';
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (!existingAdmin) {
      const admin = await userService.create({
        email: adminEmail,
        password: 'admin123!',
        name: 'System Administrator',
        role: 'admin',
        phone: '+1-555-ADMIN',
        isActive: true
      });
      
      console.log('✅ Created admin user:', admin.email);
      console.log('   Login: admin@barbershop.com / admin123!');
    } else {
      console.log('⚠️  Admin user already exists');
    }
    
    // 4. Create sample customers (optional)
    console.log('👥 Setting up sample customer accounts...');
    
    const sampleCustomers = [
      {
        email: 'john.doe@example.com',
        password: 'customer123',
        name: 'John Doe',
        role: 'customer',
        phone: '+1-555-0001'
      },
      {
        email: 'jane.smith@example.com',
        password: 'customer123',
        name: 'Jane Smith',
        role: 'customer',
        phone: '+1-555-0002'
      }
    ];
    
    for (const customerData of sampleCustomers) {
      const existingCustomer = await User.findOne({ email: customerData.email });
      if (!existingCustomer) {
        const customer = await userService.create(customerData);
        console.log(`✅ Created sample customer: ${customer.name} (${customer.email})`);
      }
    }
    
    // 5. Create sample barber accounts
    console.log('💇 Setting up sample barber accounts...');
    
    const sampleBarbers = [
      {
        email: 'mike.barber@example.com',
        password: 'barber123',
        name: 'Mike Johnson',
        role: 'barber',
        phone: '+1-555-BARB1'
      },
      {
        email: 'sarah.cuts@example.com',
        password: 'barber123',
        name: 'Sarah Wilson',
        role: 'barber',
        phone: '+1-555-BARB2'
      }
    ];
    
    const createdBarbers = [];
    for (const barberData of sampleBarbers) {
      const existingBarber = await User.findOne({ email: barberData.email });
      if (!existingBarber) {
        const barber = await userService.create(barberData);
        createdBarbers.push(barber);
        console.log(`✅ Created sample barber: ${barber.name} (${barber.email})`);
      } else {
        createdBarbers.push(existingBarber);
      }
    }
    
    // 6. Create availability for barbers
    console.log('📅 Setting up availability for barbers...');
    
    const allBarbers = await User.find({ role: 'barber' });
    console.log(`Found ${allBarbers.length} barbers to set availability for`);
    
    for (const barber of allBarbers) {
      // Clear existing availability
      await Availability.deleteMany({ barberId: barber._id });
      
      // Create availability for next 30 days
      const availabilitySlots = [];
      const today = new Date();
      
      for (let i = 1; i <= 30; i++) { // Start from tomorrow
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        date.setHours(0, 0, 0, 0);
        
        // Skip Sundays
        if (date.getDay() === 0) continue;
        
        // Create multiple time slots per day
        const slots = [
          { start: '09:00', end: '10:00' },
          { start: '10:00', end: '11:00' },
          { start: '11:00', end: '12:00' },
          { start: '14:00', end: '15:00' },
          { start: '15:00', end: '16:00' },
          { start: '16:00', end: '17:00' }
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
      
      if (availabilitySlots.length > 0) {
        await Availability.insertMany(availabilitySlots);
        console.log(`✅ Created ${availabilitySlots.length} availability slots for ${barber.name}`);
      }
    }
    
    // 7. Final summary
    console.log('\n📊 Production database seeding completed!');
    
    const finalStats = {
      users: await User.countDocuments(),
      admins: await User.countDocuments({ role: 'admin' }),
      barbers: await User.countDocuments({ role: 'barber' }),
      customers: await User.countDocuments({ role: 'customer' }),
      services: await Service.countDocuments(),
      availabilities: await Availability.countDocuments(),
      bookings: await Booking.countDocuments()
    };
    
    console.log('Database summary:', finalStats);
    
    console.log('\n🔐 Default login credentials:');
    console.log('Admin: admin@barbershop.com / admin123!');
    console.log('Sample barbers: mike.barber@example.com / barber123');
    console.log('               sarah.cuts@example.com / barber123');
    console.log('Sample customers: john.doe@example.com / customer123');
    console.log('                 jane.smith@example.com / customer123');
    
    console.log('\n✅ Production database is ready for use!');
    
  } catch (error) {
    console.error('❌ Error seeding production database:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

// Run seeding with confirmation
console.log('🚨 Production Database Seeding');
console.log('This will add initial data to your production database.');
console.log('Make sure you are connected to the correct database!\n');

seedProductionDB();
