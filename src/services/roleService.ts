import api from './api';

export interface Role {
    _id: string;
    roleConst: string;
    createdAt: string;
    updatedAt: string;
}

export interface RoleWithCount extends Role {
    userCount: number;
}

export interface RoleForm {
    roleConst: string;
}

export interface RolesResponse {
    roles: Role[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalRoles: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
        limit: number;
    };
}

export interface GetRolesParams {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: 'roleConst' | 'createdAt' | 'updatedAt';
    sortOrder?: 'asc' | 'desc';
}

export const getRoles = async (params: GetRolesParams = {}): Promise<RolesResponse> => {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.search) searchParams.append('search', params.search);
    if (params.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);

    const response = await api.get(`/v1/roles?${searchParams.toString()}`);
    return response.data.data;
};

export const getRoleById = async (id: string): Promise<Role> => {

    try {
        const response = await api.get(`/v1/roles/${id}`);


        if (response.data.success && response.data.data) {
            return response.data.data;
        } else {
            throw new Error('Invalid role response structure');
        }
    } catch (error) {
        throw error;
    }
};

export const getRoleByConst = async (roleConst: string): Promise<Role> => {
    const response = await api.get(`/v1/roles/const/${roleConst}`);
    return response.data.data;
};

export const createRole = async (roleData: RoleForm): Promise<Role> => {
    const response = await api.post('/v1/roles', roleData);
    return response.data.data;
};

export const updateRole = async (id: string, roleData: Partial<RoleForm>): Promise<Role> => {
    const response = await api.put(`/v1/roles/${id}`, roleData);
    return response.data.data;
};

export const deleteRole = async (id: string): Promise<void> => {
    await api.delete(`/v1/roles/${id}`);
};

export const getRolesWithCounts = async (): Promise<RoleWithCount[]> => {
    const response = await api.get('/v1/roles/with-counts');
    return response.data.data;
};

export const bulkUpdateRoles = async (roles: Array<{ id: string; roleConst: string }>): Promise<void> => {
    await api.put('/v1/roles/bulk-update', { roles });
};
