import api from './api';
import { parseApiError } from './errorHandler';
import { 
  ApiResponse, 
  LoginRequest, 
  LoginResponseData as LoginResponse, 
  RegisterRequest, 
  RegisterResponseData as RegisterResponse,
  LogoutResponseData as LogoutResponse
} from './types';

/**
 * Login user functionality
 * @param email User email
 * @param password User password
 * @returns Login response with tokens and user info
 */
export const login = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    // return { accessToken: '123', refreshToken: '123' }; // pythagora_mocked_data - remove when the backend is being implemented
    const response = await api.post<LoginResponse>('/api/auth/login', { email, password } as LoginRequest);
    return response.data as LoginResponse;
  } catch (error) {
    const parsedError = parseApiError(error);
    throw parsedError;
  }
};

/**
 * Register user functionality
 * @param email User email
 * @param password User password
 * @param role User role (customer or barber)
 * @param name Optional user name
 * @returns Register response with user info
 */
export const register = async (email: string, password: string, role: 'customer' | 'barber' = 'customer', name?: string): Promise<RegisterResponse> => {
  try {
    // return { email: 'jake@example.com', id: '123' }; // pythagora_mocked_data - remove when the backend is being implemented
    const response = await api.post<RegisterResponse>(
      '/api/auth/register', 
      { email, password, role, name } as RegisterRequest
    );
    return response.data as RegisterResponse;
  } catch (error) {
    const parsedError = parseApiError(error);
    throw parsedError;
  }
};

/**
 * Logout user functionality
 * @param email User email
 * @returns Logout response with success status and message
 */
export const logout = async (email: string): Promise<LogoutResponse> => {
  try {
    const response = await api.post<LogoutResponse>('/api/auth/logout', { email });
    return response.data as LogoutResponse;
  } catch (error) {
    const parsedError = parseApiError(error);
    throw parsedError;
  }
};
