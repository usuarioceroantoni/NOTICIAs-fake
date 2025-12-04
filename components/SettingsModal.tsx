import React, { useState, useEffect } from 'react';
import { signInToPuter, signOutFromPuter, isPuterSignedIn, getPuterUser, getPuterUsage } from '../services/puterService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reveApiKey: string;
  ai33ApiKey: string;
  geminiApiKey: string;
  anthropicApiKey: string;
  onSave: (reveKey: string, ai33Key: string, geminiKey: string, anthropicKey: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, reveApiKey, ai33ApiKey, geminiApiKey, anthropicApiKey, onSave }) => {
  const [inputReveKey, setInputReveKey] = useState(reveApiKey);
  const [inputAi33Key, setInputAi33Key] = useState(ai33ApiKey);
  const [inputGeminiKey, setInputGeminiKey] = useState(geminiApiKey);
  const [inputAnthropicKey, setInputAnthropicKey] = useState(anthropicApiKey);
  const [isPuterLogged, setIsPuterLogged] = useState(false);
  const [puterUser, setPuterUser] = useState<any>(null);
  const [puterUsage, setPuterUsage] = useState<any>(null);

  useEffect(() => {
    const checkPuterStatus = async () => {
      const signedIn = isPuterSignedIn();
      setIsPuterLogged(signedIn);
      if (signedIn) {
        const user = await getPuterUser();
        setPuterUser(user);
        // Optional: Get usage stats
        // const usage = await getPuterUsage();
        // setPuterUsage(usage);
      } else {
        setPuterUser(null);
      }
    };
    checkPuterStatus();
  }, [isOpen]);

  const handlePuterSignIn = async () => {
    try {
      const user = await signInToPuter();
      setIsPuterLogged(true);
      setPuterUser(user);
    } catch (error) {
      console.error(error);
      alert("Error al iniciar sesión en Puter. Revisa la consola.");
    }
  };

  const handlePuterSignOut = async () => {
    try {
      await signOutFromPuter();
      setIsPuterLogged(false);
      setPuterUser(null);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    setInputReveKey(reveApiKey);
    setInputAi33Key(ai33ApiKey);
    setInputGeminiKey(geminiApiKey);
    setInputAnthropicKey(anthropicApiKey);
  }, [reveApiKey, ai33ApiKey, geminiApiKey, anthropicApiKey, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-gray-900 border border-purple-500/30 rounded-xl shadow-[0_0_50px_rgba(168,85,247,0.2)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-black/50 p-4 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-xl font-cinzel font-bold text-white">Configuración del Nexus</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">

          {/* PUTER SECTION (FREE AI) */}
          <div className="space-y-2 pb-4 border-b border-white/10">
            <label className="flex items-center gap-2 text-xs uppercase tracking-widest text-emerald-400 font-bold">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
              PUTER.COM (GPT-5 Nano & ElevenLabs GRATIS)
            </label>

            <div className="flex items-center justify-between bg-black border border-gray-700 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isPuterLogged ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-red-500'}`}></div>
                <div className="flex flex-col">
                  <span className="text-sm font-mono text-gray-300">
                    {isPuterLogged ? `Conectado: ${puterUser?.username || 'Usuario'}` : 'Desconectado'}
                  </span>
                  {isPuterLogged && (
                    <span className="text-[10px] text-emerald-500/80">Sesión activa</span>
                  )}
                </div>
              </div>

              {isPuterLogged ? (
                <button
                  onClick={handlePuterSignOut}
                  className="px-3 py-1 text-xs bg-red-900/30 text-red-400 border border-red-900 rounded hover:bg-red-900/50 transition-colors"
                >
                  Cerrar Sesión
                </button>
              ) : (
                <button
                  onClick={handlePuterSignIn}
                  className="px-3 py-1 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-500 transition-colors shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                >
                  Iniciar Sesión
                </button>
              )}
            </div>
            <p className="text-[10px] text-gray-500">Inicia sesión para usar GPT-5 Nano y ElevenLabs totalmente GRATIS.</p>
          </div>

          {/* GEMINI SECTION (BRAIN) */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs uppercase tracking-widest text-red-500 font-bold">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              GOOGLE GEMINI API KEY (Cerebro)
            </label>
            <input
              type="password"
              value={inputGeminiKey}
              onChange={(e) => setInputGeminiKey(e.target.value)}
              placeholder="AIza..."
              className="w-full bg-black border border-gray-700 focus:border-red-500 rounded-lg p-3 text-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-red-500 transition-all"
            />
            <p className="text-[10px] text-gray-500">Necesario para generar los guiones y prompts.</p>
          </div>

          {/* REVE SECTION */}
          <div className="space-y-2 pt-4 border-t border-white/10">
            <label className="flex items-center gap-2 text-xs uppercase tracking-widest text-purple-400 font-bold">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              REVE API KEY (Imágenes)
            </label>
            <input
              type="password"
              value={inputReveKey}
              onChange={(e) => setInputReveKey(e.target.value)}
              placeholder="sk-reve-..."
              className="w-full bg-black border border-gray-700 focus:border-purple-500 rounded-lg p-3 text-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all"
            />
            <p className="text-[10px] text-gray-500">Necesario para generar la evidencia visual.</p>
          </div>

          {/* AI33 SECTION */}
          <div className="space-y-2 pt-4 border-t border-white/10">
            <label className="flex items-center gap-2 text-xs uppercase tracking-widest text-cyan-400 font-bold">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
              AI33 VOICE API KEY (Audio)
            </label>
            <input
              type="password"
              value={inputAi33Key}
              onChange={(e) => setInputAi33Key(e.target.value)}
              placeholder="xi-api-key..."
              className="w-full bg-black border border-gray-700 focus:border-cyan-500 rounded-lg p-3 text-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
            />
            <p className="text-[10px] text-gray-500">Necesario para clonar voces y narrar noticias.</p>
          </div>

          {/* ANTHROPIC SECTION */}
          <div className="space-y-2 pt-4 border-t border-white/10">
            <label className="flex items-center gap-2 text-xs uppercase tracking-widest text-orange-400 font-bold">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
              ANTHROPIC API KEY (Claude)
            </label>
            <input
              type="password"
              value={inputAnthropicKey}
              onChange={(e) => setInputAnthropicKey(e.target.value)}
              placeholder="sk-ant-..."
              className="w-full bg-black border border-gray-700 focus:border-orange-500 rounded-lg p-3 text-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all"
            />
            <p className="text-[10px] text-gray-500">Necesario para usar Claude Sonnet 4.5 en guiones.</p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-black/30 border-t border-white/5 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-inter text-gray-400 hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onSave(inputReveKey, inputAi33Key, inputGeminiKey, inputAnthropicKey);
              onClose();
            }}
            className="px-6 py-2 bg-white text-black hover:bg-gray-200 text-sm font-bold uppercase tracking-wide rounded-lg shadow-lg transition-all"
          >
            Guardar Credenciales
          </button>
        </div>
      </div>
    </div>
  );
};