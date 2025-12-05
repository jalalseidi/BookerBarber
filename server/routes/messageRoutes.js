const express = require('express');
const { requireUser } = require('./middleware/auth.js');
const { asyncHandler } = require('../utils/errorHandler');
const { ErrorTypes } = require('../utils/errorHandler');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * @route GET /api/messages
 * @desc Get all messages for the logged-in user (customer)
 * @access Private
 */
router.get('/', requireUser, asyncHandler(async (req, res) => {
  logger.info(`Getting messages for user ${req.user.id}`);
  
  const Message = require('../models/Message');
  const User = require('../models/User');
  const Booking = require('../models/Booking');
  const Service = require('../models/Service');
  
  // Get messages where user is the recipient
  const messages = await Message.find({ recipientId: req.user.id })
    .sort({ createdAt: -1 })
    .populate('senderId', 'name email')
    .populate('bookingId')
    .lean()
    .exec();
  
  // Enrich messages with booking details
  const enrichedMessages = await Promise.all(
    messages.map(async (msg) => {
      if (msg.bookingId) {
        const service = await Service.findById(msg.bookingId.serviceId).lean();
        return {
          ...msg,
          booking: {
            ...msg.bookingId,
            service: service
          }
        };
      }
      return msg;
    })
  );
  
  res.status(200).json({
    success: true,
    data: {
      messages: enrichedMessages,
      total: enrichedMessages.length,
      unreadCount: enrichedMessages.filter(m => !m.isRead).length
    }
  });
}));

/**
 * @route GET /api/messages/booking/:bookingId
 * @desc Get messages for a specific booking
 * @access Private
 */
router.get('/booking/:bookingId', requireUser, asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  
  logger.info(`Getting messages for booking ${bookingId}`);
  
  const Message = require('../models/Message');
  const Booking = require('../models/Booking');
  
  // Verify the booking belongs to the user
  const booking = await Booking.findOne({
    _id: bookingId,
    $or: [
      { customerId: req.user.id },
      { barberId: req.user.id }
    ]
  });
  
  if (!booking) {
    throw ErrorTypes.NOT_FOUND('Booking not found or access denied');
  }
  
  // Get messages for this booking
  const messages = await Message.find({ bookingId: bookingId })
    .sort({ createdAt: 1 }) // Oldest first for chat-like display
    .populate('senderId', 'name email')
    .lean()
    .exec();
  
  res.status(200).json({
    success: true,
    data: {
      messages,
      total: messages.length
    }
  });
}));

/**
 * @route PUT /api/messages/:id/read
 * @desc Mark a message as read
 * @access Private
 */
router.put('/:id/read', requireUser, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  logger.info(`Marking message ${id} as read by user ${req.user.id}`);
  
  const Message = require('../models/Message');
  
  // Find the message and verify it belongs to the user
  const message = await Message.findOne({
    _id: id,
    recipientId: req.user.id
  });
  
  if (!message) {
    throw ErrorTypes.NOT_FOUND('Message not found or access denied');
  }
  
  // Update read status
  message.isRead = true;
  message.readAt = new Date();
  await message.save();
  
  res.status(200).json({
    success: true,
    message: 'Message marked as read',
    data: message
  });
}));

/**
 * @route PUT /api/messages/booking/:bookingId/read-all
 * @desc Mark all messages for a booking as read
 * @access Private
 */
router.put('/booking/:bookingId/read-all', requireUser, asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  
  logger.info(`Marking all messages for booking ${bookingId} as read by user ${req.user.id}`);
  
  const Message = require('../models/Message');
  
  // Update all unread messages for this booking and user
  const result = await Message.updateMany(
    {
      bookingId: bookingId,
      recipientId: req.user.id,
      isRead: false
    },
    {
      $set: {
        isRead: true,
        readAt: new Date()
      }
    }
  );
  
  res.status(200).json({
    success: true,
    message: `${result.modifiedCount} messages marked as read`
  });
}));

module.exports = router;
