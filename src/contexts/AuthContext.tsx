import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import authService, { User } from '../services/authService';
import { getUserRole, getUserPermissions, Permissions, Role } from '../utils/permissions';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    userRole: Role;
    permissions: Permissions;
    login: (mobile: string, password: string) => Promise<void>;
    signup: (fullName: string, mobile: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (profileData: Partial<Pick<User, 'fullName' | 'mobile'>>) => Promise<void>;
    refreshUserProfile: () => Promise<void>;
    refreshUserRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const isAuthenticated = !!user;
    const userRole = getUserRole(user);
    const permissions = getUserPermissions(user);

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
            // Silent error handling for auth check
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
            // Silent error handling for logout
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

    const refreshUserProfile = async () => {
        try {
            const response = await authService.getProfile();
            if (response.success) {
                setUser(response.data);
            }
        } catch (error) {
            // If profile fetch fails, try to get stored user data
            try {
                const userData = await authService.getStoredUser();
                if (userData) {
                    setUser(userData);
                }
            } catch (storedUserError) {
                // Silent error handling for stored user data
            }
        }
    };

    const refreshUserRole = async () => {
        try {
            const userWithRole = await authService.refreshUserRole();
            if (userWithRole) {
                setUser(userWithRole);
            }
        } catch (error) {
            // Silent error handling for role refresh
        }
    };


    const value: AuthContextType = {
        user,
        isLoading,
        isAuthenticated,
        userRole,
        permissions,
        login,
        signup,
        logout,
        updateProfile,
        refreshUserProfile,
        refreshUserRole,
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
