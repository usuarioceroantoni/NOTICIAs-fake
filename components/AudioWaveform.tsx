import React, { useRef, useState, useEffect } from 'react';

interface AudioWaveformProps {
  audioUrl: string;
  isReal: boolean;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({ audioUrl, isReal }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Update colors to Green vs Red
  const colorClass = isReal ? 'bg-emerald-500' : 'bg-red-500';
  const shadowClass = isReal ? 'shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'shadow-[0_0_10px_rgba(220,38,38,0.5)]';
  const textClass = isReal ? 'text-emerald-500' : 'text-red-500';
  const hoverTextClass = isReal ? 'hover:text-emerald-300' : 'hover:text-red-300';
  const progressColor = isReal ? 'bg-emerald-400' : 'bg-red-400';

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      audioRef.current.load();
    }
  }, [audioUrl]);

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

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
        setDuration(audioRef.current.duration);
      }
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `Audio_Nexus_${new Date().getTime()}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? '0' + sec : sec}`;
  };

  const [bars] = useState(() => Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    height: 20 + Math.random() * 60, 
  })));

  return (
    <div className={`w-full rounded-lg border border-white/10 bg-black/40 backdrop-blur-sm p-3 flex items-center gap-4 transition-all ${isPlaying ? 'border-opacity-50 border-white' : ''}`}>
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onEnded={handleEnded}
        className="hidden"
        preload="auto"
      />

      <button
        onClick={togglePlay}
        className={`flex-shrink-0 w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-all ${isPlaying ? shadowClass : ''}`}
      >
        {isPlaying ? (
          <svg className={`w-4 h-4 ${textClass}`} fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
        ) : (
          <svg className={`w-4 h-4 ${textClass} translate-x-0.5`} fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      <div className="flex-grow h-8 relative group">
        <div className="absolute inset-0 flex items-center justify-center gap-[2px] overflow-hidden mask-image-linear-gradient opacity-50">
          {bars.map((bar) => (
            <div
              key={bar.id}
              className={`w-1 rounded-full transition-all duration-150 ${colorClass}`}
              style={{
                height: isPlaying ? `${Math.max(15, bar.height * (0.5 + Math.random()))}%` : `${bar.height * 0.3}%`,
                opacity: (currentTime / (duration || 1)) * 100 > (bar.id / bars.length) * 100 ? 1 : 0.3
              }}
            />
          ))}
        </div>

        <div 
           className={`absolute bottom-0 left-0 h-[2px] ${progressColor} transition-all duration-100`}
           style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
        ></div>

        <input
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
      </div>

      <button 
        onClick={handleDownload}
        className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
        title="Descargar Audio"
      >
        <svg className={`w-4 h-4 text-gray-400 ${hoverTextClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      </button>

      <div className="flex-shrink-0 text-[10px] font-mono text-gray-400 tabular-nums min-w-[50px] text-right">
        {formatTime(currentTime)} / {formatTime(duration)}
      </div>
    </div>
  );
};