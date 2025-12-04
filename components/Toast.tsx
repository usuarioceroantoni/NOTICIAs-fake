import React from 'react';
import { Toast as ToastType } from '../hooks/useToast';

interface ToastProps {
    toast: ToastType;
    onRemove: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onRemove }) => {
    const { id, message, type } = toast;

    const bgColor = {
        success: 'bg-emerald-900 border-emerald-600',
        error: 'bg-red-900 border-red-600',
        warning: 'bg-yellow-900 border-yellow-600',
        info: 'bg-blue-900 border-blue-600',
    }[type];

    const icon = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ',
    }[type];

    return (
        <div
            className={`${bgColor} border-2 px-6 py-4 rounded-sm shadow-2xl backdrop-blur-md animate-in slide-in-from-right-full duration-300 flex items-center gap-3 min-w-[320px]`}
        >
            <span className="text-2xl">{icon}</span>
            <p className="text-white text-sm font-mono flex-grow">{message}</p>
            <button
                onClick={() => onRemove(id)}
                className="text-gray-400 hover:text-white transition-colors text-lg"
            >
                ×
            </button>
        </div>
    );
};

interface ToastContainerProps {
    toasts: ToastType[];
    onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
    return (
        <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
            <div className="pointer-events-auto flex flex-col gap-3">
                {toasts.map(toast => (
                    <Toast key={toast.id} toast={toast} onRemove={onRemove} />
                ))}
            </div>
        </div>
    );
};
