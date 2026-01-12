import {
    useQuery,
    useMutation,
    useQueryClient,
    UseQueryOptions,
} from '@tanstack/react-query';
import {
    api,
    Task,
    TasksResponse,
    CreateTaskDto,
    UpdateTaskDto,
    TaskFilterParams,
} from './api';

// Query keys
export const taskKeys = {
    all: ['tasks'] as const,
    lists: () => [...taskKeys.all, 'list'] as const,
    list: (filters?: TaskFilterParams) => [...taskKeys.lists(), filters] as const,
    details: () => [...taskKeys.all, 'detail'] as const,
    detail: (id: string) => [...taskKeys.details(), id] as const,
};

// Get all tasks with filters
export function useTasksQuery(filters?: TaskFilterParams) {
    return useQuery({
        queryKey: taskKeys.list(filters),
        queryFn: () => api.getTasks(filters),
        refetchInterval: (query) => {
            // Check if there are any unprocessed tasks
            const data = query.state.data;
            if (!data?.data) return false;

            const hasUnprocessedTasks = data.data.some(
                (task) => !task.processedAt
            );

            // Poll every 2 seconds if there are unprocessed tasks
            return hasUnprocessedTasks ? 2000 : false;
        },
    });
}

// Get single task
export function useTaskQuery(
    id: string,
    options?: Omit<UseQueryOptions<Task, Error>, 'queryKey' | 'queryFn'>,
) {
    return useQuery({
        queryKey: taskKeys.detail(id),
        queryFn: () => api.getTask(id),
        ...options,
    });
}

// Create task mutation
export function useCreateTaskMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateTaskDto) => api.createTask(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
        },
    });
}

// Update task mutation
export function useUpdateTaskMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateTaskDto }) =>
            api.updateTask(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
            queryClient.invalidateQueries({ queryKey: taskKeys.detail(variables.id) });
        },
    });
}

// Delete task mutation
export function useDeleteTaskMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => api.deleteTask(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
        },
    });
}

// Cancel task mutation
export function useCancelTaskMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => api.cancelTask(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
            queryClient.invalidateQueries({ queryKey: taskKeys.detail(id) });
        },
    });
}
