import api from './api';
import { handleApiError } from './errorHandler';
import {
  ApiResponse,
  GetBarbersResponseData,
  GetBarberByIdResponseData,
  GetBarberAvailabilityResponseData,
  FilterParams
} from './types';

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
 * Get all available barbers
 * @param filters Optional filters for pagination, sorting, and filtering
 * @returns List of barbers with pagination info
 */
export const getBarbers = async (filters?: FilterParams): Promise<ApiResponse<GetBarbersResponseData>> => {
  try {
    const response = await api.get('/api/barbers', { 
      params: filters 
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get barber availability for a specific date
 * @param barberId ID of the barber
 * @param date Date to check availability for
 * @param serviceId Optional service ID to check availability for specific service
 * @returns Available time slots for the barber on the specified date
 */
export const getBarberAvailability = async (
  barberId: string, 
  date: string,
  serviceId?: string
): Promise<ApiResponse<GetBarberAvailabilityResponseData>> => {
  try {
    const params: any = { date };
    if (serviceId) {
      params.serviceId = serviceId;
    }
    const response = await api.get(`/api/barbers/${barberId}/availability`, { 
      params 
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get a barber by ID
 * @param barberId ID of the barber to retrieve
 * @returns Barber details
 */
export const getBarberById = async (barberId: string): Promise<ApiResponse<GetBarberByIdResponseData>> => {
  try {
    const response = await api.get(`/api/barbers/${barberId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};
