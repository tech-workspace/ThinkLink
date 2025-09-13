import api from './api';

export interface Category {
    _id: string;
    name: string;
    color: string;
    icon: string;
    isActive: boolean;
    questionCount: number;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
}

export interface CategoriesResponse {
    success: boolean;
    message: string;
    data: {
        categories: Category[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalCategories: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    };
}

export interface CategorySearchParams {
    search?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

// Get categories with search and filters
export const getCategories = async (params: CategorySearchParams = {}): Promise<CategoriesResponse> => {
    const queryParams = new URLSearchParams();

    if (params.search) queryParams.append('search', params.search);
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const response = await api.get(`/v1/categories?${queryParams.toString()}`);
    return response.data;
};

// Get active categories (for dropdowns)
export const getActiveCategories = async (): Promise<Category[]> => {
    const response = await api.get('/v1/categories/active');
    return response.data.data;
};

// Get categories with question counts
export const getCategoriesWithCounts = async (): Promise<Category[]> => {
    const response = await api.get('/v1/categories/with-counts');
    return response.data.data;
};

// Create a new category
export const createCategory = async (categoryData: Omit<Category, '_id' | 'createdAt' | 'updatedAt' | 'questionCount' | 'sortOrder'>) => {
    const response = await api.post('/v1/categories', categoryData);
    return response.data;
};

// Update a category
export const updateCategory = async (id: string, categoryData: Partial<Category>) => {
    const response = await api.put(`/v1/categories/${id}`, categoryData);
    return response.data;
};

// Delete a category
export const deleteCategory = async (id: string) => {
    const response = await api.delete(`/v1/categories/${id}`);
    return response.data;
};

// Toggle category active status
export const toggleCategoryStatus = async (id: string) => {
    const response = await api.patch(`/v1/categories/${id}/toggle-status`);
    return response.data;
};
