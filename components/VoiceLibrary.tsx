import React from 'react';
import { AudioPlayer } from './AudioPlayer';

export interface ClonedVoice {
    id: string;
    name: string;
    audioUrl: string;
    timestamp: number;
    sampleText?: string;
}

interface VoiceLibraryProps {
    voices: ClonedVoice[];
    onDelete: (id: string) => void;
    isReal: boolean;
}

export const VoiceLibrary: React.FC<VoiceLibraryProps> = ({
    voices,
    onDelete,
    isReal
}) => {
    const primaryColor = isReal ? 'emerald' : 'red';

    const handleDownload = (voice: ClonedVoice) => {
        const a = document.createElement('a');
        a.href = voice.audioUrl;
        a.download = `${voice.name.replace(/[^a-z0-9]/gi, '_')}_${voice.timestamp}.mp3`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (voices.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500 font-mono text-sm border border-gray-800 rounded-sm bg-black/20">
                No hay voces clonadas guardadas
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <h3 className="text-sm font-montserrat font-bold text-white mb-3">
                VOCES CLONADAS ({voices.length})
            </h3>

            {voices.map((voice) => (
                <div
                    key={voice.id}
                    className="border border-gray-800 rounded-sm p-3 bg-black/30"
                >
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex-grow">
                            <h4 className="text-sm font-bold text-white mb-1">{voice.name}</h4>
                            {voice.sampleText && (
                                <p className="text-xs text-gray-400 font-mono mb-1 line-clamp-2">
                                    "{voice.sampleText}"
                                </p>
                            )}
                            <p className="text-[10px] text-gray-500 font-mono">
                                Creada: {formatDate(voice.timestamp)}
                            </p>
                        </div>

                        <button
                            onClick={() => onDelete(voice.id)}
                            className="ml-3 px-2 py-1 text-[10px] font-bold rounded-sm bg-red-900/50 text-red-300 hover:bg-red-900 transition-colors"
                        >
                            ELIMINAR
                        </button>
                    </div>

                    <AudioPlayer
                        audioUrl={voice.audioUrl}
                        title={voice.name}
                        onDownload={() => handleDownload(voice)}
                        isReal={isReal}
                    />
                </div>
            ))}
        </div>
    );
};
