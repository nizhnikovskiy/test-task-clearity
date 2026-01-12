import axios from 'axios';

export enum TaskStatus {
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

export enum TaskPriority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    URGENT = 'URGENT',
}

export interface Task {
    id: string;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate?: string;
    processedAt?: string;
    deletedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTaskDto {
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    dueDate?: string;
}

export interface UpdateTaskDto {
    title?: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    dueDate?: string;
}

export interface TasksResponse {
    data: Task[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface TaskFilterParams {
    status?: TaskStatus;
    priority?: TaskPriority;
    search?: string;
    page?: number;
    limit?: number;
    includeDeleted?: boolean;
}

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const api = {
    // Get all tasks with filters
    getTasks: async (params?: TaskFilterParams): Promise<TasksResponse> => {
        const response = await apiClient.get<TasksResponse>('/tasks', { params });
        return response.data;
    },

    // Get single task
    getTask: async (id: string): Promise<Task> => {
        const response = await apiClient.get<Task>(`/tasks/${id}`);
        return response.data;
    },

    // Create task
    createTask: async (data: CreateTaskDto): Promise<Task> => {
        const response = await apiClient.post<Task>('/tasks', data);
        return response.data;
    },

    // Update task
    updateTask: async (id: string, data: UpdateTaskDto): Promise<Task> => {
        const response = await apiClient.patch<Task>(`/tasks/${id}`, data);
        return response.data;
    },

    // Delete task
    deleteTask: async (id: string): Promise<void> => {
        await apiClient.delete(`/tasks/${id}`);
    },

    // Cancel task
    cancelTask: async (id: string): Promise<Task> => {
        const response = await apiClient.patch<Task>(`/tasks/${id}/cancel`);
        return response.data;
    },
};
