/**
 * Service Registration
 * 
 * This file registers all services with the dependency injection container.
 * It configures service instances and their dependencies.
 */

const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const User = require('../models/User.js');
const Booking = require('../models/Booking.js');
const { generatePasswordHash, validatePassword } = require('../utils/password.js');
const container = require('./container');
const UserService = require('./userService');
const LLMService = require('./llmService');
const BookingService = require('./bookingService');

// Clear any cached services on module reload
container.clear();

// Register User Service
container.register('userService', () => {
  const passwordUtils = {
    generatePasswordHash,
    validatePassword
  };
  return new UserService(User, passwordUtils);
});

// Register LLM Service
container.register('llmService', () => {
  const config = {
    maxRetries: 3,
    retryDelay: 1000
  };

  const providers = {
    openai: new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    }),
    anthropic: new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
  };

  return new LLMService(config, providers);
});

// Register Booking Service
container.register('bookingService', () => {
  const mongoose = require('mongoose');

  return new BookingService(Booking, {
    getServiceById: async (id) => {
      try {
        // Validate that id is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
          console.warn(`Invalid serviceId format: ${id}`);
          // Return default service data if id is invalid
          return { 
            id, 
            name: 'Default Service', 
            nameEn: 'Default Service',
            nameTr: 'Varsayılan Hizmet',
            duration: 30,
            price: 50 
          };
        }

        // Try to fetch from Service model if it exists
        let Service;
        try {
          Service = mongoose.model('Service');
        } catch (e) {
          // Service model doesn't exist, use mock data
          console.warn('Service model not found, using mock data');
          return { 
            id, 
            name: 'Sample Service', 
            nameEn: 'Sample Service',
            nameTr: 'Örnek Hizmet',
            duration: 30,
            price: 50 
          };
        }

        // Try to fetch the service from the database
        const service = await Service.findById(id).lean().exec();
        if (service) {
          return service;
        }

        // Return default data if service not found
        console.warn(`Service with id ${id} not found, using default data`);
        return { 
          id, 
          name: 'Sample Service', 
          nameEn: 'Sample Service',
          nameTr: 'Örnek Hizmet',
          duration: 30,
          price: 50 
        };
      } catch (error) {
        console.error(`Error fetching service with id ${id}:`, error);
        // Return default data in case of error
        return { 
          id, 
          name: 'Error Service', 
          nameEn: 'Error Service',
          nameTr: 'Hata Hizmeti',
          duration: 30,
          price: 50 
        };
      }
    },
    getBarberById: async (id) => {
      try {
        // Validate that id is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
          console.warn(`Invalid barberId format: ${id}`);
          return { 
            id, 
            name: 'Default Barber',
            profilePhoto: '/default-avatar.png'
          };
        }

        // Fetch from User model since barberId references User
        let User;
        try {
          User = mongoose.model('User');
        } catch (e) {
          console.warn('User model not found, using mock data');
          return { 
            id, 
            name: 'Sample Barber',
            profilePhoto: '/default-avatar.png'
          };
        }

        // Fetch the barber user from the database
        const user = await User.findById(id).lean().exec();
        console.log(`[getBarberById] Fetched user for id ${id}:`, user ? `${user.name} (${user.role})` : 'NOT FOUND');
        
        if (user && user.role === 'barber') {
          console.log(`[getBarberById] Returning barber: ${user.name}`);
          return {
            id: user._id,
            name: user.name || 'Unnamed Barber',
            email: user.email,
            phone: user.phone,
            profilePhoto: user.profilePhoto || '/default-avatar.png'
          };
        }

        // Return default data if barber not found
        console.warn(`[getBarberById] Barber with id ${id} not found or not a barber role, using default data`);
        return { 
          id, 
          name: 'Sample Barber',
          profilePhoto: '/default-avatar.png'
        };
      } catch (error) {
        console.error(`Error fetching barber with id ${id}:`, error);
        return { 
          id, 
          name: 'Error Barber',
          profilePhoto: '/default-avatar.png'
        };
      }
    }
  });
});

module.exports = container;
