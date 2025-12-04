import React, { useRef, useState, useEffect } from 'react';

interface AudioPlayerProps {
    audioUrl: string;
    title: string;
    onDownload?: () => void;
    isReal?: boolean;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
    audioUrl,
    title,
    onDownload,
    isReal = false
}) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const primaryColor = isReal ? 'emerald' : 'red';

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateTime = () => setCurrentTime(audio.currentTime);
        const updateDuration = () => setDuration(audio.duration);
        const handleEnded = () => setIsPlaying(false);

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('loadedmetadata', updateDuration);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('loadedmetadata', updateDuration);
            audio.removeEventListener('ended', handleEnded);
        };
    }, []);

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const audio = audioRef.current;
        if (!audio) return;

        const newTime = parseFloat(e.target.value);
        audio.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const formatTime = (seconds: number) => {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    const buttonClasses = isReal
        ? 'w-10 h-10 rounded-sm bg-emerald-900 hover:bg-emerald-800 flex items-center justify-center transition-colors'
        : 'w-10 h-10 rounded-sm bg-red-900 hover:bg-red-800 flex items-center justify-center transition-colors';

    const textClasses = isReal ? 'text-emerald-100 text-xl' : 'text-red-100 text-xl';

    return (
        <div className="bg-black/40 border border-gray-800 rounded-sm p-3">
            <audio ref={audioRef} src={audioUrl} preload="metadata" />

            <div className="flex items-center gap-3">
                {/* Play/Pause Button */}
                <button
                    onClick={togglePlay}
                    className={buttonClasses}
                >
                    {isPlaying ? (
                        <span className={textClasses}>⏸</span>
                    ) : (
                        <span className={textClasses}>▶</span>
                    )}
                </button>

                {/* Progress Bar */}
                <div className="flex-grow">
                    <p className="text-xs text-gray-400 font-mono mb-1 truncate">{title}</p>
                    <div className="relative">
                        <input
                            type="range"
                            min="0"
                            max={duration || 0}
                            value={currentTime}
                            onChange={handleSeek}
                            className="w-full h-1 bg-gray-800 rounded-sm appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none 
                [&::-webkit-slider-thumb]:w-3 
                [&::-webkit-slider-thumb]:h-3 
                [&::-webkit-slider-thumb]:rounded-full 
                [&::-moz-range-thumb]:w-3 
                [&::-moz-range-thumb]:h-3 
                [&::-moz-range-thumb]:rounded-full 
                [&::-moz-range-thumb]:border-0"
                            style={{
                                background: `linear-gradient(to right, ${isReal ? '#10b981' : '#ef4444'} ${progress}%, #1f2937 ${progress}%)`,
                            }}
                        />
                        <style dangerouslySetInnerHTML={{
                            __html: `
                input[type="range"]::-webkit-slider-thumb {
                  background-color: ${isReal ? '#10b981' : '#ef4444'} !important;
                }
                input[type="range"]::-moz-range-thumb {
                  background-color: ${isReal ? '#10b981' : '#ef4444'} !important;
                }
              `
                        }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-500 font-mono mt-1">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>

                {/* Download Button */}
                {onDownload && (
                    <button
                        onClick={onDownload}
                        className="px-3 py-2 text-xs font-bold rounded-sm bg-blue-900 text-blue-100 hover:bg-blue-800 transition-colors"
                    >
                        ⬇ DESCARGAR
                    </button>
                )}
            </div>
        </div>
    );
};
