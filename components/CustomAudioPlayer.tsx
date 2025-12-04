import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Download, Volume2, VolumeX } from 'lucide-react';

interface CustomAudioPlayerProps {
    src: string;
    title: string;
    isReal: boolean;
}

export const CustomAudioPlayer: React.FC<CustomAudioPlayerProps> = ({ src, title, isReal }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateProgress = () => {
            setProgress((audio.currentTime / audio.duration) * 100);
        };

        const setAudioDuration = () => {
            setDuration(audio.duration);
        };

        const onEnded = () => {
            setIsPlaying(false);
            setProgress(0);
        };

        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('loadedmetadata', setAudioDuration);
        audio.addEventListener('ended', onEnded);

        return () => {
            audio.removeEventListener('timeupdate', updateProgress);
            audio.removeEventListener('loadedmetadata', setAudioDuration);
            audio.removeEventListener('ended', onEnded);
        };
    }, []);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleMute = () => {
        if (audioRef.current) {
            audioRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = (value / 100) * duration;
            setProgress(value);
        }
    };

    const formatTime = (time: number) => {
        if (isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const themeColor = isReal ? 'emerald' : 'red';
    const glowColor = isReal ? 'rgba(16,185,129,0.5)' : 'rgba(220,38,38,0.5)';

    return (
        <div className={`relative w-full overflow-hidden rounded-xl border border-${themeColor}-900 bg-black/80 backdrop-blur-xl p-6 shadow-2xl transition-all duration-500 group`}>
            {/* Background Glow Effect */}
            <div
                className="absolute -top-20 -right-20 h-64 w-64 rounded-full blur-3xl opacity-20 pointer-events-none"
                style={{ backgroundColor: isReal ? '#10b981' : '#dc2626' }}
            />

            <audio ref={audioRef} src={src} />

            <div className="flex flex-col md:flex-row gap-6 items-center relative z-10">

                {/* Left Side: Visual / Icon */}
                <div className={`w-24 h-24 rounded-lg flex items-center justify-center shadow-lg ${isReal ? 'bg-gradient-to-br from-emerald-900 to-black' : 'bg-gradient-to-br from-red-900 to-black'}`}>
                    <div className={`animate-pulse ${isPlaying ? 'opacity-100' : 'opacity-50'}`}>
                        <div className="flex items-end gap-1 h-8">
                            <div className={`w-1 bg-${themeColor}-500 rounded-t-sm animate-[bounce_1s_infinite] h-4`} style={{ animationDelay: '0ms' }}></div>
                            <div className={`w-1 bg-${themeColor}-500 rounded-t-sm animate-[bounce_1.2s_infinite] h-8`} style={{ animationDelay: '100ms' }}></div>
                            <div className={`w-1 bg-${themeColor}-500 rounded-t-sm animate-[bounce_0.8s_infinite] h-6`} style={{ animationDelay: '200ms' }}></div>
                            <div className={`w-1 bg-${themeColor}-500 rounded-t-sm animate-[bounce_1.1s_infinite] h-3`} style={{ animationDelay: '300ms' }}></div>
                        </div>
                    </div>
                </div>

                {/* Center: Controls & Info */}
                <div className="flex-grow w-full">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${isReal ? 'text-emerald-500' : 'text-red-500'}`}>
                                AUDIO GENERADO
                            </span>
                            <h3 className="text-white font-bold text-lg leading-tight line-clamp-1" title={title}>
                                {title}
                            </h3>
                        </div>
                        <button onClick={toggleMute} className="text-gray-400 hover:text-white transition-colors">
                            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-[10px] font-mono text-gray-400 w-8 text-right">{formatTime(audioRef.current?.currentTime || 0)}</span>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={progress}
                            onChange={handleSeek}
                            className={`w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-${themeColor}-500`}
                        />
                        <span className="text-[10px] font-mono text-gray-400 w-8">{formatTime(duration)}</span>
                    </div>

                    {/* Main Controls */}
                    <div className="flex items-center justify-between">
                        <button
                            onClick={togglePlay}
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all transform hover:scale-105 ${isReal ? 'bg-white text-emerald-900 hover:bg-emerald-50' : 'bg-white text-red-900 hover:bg-red-50'} shadow-[0_0_15px_${glowColor}]`}
                        >
                            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                        </button>

                        <a
                            href={src}
                            download={`narration-${title.substring(0, 20)}.mp3`}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${isReal
                                ? 'border-emerald-800 text-emerald-400 hover:bg-emerald-900/30 hover:border-emerald-500'
                                : 'border-red-800 text-red-400 hover:bg-red-900/30 hover:border-red-500'}`}
                        >
                            <Download size={14} />
                            <span>Descargar</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};
