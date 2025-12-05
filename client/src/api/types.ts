/**
 * API Response Types
 * 
 * This file contains TypeScript interfaces for all API responses.
 * These interfaces ensure type safety when working with API data.
 */
import { Barber } from './barbers';
import { Service } from './services';

/**
 * Booking interface - represents a booking entity
 */
export interface Booking {
  _id: string;
  customerId: string;
  barberId: string;
  serviceId: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  specialRequests?: string;
  totalPrice: number;
  createdAt: string;
  barber: {
    name: string;
    profilePhoto: string;
  };
  service: {
    name: string;
    nameEn: string;
    nameTr: string;
    duration: number;
    price: number;
  };
}

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
    details: unknown | null;
  };
}

/**
 * Combined API Response type (success or error)
 */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Authentication API Types
 */
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
  _id: string;
  email: string;
  password?: string;
  role?: 'customer' | 'barber' | 'admin';
  name?: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role?: 'customer' | 'barber';
  name?: string;
}

export interface RegisterResponseData {
  _id: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string;
}

export interface LogoutResponseData {
  message: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponseData {
  accessToken: string;
  refreshToken: string;
}

export interface UserProfileResponseData {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  role: 'customer' | 'barber' | 'admin';
  createdAt: string;
  updatedAt: string;
}

/**
 * Booking API Types
 */
export interface GetBookingsResponseData {
  bookings: Booking[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateBookingRequest {
  barberId: string;
  serviceId: string;
  date: string;
  time: string;
  specialRequests?: string;
}

export interface CreateBookingResponseData {
  booking: Booking;
  message: string;
}

export interface UpdateBookingRequest {
  barberId?: string;
  serviceId?: string;
  date?: string;
  time?: string;
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  specialRequests?: string;
}

export interface UpdateBookingResponseData {
  booking: Booking;
  message: string;
}

export interface CancelBookingResponseData {
  message: string;
  bookingId: string;
}

export interface GetBookingByIdResponseData {
  booking: Booking;
}

/**
 * Barber API Types
 */
export interface GetBarbersResponseData {
  barbers: Barber[];
  total: number;
  page: number;
  limit: number;
}

export interface GetBarberByIdResponseData {
  barber: Barber;
}

export interface GetBarberAvailabilityRequest {
  date: string;
  serviceId?: string;
}

export interface GetBarberAvailabilityResponseData {
  availableSlots: string[];
  date: string;
  barberId: string;
}

export interface BarberReviewResponseData {
  _id: string;
  barberId: string;
  customerId: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface GetBarberReviewsResponseData {
  reviews: BarberReviewResponseData[];
  total: number;
  page: number;
  limit: number;
  averageRating: number;
}

export interface CreateBarberReviewRequest {
  rating: number;
  comment: string;
}

export interface CreateBarberReviewResponseData {
  review: BarberReviewResponseData;
  message: string;
}

/**
 * Service API Types
 */
export interface GetServicesResponseData {
  services: Service[];
  total: number;
  page: number;
  limit: number;
}

export interface GetServiceByIdResponseData {
  service: Service;
}

export interface GetServicesByCategoryResponseData {
  services: Service[];
  category: string;
  total: number;
}

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
  [key: string]: unknown;
}
