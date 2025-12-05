const express = require('express');
const { requireUser } = require('./middleware/auth.js');
const { asyncHandler } = require('../utils/errorHandler');
const { ErrorTypes } = require('../utils/errorHandler');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * @route GET /api/barbers
 * @desc Get all active barbers with availability
 * @access Public
 */
router.get('/', asyncHandler(async (req, res) => {
  logger.info('Getting all barbers');
  
  // Import models
  const User = require('../models/User');
  const Availability = require('../models/Availability');
  const Barber = require('../models/Barber');
  
  // Get current date for availability check
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Fetch barber users who are active
  const barberUsers = await User.find({ 
    role: 'barber', 
    isActive: true 
  }).lean().exec();
  
  // For each barber, check if they have future availability and get Barber document
  const barbersWithDetails = await Promise.all(
    barberUsers.map(async (barber) => {
      // Check if barber has availability from today onwards
      const hasAvailability = await Availability.findOne({
        barberId: barber._id,
        date: { $gte: today },
        isAvailable: true
      }).lean();
      
      // Try to get the Barber document for additional details
      const barberDoc = await Barber.findOne({ email: barber.email }).lean();
      
      // Transform user data to barber format
      return {
        _id: barber._id,
        name: barber.name || barberDoc?.name || 'Unnamed Barber',
        email: barber.email,
        specialties: barberDoc?.specialties || [], 
        bio: barberDoc?.bio || `Professional barber with excellent service`,
        bioEn: barberDoc?.bioEn || `Professional barber with excellent service`,
        bioTr: barberDoc?.bioTr || `Mükemmel hizmet sunan profesyonel berber`,
        profilePhoto: barber.profilePhoto || barberDoc?.profilePhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        rating: barberDoc?.rating || 4.5, 
        reviewCount: barberDoc?.reviewCount || 0, 
        isAvailable: !!hasAvailability,
        workingHours: barberDoc?.workingHours || {
          start: '09:00',
          end: '18:00'
        },
        hasAvailability: !!hasAvailability,
        isActive: barberDoc?.isActive !== undefined ? barberDoc.isActive : true
      };
    })
  );
  
  // Filter to only include barbers with availability
  const availableBarbers = barbersWithDetails.filter(barber => barber.hasAvailability);
  
  res.status(200).json({
    success: true,
    data: {
      barbers: availableBarbers,
      total: availableBarbers.length,
      page: 1,
      limit: 50
    }
  });
}));

/**
 * @route GET /api/barbers/availability
 * @desc Get barber's own availability
 * @access Private (Barber only)
 */
router.get('/availability', requireUser, asyncHandler(async (req, res) => {
  // Ensure user is a barber
  if (req.user.role !== 'barber') {
    throw ErrorTypes.FORBIDDEN('Access denied. Barber role required.');
  }
  
  logger.info(`Getting availability for barber ${req.user.id}`);
  
  const Availability = require('../models/Availability');
  
  // Get availability from today onwards
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const availability = await Availability.find({
    barberId: req.user.id,
    date: { $gte: today }
  }).sort({ date: 1, startTime: 1 }).lean().exec();
  
  res.status(200).json({
    success: true,
    data: availability
  });
}));

/**
 * @route POST /api/barbers/availability
 * @desc Create new availability slot
 * @access Private (Barber only)
 */
router.post('/availability', requireUser, asyncHandler(async (req, res) => {
  // Ensure user is a barber
  if (req.user.role !== 'barber') {
    throw ErrorTypes.FORBIDDEN('Access denied. Barber role required.');
  }
  
  const { date, start_time, end_time, is_available } = req.body;
  
  if (!date || !start_time || !end_time) {
    throw ErrorTypes.BAD_REQUEST('Date, start time, and end time are required');
  }
  
  logger.info(`Creating availability for barber ${req.user.id}`);
  
  const Availability = require('../models/Availability');
  
  // Parse and validate date
  const availabilityDate = new Date(date);
  availabilityDate.setHours(0, 0, 0, 0);
  
  // Check if date is not in the past
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (availabilityDate < today) {
    throw ErrorTypes.BAD_REQUEST('Cannot set availability for past dates');
  }
  
  // Check if this exact availability already exists
  const existingSlot = await Availability.findOne({
    barberId: req.user.id,
    date: availabilityDate,
    startTime: start_time,
    endTime: end_time
  });
  
  if (existingSlot) {
    // If it exists, update it instead
    existingSlot.isAvailable = is_available !== undefined ? is_available : true;
    await existingSlot.save();
    
    return res.status(200).json({
      success: true,
      message: 'Availability already exists and was updated',
      data: existingSlot
    });
  }
  
  // Create availability slot
  const availabilitySlot = new Availability({
    barberId: req.user.id,
    date: availabilityDate,
    startTime: start_time,
    endTime: end_time,
    isAvailable: is_available !== undefined ? is_available : true
  });
  
  try {
    await availabilitySlot.save();
    
    res.status(201).json({
      success: true,
      message: 'Availability created successfully',
      data: availabilitySlot
    });
  } catch (error) {
    // Handle duplicate key error specifically
    if (error.code === 11000) {
      throw ErrorTypes.BAD_REQUEST('This availability slot already exists. Please choose a different time or delete the existing slot first.');
    }
    throw error;
  }
}));

/**
 * @route PUT /api/barbers/availability/:id
 * @desc Update availability slot
 * @access Private (Barber only)
 */
router.put('/availability/:id', requireUser, asyncHandler(async (req, res) => {
  // Ensure user is a barber
  if (req.user.role !== 'barber') {
    throw ErrorTypes.FORBIDDEN('Access denied. Barber role required.');
  }
  
  const { id } = req.params;
  const { date, start_time, end_time, is_available } = req.body;
  
  logger.info(`Updating availability ${id} for barber ${req.user.id}`);
  
  const Availability = require('../models/Availability');
  
  // Find and verify ownership
  const availabilitySlot = await Availability.findOne({
    _id: id,
    barberId: req.user.id
  });
  
  if (!availabilitySlot) {
    throw ErrorTypes.NOT_FOUND('Availability slot not found');
  }
  
  // Update fields if provided
  if (date) {
    const availabilityDate = new Date(date);
    availabilityDate.setHours(0, 0, 0, 0);
    
    // Check if date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (availabilityDate < today) {
      throw ErrorTypes.BAD_REQUEST('Cannot set availability for past dates');
    }
    
    availabilitySlot.date = availabilityDate;
  }
  
  if (start_time) availabilitySlot.startTime = start_time;
  if (end_time) availabilitySlot.endTime = end_time;
  if (is_available !== undefined) availabilitySlot.isAvailable = is_available;
  
  await availabilitySlot.save();
  
  res.status(200).json({
    success: true,
    message: 'Availability updated successfully',
    data: availabilitySlot
  });
}));

/**
 * @route DELETE /api/barbers/availability/:id
 * @desc Delete availability slot
 * @access Private (Barber only)
 */
router.delete('/availability/:id', requireUser, asyncHandler(async (req, res) => {
  // Ensure user is a barber
  if (req.user.role !== 'barber') {
    throw ErrorTypes.FORBIDDEN('Access denied. Barber role required.');
  }
  
  const { id } = req.params;
  
  logger.info(`Deleting availability ${id} for barber ${req.user.id}`);
  
  const Availability = require('../models/Availability');
  
  // Find and verify ownership
  const availabilitySlot = await Availability.findOneAndDelete({
    _id: id,
    barberId: req.user.id
  });
  
  if (!availabilitySlot) {
    throw ErrorTypes.NOT_FOUND('Availability slot not found');
  }
  
  res.status(200).json({
    success: true,
    message: 'Availability deleted successfully'
  });
}));

/**
 * @route GET /api/barbers/bookings
 * @desc Get all bookings for the barber
 * @access Private (Barber only)
 */
router.get('/bookings', requireUser, asyncHandler(async (req, res) => {
  // Ensure user is a barber
  if (req.user.role !== 'barber') {
    throw ErrorTypes.FORBIDDEN('Access denied. Barber role required.');
  }
  
  logger.info(`Getting bookings for barber ${req.user.id}`);
  
  // Import booking service
  const container = require('../services');
  const bookingService = container.get('bookingService');
  
  // Extract query parameters for filtering and pagination
  const { status, date, page = 1, limit = 10 } = req.query;
  
  const filterOpts = {
    status,
    date,
    page: parseInt(page),
    limit: parseInt(limit)
  };
  
  // Get bookings from the service
  const result = await bookingService.getBookingsByBarber(req.user.id, filterOpts);
  
  // Enrich booking data with customer and service details
  const User = require('../models/User');
  const Service = require('../models/Service');
  
  // Enhance bookings with customer and service data
  const enhancedBookings = await Promise.all(
    result.bookings.map(async (booking) => {
      // Add customer info
      const customer = await User.findById(booking.customerId).select('name email').lean();
      
      // Add service info
      const service = await Service.findById(booking.serviceId).lean();
      
      return {
        ...booking,
        customer: customer || { name: 'Unknown Customer', email: '' },
        service: service || { name: 'Unknown Service', price: 0, duration: 0 }
      };
    })
  );
  
  res.status(200).json({
    success: true,
    data: {
      bookings: enhancedBookings,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages
    }
  });
}));

/**
 * @route PUT /api/barbers/bookings/:id
 * @desc Update booking status (approve or reject)
 * @access Private (Barber only)
 */
router.put('/bookings/:id', requireUser, asyncHandler(async (req, res) => {
  // Ensure user is a barber
  if (req.user.role !== 'barber') {
    throw ErrorTypes.FORBIDDEN('Access denied. Barber role required.');
  }
  
  const { id } = req.params;
  const { status } = req.body;
  
  if (!status || !['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
    throw ErrorTypes.BAD_REQUEST('Valid status is required (pending, confirmed, completed, or cancelled)');
  }
  
  logger.info(`Updating booking ${id} status to ${status} by barber ${req.user.id}`);
  
  // Import booking model
  const Booking = require('../models/Booking');
  const notificationService = require('../services/notificationService');
  
  // Find and verify ownership
  const booking = await Booking.findOne({
    _id: id,
    barberId: req.user.id
  }).exec();
  
  if (!booking) {
    throw ErrorTypes.NOT_FOUND(`Booking with ID ${id} not found or does not belong to this barber`);
  }
  
  // Update booking status
  booking.status = status;
  await booking.save();
  
  // Send notification to customer about status change
  try {
    let notificationType;
    
    switch (status) {
      case 'confirmed':
        notificationType = 'booking_confirmed';
        break;
      case 'cancelled':
        notificationType = 'booking_cancelled';
        break;
      case 'completed':
        notificationType = 'booking_completed';
        break;
      default:
        notificationType = 'booking_status_update';
    }
    
    // Get more details for the notification
    const User = require('../models/User');
    const Service = require('../models/Service');
    
    const barber = await User.findById(req.user.id).select('name').lean();
    const service = await Service.findById(booking.serviceId).select('name').lean();
    
    await notificationService.handleNotification({
      type: notificationType,
      userId: booking.customerId,
      data: {
        bookingId: booking._id,
        service: service?.name || 'Service',
        date: new Date(booking.date).toLocaleDateString(),
        time: booking.time,
        barber: barber?.name || 'Barber',
        status: status
      }
    });
    
    logger.info(`Notification sent to customer for booking ${booking._id}`);
  } catch (notifError) {
    logger.error(`Error sending status update notification: ${notifError.message}`);
    // Don't fail the status update if notification fails
  }
  
  res.status(200).json({
    success: true,
    message: `Booking ${status === 'confirmed' ? 'approved' : status}`,
    data: {
      booking: booking.toObject(),
      message: `Booking has been ${status === 'confirmed' ? 'approved' : status}`
    }
  });
}));

/**
 * @route GET /api/barbers/dashboard
 * @desc Get barber dashboard data with booking statistics
 * @access Private (Barber only)
 */
router.get('/dashboard', requireUser, asyncHandler(async (req, res) => {
  // Ensure user is a barber
  if (req.user.role !== 'barber') {
    throw ErrorTypes.FORBIDDEN('Access denied. Barber role required.');
  }
  
  logger.info(`Getting dashboard data for barber ${req.user.id}`);
  
  // Import models - must load User and Service for populate to work
  const User = require('../models/User');
  const Service = require('../models/Service');
  const Booking = require('../models/Booking');
  const Availability = require('../models/Availability');
  
  // Get today's date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Format today as YYYY-MM-DD for query comparison
  const todayFormatted = today.toISOString().split('T')[0];
  
  // Get counts of bookings by status
  const [totalBookings, pendingBookings, confirmedBookings, todayBookings, availabilitySlots] = await Promise.all([
    Booking.countDocuments({ barberId: req.user.id }).exec(),
    Booking.countDocuments({ barberId: req.user.id, status: 'pending' }).exec(),
    Booking.countDocuments({ barberId: req.user.id, status: 'confirmed' }).exec(),
    Booking.find({ 
      barberId: req.user.id, 
      date: todayFormatted,
      status: { $in: ['pending', 'confirmed'] }
    }).sort({ time: 1 }).populate('customerId', 'name email').populate('serviceId', 'name duration price').lean().exec(),
    Availability.countDocuments({ barberId: req.user.id, date: { $gte: today }, isAvailable: true }).exec()
  ]);
  
  // Get recent bookings
  const recentBookings = await Booking.find({ barberId: req.user.id })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('customerId', 'name email')
    .populate('serviceId', 'name duration price')
    .lean()
    .exec();
  
  res.status(200).json({
    success: true,
    data: {
      stats: {
        totalBookings,
        pendingBookings,
        confirmedBookings,
        availabilitySlots,
        hasAvailability: availabilitySlots > 0
      },
      todayBookings,
      recentBookings
    }
  });
}));

/**
 * @route POST /api/barbers/contact-customer
 * @desc Send message to customer
 * @access Private (Barber only)
 */
router.post('/contact-customer', requireUser, asyncHandler(async (req, res) => {
  // Ensure user is a barber
  if (req.user.role !== 'barber') {
    throw ErrorTypes.FORBIDDEN('Access denied. Barber role required.');
  }
  
  const { booking_id, customer_email, subject, message } = req.body;
  
  if (!booking_id || !customer_email || !subject || !message) {
    throw ErrorTypes.BAD_REQUEST('Booking ID, customer email, subject, and message are required');
  }
  
  logger.info(`Barber ${req.user.id} sending message to customer ${customer_email}`);
  
  // Import models
  const Booking = require('../models/Booking');
  const User = require('../models/User');
  const Message = require('../models/Message');
  
  // Verify the booking belongs to this barber
  const booking = await Booking.findOne({
    _id: booking_id,
    barberId: req.user.id
  });
  
  if (!booking) {
    throw ErrorTypes.NOT_FOUND('Booking not found or does not belong to this barber');
  }
  
  // Get customer details
  const customer = await User.findById(booking.customerId);
  if (!customer) {
    throw ErrorTypes.NOT_FOUND('Customer not found');
  }
  
  // Save message to database
  try {
    const newMessage = new Message({
      bookingId: booking._id,
      senderId: req.user.id,
      recipientId: customer._id,
      subject: subject,
      message: message,
      isRead: false
    });
    
    await newMessage.save();
    
    // Send notification/email to customer
    try {
      const notificationService = require('../services/notificationService');
      
      await notificationService.handleNotification({
        type: 'barber_message',
        userId: customer._id,
        data: {
          barberName: req.user.name,
          subject: subject,
          message: message,
          bookingId: booking._id,
          customerEmail: customer_email
        }
      });
    } catch (notifError) {
      logger.warn(`Notification failed but message saved: ${notifError.message}`);
      // Don't fail the request if notification fails
    }
    
    logger.info(`Message saved and sent from barber ${req.user.id} to customer ${customer._id}`);
    
    res.status(200).json({
      success: true,
      message: 'Message sent successfully to customer',
      data: {
        messageId: newMessage._id
      }
    });
  } catch (saveError) {
    logger.error(`Error saving message: ${saveError.message}`);
    throw ErrorTypes.INTERNAL_ERROR('Failed to send message to customer');
  }
}));

/**
 * @route GET /api/barbers/:id
 * @desc Get a barber by ID
 * @access Public
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  logger.info(`Getting barber with ID ${id}`);
  
  // In a real implementation, this would call a barber service
  // const barber = await barberService.getBarberById(id);
  // if (!barber) {
  //   throw ErrorTypes.NOT_FOUND(`Barber with ID ${id} not found`);
  // }
  
  // Mock response - create a mapping for each barber ID
  const mockBarbers = {
    '677a4f1b2c8d3e4f5a6b7c8d': {
      _id: '677a4f1b2c8d3e4f5a6b7c8d',
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
      }
    },
    '677a4f1b2c8d3e4f5a6b7c8e': {
      _id: '677a4f1b2c8d3e4f5a6b7c8e',
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
      }
    },
    '677a4f1b2c8d3e4f5a6b7c8f': {
      _id: '677a4f1b2c8d3e4f5a6b7c8f',
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
      }
    }
  };
  
  const barber = mockBarbers[id] || {
    _id: id,
    name: 'Unknown Barber',
    email: 'unknown@barbershop.com',
    specialties: ['haircut'],
    bio: 'Barber not found',
    bioEn: 'Barber not found',
    bioTr: 'Berber bulunamadı',
    profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    rating: 0,
    reviewCount: 0,
    isAvailable: false,
    workingHours: {
      start: '09:00',
      end: '18:00'
    }
  };
  
  res.status(200).json({
    success: true,
    data: {
      barber
    }
  });
}));

/**
 * @route GET /api/barbers/:id/availability
 * @desc Get a barber's availability for a specific date
 * @access Public
 */
router.get('/:id/availability', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { date, serviceId } = req.query;
  
  if (!date) {
    throw ErrorTypes.BAD_REQUEST('Date is required');
  }
  
  logger.info(`Getting availability for barber ${id} on ${date}`);
  
  // Import models
  const User = require('../models/User');
  const Availability = require('../models/Availability');
  const Booking = require('../models/Booking');
  
  // Verify barber exists
  const barber = await User.findOne({ _id: id, role: 'barber', isActive: true });
  if (!barber) {
    throw ErrorTypes.NOT_FOUND('Barber not found');
  }
  
  // Parse the requested date
  const requestedDate = new Date(date);
  requestedDate.setHours(0, 0, 0, 0);
  
  // Get barber's availability for the specified date
  const availabilitySlots = await Availability.find({
    barberId: id,
    date: requestedDate,
    isAvailable: true
  }).lean().exec();
  
  if (availabilitySlots.length === 0) {
    return res.status(200).json({
      success: true,
      data: {
        availableSlots: [],
        date,
        barberId: id,
        message: 'No availability set for this date'
      }
    });
  }
  
  // Get existing bookings for this barber on this date
  const existingBookings = await Booking.find({
    barberId: id,
    date: requestedDate,
    status: { $in: ['pending', 'confirmed'] }
  }).lean().exec();
  
  // Generate available time slots
  const availableSlots = [];
  
  availabilitySlots.forEach(slot => {
    const startTime = slot.startTime;
    const endTime = slot.endTime;
    
    // Generate 30-minute slots between start and end time
    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);
    
    while (start < end) {
      const timeSlot = start.toTimeString().slice(0, 5); // HH:MM format
      
      // Check if this slot is not already booked
      const isBooked = existingBookings.some(booking => booking.time === timeSlot);
      
      if (!isBooked) {
        availableSlots.push(timeSlot);
      }
      
      // Move to next 30-minute slot
      start.setMinutes(start.getMinutes() + 30);
    }
  });
  
  // Sort available slots
  availableSlots.sort();
  
  res.status(200).json({
    success: true,
    data: {
      availableSlots,
      date,
      barberId: id
    }
  });
}));

/**
 * @route GET /api/barbers/:id/reviews
 * @desc Get reviews for a barber
 * @access Public
 */
router.get('/:id/reviews', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 10 } = req.query;
  
  logger.info(`Getting reviews for barber ${id}`);
  
  // In a real implementation, this would call a barber service
  // const reviews = await barberService.getBarberReviews(id, { page, limit });
  
  // Mock response
  const reviews = [
    {
      _id: '1',
      barberId: id,
      customerId: 'user1',
      customerName: 'John Doe',
      rating: 5,
      comment: 'Great haircut, very professional!',
      createdAt: '2024-01-05T10:00:00Z'
    },
    {
      _id: '2',
      barberId: id,
      customerId: 'user2',
      customerName: 'Jane Smith',
      rating: 4,
      comment: 'Good service, but a bit rushed.',
      createdAt: '2024-01-10T14:30:00Z'
    }
  ];
  
  res.status(200).json({
    success: true,
    data: {
      reviews,
      total: reviews.length,
      page: parseInt(page),
      limit: parseInt(limit),
      averageRating: 4.5
    }
  });
}));

/**
 * @route GET /api/barbers/:id/bookings
 * @desc Get all bookings for a specific barber by ID
 * @access Private (Barber only)
 */
router.get('/:id/bookings', requireUser, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Verify the requesting user is either the barber or has admin privileges
  if (req.user.role !== 'admin' && req.user.id !== id) {
    throw ErrorTypes.FORBIDDEN('You can only view your own bookings');
  }
  
  logger.info(`Getting bookings for barber ID ${id}`);
  
  // Import booking service
  const container = require('../services');
  const bookingService = container.get('bookingService');
  
  // Extract query parameters for filtering and pagination
  const { status, date, page = 1, limit = 10 } = req.query;
  
  const filterOpts = {
    status,
    date,
    page: parseInt(page),
    limit: parseInt(limit)
  };
  
  // Get bookings from the service
  const result = await bookingService.getBookingsByBarber(id, filterOpts);
  
  // Enrich booking data with customer and service details
  const User = require('../models/User');
  const Service = require('../models/Service');
  
  // Enhance bookings with customer and service data
  const enhancedBookings = await Promise.all(
    result.bookings.map(async (booking) => {
      // Add customer info
      const customer = await User.findById(booking.customerId).select('name email').lean();
      
      // Add service info
      const service = await Service.findById(booking.serviceId).lean();
      
      return {
        ...booking,
        customer: customer || { name: 'Unknown Customer', email: '' },
        service: service || { name: 'Unknown Service', price: 0, duration: 0 }
      };
    })
  );
  
  res.status(200).json({
    success: true,
    data: {
      bookings: enhancedBookings,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages
    }
  });
}));

/**
 * @route POST /api/barbers/:id/reviews
 * @desc Create a review for a barber
 * @access Private
 */
router.post('/:id/reviews', requireUser, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;
  
  if (!rating || rating < 1 || rating > 5) {
    throw ErrorTypes.BAD_REQUEST('Rating is required and must be between 1 and 5');
  }
  
  logger.info(`Creating review for barber ${id} by user ${req.user.id}`);
  
  // In a real implementation, this would call a barber service
  // const review = await barberService.createBarberReview(id, req.user.id, { rating, comment });
  
  // Mock response
  const review = {
    _id: Date.now().toString(),
    barberId: id,
    customerId: req.user.id,
    customerName: req.user.name || 'Anonymous',
    rating,
    comment,
    createdAt: new Date().toISOString()
  };
  
  res.status(201).json({
    success: true,
    message: 'Review created successfully',
    data: {
      review,
      message: 'Review created successfully'
    }
  });
}));


module.exports = router;
