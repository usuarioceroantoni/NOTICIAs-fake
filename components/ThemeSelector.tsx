import React, { useState } from 'react';
import { useTheme, ThemeName, themes } from '../hooks/useTheme';

export const ThemeSelector: React.FC = () => {
    const { currentTheme, setTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="theme-selector">
            <button
                className="theme-selector-button"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Change theme"
            >
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 1v6m0 6v6m5.2-13.2l-4.2 4.2m-2.8 2.8-4.2 4.2M23 12h-6m-6 0H1m18.2-5.2l-4.2 4.2m-2.8 2.8-4.2 4.2" />
                </svg>
            </button>

            {isOpen && (
                <>
                    <div className="theme-selector-backdrop" onClick={() => setIsOpen(false)} />
                    <div className="theme-selector-panel">
                        <h3>Choose Theme</h3>
                        <div className="theme-options">
                            {(Object.keys(themes) as ThemeName[]).map((themeName) => {
                                const theme = themes[themeName];
                                return (
                                    <button
                                        key={themeName}
                                        className={`theme-option ${currentTheme === themeName ? 'active' : ''}`}
                                        onClick={() => {
                                            setTheme(themeName);
                                            setIsOpen(false);
                                        }}
                                    >
                                        <div className="theme-preview">
                                            <div
                                                className="theme-preview-gradient"
                                                style={{
                                                    background: `linear-gradient(135deg, ${theme.primaryFrom}, ${theme.primaryTo})`,
                                                }}
                                            />
                                        </div>
                                        <span>{theme.displayName}</span>
                                        {currentTheme === themeName && (
                                            <svg
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="3"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="check-icon"
                                            >
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
