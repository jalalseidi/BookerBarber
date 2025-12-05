/**
 * Error handling utilities for the BarberBooker client
 * 
 * This module provides a consistent approach to error handling for API requests,
 * including error parsing, display, and recovery strategies.
 */
import { AxiosError } from 'axios';

/**
 * Standard error response structure from the API
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    timestamp: string;
    details: any | null;
  };
}

/**
 * Client-side error class that mirrors the server's ApiError
 */
export class ClientApiError extends Error {
  statusCode: number;
  errorCode: string;
  details: any | null;
  timestamp: string;

  constructor(
    statusCode: number,
    message: string,
    errorCode: string = 'UNKNOWN_ERROR',
    details: any = null,
    timestamp: string = new Date().toISOString()
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.timestamp = timestamp;
    this.name = this.constructor.name;
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ClientApiError.prototype);
  }

  /**
   * Get a user-friendly message for display in the UI
   */
  getUserMessage(): string {
    // For some error types, we might want to provide more user-friendly messages
    switch (this.errorCode) {
      case 'UNAUTHORIZED':
        return 'Your session has expired. Please log in again.';
      case 'FORBIDDEN':
        return 'You don\'t have permission to perform this action.';
      case 'VALIDATION_ERROR':
        return this.message || 'Please check your input and try again.';
      case 'NOT_FOUND':
        return 'The requested resource was not found.';
      case 'INTERNAL_ERROR':
        return 'An unexpected error occurred. Please try again later.';
      case 'SERVICE_UNAVAILABLE':
        return 'The service is currently unavailable. Please try again later.';
      default:
        return this.message || 'An error occurred. Please try again.';
    }
  }

  /**
   * Check if the error is a network error
   */
  isNetworkError(): boolean {
    return this.errorCode === 'NETWORK_ERROR';
  }

  /**
   * Check if the error is an authentication error
   */
  isAuthError(): boolean {
    return this.statusCode === 401 || this.statusCode === 403;
  }
}

/**
 * Parse an Axios error into a ClientApiError
 */
export function parseApiError(error: AxiosError): ClientApiError {
  // Network error (no response from server)
  if (error.response === undefined) {
    return new ClientApiError(
      0,
      'Network error. Please check your connection and try again.',
      'NETWORK_ERROR'
    );
  }

  const { status, data } = error.response;

  // If the response follows our API error format
  if (data && typeof data === 'object' && 'error' in data) {
    const apiError = data as ApiErrorResponse;
    return new ClientApiError(
      status,
      apiError.error.message,
      apiError.error.code,
      apiError.error.details,
      apiError.error.timestamp
    );
  }

  // If the response doesn't follow our format, create a generic error
  return new ClientApiError(
    status,
    error.message || 'An unexpected error occurred',
    'UNKNOWN_ERROR'
  );
}

/**
 * Handle API errors consistently across the application
 * 
 * @param error The error to handle
 * @param options Additional options for error handling
 * @returns A ClientApiError instance
 */
export function handleApiError(
  error: unknown,
  options: {
    logError?: boolean;
    showToast?: boolean;
    defaultMessage?: string;
  } = {}
): ClientApiError {
  const { logError = true, showToast = false, defaultMessage } = options;
  
  // Parse the error into a ClientApiError
  let clientError: ClientApiError;
  
  if (error instanceof ClientApiError) {
    clientError = error;
  } else if (error instanceof AxiosError) {
    clientError = parseApiError(error);
  } else if (error instanceof Error) {
    clientError = new ClientApiError(500, error.message);
  } else {
    clientError = new ClientApiError(
      500,
      defaultMessage || 'An unexpected error occurred',
      'UNKNOWN_ERROR'
    );
  }
  
  // Log the error to console in development
  if (logError && process.env.NODE_ENV !== 'production') {
    console.error('API Error:', {
      message: clientError.message,
      code: clientError.errorCode,
      status: clientError.statusCode,
      details: clientError.details,
    });
  }
  
  // Show toast notification if requested
  // This would integrate with your toast notification system
  if (showToast) {
    // Example integration with a toast library
    // toast.error(clientError.getUserMessage());
    console.error('Toast:', clientError.getUserMessage());
  }
  
  return clientError;
}

/**
 * Common error types with predefined status codes and error codes
 * Mirrors the server-side ErrorTypes
 */
export const ErrorTypes = {
  BAD_REQUEST: (message?: string, details?: any) => 
    new ClientApiError(400, message || 'Bad Request', 'BAD_REQUEST', details),
  UNAUTHORIZED: (message?: string, details?: any) => 
    new ClientApiError(401, message || 'Unauthorized', 'UNAUTHORIZED', details),
  FORBIDDEN: (message?: string, details?: any) => 
    new ClientApiError(403, message || 'Forbidden', 'FORBIDDEN', details),
  NOT_FOUND: (message?: string, details?: any) => 
    new ClientApiError(404, message || 'Resource Not Found', 'NOT_FOUND', details),
  CONFLICT: (message?: string, details?: any) => 
    new ClientApiError(409, message || 'Resource Conflict', 'CONFLICT', details),
  VALIDATION_ERROR: (message?: string, details?: any) => 
    new ClientApiError(422, message || 'Validation Error', 'VALIDATION_ERROR', details),
  INTERNAL_ERROR: (message?: string, details?: any) => 
    new ClientApiError(500, message || 'Internal Server Error', 'INTERNAL_ERROR', details),
  SERVICE_UNAVAILABLE: (message?: string, details?: any) => 
    new ClientApiError(503, message || 'Service Unavailable', 'SERVICE_UNAVAILABLE', details),
  NETWORK_ERROR: (message?: string, details?: any) => 
    new ClientApiError(0, message || 'Network Error', 'NETWORK_ERROR', details),
};