import { useState, useCallback, useEffect } from 'react';
import { ClonedVoice } from '../components/VoiceLibrary';

export const useVoiceLibrary = () => {
    const [clonedVoices, setClonedVoices] = useState<ClonedVoice[]>([]);

    // Load voices from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('maquina_cloned_voices');
        if (stored) {
            try {
                const voices = JSON.parse(stored);
                setClonedVoices(voices);
            } catch (error) {
                console.error('Error loading cloned voices:', error);
            }
        }
    }, []);

    // Save voices to localStorage whenever they change
    useEffect(() => {
        if (clonedVoices.length > 0) {
            localStorage.setItem('maquina_cloned_voices', JSON.stringify(clonedVoices));
        }
    }, [clonedVoices]);

    const addVoice = useCallback((voice: Omit<ClonedVoice, 'id' | 'timestamp'>) => {
        const newVoice: ClonedVoice = {
            ...voice,
            id: Date.now().toString() + Math.random().toString(36).substring(7),
            timestamp: Date.now(),
        };

        setClonedVoices(prev => {
            const updated = [newVoice, ...prev];
            // Keep only last 20 voices to avoid excessive storage
            return updated.slice(0, 20);
        });

        return newVoice.id;
    }, []);

    const deleteVoice = useCallback((id: string) => {
        setClonedVoices(prev => prev.filter(v => v.id !== id));
    }, []);

    const clearAll = useCallback(() => {
        setClonedVoices([]);
        localStorage.removeItem('maquina_cloned_voices');
    }, []);

    return {
        clonedVoices,
        addVoice,
        deleteVoice,
        clearAll,
    };
};
