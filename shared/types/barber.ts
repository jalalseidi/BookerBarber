/**
 * Barber Types
 * 
 * This file contains TypeScript interfaces for barber-related data.
 */
import { ApiResponse } from './api';

/**
 * Barber interface
 */
export interface Barber {
  _id: string;
  name: string;
  email: string;
  specialties: string[];
  bio: string;
  bioEn: string;
  bioTr: string;
  profilePhoto: string;
  rating: number;
  reviewCount: number;
  isAvailable: boolean;
  workingHours: {
    start: string;
    end: string;
  };
}

/**
 * Barber Review interface
 */
export interface BarberReview {
  _id: string;
  barberId: string;
  customerId: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

/**
 * Barber API Response Types
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

export interface GetBarberReviewsResponseData {
  reviews: BarberReview[];
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
  review: BarberReview;
  message: string;
}