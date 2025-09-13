import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types based on API documentation
export interface User {
    _id: string;
    fullName: string;
    mobile: string;
    createdAt: string;
    updatedAt: string;
}

export interface LoginRequest {
    mobile: string;
    password: string;
}

export interface SignupRequest {
    fullName: string;
    mobile: string;
    password: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        user: User;
        token: string;
    };
}

export interface ApiError {
    success: false;
    message: string;
    error?: string;
}

// Token storage keys
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

class AuthService {
    // Login user
    async login(credentials: LoginRequest): Promise<AuthResponse> {
        try {
            const response = await api.post<AuthResponse>('/v1/auth/login', credentials);

            if (response.data.success) {
                // Store token and user data
                await this.storeAuthData(response.data.data.token, response.data.data.user);
            }

            return response.data;
        } catch (error: any) {
            console.error('Login error:', error.response?.data || error.message);
            throw this.handleError(error);
        }
    }

    // Signup user
    async signup(userData: SignupRequest): Promise<AuthResponse> {
        try {
            const response = await api.post<AuthResponse>('/v1/auth/signup', userData);

            if (response.data.success) {
                // Store token and user data
                await this.storeAuthData(response.data.data.token, response.data.data.user);
            }

            return response.data;
        } catch (error: any) {
            console.error('Signup error:', error.response?.data || error.message);
            throw this.handleError(error);
        }
    }

    // Get user profile
    async getProfile(): Promise<{ success: boolean; message: string; data: User }> {
        try {
            const token = await this.getStoredToken();
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await api.get('/v1/auth/profile', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return response.data;
        } catch (error: any) {
            console.error('Get profile error:', error.response?.data || error.message);
            throw this.handleError(error);
        }
    }

    // Update user profile
    async updateProfile(profileData: Partial<Pick<User, 'fullName' | 'mobile'>>): Promise<{ success: boolean; message: string; data: User }> {
        try {
            const token = await this.getStoredToken();
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await api.put('/v1/auth/profile', profileData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data.success) {
                // Update stored user data
                await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.data.data));
            }

            return response.data;
        } catch (error: any) {
            console.error('Update profile error:', error.response?.data || error.message);
            throw this.handleError(error);
        }
    }

    // Logout user
    async logout(): Promise<void> {
        try {
            await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    // Check if user is authenticated
    async isAuthenticated(): Promise<boolean> {
        try {
            const token = await this.getStoredToken();
            return !!token;
        } catch (error) {
            console.error('Check authentication error:', error);
            return false;
        }
    }

    // Get stored token
    async getStoredToken(): Promise<string | null> {
        try {
            return await AsyncStorage.getItem(TOKEN_KEY);
        } catch (error) {
            console.error('Get token error:', error);
            return null;
        }
    }

    // Get stored user data
    async getStoredUser(): Promise<User | null> {
        try {
            const userData = await AsyncStorage.getItem(USER_KEY);
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Get user data error:', error);
            return null;
        }
    }

    // Store authentication data
    private async storeAuthData(token: string, user: User): Promise<void> {
        try {
            await AsyncStorage.multiSet([
                [TOKEN_KEY, token],
                [USER_KEY, JSON.stringify(user)],
            ]);
        } catch (error) {
            console.error('Store auth data error:', error);
            throw error;
        }
    }

    // Handle API errors
    private handleError(error: any): Error {
        if (error.response?.data) {
            const apiError = error.response.data as ApiError;
            return new Error(apiError.message || 'An error occurred');
        }
        if (error.message) {
            return new Error(error.message);
        }
        return new Error('Network error. Please check your connection.');
    }
}

// Create and export singleton instance
export const authService = new AuthService();
export default authService;
