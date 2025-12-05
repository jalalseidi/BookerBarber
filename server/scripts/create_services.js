const { connectDB } = require('../config/database');
const Service = require('../models/Service');

/**
 * Create basic services for the barbershop
 */
async function createServices() {
  try {
    console.log('✂️ Creating services...');
    
    await connectDB();
    
    // Check if services already exist
    const existingServices = await Service.find({});
    console.log(`Found ${existingServices.length} existing services`);
    
    if (existingServices.length > 0) {
      console.log('Services already exist:');
      existingServices.forEach((service, idx) => {
        console.log(`  ${idx + 1}. ${service.name} - $${service.price} (${service.duration} min)`);
      });
      return;
    }
    
    // Create default services
    const services = [
      {
        name: 'Haircut',
        description: 'Professional haircut and styling',
        price: 25,
        duration: 30,
        category: 'haircut',
        isActive: true
      },
      {
        name: 'Beard Trim',
        description: 'Beard trimming and shaping',
        price: 15,
        duration: 20,
        category: 'beard',
        isActive: true
      },
      {
        name: 'Shampoo & Wash',
        description: 'Hair washing with premium shampoo',
        price: 10,
        duration: 15,
        category: 'wash',
        isActive: true
      },
      {
        name: 'Hair Styling',
        description: 'Professional hair styling',
        price: 20,
        duration: 25,
        category: 'styling',
        isActive: true
      },
      {
        name: 'Full Service',
        description: 'Complete haircut, wash, and styling package',
        price: 45,
        duration: 60,
        category: 'package',
        isActive: true
      }
    ];
    
    console.log(`Creating ${services.length} services...`);
    
    for (const serviceData of services) {
      try {
        const service = new Service(serviceData);
        await service.save();
        console.log(`✅ Created service: ${service.name} - $${service.price} (${service.duration} min)`);
      } catch (error) {
        console.error(`❌ Failed to create service ${serviceData.name}:`, error.message);
      }
    }
    
    // Show final count
    const finalCount = await Service.countDocuments();
    console.log(`\n📊 Total services in database: ${finalCount}`);
    
    const allServices = await Service.find({ isActive: true });
    console.log('\n✂️ Available services:');
    allServices.forEach((service, idx) => {
      console.log(`  ${idx + 1}. ${service.name} - $${service.price} (${service.duration} min)`);
      console.log(`     ${service.description}`);
    });
    
    console.log('\n✅ Services created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating services:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

// Run service creation
createServices();
