'use client';

import { useState, useRef, useEffect } from 'react';
import { Task, TaskPriority, TaskStatus } from '@/lib/api';
import { useDeleteTaskMutation, useCancelTaskMutation } from '@/lib/queries';
import { TaskForm } from './TaskForm';

interface TaskListProps {
    tasks: Task[];
    isLoading: boolean;
    onTaskCompleted?: (task: Task) => void;
}

const statusColors: Record<TaskStatus, string> = {
    [TaskStatus.PENDING]: 'bg-gray-200 text-gray-800',
    [TaskStatus.IN_PROGRESS]: 'bg-blue-200 text-blue-800',
    [TaskStatus.COMPLETED]: 'bg-green-200 text-green-800',
    [TaskStatus.CANCELLED]: 'bg-red-200 text-red-800',
};

const priorityColors: Record<TaskPriority, string> = {
    [TaskPriority.LOW]: 'bg-gray-100 text-gray-700',
    [TaskPriority.MEDIUM]: 'bg-yellow-100 text-yellow-700',
    [TaskPriority.HIGH]: 'bg-orange-100 text-orange-700',
    [TaskPriority.URGENT]: 'bg-red-100 text-red-700',
};

export function TaskList({ tasks, isLoading, onTaskCompleted }: TaskListProps) {
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const deleteMutation = useDeleteTaskMutation();
    const cancelMutation = useCancelTaskMutation();
    const previousTasksRef = useRef<Map<string, boolean>>(new Map());

    // Track task completion and trigger notifications
    useEffect(() => {
        if (!tasks || tasks.length === 0) return;

        tasks.forEach((task) => {
            const wasUnprocessed = previousTasksRef.current.get(task.id);
            const isNowProcessed = !!task.processedAt;

            // Detect transition from unprocessed to processed
            if (wasUnprocessed === false && isNowProcessed) {
                onTaskCompleted?.(task);
            }

            // Update tracking
            previousTasksRef.current.set(task.id, isNowProcessed);
        });
    }, [tasks, onTaskCompleted]);

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this task?')) {
            try {
                await deleteMutation.mutateAsync(id);
            } catch (error) {
                console.error('Failed to delete task:', error);
            }
        }
    };

    const handleCancel = async (id: string) => {
        if (confirm('Are you sure you want to cancel this task?')) {
            try {
                await cancelMutation.mutateAsync(id);
            } catch (error) {
                console.error('Failed to cancel task:', error);
            }
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div
                        key={i}
                        className="border border-gray-200 rounded-lg p-4 animate-pulse"
                    >
                        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (tasks.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                No tasks found. Create your first task to get started!
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {tasks.map((task) => (
                <div key={task.id}>
                    {editingTask?.id === task.id ? (
                        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <h3 className="text-lg font-semibold mb-4">Edit Task</h3>
                            <TaskForm
                                task={task}
                                onSuccess={() => setEditingTask(null)}
                                onCancel={() => setEditingTask(null)}
                            />
                        </div>
                    ) : (
                        <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-lg font-semibold text-black">{task.title}</h3>
                                <div className="flex gap-2">
                                    <span
                                        className={`px-2 py-1 rounded text-xs font-medium ${statusColors[task.status]}`}
                                    >
                                        {task.status.replace('_', ' ')}
                                    </span>
                                    <span
                                        className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[task.priority]}`}
                                    >
                                        {task.priority}
                                    </span>
                                    {task.deletedAt && (
                                        <span className="px-2 py-1 rounded text-xs font-medium bg-gray-300 text-gray-700">
                                            DELETED
                                        </span>
                                    )}
                                    {!task.processedAt && task.status !== TaskStatus.CANCELLED && (
                                        <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-200 text-yellow-800 animate-pulse">
                                            Processing...
                                        </span>
                                    )}
                                </div>
                            </div>

                            {task.description && (
                                <p className="text-gray-600 mb-3">{task.description}</p>
                            )}

                            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                                {task.dueDate && (
                                    <div>
                                        <span className="font-medium">Due:</span>{' '}
                                        {new Date(task.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </div>
                                )}
                                {task.processedAt && (
                                    <div>
                                        <span className="font-medium">Processed:</span>{' '}
                                        {new Date(task.processedAt).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                )}
                                <div>
                                    <span className="font-medium">Created:</span>{' '}
                                    {new Date(task.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setEditingTask(task)}
                                    disabled={!task.processedAt || !!task.deletedAt}
                                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Edit
                                </button>
                                {(task.status === TaskStatus.PENDING || task.status === TaskStatus.IN_PROGRESS) && !task.deletedAt && !task.processedAt && (
                                    <button
                                        onClick={() => handleCancel(task.id)}
                                        disabled={cancelMutation.isPending}
                                        className="px-3 py-1 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
                                    >
                                        {cancelMutation.isPending ? 'Cancelling...' : 'Cancel'}
                                    </button>
                                )}
                                <button
                                    onClick={() => handleDelete(task.id)}
                                    disabled={deleteMutation.isPending || !task.processedAt || !!task.deletedAt}
                                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
