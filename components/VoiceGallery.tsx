import React, { useRef, useState } from 'react';
import { Voice, NewsStyle } from '../types';

interface VoiceGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  voices: Voice[];
  onSelectVoice: (voice: Voice) => void;
  onCloneVoice: (file: File) => Promise<void>;
  isLoading: boolean;
  style: NewsStyle;
}

export const VoiceGallery: React.FC<VoiceGalleryProps> = ({ isOpen, onClose, voices, onSelectVoice, onCloneVoice, isLoading, style }) => {
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [isCloning, setIsCloning] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handlePlay = (voiceId: string, url: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (playingVoiceId === voiceId && audioRef.current) {
      audioRef.current.pause();
      setPlayingVoiceId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => setPlayingVoiceId(null);
      audio.play();
      setPlayingVoiceId(voiceId);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsCloning(true);
      try {
        await onCloneVoice(file);
      } catch (error) {
        console.error(error);
      } finally {
        setIsCloning(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  const isReal = style === 'REAL';
  const accentColor = isReal ? 'text-emerald-400' : 'text-red-400';
  const borderColor = isReal ? 'border-emerald-500' : 'border-red-500';
  const hoverBg = isReal ? 'hover:bg-emerald-900/20' : 'hover:bg-red-900/20';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in zoom-in-95 duration-300">
      <div className={`w-full max-w-4xl h-[80vh] flex flex-col bg-gray-900 rounded-xl border ${isReal ? 'border-emerald-900' : 'border-red-900'} shadow-2xl relative overflow-hidden`}>

        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/40">
          <div>
            <h2 className={`text-2xl font-montserrat font-bold text-white mb-1`}>
              {isReal ? 'CORRESPONSALES VERIFICADOS' : 'VOCES ANÓNIMAS'}
            </h2>
            <p className="text-xs text-gray-400 font-mono uppercase tracking-wider">
              {voices.length} {isReal ? 'Periodistas' : 'Entidades'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-6 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            <div
              onClick={() => !isCloning && fileInputRef.current?.click()}
              className={`group relative p-4 rounded-lg border border-dashed border-white/20 bg-white/5 hover:bg-white/10 cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[80px] gap-2 ${isReal ? 'hover:border-emerald-500' : 'hover:border-red-500'}`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="audio/*"
                className="hidden"
              />

              {isCloning ? (
                <div className={`w-8 h-8 border-2 ${borderColor} border-t-transparent rounded-full animate-spin`}></div>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${isReal ? 'text-emerald-500' : 'text-red-500'} opacity-70 group-hover:opacity-100 transition-opacity`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <div className="text-center">
                    <span className="block text-xs font-bold text-white uppercase tracking-wide">Clonar Nueva Voz</span>
                    <span className="block text-[9px] text-gray-500">Subir archivo de audio</span>
                  </div>
                </>
              )}
            </div>

            {/* Custom Voice ID Input */}
            <div className={`p-4 rounded-lg border border-dashed border-white/20 bg-white/5 hover:bg-white/10 transition-all duration-300 flex flex-col justify-center gap-3 ${isReal ? 'hover:border-emerald-500' : 'hover:border-red-500'}`}>
              <div className="flex items-center gap-2 mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isReal ? 'text-emerald-500' : 'text-red-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                <span className="text-xs font-bold text-white uppercase tracking-wide">ID Manual</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Pegar ID de ElevenLabs..."
                  className="bg-black/50 border border-gray-700 rounded px-3 py-2 text-xs text-white w-full focus:outline-none focus:border-white/50 font-mono"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const target = e.target as HTMLInputElement;
                      if (target.value.trim()) {
                        onSelectVoice({
                          voice_id: target.value.trim(),
                          voice_name: `Custom Voice (${target.value.trim().substring(0, 4)}...)`,
                          category: 'custom',
                          description: 'ID Manual',
                          preview_url: '',
                          sample_audio: ''
                        });
                      }
                    }
                  }}
                />
              </div>
              <p className="text-[9px] text-gray-500">Presiona Enter para usar este ID</p>
            </div>

            {isLoading ? (
              <div className="col-span-full flex flex-col items-center justify-center gap-4 text-gray-400 py-12">
                <div className={`w-10 h-10 border-2 ${borderColor} border-t-transparent rounded-full animate-spin`}></div>
                <p className="text-xs font-mono uppercase animate-pulse">Cargando voces...</p>
              </div>
            ) : voices.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center text-center p-8">
                <p className="text-gray-500 mb-4">No se encontraron voces.</p>
              </div>
            ) : (
              voices.map((voice) => (
                <div
                  key={voice.voice_id}
                  onClick={() => onSelectVoice(voice)}
                  className={`group relative p-4 rounded-lg border border-white/5 bg-black/20 ${hoverBg} cursor-pointer transition-all duration-300 hover:border-opacity-50 ${isReal ? 'hover:border-emerald-500' : 'hover:border-red-500'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-800 border border-white/10 flex-shrink-0">
                      {voice.cover_url ? (
                        <img src={voice.cover_url} alt={voice.voice_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500">
                          {voice.voice_name.charAt(0)}
                        </div>
                      )}
                      <button
                        onClick={(e) => handlePlay(voice.voice_id, voice.sample_audio, e)}
                        className={`absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity ${playingVoiceId === voice.voice_id ? 'opacity-100 bg-black/40' : ''}`}
                      >
                        {playingVoiceId === voice.voice_id ? (
                          <svg className="w-6 h-6 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        ) : (
                          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        )}
                      </button>
                    </div>

                    <div className="flex-grow min-w-0">
                      <h3 className="text-sm font-bold text-white truncate group-hover:text-white transition-colors">{voice.voice_name}</h3>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {voice.tag_list?.slice(0, 2).map((tag, i) => (
                          <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-gray-400 border border-white/5">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className={`absolute top-2 right-2 w-2 h-2 rounded-full transition-colors ${isReal ? 'bg-emerald-500' : 'bg-red-500'} opacity-0 group-hover:opacity-100`}></div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};