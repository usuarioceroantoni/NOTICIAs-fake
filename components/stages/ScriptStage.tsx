import React from 'react';
import { NewsItem } from '../../types';

interface ScriptStageProps {
    newsItems: NewsItem[];
    isReal: boolean;
    onRegenerate: () => void;
    isRegenerating: boolean;
}

export const ScriptStage: React.FC<ScriptStageProps> = ({ newsItems, isReal, onRegenerate, isRegenerating }) => {
    const neonBtn = isReal ? 'bg-emerald-700 hover:bg-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.6)]' : 'bg-red-700 hover:bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.6)]';

    return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className={`backdrop-blur-xl bg-black/90 border-2 ${isReal ? 'border-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'border-red-700 shadow-[0_0_15px_rgba(220,38,38,0.3)]'} rounded-none p-8`}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className={`text-xl font-montserrat font-bold ${isReal ? 'text-emerald-400' : 'text-red-500'}`}>
                        GUIÓN GENERADO ({newsItems.length} ESCENAS)
                    </h3>
                    <button
                        onClick={onRegenerate}
                        disabled={isRegenerating}
                        className={`px-6 py-2 font-bold uppercase text-xs tracking-widest transition-all ${isRegenerating ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : neonBtn
                            } text-white`}
                    >
                        {isRegenerating ? '⟳ REGENERANDO...' : '⟳ REGENERAR GUIÓN'}
                    </button>
                </div>
                <textarea
                    className={`w-full bg-transparent border-none focus:outline-none resize-none ${isReal ? 'text-emerald-50' : 'text-red-50'} font-lato text-lg leading-relaxed tracking-wide`}
                    style={{ minHeight: '60vh' }}
                    defaultValue={newsItems.map((item, index) =>
                        `${item.headline}\n\n${item.summary}${index < newsItems.length - 1 ? '\n\n─────────────────────────────────────\n\n' : ''}`
                    ).join('')}
                    spellCheck={false}
                />
            </div>
        </div>
    );
};
