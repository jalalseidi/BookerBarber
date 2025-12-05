/**
 * Booking Types
 * 
 * This file contains TypeScript interfaces for booking-related data.
 */
import { ApiResponse } from './api';

/**
 * Booking interface
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
 * Booking API Request Types
 */
export interface CreateBookingRequest {
  barberId: string;
  serviceId: string;
  date: string;
  time: string;
  specialRequests?: string;
}

export interface UpdateBookingRequest {
  barberId?: string;
  serviceId?: string;
  date?: string;
  time?: string;
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  specialRequests?: string;
}

/**
 * Booking API Response Types
 */
export interface GetBookingsResponseData {
  bookings: Booking[];
  total: number;
  page: number;
  limit: number;
}

export interface GetBookingByIdResponseData {
  booking: Booking;
}

export interface CreateBookingResponseData {
  booking: Booking;
  message: string;
}

export interface UpdateBookingResponseData {
  booking: Booking;
  message: string;
}

export interface CancelBookingResponseData {
  message: string;
  bookingId: string;
}