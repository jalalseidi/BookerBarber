#!/usr/bin/env node

/**
 * Seed Data Script for Barber Booking System
 * 
 * This script creates initial data for testing:
 * - Users (customers)
 * - Barbers
 * - Services
 * 
 * Usage: node scripts/seedData.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Import models
const User = require('../models/User');
const Barber = require('../models/Barber');
const Service = require('../models/Service');

// Database connection
const { connectDB } = require('../config/database');

const seedData = async () => {
  try {
    console.log('🌱 Starting seed data process...');
    
    // Connect to database
    await connectDB();

    // Clear existing data (optional - comment out if you want to preserve existing data)
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Barber.deleteMany({});
    await Service.deleteMany({});

    // Create users (customers)
    console.log('👥 Creating users...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const users = await User.insertMany([
      {
        email: 'customer1@example.com',
        password: hashedPassword,
      },
      {
        email: 'customer2@example.com',
        password: hashedPassword,
      },
      {
        email: 'customer3@example.com',
        password: hashedPassword,
      },
      {
        email: 'admin@barbershop.com',
        password: hashedPassword,
      }
    ]);

    console.log(`✅ Created ${users.length} users`);

    // Create services
    console.log('💼 Creating services...');
    const services = await Service.insertMany([
      {
        name: 'Classic Haircut',
        nameEn: 'Classic Haircut',
        nameTr: 'Klasik Saç Kesimi',
        description: 'Professional haircut with styling',
        descriptionEn: 'Professional haircut with styling',
        descriptionTr: 'Şekillendirme ile profesyonel saç kesimi',
        duration: 30,
        price: 50,
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
        duration: 20,
        price: 30,
        category: 'beard',
        isActive: true
      },
      {
        name: 'Classic Shave',
        nameEn: 'Classic Shave',
        nameTr: 'Klasik Tıraş',
        description: 'Traditional hot towel shave',
        descriptionEn: 'Traditional hot towel shave',
        descriptionTr: 'Geleneksel sıcak havlu tıraşı',
        duration: 25,
        price: 40,
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
        duration: 20,
        price: 35,
        category: 'styling',
        isActive: true
      },
      {
        name: 'Hair Treatment',
        nameEn: 'Hair Treatment',
        nameTr: 'Saç Bakımı',
        description: 'Deep conditioning and hair treatment',
        descriptionEn: 'Deep conditioning and hair treatment',
        descriptionTr: 'Derin kondisyonlama ve saç bakımı',
        duration: 45,
        price: 75,
        category: 'treatment',
        isActive: true
      },
      {
        name: 'Complete Package',
        nameEn: 'Complete Package',
        nameTr: 'Komple Paket',
        description: 'Haircut, beard trim, and styling',
        descriptionEn: 'Haircut, beard trim, and styling',
        descriptionTr: 'Saç kesimi, sakal düzeltme ve şekillendirme',
        duration: 60,
        price: 100,
        category: 'package',
        isActive: true
      }
    ]);

    console.log(`✅ Created ${services.length} services`);

    // Create barbers
    console.log('✂️ Creating barbers...');
    const barbers = await Barber.insertMany([
      {
        name: 'Mehmet Özkan',
        email: 'mehmet@barbershop.com',
        specialties: ['haircut', 'beard', 'styling'],
        bio: 'Expert barber with 10+ years experience',
        bioEn: 'Expert barber with 10+ years experience',
        bioTr: '10+ yıl deneyimli uzman berber',
        profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        rating: 4.8,
        reviewCount: 127,
        isAvailable: true,
        workingHours: {
          start: '09:00',
          end: '18:00'
        },
        isActive: true
      },
      {
        name: 'Ali Demir',
        email: 'ali@barbershop.com',
        specialties: ['haircut', 'shave'],
        bio: 'Traditional barber specializing in classic cuts',
        bioEn: 'Traditional barber specializing in classic cuts',
        bioTr: 'Klasik kesimler konusunda uzmanlaşmış geleneksel berber',
        profilePhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        rating: 4.6,
        reviewCount: 89,
        isAvailable: true,
        workingHours: {
          start: '10:00',
          end: '19:00'
        },
        isActive: true
      },
      {
        name: 'Emre Kaya',
        email: 'emre@barbershop.com',
        specialties: ['styling', 'treatment'],
        bio: 'Modern styling expert and hair treatment specialist',
        bioEn: 'Modern styling expert and hair treatment specialist',
        bioTr: 'Modern şekillendirme uzmanı ve saç bakım uzmanı',
        profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
        rating: 4.9,
        reviewCount: 156,
        isAvailable: false,
        workingHours: {
          start: '08:00',
          end: '17:00'
        },
        isActive: true
      },
      {
        name: 'Can Yılmaz',
        email: 'can@barbershop.com',
        specialties: ['haircut', 'beard', 'shave', 'package'],
        bio: 'Master barber with expertise in all services',
        bioEn: 'Master barber with expertise in all services',
        bioTr: 'Tüm hizmetlerde uzman usta berber',
        profilePhoto: 'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=150&h=150&fit=crop&crop=face',
        rating: 4.7,
        reviewCount: 203,
        isAvailable: true,
        workingHours: {
          start: '09:30',
          end: '18:30'
        },
        isActive: true
      }
    ]);

    console.log(`✅ Created ${barbers.length} barbers`);

    // Display created ObjectIds for reference
    console.log('\n📋 Created ObjectIds for reference:');
    console.log('\n👥 Users:');
    users.forEach((user, index) => {
      console.log(`  Customer ${index + 1}: ${user._id} (${user.email})`);
    });

    console.log('\n✂️ Barbers:');
    barbers.forEach((barber, index) => {
      console.log(`  ${barber.name}: ${barber._id} (${barber.email})`);
    });

    console.log('\n💼 Services:');
    services.forEach((service, index) => {
      console.log(`  ${service.name}: ${service._id} ($${service.price} - ${service.duration}min)`);
    });

    console.log('\n🎉 Seed data created successfully!');
    console.log('\n📝 Note: Save these ObjectIds for testing booking creation');
    console.log('🔑 Default password for all users: password123');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📱 Database connection closed');
    process.exit(0);
  }
};

// Handle script execution
if (require.main === module) {
  seedData();
}

module.exports = { seedData };
