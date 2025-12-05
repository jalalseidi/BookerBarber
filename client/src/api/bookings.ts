import api from './api';
import { handleApiError } from './errorHandler';

import { 
  ApiResponse, 
  GetBookingsResponseData, 
  CreateBookingRequest,
  CreateBookingResponseData, 
  CancelBookingResponseData,
  GetBookingByIdResponseData,
  FilterParams,
  Booking,
  UpdateBookingRequest,
  UpdateBookingResponseData
} from './types';

export const getBookings = (filters?: FilterParams): Promise<ApiResponse<GetBookingsResponseData>> => 
  api.get('/api/bookings', { params: filters }).then(r => r.data);

export const createBooking = (data: CreateBookingRequest): Promise<ApiResponse<CreateBookingResponseData>> => {
  return api.post('/api/bookings', data)
    .then(r => r.data)
    .catch(error => {
      console.error('Error creating booking:', error);
      // Re-throw the error after logging it
      throw handleApiError(error, {
        defaultMessage: 'Failed to create booking. Please check your connection and try again.',
        showToast: true
      });
    });
};

export const updateBooking = (id: string, data: UpdateBookingRequest): Promise<ApiResponse<UpdateBookingResponseData>> => 
  api.put(`/api/bookings/${id}`, data).then(r => r.data);

export const cancelBooking = (id: string): Promise<ApiResponse<CancelBookingResponseData>> => 
  api.delete(`/api/bookings/${id}`).then(r => r.data);

export const getBookingById = (id: string): Promise<ApiResponse<GetBookingByIdResponseData>> => 
  api.get(`/api/bookings/${id}`).then(r => r.data);

// Re-export types for convenience
export type { Booking, CreateBookingRequest, FilterParams } from './types';
