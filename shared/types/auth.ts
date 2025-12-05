/**
 * Authentication Types
 * 
 * This file contains TypeScript interfaces for authentication-related data.
 */
import { ApiResponse } from './api';

/**
 * Authentication API Request Types
 */
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * Authentication API Response Types
 */
export interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name?: string;
    role: 'customer' | 'barber' | 'admin';
  };
}

export interface RegisterResponseData {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
}

export interface LogoutResponseData {
  message: string;
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