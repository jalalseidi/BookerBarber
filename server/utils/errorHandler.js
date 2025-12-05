/**
 * Error handling utilities for the BarberBooker server
 * 
 * This module provides a consistent approach to error handling across the application,
 * including custom error classes, error middleware, and helper functions.
 */
const logger = require('./logger');

/**
 * Custom API Error class that extends Error
 * Used to create standardized error objects with status codes and additional metadata
 */
class ApiError extends Error {
  constructor(statusCode, message, errorCode = 'UNKNOWN_ERROR', details = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Common error types with predefined status codes and error codes
 */
const ErrorTypes = {
  BAD_REQUEST: (message, details) => new ApiError(400, message || 'Bad Request', 'BAD_REQUEST', details),
  UNAUTHORIZED: (message, details) => new ApiError(401, message || 'Unauthorized', 'UNAUTHORIZED', details),
  FORBIDDEN: (message, details) => new ApiError(403, message || 'Forbidden', 'FORBIDDEN', details),
  NOT_FOUND: (message, details) => new ApiError(404, message || 'Resource Not Found', 'NOT_FOUND', details),
  CONFLICT: (message, details) => new ApiError(409, message || 'Resource Conflict', 'CONFLICT', details),
  VALIDATION_ERROR: (message, details) => new ApiError(422, message || 'Validation Error', 'VALIDATION_ERROR', details),
  INTERNAL_ERROR: (message, details) => new ApiError(500, message || 'Internal Server Error', 'INTERNAL_ERROR', details),
  SERVICE_UNAVAILABLE: (message, details) => new ApiError(503, message || 'Service Unavailable', 'SERVICE_UNAVAILABLE', details),
};

/**
 * Error handling middleware for Express
 * Catches errors, logs them, and sends standardized responses to clients
 */
const errorMiddleware = (err, req, res, next) => {
  // Default to internal server error if not an ApiError
  const error = err instanceof ApiError 
    ? err 
    : ErrorTypes.INTERNAL_ERROR(err.message);
  
  // Log the error with appropriate level based on status code
  if (error.statusCode >= 500) {
    logger.error({
      err: {
        message: error.message,
        stack: error.stack,
        code: error.errorCode,
        details: error.details
      },
      req: {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userId: req.user?.id
      }
    }, `Server error: ${error.message}`);
  } else {
    logger.warn({
      err: {
        message: error.message,
        code: error.errorCode,
        details: error.details
      },
      req: {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userId: req.user?.id
      }
    }, `Client error: ${error.message}`);
  }

  // Send standardized error response
  res.status(error.statusCode).json({
    success: false,
    error: {
      message: error.message,
      code: error.errorCode,
      timestamp: error.timestamp,
      details: error.details
    }
  });
};

/**
 * Async handler to wrap route handlers and automatically catch errors
 * This eliminates the need for try/catch blocks in every route
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  ApiError,
  ErrorTypes,
  errorMiddleware,
  asyncHandler
};