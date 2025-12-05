const { randomUUID } = require('crypto');
const logger = require('../utils/logger');

/**
 * User Service
 * 
 * This service handles user-related operations.
 * It uses dependency injection to receive its dependencies.
 */
class UserService {
  /**
   * Create a new UserService instance
   * @param {Object} userModel - The User model
   * @param {Object} passwordUtils - Password utility functions
   */
  constructor(userModel, passwordUtils) {
    this.User = userModel;
    this.generatePasswordHash = passwordUtils.generatePasswordHash;
    this.validatePassword = passwordUtils.validatePassword;
  }

  /**
   * Get all users
   * @returns {Promise<Array>} List of users
   */
  async list() {
    try {
      return this.User.find();
    } catch (err) {
      throw new Error(`Database error while listing users: ${err}`);
    }
  }

  /**
   * Get a user by ID
   * @param {string} id - User ID
   * @returns {Promise<Object>} User object
   */
  async get(id) {
    try {
      return this.User.findOne({ _id: id }).exec();
    } catch (err) {
      throw new Error(`Database error while getting the user by their ID: ${err}`);
    }
  }

  /**
   * Get a user by email
   * @param {string} email - User email
   * @returns {Promise<Object>} User object
   */
  async getByEmail(email) {
    try {
      return this.User.findOne({ email }).exec();
    } catch (err) {
      throw new Error(`Database error while getting the user by their email: ${err}`);
    }
  }

  /**
   * Update a user
   * @param {string} id - User ID
   * @param {Object} data - User data to update
   * @returns {Promise<Object>} Updated user object
   */
  async update(id, data) {
    try {
      return this.User.findOneAndUpdate({ _id: id }, data, { new: true, upsert: false });
    } catch (err) {
      throw new Error(`Database error while updating user ${id}: ${err}`);
    }
  }

  /**
   * Delete a user
   * @param {string} id - User ID
   * @returns {Promise<boolean>} True if user was deleted
   */
  async delete(id) {
    try {
      const result = await this.User.deleteOne({ _id: id }).exec();
      return (result.deletedCount === 1);
    } catch (err) {
      throw new Error(`Database error while deleting user ${id}: ${err}`);
    }
  }

  /**
   * Authenticate a user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object|null>} User object if authentication successful, null otherwise
   */
  async authenticateWithPassword(email, password) {
    if (!email) throw new Error('Email is required');
    if (!password) throw new Error('Password is required');

    logger.info(`Attempting to authenticate user: ${email}`);
    try {
      // Add timeout handling for the database query
      logger.info(`Starting database query for user: ${email}`);
      const startTime = Date.now();

      const user = await Promise.race([
        this.User.findOne({email}).exec().then(result => {
          logger.info(`Database query completed in ${Date.now() - startTime}ms`);
          return result;
        }),
        new Promise((_, reject) => 
          setTimeout(() => {
            logger.info(`Database query timed out after ${Date.now() - startTime}ms`);
            reject(new Error('Database query timeout - please try again'));
          }, 30000)
        )
      ]);

      if (!user) return null;

      const passwordValid = await this.validatePassword(password, user.password);
      if (!passwordValid) return null;

      user.lastLoginAt = Date.now();
      const updatedUser = await user.save();
      return updatedUser;
    } catch (err) {
      // Log the error details for debugging
      logger.error(`Authentication error for user ${email}:`, {
        errorName: err.name,
        errorMessage: err.message,
        stack: err.stack
      });

      // Provide more specific error messages based on the error type
      if (err.name === 'MongooseError' && err.message.includes('buffering timed out')) {
        throw new Error(`Database connection timeout. Please ensure MongoDB is running and try again.`);
      } else if (err.name === 'MongoNetworkError') {
        throw new Error(`Database network error. Please check your connection and try again.`);
      } else {
        throw new Error(`Database error while authenticating user ${email}: ${err.message}`);
      }
    }
  }

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @param {string} userData.email - User email
   * @param {string} userData.password - User password
   * @param {string} [userData.name=''] - User name
   * @param {string} [userData.role='customer'] - User role
   * @param {string} [userData.phone=''] - User phone
   * @param {string} [userData.preferredLanguage='en'] - User preferred language
   * @returns {Promise<Object>} Created user object
   */
  async create(userData) {
    const { email, password, name = '', role = 'customer', phone = '', preferredLanguage = 'en' } = userData;
    
    if (!email) throw new Error('Email is required');
    if (!password) throw new Error('Password is required');

    const existingUser = await this.getByEmail(email);
    if (existingUser) throw new Error('User with this email already exists');

    const hash = await this.generatePasswordHash(password);

    try {
      // Create user without refreshToken field
      const user = new this.User({
        email,
        password: hash,
        name,
        role,
        phone,
        preferredLanguage,
      });

      // Save the user
      await user.save();

      // Ensure refreshToken field is removed to avoid conflicts with unique index
      await this.User.updateOne(
        { _id: user._id },
        { $unset: { refreshToken: "" } }
      );

      // Fetch the updated user
      return await this.get(user._id);
    } catch (err) {
      throw new Error(`Database error while creating new user: ${err}`);
    }
  }

  /**
   * Set a user's password
   * @param {Object} user - User object
   * @param {string} password - New password
   * @returns {Promise<Object>} Updated user object
   */
  async setPassword(user, password) {
    if (!password) throw new Error('Password is required');
    user.password = await this.generatePasswordHash(password); // eslint-disable-line

    try {
      if (!user.isNew) {
        await user.save();
      }

      return user;
    } catch (err) {
      throw new Error(`Database error while setting user password: ${err}`);
    }
  }
}

module.exports = UserService;
