/**
 * Service Types
 * 
 * This file contains TypeScript interfaces for service-related data.
 */
import { ApiResponse } from './api';

/**
 * Service interface
 */
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
 * Service API Response Types
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
 * Service API Request Types
 */
export interface CreateServiceRequest {
  name: string;
  nameEn?: string;
  nameTr?: string;
  description?: string;
  descriptionEn?: string;
  descriptionTr?: string;
  duration: number;
  price: number;
  category: string;
}

export interface UpdateServiceRequest {
  name?: string;
  nameEn?: string;
  nameTr?: string;
  description?: string;
  descriptionEn?: string;
  descriptionTr?: string;
  duration?: number;
  price?: number;
  category?: string;
  isActive?: boolean;
}