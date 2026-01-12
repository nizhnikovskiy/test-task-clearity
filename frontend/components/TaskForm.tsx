'use client';

import { useForm } from 'react-hook-form';
import { CreateTaskDto, TaskPriority } from '@/lib/api';
import { useCreateTaskMutation, useUpdateTaskMutation } from '@/lib/queries';
import { Task } from '@/lib/api';

interface TaskFormProps {
    task?: Task;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function TaskForm({ task, onSuccess, onCancel }: TaskFormProps) {
    const createMutation = useCreateTaskMutation();
    const updateMutation = useUpdateTaskMutation();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<CreateTaskDto>({
        defaultValues: task
            ? {
                title: task.title,
                description: task.description,
                priority: task.priority,
            }
            : {
                priority: TaskPriority.MEDIUM,
            },
    });

    const onSubmit = async (data: CreateTaskDto) => {
        try {
            if (task) {
                await updateMutation.mutateAsync({ id: task.id, data });
            } else {
                await createMutation.mutateAsync(data);
            }
            reset();
            onSuccess?.();
        } catch (error) {
            console.error('Failed to save task:', error);
        }
    };

    const isLoading = isSubmitting || createMutation.isPending || updateMutation.isPending;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
                <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                    Title <span className="text-red-500">*</span>
                </label>
                <input
                    id="title"
                    type="text"
                    placeholder="Enter task title..."
                    {...register('title', { required: 'Title is required' })}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                />
                {errors.title && (
                    <p className="text-red-600 text-sm mt-2 font-medium">{errors.title.message}</p>
                )}
            </div>

            <div>
                <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                </label>
                <textarea
                    id="description"
                    placeholder="Add a description (optional)..."
                    {...register('description')}
                    rows={4}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 resize-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                />
            </div>

            <div>
                <label htmlFor="priority" className="block text-sm font-semibold text-gray-700 mb-2">
                    Priority <span className="text-red-500">*</span>
                </label>
                <select
                    id="priority"
                    {...register('priority', { required: 'Priority is required' })}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                >
                    {Object.values(TaskPriority).map((priority) => (
                        <option key={priority} value={priority}>
                            {priority}
                        </option>
                    ))}
                </select>
                {errors.priority && (
                    <p className="text-red-600 text-sm mt-2 font-medium">{errors.priority.message}</p>
                )}
            </div>

            <div className="flex gap-3 pt-2">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                >
                    {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Saving...
                        </span>
                    ) : task ? 'Update Task' : 'Create Task'}
                </button>
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isLoading}
                        className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                        Cancel
                    </button>
                )}
            </div>
        </form>
    );
}
