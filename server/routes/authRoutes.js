const express = require('express');
const serviceContainer = require('../services');
const { requireUser } = require('./middleware/auth.js');
const { generateAccessToken, generateRefreshToken } = require('../utils/auth.js');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const Barber = require('../models/Barber');

// Get the userService instance from the container
const userService = serviceContainer.get('userService');

const router = express.Router();

router.post('/login', async (req, res) => {
  const sendError = msg => res.status(400).json({ message: msg });
  const { email, password } = req.body;

  if (!email || !password) {
    return sendError('Email and password are required');
  }

  const user = await userService.authenticateWithPassword(email, password);

  if (user) {
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();
    return res.json({...user.toObject(), accessToken, refreshToken});
  } else {
    return sendError('Email or password is incorrect');

  }
});

router.post('/register', async (req, res, next) => {
  if (req.user) {
    return res.json({ user: req.user });
  }
  try {
    const userData = {
      email: req.body.email,
      password: req.body.password,
      name: req.body.name || (req.body.firstName && req.body.lastName ? `${req.body.firstName} ${req.body.lastName}`.trim() : ''),
      role: req.body.role || 'customer',
      phone: req.body.phone || '',
      preferredLanguage: req.body.preferredLanguage || 'en'
    };
    const user = await userService.create(userData);
    
    // If user registered as a barber, create a Barber document
    if (req.body.role === 'barber') {
      try {
        // Check if barber document already exists
        const existingBarber = await Barber.findOne({ email: req.body.email });
        
        if (!existingBarber) {
          const barberData = {
            name: req.body.name || `${req.body.firstName} ${req.body.lastName}`.trim() || 'Unnamed Barber',
            email: req.body.email,
            specialties: req.body.specialties || [],
            bio: req.body.bio || '',
            bioEn: req.body.bioEn || '',
            bioTr: req.body.bioTr || '',
            profilePhoto: req.body.profilePhoto || '',
            rating: 0,
            reviewCount: 0,
            isAvailable: true,
            workingHours: {
              start: req.body.workingHoursStart || '09:00',
              end: req.body.workingHoursEnd || '18:00'
            },
            isActive: true
          };
          
          const barber = new Barber(barberData);
          await barber.save();
          
          logger.info(`Barber document created for user: ${user.email}`);
        } else {
          logger.info(`Barber document already exists for: ${user.email}`);
        }
      } catch (barberError) {
        logger.error(`Error creating barber document: ${barberError}`);
        logger.error(`Error stack: ${barberError.stack}`);
        // Don't fail the registration if barber creation fails
        // The user account is already created successfully
      }
    }
    
    return res.status(200).json(user);
  } catch (error) {
    logger.error(`Error while registering user: ${error}`);
    return res.status(400).json({ error });
  }
});

router.post('/logout', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await userService.getByEmail(email);
    if (user) {
      // Use mongoose directly to update the user document
      const User = require('../models/User');
      await User.updateOne(
        { _id: user._id },
        { $unset: { refreshToken: "" } }
      );
    }

    res.status(200).json({ message: 'User logged out successfully.' });
  } catch (error) {
    logger.error(`Error during logout: ${error}`);
    res.status(500).json({ message: 'An error occurred during logout' });
  }
});

router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token is required'
    });
  }

  try {
    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Find the user
    const user = await userService.get(decoded.sub);

    if (!user) {
      return res.status(403).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.refreshToken !== refreshToken) {
      return res.status(403).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Update user's refresh token in database
    user.refreshToken = newRefreshToken;
    await user.save();

    // Return new tokens
    return res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
    });

  } catch (error) {
    logger.error(`Token refresh error: ${error.message}`);

    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({
        success: false,
        message: 'Refresh token has expired'
      });
    }

    return res.status(403).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
});

router.get('/me', requireUser, async (req, res) => {
  return res.status(200).json(req.user);
});

router.get('/profile', requireUser, async (req, res) => {
  return res.status(200).json({ profile: req.user });
});

router.put('/profile', requireUser, async (req, res) => {
  try {
    const userId = req.user._id;
    const updateData = req.body;
    
    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updateData.password;
    delete updateData._id;
    delete updateData.refreshToken;
    
    // Update user profile
    const updatedUser = await userService.update(userId, updateData);
    
    if (!updatedUser) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    logger.info(`Profile updated for user: ${updatedUser.email}`);
    
    return res.status(200).json({ 
      success: true,
      profile: updatedUser,
      message: 'Profile updated successfully' 
    });
    
  } catch (error) {
    logger.error(`Error updating profile: ${error}`);
    return res.status(500).json({ 
      success: false,
      message: 'An error occurred while updating the profile' 
    });
  }
});

router.put('/change-password', requireUser, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ 
      success: false,
      message: 'Current password and new password are required' 
    });
  }
  
  try {
    const user = req.user;
    
    // Verify current password
    const { validatePassword } = require('../utils/password');
    const isCurrentPasswordValid = await validatePassword(currentPassword, user.password);
    
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ 
        success: false,
        message: 'Current password is incorrect' 
      });
    }
    
    // Set new password
    await userService.setPassword(user, newPassword);
    
    logger.info(`Password changed for user: ${user.email}`);
    
    return res.status(200).json({ 
      success: true,
      message: 'Password changed successfully' 
    });
    
  } catch (error) {
    logger.error(`Error changing password: ${error}`);
    return res.status(500).json({ 
      success: false,
      message: 'An error occurred while changing the password' 
    });
  }
});

router.delete('/delete-account', requireUser, async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    
    // If user is a barber, delete the barber document first
    if (userRole === 'barber') {
      try {
        await Barber.deleteOne({ userId: userId });
        logger.info(`Barber document deleted for user: ${req.user.email}`);
      } catch (barberError) {
        logger.error(`Error deleting barber document: ${barberError}`);
        // Continue with user deletion even if barber deletion fails
      }
    }
    
    // Delete the user account
    await userService.delete(userId);
    
    logger.info(`User account deleted: ${req.user.email}`);
    
    return res.status(200).json({ 
      success: true,
      message: 'Account deleted successfully' 
    });
    
  } catch (error) {
    logger.error(`Error deleting account: ${error}`);
    return res.status(500).json({ 
      success: false,
      message: 'An error occurred while deleting the account' 
    });
  }
});

// Settings endpoints
router.get('/settings', requireUser, async (req, res) => {
  try {
    const user = req.user;
    const preferences = user.notificationPreferences;
    
    const settings = {
      language: user.preferredLanguage || 'en',
      theme: 'system',
      primaryChannel: preferences.primaryChannel || 'email',
      bookingConfirmations: preferences.bookingConfirmations,
      bookingReminders: preferences.bookingReminders,
      bookingCancellations: preferences.bookingCancellations,
      bookingChanges: preferences.bookingChanges,
      newBookingRequests: preferences.newBookingRequests,
      dailySummary: preferences.dailySummary,
      newReviews: preferences.newReviews,
      reminderTiming: preferences.reminderTiming || {
        twentyFourHours: true,
        twoHours: true
      }
    };
    
    return res.status(200).json({ 
      success: true,
      settings: settings 
    });
    
  } catch (error) {
    logger.error(`Error fetching settings: ${error}`);
    return res.status(500).json({ 
      success: false,
      message: 'An error occurred while fetching settings' 
    });
  }
});

router.put('/settings', requireUser, async (req, res) => {
  try {
    const userId = req.user._id;
    const settingsData = req.body;
    
    // Prepare update data
    const updateData = {};
    
    // Update language preference
    if (settingsData.language) {
      updateData.preferredLanguage = settingsData.language;
    }
    
    // Update notification preferences
    const notificationPreferences = {};
    if (settingsData.primaryChannel) {
      notificationPreferences.primaryChannel = settingsData.primaryChannel;
    }
    if (settingsData.bookingConfirmations !== undefined) {
      notificationPreferences.bookingConfirmations = settingsData.bookingConfirmations;
    }
    if (settingsData.bookingReminders !== undefined) {
      notificationPreferences.bookingReminders = settingsData.bookingReminders;
    }
    if (settingsData.bookingCancellations !== undefined) {
      notificationPreferences.bookingCancellations = settingsData.bookingCancellations;
    }
    if (settingsData.bookingChanges !== undefined) {
      notificationPreferences.bookingChanges = settingsData.bookingChanges;
    }
    if (settingsData.newBookingRequests !== undefined) {
      notificationPreferences.newBookingRequests = settingsData.newBookingRequests;
    }
    if (settingsData.dailySummary !== undefined) {
      notificationPreferences.dailySummary = settingsData.dailySummary;
    }
    if (settingsData.newReviews !== undefined) {
      notificationPreferences.newReviews = settingsData.newReviews;
    }
    if (settingsData.reminderTiming) {
      notificationPreferences.reminderTiming = settingsData.reminderTiming;
    }
    
    // Add notification preferences to update data
    if (Object.keys(notificationPreferences).length > 0) {
      updateData.notificationPreferences = {
        ...req.user.notificationPreferences,
        ...notificationPreferences
      };
    }
    
    // Update user if there's data to update
    if (Object.keys(updateData).length > 0) {
      await userService.update(userId, updateData);
    }
    
    logger.info(`Settings updated for user: ${req.user.email}`);
    
    return res.status(200).json({ 
      success: true,
      message: 'Settings updated successfully' 
    });
    
  } catch (error) {
    logger.error(`Error updating settings: ${error}`);
    return res.status(500).json({ 
      success: false,
      message: 'An error occurred while updating settings' 
    });
  }
});

module.exports = router;
