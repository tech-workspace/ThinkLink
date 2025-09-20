import api from './api';

export interface User {
    _id: string;
    fullName: string;
    mobile: string;
    roleId?: {
        _id: string;
        roleConst: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface UserForm {
    fullName: string;
    mobile: string;
    password: string;
    roleId?: string;
}

export interface UsersResponse {
    users: User[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalUsers: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
        limit: number;
    };
}

export interface GetUsersParams {
    page?: number;
    limit?: number;
    search?: string;
    roleId?: string;
    sortBy?: 'fullName' | 'mobile' | 'createdAt' | 'updatedAt';
    sortOrder?: 'asc' | 'desc';
}

export const getUsers = async (params: GetUsersParams = {}): Promise<UsersResponse> => {

    const searchParams = new URLSearchParams();

    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.search) searchParams.append('search', params.search);
    if (params.roleId) searchParams.append('roleId', params.roleId);
    if (params.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);

    const url = `/v1/auth/users?${searchParams.toString()}`;

    try {
        const response = await api.get(url);

        if (response.data.success && response.data.data) {
            return response.data.data;
        } else {
            throw new Error('Invalid users response structure');
        }
    } catch (error: any) {
        throw error;
    }
};

export const getUserById = async (id: string): Promise<User> => {
    const response = await api.get(`/v1/auth/users/${id}`);
    return response.data.data.user;
};

export const createUser = async (userData: UserForm): Promise<User> => {
    const response = await api.post('/v1/auth/users', userData);
    return response.data.data.user;
};

export const updateUser = async (id: string, userData: Partial<UserForm>): Promise<User> => {
    const response = await api.put(`/v1/auth/users/${id}`, userData);
    return response.data.data.user;
};

export const deleteUser = async (id: string): Promise<void> => {
    await api.delete(`/v1/auth/users/${id}`);
};

export const getUsersByRole = async (roleId: string, params: GetUsersParams = {}): Promise<UsersResponse> => {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.search) searchParams.append('search', params.search);
    if (params.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);

    const response = await api.get(`/v1/auth/users/role/${roleId}?${searchParams.toString()}`);
    return response.data.data;
};
