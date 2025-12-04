import { useState, useEffect } from 'react';

export type ThemeName = 'sunset' | 'coral' | 'purple' | 'green' | 'blue' | 'red' | 'white';

interface Theme {
    name: ThemeName;
    displayName: string;
    primaryFrom: string;
    primaryTo: string;
    secondaryFrom: string;
    secondaryTo: string;
    bgFrom: string;
    bgTo: string;
    isDark: boolean;
}

export const themes: Record<ThemeName, Theme> = {
    sunset: {
        name: 'sunset',
        displayName: '🌅 Golden Hour',
        primaryFrom: '#FFD700',      // Oro brillante
        primaryTo: '#FF8C00',        // Naranja oscuro intenso
        secondaryFrom: '#FF4500',    // Rojo-naranja
        secondaryTo: '#FF6B35',      // Coral fuego
        bgFrom: '#0a0604',           // Negro cálido
        bgTo: '#1a0f08',             // Marrón oscuro
        isDark: true,
    },
    coral: {
        name: 'coral',
        displayName: '🔥 Fire Coral',
        primaryFrom: '#FF6347',      // Tomate brillante
        primaryTo: '#FF1493',        // Rosa profundo
        secondaryFrom: '#FF4500',    // Naranja fuego
        secondaryTo: '#FFB6C1',      // Rosa claro
        bgFrom: '#0d0608',           // Negro rosado
        bgTo: '#1a0a0f',             // Vino oscuro
        isDark: true,
    },
    purple: {
        name: 'purple',
        displayName: '💜 Electric Purple',
        primaryFrom: '#DA70D6',      // Orquídea
        primaryTo: '#FF00FF',        // Magenta puro
        secondaryFrom: '#9D4EDD',    // Púrpura medio
        secondaryTo: '#FF1493',      // Rosa profundo
        bgFrom: '#0f0a1e',
        bgTo: '#1e1b4b',
        isDark: true,
    },
    green: {
        name: 'green',
        displayName: '💚 Neon Lime',
        primaryFrom: '#00FF00',      // Verde lima puro
        primaryTo: '#00FF7F',        // Verde primavera
        secondaryFrom: '#39FF14',    // Verde neón
        secondaryTo: '#7FFF00',      // Chartreuse
        bgFrom: '#0a1f0a',
        bgTo: '#0d1f1f',
        isDark: true,
    },
    blue: {
        name: 'blue',
        displayName: '💙 Cyber Cyan',
        primaryFrom: '#00FFFF',      // Cian puro
        primaryTo: '#00BFFF',        // Azul cielo profundo
        secondaryFrom: '#1E90FF',    // Azul Dodger
        secondaryTo: '#00CED1',      // Turquesa oscuro
        bgFrom: '#0a1628',
        bgTo: '#1e293b',
        isDark: true,
    },
    red: {
        name: 'red',
        displayName: '❤️ Crimson Fire',
        primaryFrom: '#FF0000',      // Rojo puro
        primaryTo: '#FF4500',        // Rojo-naranja
        secondaryFrom: '#DC143C',    // Carmesí
        secondaryTo: '#FF6347',      // Tomate
        bgFrom: '#1f0a0a',
        bgTo: '#2d1414',
        isDark: true,
    },
    white: {
        name: 'white',
        displayName: '🤍 Pure Light',
        primaryFrom: '#3b82f6',
        primaryTo: '#8b5cf6',
        secondaryFrom: '#06b6d4',
        secondaryTo: '#a855f7',
        bgFrom: '#f8fafc',
        bgTo: '#e0e7ff',
        isDark: false,
    },
};

export const useTheme = () => {
    const [currentTheme, setCurrentTheme] = useState<ThemeName>(() => {
        const saved = localStorage.getItem('app-theme');
        return (saved as ThemeName) || 'sunset';
    });

    useEffect(() => {
        const theme = themes[currentTheme];
        const root = document.documentElement;

        // Apply theme CSS variables
        root.style.setProperty('--theme-primary-from', theme.primaryFrom);
        root.style.setProperty('--theme-primary-to', theme.primaryTo);
        root.style.setProperty('--theme-secondary-from', theme.secondaryFrom);
        root.style.setProperty('--theme-secondary-to', theme.secondaryTo);
        root.style.setProperty('--theme-bg-from', theme.bgFrom);
        root.style.setProperty('--theme-bg-to', theme.bgTo);

        // Add text colors based on theme
        if (theme.isDark) {
            root.style.setProperty('--theme-text-primary', '#ffffff');
            root.style.setProperty('--theme-text-secondary', '#9ca3af');
            root.style.setProperty('--theme-border', 'rgba(255, 255, 255, 0.1)');
            root.style.setProperty('--theme-glass-bg', 'rgba(0, 0, 0, 0.4)');
        } else {
            root.style.setProperty('--theme-text-primary', '#1f2937');
            root.style.setProperty('--theme-text-secondary', '#6b7280');
            root.style.setProperty('--theme-border', 'rgba(0, 0, 0, 0.1)');
            root.style.setProperty('--theme-glass-bg', 'rgba(255, 255, 255, 0.7)');
        }

        // Save to localStorage
        localStorage.setItem('app-theme', currentTheme);

        // Update body class for theme-specific styles
        document.body.className = `theme-${currentTheme}`;
    }, [currentTheme]);

    return {
        currentTheme,
        setTheme: setCurrentTheme,
        theme: themes[currentTheme],
        allThemes: themes,
    };
};
