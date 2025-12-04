import React from 'react';
import { NewsItem, AspectRatio } from '../../types';
import { ProgressBar } from '../ProgressBar';

interface VisualStageProps {
    newsItems: NewsItem[];
    isReal: boolean;
    handleGenerateImage: (index: number, prompt?: string) => void;
    loadingImages: { [index: number]: boolean };
    globalAspectRatio: AspectRatio;
    setGlobalAspectRatio: (ratio: AspectRatio) => void;
    bulkImageCount: number;
    setBulkImageCount: (count: number) => void;
    handleBulkGenerateImages: () => void;
    isBulkGenerating: boolean;
    handleDownloadZip: () => void;
    isZipping: boolean;
    onUpdatePrompt: (index: number, newPrompt: string) => void;
    sceneCount: number;
    setSceneCount: (count: number) => void;
    scriptContent: string;
    setScriptContent: (content: string) => void;
    onGenerateFromScript: () => void;
    isGeneratingFromScript: boolean;
    onGenerateAllImages: () => void;
    onRegeneratePromptWithAI: (index: number) => void;
    onDownloadSingleImage: (index: number) => void;
    hideScriptInput?: boolean;
}

export const VisualStage: React.FC<VisualStageProps> = ({
    newsItems,
    isReal,
    handleGenerateImage,
    loadingImages,
    globalAspectRatio,
    setGlobalAspectRatio,
    bulkImageCount,
    setBulkImageCount,
    handleBulkGenerateImages,
    isBulkGenerating,
    handleDownloadZip,
    isZipping,
    onUpdatePrompt,
    sceneCount,
    setSceneCount,
    scriptContent,
    setScriptContent,
    onGenerateFromScript,
    isGeneratingFromScript,
    onGenerateAllImages,
    onRegeneratePromptWithAI,
    onDownloadSingleImage,
    hideScriptInput = false
}) => {
    const neonPrimary = isReal ? 'text-emerald-400' : 'text-red-500';
    const neonBorder = isReal ? 'border-emerald-600' : 'border-red-600';
    const neonBtn = isReal ? 'bg-emerald-700 hover:bg-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.6)]' : 'bg-red-700 hover:bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.6)]';

    return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700">

            <div className={`mb-8 p-6 border-2 bg-black/80 backdrop-blur-md flex flex-col md:flex-row justify-between items-end gap-6 ${neonBorder} shadow-lg`}>
                <div className="flex-grow">
                    <h3 className={`text-2xl font-montserrat font-bold text-white mb-2 flex items-center gap-2`}>
                        <span className={neonPrimary}>///</span> LABORATORIO VISUAL
                    </h3>
                    <p className="text-xs text-gray-400 font-mono mb-3">SISTEMA DE RENDERIZADO DE EVIDENCIA</p>
                    {isBulkGenerating && (
                        <ProgressBar
                            current={newsItems.filter(item => item.imageUrl && item.aspectRatio === globalAspectRatio).length}
                            total={Math.min(bulkImageCount, newsItems.length)}
                            label="Generando imágenes"
                            isReal={isReal}
                        />
                    )}
                </div>

                <div className="flex flex-col items-end gap-4">
                    <div className="flex bg-black border border-gray-800 p-1">
                        <button
                            onClick={() => setGlobalAspectRatio('16:9')}
                            className={`px-4 py-1 text-[10px] font-bold font-montserrat transition-all ${globalAspectRatio === '16:9' ? (isReal ? 'bg-emerald-900 text-emerald-100' : 'bg-red-900 text-red-100') : 'text-gray-600 hover:text-white'}`}
                        >
                            16:9 LANDSCAPE
                        </button>
                        <button
                            onClick={() => setGlobalAspectRatio('9:16')}
                            className={`px-4 py-1 text-[10px] font-bold font-montserrat transition-all ${globalAspectRatio === '9:16' ? (isReal ? 'bg-emerald-900 text-emerald-100' : 'bg-red-900 text-red-100') : 'text-gray-600 hover:text-white'}`}
                        >
                            9:16 PORTRAIT
                        </button>
                    </div>

                    <div className="flex gap-3">
                        <div className="flex items-center bg-black border border-gray-800 px-2">
                            <span className="text-[9px] font-mono text-gray-500 mr-2">BATCH_SIZE:</span>
                            {[1, 2, 3].map(num => (
                                <button
                                    key={num}
                                    onClick={() => setBulkImageCount(num)}
                                    className={`px-2 py-1 text-[10px] font-mono font-bold ${bulkImageCount === num ? 'text-white underline' : 'text-gray-600 hover:text-gray-400'}`}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={handleBulkGenerateImages}
                            disabled={isBulkGenerating}
                            className={`px-6 py-2 font-bold uppercase text-[10px] tracking-widest transition-all border border-transparent ${isBulkGenerating ? 'bg-gray-800 text-gray-500' : neonBtn} text-white`}
                        >
                            {isBulkGenerating ? 'RENDERIZANDO...' : 'GENERAR LOTE'}
                        </button>

                        <button
                            onClick={handleDownloadZip}
                            disabled={isZipping}
                            className={`px-6 py-2 font-bold uppercase text-[10px] tracking-widest transition-all bg-white text-black hover:bg-gray-200 flex items-center gap-2`}
                        >
                            {isZipping ? 'COMPRIMIENDO...' : 'DESCARGAR ZIP'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Scene Count Selector and Script Editor */}
            {!hideScriptInput && (
                <div className={`mb-8 p-6 border-2 bg-black/80 backdrop-blur-md ${neonBorder} shadow-lg`}>
                    <div className="mb-4">
                        <label className={`block text-sm font-montserrat font-bold mb-2 ${neonPrimary}`}>
                            CANTIDAD DE ESCENAS
                        </label>
                        <div className="flex items-center gap-4">
                            <input
                                type="number"
                                min="1"
                                max="40"
                                value={sceneCount}
                                onChange={(e) => setSceneCount(Math.min(40, Math.max(1, parseInt(e.target.value) || 1)))}
                                className="bg-black border border-gray-700 text-white px-4 py-2 w-24 font-mono text-center focus:outline-none focus:border-gray-500"
                            />
                            <span className="text-gray-500 text-xs font-mono">
                                RANGO: 1 - 40 ESCENAS
                            </span>
                        </div>
                    </div>

                    <div>
                        <label className={`block text-sm font-montserrat font-bold mb-2 ${neonPrimary}`}>
                            GUIÓN
                        </label>
                        <textarea
                            value={scriptContent}
                            onChange={(e) => setScriptContent(e.target.value)}
                            placeholder="Escribe aquí el guión para tu generación de imágenes..."
                            className="w-full bg-black border border-gray-700 text-white px-4 py-3 font-mono text-sm focus:outline-none focus:border-gray-500 resize-vertical min-h-[200px]"
                        />
                        <div className="flex justify-between items-center mt-2">
                            <p className="text-gray-600 text-xs font-mono">
                                {scriptContent.length} CARACTERES
                            </p>
                            <button
                                onClick={onGenerateFromScript}
                                disabled={isGeneratingFromScript || !scriptContent.trim()}
                                className={`px-6 py-2 font-bold uppercase text-xs tracking-widest transition-all ${isGeneratingFromScript || !scriptContent.trim()
                                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                    : neonBtn
                                    } text-white`}
                            >
                                {isGeneratingFromScript ? 'PROCESANDO...' : 'GENERAR'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Auto-Generate All Images Button */}
            {newsItems.length > 0 && (
                <div className={`mb-8 p-6 border-2 bg-black/80 backdrop-blur-md ${neonBorder} shadow-lg`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className={`text-lg font-montserrat font-bold ${neonPrimary} mb-1`}>
                                GENERACIÓN AUTOMÁTICA
                            </h3>
                            <p className="text-gray-500 text-xs font-mono">
                                {newsItems.length} ESCENAS PARSEADAS • {newsItems.filter(i => i.imageUrl).length} IMÁGENES GENERADAS
                            </p>
                        </div>
                        <button
                            onClick={onGenerateAllImages}
                            disabled={isBulkGenerating}
                            className={`px-8 py-3 font-bold uppercase text-sm tracking-widest transition-all ${isBulkGenerating
                                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                : neonBtn
                                } text-white`}
                        >
                            {isBulkGenerating ? 'GENERANDO...' : 'GENERAR TODAS LAS IMÁGENES'}
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
                {newsItems.map((item, index) => (
                    <div key={index} className="bg-black border border-gray-900 hover:border-gray-700 overflow-hidden relative group">
                        <div className={`relative w-full flex items-center justify-center bg-gray-950 ${globalAspectRatio === '9:16' ? 'aspect-[9/16]' : 'aspect-video'}`}>
                            {item.imageUrl ? (
                                <img src={item.imageUrl} alt="Evidence" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                            ) : (
                                <div className="text-center p-2">
                                    {loadingImages[index] ? (
                                        <div className={`w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-2 ${neonBorder}`}></div>
                                    ) : (
                                        <span className="text-[10px] font-mono text-gray-700">NO_SIGNAL</span>
                                    )}
                                </div>
                            )}

                            <div className="absolute top-2 left-2 bg-black/80 backdrop-blur px-2 py-1 text-[9px] font-mono text-white border border-gray-800">
                                #{index + 1}
                            </div>
                        </div>

                        {/* Enhanced Hover Controls */}
                        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-black/95 border-t border-gray-800 p-3">
                            <div className="flex flex-col gap-2">
                                {/* Prompt Editor */}
                                <textarea
                                    value={item.imagePrompt || ""}
                                    onChange={(e) => onUpdatePrompt(index, e.target.value)}
                                    className="w-full bg-black/50 text-[9px] font-mono text-gray-300 focus:text-white border border-gray-700 focus:border-gray-500 resize-none focus:ring-0 px-2 py-1 h-12 leading-tight"
                                    placeholder="Prompt de imagen..."
                                />

                                {/* Action Buttons */}
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => onRegeneratePromptWithAI(index)}
                                        className="flex-1 text-[9px] font-bold uppercase text-white bg-purple-700 hover:bg-purple-600 px-2 py-1 rounded-sm transition-all"
                                        title="Regenerar prompt con IA"
                                    >
                                        🤖 AI
                                    </button>
                                    <button
                                        onClick={() => handleGenerateImage(index, item.imagePrompt)}
                                        className={`flex-1 text-[9px] font-bold uppercase text-white px-2 py-1 rounded-sm transition-all ${neonBtn}`}
                                        title="Regenerar imagen"
                                    >
                                        🔄 GEN
                                    </button>
                                    <button
                                        onClick={() => onDownloadSingleImage(index)}
                                        disabled={!item.imageUrl}
                                        className={`flex-1 text-[9px] font-bold uppercase px-2 py-1 rounded-sm transition-all ${item.imageUrl
                                            ? 'text-white bg-blue-700 hover:bg-blue-600'
                                            : 'text-gray-600 bg-gray-900 cursor-not-allowed'
                                            }`}
                                        title="Descargar imagen"
                                    >
                                        ⬇ DL
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
};
