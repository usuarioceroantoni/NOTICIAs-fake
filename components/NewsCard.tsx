import React, { useState, useEffect, useRef } from 'react';
import { NewsItem } from '../types';
import { AudioWaveform } from './AudioWaveform';

interface NewsCardProps {
  item: NewsItem;
  index: number;
  onGenerateImage: (prompt: string) => void;
  onSelectVoice: () => void;
  onGenerateAudio: (text: string) => void;
  isGeneratingImage: boolean;
  isGeneratingAudio: boolean;
}

export const NewsCard: React.FC<NewsCardProps> = ({
  item,
  index,
  onGenerateImage,
  onSelectVoice,
  onGenerateAudio,
  isGeneratingImage,
  isGeneratingAudio
}) => {
  const [localScript, setLocalScript] = useState(item.summary);
  const [localImagePrompt, setLocalImagePrompt] = useState(item.imagePrompt || "");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const promptRef = useRef<HTMLTextAreaElement>(null);

  const isReal = item.style === 'REAL';

  // Green (Emerald) vs Red Theme
  const borderColor = isReal ? 'border-emerald-600' : 'border-red-700';
  const glowClass = isReal ? 'shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'shadow-[0_0_15px_rgba(220,38,38,0.3)]';
  const textGlow = isReal ? 'neon-text-emerald' : 'neon-text-red';

  // Button Styles
  const btnBg = isReal ? 'bg-emerald-950 hover:bg-emerald-900' : 'bg-red-950 hover:bg-red-900';
  const btnText = isReal ? 'text-emerald-400' : 'text-red-500';
  const btnBorder = isReal ? 'border-emerald-600' : 'border-red-600';
  const sectionTitleColor = isReal ? 'text-emerald-500' : 'text-red-500';
  const separatorColor = isReal ? 'bg-emerald-600/50' : 'bg-red-600/50';

  useEffect(() => {
    setLocalScript(item.summary);
    setLocalImagePrompt(item.imagePrompt || "");
  }, [item.summary, item.imagePrompt]);

  const adjustHeight = (ref: React.RefObject<HTMLTextAreaElement>) => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = ref.current.scrollHeight + 'px';
    }
  };

  useEffect(() => { adjustHeight(textareaRef); }, [localScript]);
  useEffect(() => { adjustHeight(promptRef); }, [localImagePrompt]);

  return (
    <div
      className={`relative group backdrop-blur-xl bg-black/90 border-2 ${borderColor} ${glowClass} rounded-none p-6 transition-all duration-500 flex flex-col mb-8 magic-hover`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Scene Number Badge */}
      <div className={`absolute -top-3 -left-1 px-4 py-1 text-xs font-montserrat font-bold tracking-widest border ${borderColor} bg-black z-10 ${btnText}`}>
        SCENE_0{index + 1}
      </div>

      {/* Header */}
      <div className="flex flex-col mb-6 pt-2">
        <span className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-2 ${isReal ? 'text-emerald-200/70' : 'text-red-200/70'}`}>
          {item.category} // DETECTED: {item.impactLevel}
        </span>
        {/* Headline */}
        <h3 className={`text-2xl leading-tight ${isReal
            ? 'font-montserrat font-black text-white uppercase drop-shadow-[0_0_5px_rgba(16,185,129,0.8)]'
            : 'font-mono font-bold text-red-100 drop-shadow-[0_0_5px_rgba(220,38,38,0.8)] tracking-tighter lowercase'
          }`}>
          {item.headline}
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-4">

        {/* Left Column: Script & Audio */}
        <div className="flex flex-col gap-4 h-full order-1">
          <div className="flex-grow flex flex-col">
            <label className={`block text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-2 ${sectionTitleColor}`}>
              <span>// 01_NARRATIVE_DATA</span>
              <span className={`h-px flex-grow ${separatorColor}`}></span>
            </label>
            <textarea
              ref={textareaRef}
              value={localScript}
              onChange={(e) => setLocalScript(e.target.value)}
              className={`w-full flex-grow bg-black/50 resize-none focus:outline-none rounded-sm p-4 transition-all border ${isReal ? 'border-emerald-900 text-emerald-50 focus:border-emerald-500' : 'border-red-900 text-red-50 focus:border-red-500'} font-lato text-base leading-relaxed tracking-wide shadow-inner min-h-[150px]`}
              spellCheck={false}
              placeholder="Initializing script sequence..."
            />
          </div>

          {/* Audio Player */}
          {item.audioUrl && (
            <div className="mt-2 animate-in fade-in slide-in-from-top-2">
              <AudioWaveform audioUrl={item.audioUrl} isReal={isReal} />
            </div>
          )}

          {/* Buttons */}
          <div className={`flex items-center justify-between gap-3 mt-2 pt-4 border-t border-dashed ${isReal ? 'border-emerald-900' : 'border-red-900'}`}>
            <button
              onClick={onSelectVoice}
              className={`text-[10px] font-montserrat font-bold uppercase tracking-wider px-4 py-3 rounded-sm border transition-all flex-1 text-center ${item.selectedVoiceId
                  ? 'bg-gray-900 border-gray-600 text-white'
                  : 'bg-black border-gray-800 text-gray-500 hover:text-white hover:border-white'
                }`}
            >
              {item.selectedVoiceId ? '[ VOZ ACTIVA ]' : '[ SELECCIONAR VOZ ]'}
            </button>

            {item.selectedVoiceId && !item.audioUrl && (
              <button
                onClick={() => onGenerateAudio(localScript)}
                disabled={isGeneratingAudio}
                className={`text-[10px] font-montserrat font-bold uppercase tracking-wider px-4 py-3 rounded-sm border transition-all flex-1 ${btnBg} ${btnBorder} ${btnText} hover:shadow-[0_0_15px_currentColor]`}
              >
                {isGeneratingAudio ? 'PROCESANDO...' : 'INICIAR DOBLAJE'}
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Visuals */}
        <div className="flex flex-col gap-4 order-2">
          <label className={`block text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-2 ${sectionTitleColor}`}>
            <span>// 02_VISUAL_FEED</span>
            <span className={`h-px flex-grow ${separatorColor}`}></span>
          </label>

          <div className={`w-full rounded-sm overflow-hidden relative aspect-video flex items-center justify-center transition-colors bg-black border-2 ${isReal ? 'border-emerald-900' : 'border-red-900'}`}>
            {item.imageUrl ? (
              <>
                <img
                  src={item.imageUrl}
                  alt={item.headline}
                  className="w-full h-full object-cover animate-in fade-in duration-700"
                />
                <div className={`absolute inset-0 border-[4px] opacity-30 ${isReal ? 'border-emerald-500' : 'border-red-500'} pointer-events-none mix-blend-overlay`}></div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                {isGeneratingImage ? (
                  <div className={`flex flex-col items-center gap-3 ${btnText} animate-pulse`}>
                    <div className={`w-12 h-12 border-4 ${btnBorder} border-t-transparent rounded-full animate-spin`}></div>
                    <span className="text-xs font-montserrat uppercase tracking-widest">RENDERIZANDO...</span>
                  </div>
                ) : (
                  <button
                    onClick={() => onGenerateImage(localImagePrompt)}
                    className="group/btn flex flex-col items-center gap-3 text-gray-600 hover:text-white transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 opacity-50 group-hover/btn:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className={`text-xs font-montserrat uppercase tracking-wide border-b border-transparent group-hover/btn:border-white transition-all`}>
                      INICIAR RENDER
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="relative group/prompt">
            <label className="block text-[9px] font-bold uppercase tracking-widest mb-1 text-gray-500 mt-2">
              PROMPT_TERMINAL_INPUT:
            </label>
            <textarea
              ref={promptRef}
              value={localImagePrompt}
              onChange={(e) => setLocalImagePrompt(e.target.value)}
              className={`w-full bg-black border ${isReal ? 'border-emerald-900 focus:border-emerald-500 text-emerald-100' : 'border-red-900 focus:border-red-500 text-red-100'} rounded-sm p-3 text-xs font-mono focus:outline-none resize-none overflow-hidden min-h-[60px] transition-all`}
              rows={3}
              placeholder="> Ingrese parámetros visuales..."
            />
            <div className={`absolute bottom-0 left-0 h-[2px] w-0 group-focus-within/prompt:w-full transition-all duration-500 ${isReal ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
          </div>
        </div>

      </div>
    </div>
  );
};