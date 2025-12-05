const express = require('express');
const { requireUser } = require('./middleware/auth');
const notificationService = require('../services/notificationService');
const logger = require('../utils/logger');

const router = express.Router();

// Test endpoint to create a sample notification
router.post('/test', requireUser, async (req, res) => {
  try {
    const userId = req.user._id;
    const { type = 'booking_confirmation' } = req.body;
    
    // Sample booking data for testing
    const sampleData = {
      service: 'Haircut',
      date: '2025-08-05',
      time: '14:00',
      bookingId: '507f1f77bcf86cd799439011' // Sample ObjectId
    };
    
    // Test the notification service
    await notificationService.handleNotification({
      type,
      userId,
      data: sampleData
    });
    
    logger.info(`Test notification created for user ${userId}`);
    
    res.status(200).json({
      success: true,
      message: 'Test notification created successfully'
    });
    
  } catch (error) {
    logger.error('Error creating test notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create test notification'
    });
  }
});

// Get user notifications
router.get('/', requireUser, async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 20, skip = 0, unreadOnly = false } = req.query;
    
    const notifications = await notificationService.getUserNotifications(userId, {
      limit: parseInt(limit),
      skip: parseInt(skip),
      unreadOnly: unreadOnly === 'true'
    });
    
    res.status(200).json({
      success: true,
      notifications
    });
    
  } catch (error) {
    logger.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
});

// Mark notification as read
router.put('/:id/read', requireUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    await notificationService.markAsRead(id, userId);
    
    res.status(200).json({
      success: true,
      message: 'Notification marked as read'
    });
    
  } catch (error) {
    logger.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
});

module.exports = router;
