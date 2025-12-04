import React from 'react';

interface ProgressBarProps {
    current: number;
    total: number;
    label?: string;
    isReal?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
    current,
    total,
    label = 'Progreso',
    isReal = false
}) => {
    const percentage = Math.round((current / total) * 100);
    const barColor = isReal ? 'bg-emerald-500' : 'bg-red-500';
    const glowColor = isReal
        ? 'shadow-[0_0_10px_rgba(16,185,129,0.6)]'
        : 'shadow-[0_0_10px_rgba(220,38,38,0.6)]';

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">
                    {label}
                </span>
                <span className="text-xs font-mono text-white">
                    {current} / {total} ({percentage}%)
                </span>
            </div>
            <div className="w-full h-2 bg-gray-900 border border-gray-800 rounded-sm overflow-hidden">
                <div
                    className={`h-full ${barColor} ${glowColor} transition-all duration-500 ease-out`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};
