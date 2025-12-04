import React from 'react';
import { NewsItem } from '../../types';

interface AudioStageProps {
    newsItems: NewsItem[];
    currentAudioUrl: string | null;
    handleGenerateAudio: (index: number, text: string) => void;
    loadingAudios: { [index: number]: boolean };
    isReal: boolean;
    openVoiceSelection: (index: number) => void;
    audioProvider?: 'ai33' | 'puter';
    onAudioProviderChange?: (provider: 'ai33' | 'puter') => void;
}

export const AudioStage: React.FC<AudioStageProps> = ({
    newsItems,
    currentAudioUrl,
    handleGenerateAudio,
    loadingAudios,
    isReal,
    openVoiceSelection,
    audioProvider = 'puter',
    onAudioProviderChange
}) => {
    return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className={`backdrop-blur-xl bg-black/90 border-2 ${isReal ? 'border-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'border-red-700 shadow-[0_0_15px_rgba(220,38,38,0.3)]'} rounded-none p-8`}>

                <h3 className={`text-2xl font-montserrat font-bold mb-4 ${isReal ? 'text-emerald-400' : 'text-red-500'}`}>
                    ESTUDIO DE DOBLAJE
                </h3>

                {/* Audio Provider Indicator */}
                <div className="mb-6 flex justify-center">
                    <div className="inline-flex items-center gap-2 bg-emerald-900/30 border border-emerald-500/30 px-4 py-2 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.2)] backdrop-blur-md">
                        <span className="text-lg">🎉</span>
                        <span className="text-xs font-bold tracking-widest text-emerald-400">
                            AUDIO GENERADO POR PUTER (ELEVENLABS GRATIS)
                        </span>
                    </div>
                </div>

                {/* Text Area para pegar narración */}
                <textarea
                    id="audioTextInput"
                    className={`w-full bg-black/50 border ${isReal ? 'border-emerald-900 focus:border-emerald-500 text-emerald-50' : 'border-red-900 focus:border-red-500 text-red-50'} rounded-sm p-4 font-lato text-base leading-relaxed tracking-wide resize-none focus:outline-none mb-6`}
                    style={{ minHeight: '200px' }}
                    placeholder="Pega aquí el texto de la narración..."
                    spellCheck={false}
                />

                {/* GRID DE 2 COLUMNAS: VOZ (IZQ) - AUDIO (DER) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* COLUMNA IZQUIERDA: SELECCIÓN DE VOZ */}
                    <div className={`p-6 border ${isReal ? 'border-emerald-900 bg-emerald-950/10' : 'border-red-900 bg-red-950/10'} rounded-sm flex flex-col justify-center`}>
                        <label className={`text-xs font-bold uppercase tracking-widest mb-4 block ${isReal ? 'text-emerald-500' : 'text-red-500'}`}>
              // CONFIGURACIÓN DE VOZ
                        </label>

                        <button
                            onClick={() => openVoiceSelection(0)}
                            className={`w-full py-4 rounded-sm border-2 font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-3 ${newsItems[0]?.selectedVoiceId
                                ? (isReal ? 'border-emerald-500 text-emerald-400 bg-emerald-900/20' : 'border-red-500 text-red-400 bg-red-900/20')
                                : 'border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white'
                                }`}
                        >
                            {newsItems[0]?.selectedVoiceId ? (
                                <>
                                    <span className="text-lg">✓</span>
                                    <span>VOZ SELECCIONADA</span>
                                </>
                            ) : (
                                <span>+ SELECCIONAR VOZ</span>
                            )}
                        </button>

                        {newsItems[0]?.selectedVoiceId && (
                            <div className={`mt-3 text-center text-xs font-mono ${isReal ? 'text-emerald-600' : 'text-red-600'}`}>
                                ID: {newsItems[0].selectedVoiceId}
                            </div>
                        )}
                    </div>

                    {/* COLUMNA DERECHA: GENERACIÓN Y DESCARGA */}
                    <div className={`p-6 border ${isReal ? 'border-emerald-900 bg-emerald-950/10' : 'border-red-900 bg-red-950/10'} rounded-sm flex flex-col justify-center`}>
                        <label className={`text-xs font-bold uppercase tracking-widest mb-4 block ${isReal ? 'text-emerald-500' : 'text-red-500'}`}>
              // PROCESAMIENTO DE AUDIO
                        </label>

                        {(currentAudioUrl || newsItems[0]?.audioUrl) ? (
                            <div className="flex flex-col gap-4 animate-in fade-in">
                                <audio
                                    key={currentAudioUrl || newsItems[0]?.audioUrl}
                                    controls
                                    className="w-full h-10"
                                    autoPlay={false}
                                >
                                    <source src={currentAudioUrl || newsItems[0].audioUrl} type="audio/mpeg" />
                                    <source src={currentAudioUrl || newsItems[0].audioUrl} type="audio/mp3" />
                                    Tu navegador no soporta el elemento de audio.
                                </audio>

                                <a
                                    href={currentAudioUrl || newsItems[0].audioUrl}
                                    download="narration.mp3"
                                    className={`w-full py-3 rounded-sm font-bold uppercase text-sm tracking-widest transition-all text-center ${isReal
                                        ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                                        : 'bg-red-600 text-white hover:bg-red-500 shadow-[0_0_15px_rgba(220,38,38,0.4)]'
                                        }`}
                                >
                                    ⬇ DESCARGAR AUDIO
                                </a>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2 w-full">
                                <button
                                    onClick={() => {
                                        const textArea = document.getElementById('audioTextInput') as HTMLTextAreaElement;
                                        const text = textArea?.value || '';
                                        if (text && newsItems[0]?.selectedVoiceId) {
                                            handleGenerateAudio(0, text);
                                        }
                                    }}
                                    disabled={!newsItems[0]?.selectedVoiceId || !!loadingAudios[0]}
                                    className={`w-full py-4 rounded-sm font-bold uppercase text-sm tracking-wider transition-all ${!newsItems[0]?.selectedVoiceId
                                        ? 'opacity-30 cursor-not-allowed bg-gray-800 border border-gray-700 text-gray-500'
                                        : (isReal
                                            ? 'bg-emerald-900 text-emerald-100 border border-emerald-600 hover:bg-emerald-800 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                                            : 'bg-red-900 text-red-100 border border-red-600 hover:bg-red-800 hover:shadow-[0_0_15px_rgba(220,38,38,0.3)]')
                                        }`}
                                >
                                    {loadingAudios[0] ? (
                                        <span className="animate-pulse">GENERANDO...</span>
                                    ) : (
                                        'GENERAR AUDIO'
                                    )}
                                </button>
                                {loadingAudios[0] && (
                                    <p className={`text-[10px] text-center uppercase tracking-widest animate-pulse ${isReal ? 'text-emerald-500' : 'text-red-500'}`}>
                                        El reproductor aparecerá aquí al finalizar...
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};
