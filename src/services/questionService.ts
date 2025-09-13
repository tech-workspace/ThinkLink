import api from './api';

export interface Question {
    _id: string;
    title: string;
    answer: string;
    category: string;
    level: 'Easy' | 'Medium' | 'Hard';
    createdAt: string;
    updatedAt: string;
}

export interface QuestionStats {
    totalQuestions: number;
    categoryStats: Array<{ _id: string; count: number }>;
    levelStats: Array<{ _id: string; count: number }>;
}

export interface QuestionsResponse {
    success: boolean;
    message: string;
    data: {
        questions: Question[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalQuestions: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    };
}

export interface QuestionSearchParams {
    search?: string;
    category?: string;
    level?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

// Get questions with search and filters
export const getQuestions = async (params: QuestionSearchParams = {}): Promise<QuestionsResponse> => {
    const queryParams = new URLSearchParams();

    if (params.search) queryParams.append('search', params.search);
    if (params.category) queryParams.append('category', params.category);
    if (params.level) queryParams.append('level', params.level);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const url = `/v1/questions?${queryParams.toString()}`;

    const response = await api.get(url);
    return response.data;
};

// Get question statistics
export const getQuestionStats = async (): Promise<QuestionStats> => {
    const response = await api.get('/v1/questions/stats');
    return response.data.data;
};

// Get available categories
export const getQuestionCategories = async (): Promise<string[]> => {
    const response = await api.get('https://apigateway.up.railway.app/v1/categories');
    // Extract just the names from the category objects
    return response.data.data.categories.map((category: any) => category.name);
};

// Get available levels
export const getQuestionLevels = async (): Promise<string[]> => {
    const response = await api.get('/v1/questions/levels');
    return response.data.data;
};

// Create a new question
export const createQuestion = async (questionData: Omit<Question, '_id' | 'createdAt' | 'updatedAt'>) => {
    const response = await api.post('/v1/questions', questionData);
    return response.data;
};

// Update a question
export const updateQuestion = async (id: string, questionData: Partial<Question>) => {
    const response = await api.put(`/v1/questions/${id}`, questionData);
    return response.data;
};

// Delete a question
export const deleteQuestion = async (id: string) => {
    const response = await api.delete(`/v1/questions/${id}`);
    return response.data;
};
