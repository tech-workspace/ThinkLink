import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import authService, { User } from '../services/authService';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (mobile: string, password: string) => Promise<void>;
    signup: (fullName: string, mobile: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (profileData: Partial<Pick<User, 'fullName' | 'mobile'>>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const isAuthenticated = !!user;

    // Check if user is already logged in on app start
    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            setIsLoading(true);
            const isAuth = await authService.isAuthenticated();

            if (isAuth) {
                const userData = await authService.getStoredUser();
                if (userData) {
                    setUser(userData);
                }
            }
        } catch (error) {
            console.error('Auth check error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (mobile: string, password: string) => {
        try {
            const response = await authService.login({ mobile, password });
            if (response.success) {
                setUser(response.data.user);
            }
        } catch (error) {
            throw error;
        }
    };

    const signup = async (fullName: string, mobile: string, password: string) => {
        try {
            const response = await authService.signup({ fullName, mobile, password });
            if (response.success) {
                setUser(response.data.user);
            }
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
            setUser(null);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const updateProfile = async (profileData: Partial<Pick<User, 'fullName' | 'mobile'>>) => {
        try {
            const response = await authService.updateProfile(profileData);
            if (response.success) {
                setUser(response.data);
            }
        } catch (error) {
            throw error;
        }
    };

    const value: AuthContextType = {
        user,
        isLoading,
        isAuthenticated,
        login,
        signup,
        logout,
        updateProfile,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
