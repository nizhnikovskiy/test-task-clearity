'use client';

import { useEffect, useState } from 'react';

export interface ToastProps {
    message: string;
    type?: 'success' | 'error' | 'info';
    duration?: number;
    onClose?: () => void;
}

export function Toast({ message, type = 'success', duration = 4000, onClose }: ToastProps) {
    const [isVisible, setIsVisible] = useState(true);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsExiting(true);
            setTimeout(() => {
                setIsVisible(false);
                onClose?.();
            }, 300); // Match animation duration
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    if (!isVisible) return null;

    const bgColors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
    };

    const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️',
    };

    return (
        <div
            className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-2xl text-white ${bgColors[type]} transition-all duration-300 ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'
                }`}
            style={{
                minWidth: '300px',
                maxWidth: '500px',
            }}
        >
            <span className="text-xl">{icons[type]}</span>
            <span className="flex-1 font-medium">{message}</span>
            <button
                onClick={() => {
                    setIsExiting(true);
                    setTimeout(() => {
                        setIsVisible(false);
                        onClose?.();
                    }, 300);
                }}
                className="text-white hover:text-gray-200 transition-colors"
            >
                ✕
            </button>
        </div>
    );
}

interface ToastContainerProps {
    toasts: Array<{ id: string; message: string; type?: 'success' | 'error' | 'info' }>;
    onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
            {toasts.map((toast, index) => (
                <div
                    key={toast.id}
                    style={{
                        transform: `translateY(${index * 80}px)`,
                        transition: 'transform 0.3s ease-out',
                    }}
                >
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => onRemove(toast.id)}
                    />
                </div>
            ))}
        </div>
    );
}
