import api from './api';
import { handleApiError } from './errorHandler';
import {
  ApiResponse,
  GetServicesResponseData,
  GetServiceByIdResponseData,
  GetServicesByCategoryResponseData,
  FilterParams
} from './types';

export interface Service {
  _id: string;
  name: string;
  nameEn: string;
  nameTr: string;
  description: string;
  descriptionEn: string;
  descriptionTr: string;
  duration: number;
  price: number;
  category: string;
  isActive: boolean;
}

/**
 * Get all available services
 * @param filters Optional filters for pagination, sorting, and filtering
 * @returns List of services with pagination info
 */
export const getServices = async (filters?: FilterParams): Promise<ApiResponse<GetServicesResponseData>> => {
  try {
    const response = await api.get('/api/services', { 
      params: filters 
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get a service by ID
 * @param serviceId ID of the service to retrieve
 * @returns Service details
 */
export const getServiceById = async (serviceId: string): Promise<ApiResponse<GetServiceByIdResponseData>> => {
  try {
    const response = await api.get(`/api/services/${serviceId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get services by category
 * @param category Category to filter services by
 * @param filters Optional filters for pagination, sorting, and filtering
 * @returns List of services in the specified category
 */
export const getServicesByCategory = async (
  category: string,
  filters?: FilterParams
): Promise<ApiResponse<GetServicesByCategoryResponseData>> => {
  try {
    const response = await api.get(`/api/services/category/${category}`, { 
      params: filters 
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};
