import { useEffect } from 'react';

interface ShortcutHandlers {
    onGenerate?: () => void;
    onBulkImages?: () => void;
    onBulkAudio?: () => void;
    onNextStage?: () => void;
    onPrevStage?: () => void;
}

export const useKeyboardShortcuts = (handlers: ShortcutHandlers) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore shortcuts when typing in inputs
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                if (e.key === 'Enter' && !e.shiftKey && handlers.onGenerate) {
                    handlers.onGenerate();
                }
                return;
            }

            const isMod = e.metaKey || e.ctrlKey;

            // Ctrl/Cmd + G: Bulk generate images
            if (isMod && e.key === 'g') {
                e.preventDefault();
                handlers.onBulkImages?.();
            }

            // Ctrl/Cmd + A: Bulk generate audio
            if (isMod && e.key === 'a') {
                e.preventDefault();
                handlers.onBulkAudio?.();
            }

            // Tab: Next stage (without modifier)
            if (e.key === 'Tab' && !isMod) {
                e.preventDefault();
                handlers.onNextStage?.();
            }

            // Shift + Tab: Previous stage
            if (e.key === 'Tab' && e.shiftKey) {
                e.preventDefault();
                handlers.onPrevStage?.();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handlers]);
};
