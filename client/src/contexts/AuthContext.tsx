
import { createContext, useContext, useState, ReactNode } from "react";
import { login as apiLogin, register as apiRegister, logout as apiLogout } from "../api/auth";

type User = {
  id: string;
  email: string;
  name?: string;
  role: 'customer' | 'barber' | 'admin';
  phone?: string;
  bio?: string;
  specialties?: string;
  experience?: number;
};

type AuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role?: 'customer' | 'barber') => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem("accessToken");
  });
  const [user, setUser] = useState<User | null>(() => {
    const userData = localStorage.getItem("userData");
    return userData ? JSON.parse(userData) : null;
  });

  const login = async (email: string, password: string) => {
    try {
      const response = await apiLogin(email, password);
      if (response?.refreshToken || response?.accessToken) {
        localStorage.setItem("refreshToken", response.refreshToken);
        localStorage.setItem("accessToken", response.accessToken);
        localStorage.setItem("userEmail", email);
        
        // Create user object (for now with mock data, will be replaced with real API data)
        const userData: User = {
          id: response._id,
          email: response.email,
          name: response.name || email.split('@')[0], // temporary
          role: response.role || (email.includes('barber') ? 'barber' : 'customer') // use API role or fallback logic
        };
        
        localStorage.setItem("userData", JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        throw new Error('Login failed: No tokens received');
      }
    } catch (error) {
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userData");
      setUser(null);
      setIsAuthenticated(false);
      throw new Error(error?.message || 'Login failed');
    }
  };

  const register = async (email: string, password: string, role: 'customer' | 'barber' = 'customer') => {
    try {
      // Pass role to the API if it supports it, otherwise handle it during login
      const response = await apiRegister(email, password, role);
      // For now, registration doesn't automatically log in
      // The user will need to log in after registration
    } catch (error) {
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userData");
      setIsAuthenticated(false);
      throw new Error(error?.message || 'Registration failed');
    }
  };

  const logout = async () => {
    try {
      if (user?.email) {
        await apiLogout(user.email);
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userData");
      setUser(null);
      setIsAuthenticated(false);
      window.location.reload();
    }
  };
  
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem("userData", JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
