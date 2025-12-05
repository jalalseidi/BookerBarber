/**
 * API Response Types
 * 
 * This file contains TypeScript interfaces for all API responses.
 * These interfaces ensure type safety when working with API data.
 */

/**
 * Generic API Success Response interface
 * All successful API responses should follow this structure for consistency
 */
export interface ApiSuccessResponse<T> {
  success: true;
  message?: string;
  data: T;
}

/**
 * Standard API Error Response interface
 * Matches the server-side error response format from errorHandler.js
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
 * Combined API Response type (success or error)
 */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Pagination and Filtering
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface DateRangeParams {
  startDate?: string;
  endDate?: string;
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams extends PaginationParams, DateRangeParams, SortParams {
  status?: string;
  search?: string;
  [key: string]: any;
}