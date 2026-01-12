'use client';

import { useState, useEffect } from 'react';
import { TaskStatus, TaskPriority } from '@/lib/api';

interface TaskFilterParams {
    status?: TaskStatus;
    priority?: TaskPriority;
    search?: string;
    page?: number;
    limit?: number;
    includeDeleted?: boolean;
}

interface FiltersProps {
    filters: TaskFilterParams;
    onChange: (filters: TaskFilterParams) => void;
}

export function Filters({ filters, onChange }: FiltersProps) {
    const [search, setSearch] = useState(filters.search || '');

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            onChange({ ...filters, search: search || undefined, page: 1 });
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    const handleStatusChange = (status: string) => {
        onChange({
            ...filters,
            status: status ? (status as TaskStatus) : undefined,
            page: 1,
        });
    };

    const handlePriorityChange = (priority: string) => {
        onChange({
            ...filters,
            priority: priority ? (priority as TaskPriority) : undefined,
            page: 1,
        });
    };

    const handleIncludeDeletedChange = (checked: boolean) => {
        onChange({
            ...filters,
            includeDeleted: checked,
            page: 1,
        });
    };

    const handleClearFilters = () => {
        setSearch('');
        onChange({ page: 1, limit: filters.limit || 10 });
    };

    const hasActiveFilters = filters.status || filters.priority || filters.search || filters.includeDeleted;

    return (
        <div className="bg-white border-2 border-gray-200 rounded-xl shadow-md p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label htmlFor="search" className="block text-sm font-bold text-gray-800 mb-2">
                        Search
                    </label>
                    <input
                        id="search"
                        type="text"
                        placeholder="Search title or description..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 font-medium focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                    />
                </div>

                <div>
                    <label htmlFor="status" className="block text-sm font-bold text-gray-800 mb-2">
                        Status
                    </label>
                    <select
                        id="status"
                        value={filters.status || ''}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-gray-900 font-medium focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 cursor-pointer"
                    >
                        <option value="">All Statuses</option>
                        {Object.values(TaskStatus).map((status) => (
                            <option key={status} value={status}>
                                {status.replace('_', ' ')}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="priority" className="block text-sm font-bold text-gray-800 mb-2">
                        Priority
                    </label>
                    <select
                        id="priority"
                        value={filters.priority || ''}
                        onChange={(e) => handlePriorityChange(e.target.value)}
                        className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-gray-900 font-medium focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 cursor-pointer"
                    >
                        <option value="">All Priorities</option>
                        {Object.values(TaskPriority).map((priority) => (
                            <option key={priority} value={priority}>
                                {priority}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="mt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={filters.includeDeleted || false}
                        onChange={(e) => handleIncludeDeletedChange(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Include Deleted Tasks</span>
                </label>
            </div>

            {hasActiveFilters && (
                <div className="mt-5">
                    <button
                        onClick={handleClearFilters}
                        className="text-sm text-blue-600 hover:text-blue-800 font-bold hover:underline transition-all"
                    >
                        ✕ Clear all filters
                    </button>
                </div>
            )}
        </div>
    );
}
