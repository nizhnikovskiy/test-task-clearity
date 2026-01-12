'use client';

import { useState } from 'react';
import { useTasksQuery } from '@/lib/queries';
import { TaskFilterParams, Task } from '@/lib/api';
import { TaskForm } from '@/components/TaskForm';
import { TaskList } from '@/components/TaskList';
import { Filters } from '@/components/Filters';
import { Pagination } from '@/components/Pagination';
import { ToastContainer } from '@/components/Toast';

export default function Home() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filters, setFilters] = useState<TaskFilterParams>({
    page: 1,
    limit: 10,
  });
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: 'success' | 'error' | 'info' }>>([]);

  const { data, isLoading, error } = useTasksQuery(filters);

  const handleTaskCompleted = (task: Task) => {
    const newToast = {
      id: `${task.id}-${Date.now()}`,
      message: `Task '${task.title}' completed!`,
      type: 'success' as const,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-3 tracking-tight">
            Task Management System
          </h1>
          <p className="text-lg text-gray-700 font-medium">
            Manage your tasks with background job processing
          </p>
        </header>

        <div className="mb-6">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all"
          >
            {showCreateForm ? 'Cancel' : '+ Create New Task'}
          </button>
        </div>

        {showCreateForm && (
          <div className="bg-white rounded-xl shadow-2xl p-8 mb-6 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Task</h2>
            <TaskForm onSuccess={() => setShowCreateForm(false)} />
          </div>
        )}

        <Filters filters={filters} onChange={setFilters} />

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <p className="font-medium">Error loading tasks</p>
            <p className="text-sm">
              {error instanceof Error ? error.message : 'An error occurred'}
            </p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6">
          {data && (
            <div className="mb-4 text-sm text-gray-600">
              Showing {data.data.length} of {data.meta.total} tasks
            </div>
          )}

          <TaskList
            tasks={data?.data || []}
            isLoading={isLoading}
            onTaskCompleted={handleTaskCompleted}
          />

          {data && (
            <Pagination
              currentPage={data.meta.page}
              totalPages={data.meta.totalPages}
              onPageChange={(page) => setFilters({ ...filters, page })}
            />
          )}
        </div>
      </div>
    </div>
  );
}
