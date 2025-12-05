const logger = require('../utils/logger');

/**
 * Booking Service
 * 
 * This service handles booking-related operations.
 * It isolates database logic from routes and provides async helpers for CRUD operations.
 */
class BookingService {
  /**
   * Create a new BookingService instance
   * @param {Object} bookingModel - The Booking model
   * @param {Object} serviceData - Service data provider (could be API client, mock data, etc.)
   */
  constructor(bookingModel, serviceData) {
    this.Booking = bookingModel;
    this.serviceData = serviceData;
  }

  /**
   * Get bookings for a specific user with optional filtering
   * @param {string} userId - User ID
   * @param {Object} filterOpts - Filter options
   * @param {string} [filterOpts.status] - Filter by status
   * @param {string} [filterOpts.date] - Filter by date
   * @param {string} [filterOpts.barberId] - Filter by barber ID
   * @param {number} [filterOpts.page=1] - Page number for pagination
   * @param {number} [filterOpts.limit=10] - Items per page
   * @returns {Promise<Object>} Object containing bookings array and pagination info
   */
  async getBookingsByUser(userId, filterOpts = {}) {
    try {
      logger.info(`Getting bookings for user ${userId}`, { filterOpts });

      const {
        status,
        date,
        barberId,
        page = 1,
        limit = 10
      } = filterOpts;

      // Build query object
      const query = { customerId: userId };

      if (status) {
        query.status = status;
      }

      if (date) {
        query.date = date;
      }

      if (barberId) {
        query.barberId = barberId;
      }

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Execute query with pagination
      const [bookings, total] = await Promise.all([
        this.Booking.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.Booking.countDocuments(query).exec()
      ]);

      // Populate service data for each booking
      const enrichedBookings = await Promise.all(
        bookings.map(async (booking) => {
          const enrichedBooking = booking.toObject();

          // Add service information
          if (this.serviceData) {
            try {
              const serviceInfo = await this.serviceData.getServiceById(booking.serviceId);
              enrichedBooking.service = serviceInfo;
            } catch (error) {
              logger.warn(`Failed to get service info for booking ${booking._id}`, { error: error.message });
              enrichedBooking.service = null;
            }

            // Add barber information
            try {
              const barberInfo = await this.serviceData.getBarberById(booking.barberId);
              enrichedBooking.barber = barberInfo;
            } catch (error) {
              logger.warn(`Failed to get barber info for booking ${booking._id}`, { error: error.message });
              enrichedBooking.barber = null;
            }
          }

          return enrichedBooking;
        })
      );

      return {
        bookings: enrichedBookings,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error(`Error getting bookings for user ${userId}`, { error: error.message });
      throw new Error(`Database error while getting bookings: ${error.message}`);
    }
  }

  /**
   * Get a specific booking by ID for a user
   * @param {string} id - Booking ID
   * @param {string} userId - User ID (for authorization)
   * @returns {Promise<Object|null>} Booking object or null if not found
   */
  async getBookingById(id, userId) {
    try {
      logger.info(`Getting booking ${id} for user ${userId}`);

      const booking = await this.Booking.findOne({
        _id: id,
        customerId: userId
      }).exec();

      if (!booking) {
        return null;
      }

      const enrichedBooking = booking.toObject();

      // Populate service data
      if (this.serviceData) {
        try {
          const serviceInfo = await this.serviceData.getServiceById(booking.serviceId);
          enrichedBooking.service = serviceInfo;
        } catch (error) {
          logger.warn(`Failed to get service info for booking ${id}`, { error: error.message });
          enrichedBooking.service = null;
        }

        // Add barber information
        try {
          const barberInfo = await this.serviceData.getBarberById(booking.barberId);
          enrichedBooking.barber = barberInfo;
        } catch (error) {
          logger.warn(`Failed to get barber info for booking ${id}`, { error: error.message });
          enrichedBooking.barber = null;
        }
      }

      return enrichedBooking;
    } catch (error) {
      logger.error(`Error getting booking ${id} for user ${userId}`, { error: error.message });
      throw new Error(`Database error while getting booking: ${error.message}`);
    }
  }

  /**
   * Create a new booking with price calculation
   * @param {Object} data - Booking data
   * @param {string} data.customerId - Customer ID
   * @param {string} data.barberId - Barber ID
   * @param {string} data.serviceId - Service ID
   * @param {string} data.date - Booking date
   * @param {string} data.time - Booking time
   * @param {string} [data.specialRequests] - Special requests
   * @returns {Promise<Object>} Created booking object
   */
  async createBooking(data) {
    try {
      logger.info(`Creating booking for customer ${data.customerId}`);

      const {
        customerId,
        barberId,
        serviceId,
        date,
        time,
        specialRequests = ''
      } = data;

      // Validate required fields
      if (!customerId || !barberId || !serviceId || !date || !time) {
        throw new Error('Missing required fields: customerId, barberId, serviceId, date, time');
      }

      // Validate ObjectId format
      const mongoose = require('mongoose');
      const validateId = (id, name) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          throw new Error(`Invalid ${name} format: ${id}. Must be a valid MongoDB ObjectId.`);
        }
      };

      try {
        validateId(customerId, 'customerId');
        validateId(barberId, 'barberId');
        validateId(serviceId, 'serviceId');
      } catch (validationError) {
        logger.error(`Validation error: ${validationError.message}`);
        throw validationError;
      }

      // Check for duplicate booking (same customer, barber, date, and time)
      const existingBooking = await this.Booking.findOne({
        customerId,
        barberId,
        date,
        time,
        status: { $in: ['pending', 'confirmed'] } // Only check active bookings
      }).exec();

      if (existingBooking) {
        throw new Error('A booking already exists for this date and time with the selected barber. Please choose a different time slot.');
      }

      // Calculate price by getting service information
      let totalPrice = 0;
      let serviceInfo = null;

      if (this.serviceData) {
        try {
          logger.info(`Fetching service information for serviceId: ${serviceId}`);
          serviceInfo = await this.serviceData.getServiceById(serviceId);
          if (serviceInfo && serviceInfo.price) {
            totalPrice = serviceInfo.price;
            logger.info(`Service price: ${totalPrice}`);
          } else {
            logger.warn(`Service ${serviceId} not found or has no price, using default price`);
            totalPrice = 50; // Default price
          }
        } catch (error) {
          logger.warn(`Failed to get service price for ${serviceId}`, { error: error.message });
          totalPrice = 50; // Default price
        }
      } else {
        logger.warn('No service data provider available, using default price');
        totalPrice = 50; // Default price when no service data provider
      }

      // Create booking object
      logger.info('Creating booking object with data:', {
        customerId,
        barberId,
        serviceId,
        date,
        time,
        totalPrice,
        status: 'pending'
      });

      // Create booking
      const booking = new this.Booking({
        customerId,
        barberId,
        serviceId,
        date,
        time,
        specialRequests,
        totalPrice,
        status: 'pending'
      });

      // Save booking to database with error handling
      let savedBooking;
      try {
        logger.info('Saving booking to database...');
        savedBooking = await booking.save();
        logger.info(`Booking saved with ID: ${savedBooking._id}`);
      } catch (saveError) {
        logger.error('Error saving booking to database:', { 
          error: saveError.message,
          code: saveError.code,
          name: saveError.name
        });

        // Handle specific MongoDB errors
        if (saveError.name === 'ValidationError') {
          const validationErrors = Object.keys(saveError.errors).map(
            key => `${key}: ${saveError.errors[key].message}`
          ).join(', ');
          throw new Error(`Validation error: ${validationErrors}`);
        } else if (saveError.code === 11000) {
          throw new Error('Duplicate booking error. This booking already exists.');
        }

        throw saveError;
      }

      // Return enriched booking
      const enrichedBooking = savedBooking.toObject();
      if (serviceInfo) {
        enrichedBooking.service = serviceInfo;
      }

      // Add barber information
      if (this.serviceData) {
        try {
          logger.info(`Fetching barber information for barberId: ${barberId}`);
          const barberInfo = await this.serviceData.getBarberById(barberId);
          enrichedBooking.barber = barberInfo;
        } catch (error) {
          logger.warn(`Failed to get barber info for new booking`, { error: error.message });
          enrichedBooking.barber = null;
        }
      }

      logger.info(`Booking created successfully with ID ${savedBooking._id}`);
      return enrichedBooking;
    } catch (error) {
      logger.error(`Error creating booking`, { 
        error: error.message, 
        stack: error.stack,
        data 
      });

      // Rethrow with more specific error message
      throw new Error(`Database error while creating booking: ${error.message}`);
    }
  }

  /**
   * Update a booking
   * @param {string} id - Booking ID
   * @param {string} userId - User ID (for authorization)
   * @param {Object} data - Updated booking data
   * @param {string} [data.barberId] - Barber ID
   * @param {string} [data.serviceId] - Service ID
   * @param {string} [data.date] - Booking date
   * @param {string} [data.time] - Booking time
   * @param {string} [data.status] - Booking status
   * @param {string} [data.specialRequests] - Special requests
   * @returns {Promise<Object|null>} Updated booking object or null if not found
   */
  async updateBooking(id, userId, data) {
    try {
      logger.info(`Updating booking ${id} for user ${userId}`);

      // Check if booking exists and belongs to user
      const existingBooking = await this.Booking.findOne({
        _id: id,
        customerId: userId
      }).exec();

      if (!existingBooking) {
        return null;
      }

      // Prepare update data
      const updateData = { ...data };

      // If service is being updated, recalculate price
      if (data.serviceId && data.serviceId !== existingBooking.serviceId) {
        if (this.serviceData) {
          try {
            const serviceInfo = await this.serviceData.getServiceById(data.serviceId);
            if (serviceInfo && serviceInfo.price) {
              updateData.totalPrice = serviceInfo.price;
            }
          } catch (error) {
            logger.warn(`Failed to get service price for ${data.serviceId}`, { error: error.message });
          }
        }
      }

      // Update booking
      const updatedBooking = await this.Booking.findOneAndUpdate(
        { _id: id, customerId: userId },
        updateData,
        { new: true, runValidators: true }
      ).exec();

      if (!updatedBooking) {
        return null;
      }

      // Return enriched booking
      const enrichedBooking = updatedBooking.toObject();

      // Add service information
      if (this.serviceData) {
        try {
          const serviceInfo = await this.serviceData.getServiceById(updatedBooking.serviceId);
          enrichedBooking.service = serviceInfo;
        } catch (error) {
          logger.warn(`Failed to get service info for updated booking ${id}`, { error: error.message });
          enrichedBooking.service = null;
        }

        // Add barber information
        try {
          const barberInfo = await this.serviceData.getBarberById(updatedBooking.barberId);
          enrichedBooking.barber = barberInfo;
        } catch (error) {
          logger.warn(`Failed to get barber info for updated booking ${id}`, { error: error.message });
          enrichedBooking.barber = null;
        }
      }

      logger.info(`Booking ${id} updated successfully`);
      return enrichedBooking;
    } catch (error) {
      logger.error(`Error updating booking ${id} for user ${userId}`, { error: error.message });
      throw new Error(`Database error while updating booking: ${error.message}`);
    }
  }

  /**
   * Cancel a booking by setting status to 'cancelled'
   * @param {string} id - Booking ID
   * @param {string} userId - User ID (for authorization)
   * @returns {Promise<Object|null>} Cancelled booking object or null if not found
   */
  async cancelBooking(id, userId) {
    try {
      logger.info(`Cancelling booking ${id} for user ${userId}`);

      const cancelledBooking = await this.Booking.findOneAndUpdate(
        { _id: id, customerId: userId },
        { status: 'cancelled' },
        { new: true }
      ).exec();

      if (!cancelledBooking) {
        return null;
      }

      logger.info(`Booking ${id} cancelled successfully`);
      return cancelledBooking.toObject();
    } catch (error) {
      logger.error(`Error cancelling booking ${id} for user ${userId}`, { error: error.message });
      throw new Error(`Database error while cancelling booking: ${error.message}`);
    }
  }

  /**
   * Get bookings for a specific barber (useful for barber dashboard)
   * @param {string} barberId - Barber ID
   * @param {Object} filterOpts - Filter options
   * @param {string} [filterOpts.status] - Filter by status
   * @param {string} [filterOpts.date] - Filter by date
   * @param {number} [filterOpts.page=1] - Page number for pagination
   * @param {number} [filterOpts.limit=10] - Items per page
   * @returns {Promise<Object>} Object containing bookings array and pagination info
   */
  async getBookingsByBarber(barberId, filterOpts = {}) {
    try {
      logger.info(`Getting bookings for barber ${barberId}`, { filterOpts });

      const {
        status,
        date,
        page = 1,
        limit = 10
      } = filterOpts;

      // Build query object
      const query = { barberId };

      if (status) {
        query.status = status;
      }

      if (date) {
        query.date = date;
      }

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Execute query with pagination
      const [bookings, total] = await Promise.all([
        this.Booking.find(query)
          .sort({ date: 1, time: 1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.Booking.countDocuments(query).exec()
      ]);

      return {
        bookings: bookings.map(booking => booking.toObject()),
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error(`Error getting bookings for barber ${barberId}`, { error: error.message });
      throw new Error(`Database error while getting barber bookings: ${error.message}`);
    }
  }
}

module.exports = BookingService;
