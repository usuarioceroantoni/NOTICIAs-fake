import React, { useState, useCallback, useEffect } from 'react';
import JSZip from 'jszip';
import { Background } from './components/Background';
import { NewsCard } from './components/NewsCard';
import { SettingsModal } from './components/SettingsModal';
import { VoiceGallery } from './components/VoiceGallery';
import { AudioWaveform } from './components/AudioWaveform';
import { ToastContainer } from './components/Toast';
import { ProgressBar } from './components/ProgressBar';
import { ProjectManager } from './components/ProjectManager';
import { ThemeSelector } from './components/ThemeSelector';
import { useToast } from './hooks/useToast';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useProjectManager } from './hooks/useProjectManager';
import { useTheme } from './hooks/useTheme';
import { generateNewsIdeas, parseScriptIntoScenes, regenerateImagePrompt } from './services/geminiService';
import * as openaiService from './services/openaiService';
import { generateNewsWithClaude } from './services/claudeService';
import { generateNewsIdeasWithPuter, parseScriptIntoScenesWithPuter, regenerateImagePromptWithPuter, generateSpeechWithPuter, getPuterVoices } from './services/puterService';
import { generateReveImage } from './services/reveService';
import { getVoiceClones, generateSpeech, cloneVoice } from './services/audioService';
import { generateEnhancedZip } from './utils/zipGenerator';
import { NewsItem, GeneratorStatus, NewsStyle, Voice, AspectRatio } from './types';
import { ScriptStage } from './components/stages/ScriptStage';
import { AudioStage } from './components/stages/AudioStage';
import { VisualStage } from './components/stages/VisualStage';

type Stage = 'SCRIPT' | 'AUDIO' | 'VISUAL';

const App: React.FC = () => {
  const { currentTheme } = useTheme();
  const [topic, setTopic] = useState('');

  // Separate histories for REAL and FAKE
  const [realNewsItems, setRealNewsItems] = useState<NewsItem[]>([]);
  const [fakeNewsItems, setFakeNewsItems] = useState<NewsItem[]>([]);

  const [status, setStatus] = useState<GeneratorStatus>(GeneratorStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [newsStyle, setNewsStyle] = useState<NewsStyle>('FAKE');

  // Computed current items based on style
  const newsItems = newsStyle === 'REAL' ? realNewsItems : fakeNewsItems;
  const setNewsItems = newsStyle === 'REAL' ? setRealNewsItems : setFakeNewsItems;

  const [currentStage, setCurrentStage] = useState<Stage>('SCRIPT');

  const [reveApiKey, setReveApiKey] = useState('');
  const [ai33ApiKey, setAi33ApiKey] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [anthropicApiKey, setAnthropicApiKey] = useState('');
  const [openaiApiKey, setOpenaiApiKey] = useState('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');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [loadingImages, setLoadingImages] = useState<{ [index: number]: boolean }>({});
  const [loadingAudios, setLoadingAudios] = useState<{ [index: number]: boolean }>({});



  const [globalAspectRatio, setGlobalAspectRatio] = useState<AspectRatio>('9:16');

  const [bulkImageCount, setBulkImageCount] = useState(3);
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  // Character limit for script generation
  const [characterLimit, setCharacterLimit] = useState(500);

  // AI Model selection
  const [aiModel, setAiModel] = useState<'gemini-2.0-flash-exp' | 'gemini-1.5-flash' | 'gemini-1.5-pro' | 'claude-sonnet-4' | 'gpt-3.5-turbo' | 'gpt-5-nano'>('gemini-1.5-flash');

  // Audio Provider selection: 'ai33' or 'puter' (ElevenLabs via Puter - FREE!)
  const [audioProvider, setAudioProvider] = useState<'ai33' | 'puter'>('puter');

  // Script editor state for visual lab
  const [sceneCount, setSceneCount] = useState(1);
  const [scriptContent, setScriptContent] = useState('');

  const [isVoiceGalleryOpen, setIsVoiceGalleryOpen] = useState(false);
  const [currentNewsIndexForVoice, setCurrentNewsIndexForVoice] = useState<number | null>(null);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [isLoadingVoices, setIsLoadingVoices] = useState(false);

  // Toast notifications
  const { toasts, showToast, removeToast } = useToast();

  // Project Manager
  const projectManager = useProjectManager();
  const [showProjectManager, setShowProjectManager] = useState(false);

  // Auto-save project cuando cambian datos importantes
  useEffect(() => {
    if (newsItems.length > 0 && projectManager.autoSaveEnabled) {
      const timer = setTimeout(() => {
        projectManager.saveProject({
          name: topic || 'Proyecto sin nombre',
          topic,
          newsStyle,
          newsItems,
          bgMusicUrl: null,
          musicConfig: { styleId: '', moodId: '', idea: '' },
        });
      }, 3000); // Auto-save después de 3 segundos de inactividad

      return () => clearTimeout(timer);
    }
  }, [newsItems, topic, newsStyle, projectManager]);

  useEffect(() => {
    const savedReveKey = localStorage.getItem('reve_api_key');
    const savedAi33Key = localStorage.getItem('ai33_api_key');
    const savedGeminiKey = localStorage.getItem('gemini_api_key');
    if (savedReveKey) setReveApiKey(savedReveKey);
    if (savedAi33Key) setAi33ApiKey(savedAi33Key);
    if (savedGeminiKey) setGeminiApiKey(savedGeminiKey);
  }, []);

  const saveApiKeys = (reveKey: string, ai33Key: string, geminiKey: string) => {
    setReveApiKey(reveKey);
    setAi33ApiKey(ai33Key);
    setGeminiApiKey(geminiKey);
    localStorage.setItem('reve_api_key', reveKey);
    localStorage.setItem('ai33_api_key', ai33Key);
    localStorage.setItem('gemini_api_key', geminiKey);
  };

  const handleGenerate = useCallback(async () => {
    if (!topic.trim()) return;

    // Validaciones
    if (aiModel === 'claude-sonnet-4' && !anthropicApiKey) {
      showToast('Error: Se requiere API Key de Anthropic para usar Claude', 'error');
      setStatus(GeneratorStatus.ERROR);
      setIsSettingsOpen(true); // Open settings to allow user to enter key
      return;
    }

    if (aiModel !== 'claude-sonnet-4' && aiModel !== 'gpt-5-nano' && aiModel !== 'gpt-3.5-turbo' && !geminiApiKey) {
      showToast('Error: Se requiere API Key de Gemini', 'error');
      setStatus(GeneratorStatus.ERROR);
      setIsSettingsOpen(true);
      return;
    }

    // GPT-5-nano via Puter is FREE! No API key needed
    if (aiModel === 'gpt-3.5-turbo' && !openaiApiKey) {
      showToast('Error: Se requiere API Key de OpenAI para GPT-3.5-turbo', 'error');
      setStatus(GeneratorStatus.ERROR);
      setIsSettingsOpen(true);
      return;
    }

    setError(null);
    setStatus(GeneratorStatus.LOADING);
    setNewsItems([]);
    setCurrentStage('SCRIPT');

    try {
      let items: NewsItem[];

      // Use Claude, OpenAI GPT, Puter AI (FREE!), or Gemini based on selected model
      if (aiModel === 'claude-sonnet-4') {
        items = await generateNewsWithClaude(topic, newsStyle, anthropicApiKey, characterLimit);
      } else if (aiModel === 'gpt-5-nano') {
        // GPT-5 nano via Puter - FREE! No API key needed! 🎉
        showToast('Generando con GPT-5 Nano (Puter) - ¡Gratis!', 'info');
        items = await generateNewsIdeasWithPuter(topic, newsStyle, characterLimit);
      } else if (aiModel === 'gpt-3.5-turbo') {
        items = await openaiService.generateNewsIdeas(topic, newsStyle, openaiApiKey, characterLimit, aiModel);
      } else {
        items = await generateNewsIdeas(topic, newsStyle, geminiApiKey, characterLimit, aiModel);
      }
      setNewsItems(items);
      setStatus(GeneratorStatus.SUCCESS);
      setBulkImageCount(items.length);
    } catch (e) {
      console.error(e);
      setError("La señal se ha perdido. El sistema no responde.");
      setStatus(GeneratorStatus.ERROR);
      const errorMessage = e instanceof Error ? e.message : 'Error desconocido';
      showToast(`Error: ${errorMessage}`, 'error');
    }
  }, [topic, newsStyle, geminiApiKey, anthropicApiKey, openaiApiKey, aiModel, characterLimit, showToast]);

  const handleGenerateImage = async (index: number, specificPrompt?: string): Promise<{ success: boolean; stopLoop: boolean }> => {
    const item = newsItems[index];
    if (!item) return { success: false, stopLoop: false };

    if (!reveApiKey) {
      setIsSettingsOpen(true);
      showToast("Por favor ingresa tu REVE API Key en la configuración.", 'warning');
      return { success: false, stopLoop: true };
    }

    setLoadingImages(prev => ({ ...prev, [index]: true }));

    try {
      const promptToUse = specificPrompt || item.imagePrompt || `${item.headline}. ${item.summary}`;
      const base64Image = await generateReveImage(promptToUse, reveApiKey, globalAspectRatio);

      setNewsItems(prevItems => {
        const newItems = [...prevItems];
        newItems[index] = {
          ...newItems[index],
          imageUrl: base64Image,
          aspectRatio: globalAspectRatio
        };
        if (specificPrompt) {
          newItems[index].imagePrompt = specificPrompt;
        }
        return newItems;
      });

      return { success: true, stopLoop: false };
    } catch (err: any) {
      const errorMessage = (err.message || '').toLowerCase();

      if (
        errorMessage.includes('401') ||
        errorMessage.includes('unauthorized') ||
        errorMessage.includes('budget') ||
        errorMessage.includes('credit') ||
        errorMessage.includes('funds')
      ) {
        showToast("⚠️ TUS CRÉDITOS SE HAN AGOTADO - Verifica tu REVE API Key.", 'error');
        setIsSettingsOpen(true);
        return { success: false, stopLoop: true };
      } else {
        if (errorMessage !== "api key missing") {
          showToast("Error generando imagen: " + err.message, 'error');
        }
        return { success: false, stopLoop: false };
      }
    } finally {
      setLoadingImages(prev => ({ ...prev, [index]: false }));
    }
  };

  const handleBulkGenerateImages = async () => {
    if (!reveApiKey) {
      setIsSettingsOpen(true);
      return;
    }

    setIsBulkGenerating(true);
    const limit = Math.min(bulkImageCount, newsItems.length);

    for (let i = 0; i < limit; i++) {
      if (!newsItems[i].imageUrl || newsItems[i].aspectRatio !== globalAspectRatio) {
        const result = await handleGenerateImage(i, newsItems[i].imagePrompt);
        if (result.stopLoop) {
          break;
        }
      }
    }
    setIsBulkGenerating(false);
  };

  const handleDownloadZip = async () => {
    // Filter only items with generated images
    const itemsWithImages = newsItems.filter(item => item.imageUrl);

    console.log('🔍 DEBUG ZIP - Total news items:', newsItems.length);
    console.log('🔍 DEBUG ZIP - Items with images:', itemsWithImages.length);
    console.log('🔍 DEBUG ZIP - Image URLs (first 100 chars):',
      itemsWithImages.map((item, idx) => ({
        index: idx,
        headline: item.headline.substring(0, 30),
        imageUrlPreview: item.imageUrl?.substring(0, 100)
      }))
    );

    if (itemsWithImages.length === 0) {
      showToast("No hay imágenes generadas para descargar.", 'warning');
      return;
    }

    setIsZipping(true);
    try {
      console.log('📦 Generando ZIP con', itemsWithImages.length, 'imágenes...');

      const zipBlob = await generateEnhancedZip(itemsWithImages, null, {
        includeAudio: false,
        includeMusic: false,
        includeMetadata: false,
        projectName: topic || 'Proyecto MAQUINA.NEWS',
        topic,
        newsStyle,
      });

      console.log('✅ ZIP generado. Tamaño:', zipBlob.size, 'bytes');

      // Generar un timestamp único para evitar caché
      const timestamp = Date.now();
      const safeTopicName = topic.replace(/[^a-z0-9]/gi, '_').substring(0, 30);
      const filename = `MAQUINA_Images_${safeTopicName}_${timestamp}.zip`;

      // Crear el enlace de descarga
      const url = window.URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;

      // Asegurar que el enlace se añade al DOM
      document.body.appendChild(a);

      console.log('💾 Iniciando descarga:', filename);

      // Forzar el click
      a.click();

      // Cleanup con un pequeño delay para asegurar la descarga
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        console.log('🧹 Limpieza completada');
      }, 100);

      showToast(`✓ ZIP con ${itemsWithImages.length} imágenes descargado!`, 'success');
    } catch (err) {
      console.error("❌ ZIP Error:", err);
      showToast("Error creando el archivo ZIP.", 'error');
    } finally {
      setIsZipping(false);
    }
  };

  const handleGenerateFromScript = async () => {
    if (!scriptContent.trim()) {
      showToast("Por favor escribe un guión primero.", 'warning');
      return;
    }

    if (sceneCount < 1 || sceneCount > 40) {
      showToast("La cantidad de escenas debe estar entre 1 y 40.", 'warning');
      return;
    }

    if (!geminiApiKey) {
      showToast("Se requiere Gemini API Key para procesar el guión.", 'warning');
      setIsSettingsOpen(true);
      return;
    }

    setStatus(GeneratorStatus.LOADING);
    setError(null);

    try {
      showToast(`Procesando guión en ${sceneCount} escenas...`, 'info');

      // Parse script into scenes using Gemini
      const scenes = await parseScriptIntoScenes(
        scriptContent,
        sceneCount,
        newsStyle,
        geminiApiKey
      );

      setNewsItems(scenes);
      setStatus(GeneratorStatus.SUCCESS);
      setCurrentStage('VISUAL');

      showToast(`✓ ${scenes.length} escenas generadas del guión!`, 'success');
    } catch (err: any) {
      console.error("Error parsing script:", err);
      setError("Error procesando el guión.");
      setStatus(GeneratorStatus.ERROR);
      showToast("Error al procesar el guión: " + err.message, 'error');
    }
  };

  const handleGenerateAllImagesFromScript = async () => {
    if (!reveApiKey) {
      showToast("Se requiere REVE API Key para generar imágenes.", 'warning');
      setIsSettingsOpen(true);
      return;
    }

    if (newsItems.length === 0) {
      showToast("No hay escenas para generar.", 'warning');
      return;
    }

    setIsBulkGenerating(true);
    let successCount = 0;

    for (let i = 0; i < newsItems.length; i++) {
      const item = newsItems[i];
      if (item.imagePrompt) {
        const result = await handleGenerateImage(i, item.imagePrompt);
        if (result.success) {
          successCount++;
        }
        if (result.stopLoop) {
          break;
        }
      }
    }

    setIsBulkGenerating(false);
    showToast(`✓ ${successCount} imágenes generadas!`, 'success');
  };

  const handleRegeneratePromptWithAI = async (index: number) => {
    if (!geminiApiKey) {
      showToast("Se requiere Gemini API Key para regenerar prompts.", 'warning');
      setIsSettingsOpen(true);
      return;
    }

    const item = newsItems[index];
    if (!item) return;

    try {
      showToast("Regenerando prompt con IA...", 'info');

      const newPrompt = await regenerateImagePrompt(
        item.imagePrompt || item.headline,
        item.summary,
        geminiApiKey
      );

      setNewsItems(prevItems => {
        const newItems = [...prevItems];
        newItems[index] = {
          ...newItems[index],
          imagePrompt: newPrompt
        };
        return newItems;
      });

      showToast("✓ Prompt regenerado con IA!", 'success');
    } catch (err: any) {
      console.error("Error regenerating prompt:", err);
      showToast("Error regenerando prompt: " + err.message, 'error');
    }
  };

  const handleDownloadSingleImage = (index: number) => {
    const item = newsItems[index];
    if (!item?.imageUrl) {
      showToast("Esta imagen aún no ha sido generada.", 'warning');
      return;
    }

    try {
      const link = document.createElement('a');
      link.href = item.imageUrl;
      link.download = `escena_${index + 1}_${item.headline.replace(/[^a-z0-9]/gi, '_')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast("✓ Imagen descargada!", 'success');
    } catch (err) {
      console.error("Error downloading image:", err);
      showToast("Error al descargar imagen.", 'error');
    }
  };

  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);

  const handleGenerateAudio = async (index: number, textToNarrate: string) => {
    const item = newsItems[index];
    if (!item || !item.selectedVoiceId) return;

    // Check API key only if using AI33
    if (audioProvider === 'ai33' && !ai33ApiKey) {
      showToast("Se requiere API Key de AI33. Cambia a Puter (gratis) o configura tu API key.", 'warning');
      setIsSettingsOpen(true);
      return;
    }

    setLoadingAudios(prev => ({ ...prev, [index]: true }));

    try {
      console.log("Starting audio generation for:", textToNarrate.substring(0, 50) + "...");

      let audioUrl: string;
      if (audioProvider === 'puter') {
        // Use Puter + ElevenLabs - FREE!
        showToast("Generando audio con ElevenLabs (Puter) - ¡Gratis!", 'info');
        audioUrl = await generateSpeechWithPuter(textToNarrate, item.selectedVoiceId);
      } else {
        // Use AI33
        audioUrl = await generateSpeech(textToNarrate, item.selectedVoiceId, ai33ApiKey);
      }

      console.log("Audio generated successfully:", audioUrl);

      // Update separate state to force render
      setCurrentAudioUrl(audioUrl);

      // Update main state
      setNewsItems(prevItems => {
        const newItems = [...prevItems];
        newItems[index] = {
          ...newItems[index],
          audioUrl: audioUrl,
          summary: textToNarrate
        };
        return newItems;
      });

      showToast(audioProvider === 'puter' ? "✓ Audio generado con ElevenLabs (GRATIS)" : "✓ Audio generado correctamente", 'success');

    } catch (err: any) {
      console.error("Error in handleGenerateAudio:", err);
      showToast("Error generando audio: " + err.message, 'error');
    } finally {
      setLoadingAudios(prev => ({ ...prev, [index]: false }));
    }
  };



  const handleBulkGenerateAudio = async () => {
    if (!ai33ApiKey) {
      setIsSettingsOpen(true);
      return;
    }
    for (let i = 0; i < newsItems.length; i++) {
      const item = newsItems[i];
      if (item.selectedVoiceId && !item.audioUrl) {
        await handleGenerateAudio(i, item.summary);
      }
    }
  };

  const openVoiceSelection = async (index: number) => {
    setCurrentNewsIndexForVoice(index);
    setIsVoiceGalleryOpen(true);

    if (voices.length === 0) {
      setIsLoadingVoices(true);
      try {
        if (audioProvider === 'puter') {
          // Load ElevenLabs voices from Puter (FREE!)
          const puterVoices = getPuterVoices();
          setVoices(puterVoices as any);
        } else {
          // Load AI33 voices
          if (!ai33ApiKey) {
            showToast("Se requiere AI33 Voice API Key. Cambia a Puter (gratis) o configura tu API key.", 'warning');
            setIsSettingsOpen(true);
            setIsVoiceGalleryOpen(false);
            return;
          }
          const fetchedVoices = await getVoiceClones(ai33ApiKey);
          setVoices(fetchedVoices);
        }
      } catch (err) {
        console.error(err);
        showToast("Error cargando voces. Verifica tu configuración.", 'error');
      } finally {
        setIsLoadingVoices(false);
      }
    }
  };

  const handleVoiceSelect = (voice: Voice) => {
    if (currentNewsIndexForVoice !== null) {
      setNewsItems(prev => {
        const newItems = [...prev];
        newItems[currentNewsIndexForVoice] = {
          ...newItems[currentNewsIndexForVoice],
          selectedVoiceId: voice.voice_id,
          audioUrl: undefined
        };
        return newItems;
      });
      setIsVoiceGalleryOpen(false);
    }
  };

  const handleCloneVoice = async (file: File) => {
    if (!ai33ApiKey) {
      showToast("API Key requerida", 'warning');
      return;
    }

    try {
      const result = await cloneVoice(file, ai33ApiKey);

      showToast("✓ Voz clonada exitosamente! ID: " + result.cloned_voice_id, 'success');
      const fetchedVoices = await getVoiceClones(ai33ApiKey);
      setVoices(fetchedVoices);
    } catch (err: any) {
      console.error(err);
      showToast("Error clonando voz: " + err.message, 'error');
    }
  };

  const handleUpdatePrompt = (index: number, newPrompt: string) => {
    setNewsItems(prevItems => {
      const newItems = [...prevItems];
      newItems[index] = {
        ...newItems[index],
        imagePrompt: newPrompt
      };
      return newItems;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleGenerate();
    }
  };

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onGenerate: () => {
      if (topic.trim() && status !== GeneratorStatus.LOADING) {
        handleGenerate();
      }
    },
    onBulkImages: () => {
      if (currentStage === 'VISUAL' && !isBulkGenerating) {
        handleBulkGenerateImages();
      }
    },
    onBulkAudio: () => {
      if (currentStage === 'AUDIO') {
        handleBulkGenerateAudio();
      }
    },
    onNextStage: () => {
      if (status === GeneratorStatus.SUCCESS) {
        if (currentStage === 'SCRIPT') setCurrentStage('AUDIO');
        else if (currentStage === 'AUDIO') setCurrentStage('VISUAL');
      }
    },
    onPrevStage: () => {
      if (status === GeneratorStatus.SUCCESS) {
        if (currentStage === 'VISUAL') setCurrentStage('AUDIO');
        else if (currentStage === 'AUDIO') setCurrentStage('SCRIPT');
      }
    },
  });

  const isReal = newsStyle === 'REAL';

  // Updated Colors: Emerald (Green) vs Red
  const neonPrimary = isReal ? 'text-emerald-400' : 'text-red-500';
  const neonBorder = isReal ? 'border-emerald-600' : 'border-red-600';
  const neonGlow = isReal ? 'shadow-[0_0_20px_rgba(16,185,129,0.5)]' : 'shadow-[0_0_20px_rgba(220,38,38,0.5)]';
  const neonBtn = isReal ? 'bg-emerald-700 hover:bg-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.6)]' : 'bg-red-700 hover:bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.6)]';

  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden font-inter" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0e1b 100%)' }}>
      <Background />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Theme Selector */}
      <ThemeSelector />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        reveApiKey={reveApiKey}
        ai33ApiKey={ai33ApiKey}
        geminiApiKey={geminiApiKey}
        anthropicApiKey={anthropicApiKey}
        onSave={(reve, ai33, gemini, anthropic) => {
          setReveApiKey(reve);
          setAi33ApiKey(ai33);
          setGeminiApiKey(gemini);
          setAnthropicApiKey(anthropic);
        }}
      />

      <VoiceGallery
        isOpen={isVoiceGalleryOpen}
        onClose={() => setIsVoiceGalleryOpen(false)}
        voices={voices}
        onSelectVoice={handleVoiceSelect}
        onCloneVoice={handleCloneVoice}
        isLoading={isLoadingVoices}
        style={newsStyle}
      />

      {/* Top Settings */}
      <div className="absolute top-6 left-6 z-50">
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="flex items-center gap-2 px-5 py-3 backdrop-blur-md rounded-full text-xs transition-all font-inter font-semibold tracking-wide magic-hover"
          style={{
            background: 'var(--theme-glass-bg)',
            border: '1px solid var(--theme-border)',
            color: 'var(--theme-text-primary)'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l-.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span>Settings</span>
        </button>

        <button
          onClick={() => setShowProjectManager(true)}
          className="flex items-center gap-2 px-5 py-3 backdrop-blur-md rounded-full text-xs transition-all font-inter font-semibold tracking-wide mt-2 magic-hover"
          style={{
            background: 'var(--theme-glass-bg)',
            border: '1px solid var(--theme-border)',
            color: 'var(--theme-text-primary)'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>History</span>
        </button>
      </div>

      {/* Project Manager Modal */}
      {showProjectManager && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="bg-black/50 p-4 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-xl font-cinzel font-bold text-white">Historial de Proyectos</h2>
              <button onClick={() => setShowProjectManager(false)} className="text-gray-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <ProjectManager
                projects={projectManager.savedProjects}
                onLoad={(id) => {
                  const proj = projectManager.loadProject(id);
                  if (proj) {
                    setTopic(proj.topic);
                    setNewsStyle(proj.newsStyle);
                    setNewsItems(proj.newsItems);
                    setStatus(GeneratorStatus.SUCCESS);
                    if (proj.newsItems.length > 0) {
                      setCurrentStage('SCRIPT');
                    }
                    setShowProjectManager(false);
                    showToast(`Proyecto "${proj.name}" cargado`, 'success');
                  }
                }}
                onDelete={projectManager.deleteProject}
                onExport={projectManager.exportProject}
                onImport={projectManager.importProject}
                onNew={() => {
                  projectManager.newProject();
                  setTopic('');
                  setNewsItems([]);
                  setStatus(GeneratorStatus.IDLE);
                  setShowProjectManager(false);
                }}
                currentProjectId={projectManager.currentProjectId}
                isReal={isReal}
              />
            </div>
          </div>
        </div>
      )}

      {/* Visual Lab Mode - Full Screen */}
      {currentStage === 'VISUAL' ? (
        <div className="flex-grow flex flex-col w-full min-h-screen relative z-10 pt-20">
          {/* Back Button */}
          <div className="w-full max-w-[1600px] mx-auto px-4 mb-8">
            <button
              onClick={() => setCurrentStage('SCRIPT')}
              className="px-6 py-3 rounded-full text-xs font-montserrat font-bold tracking-widest transition-all duration-300 hover-lift"
              style={{
                background: 'rgba(0, 0, 0, 0.5)',
                color: 'var(--theme-primary-to)',
                border: '1px solid var(--theme-primary-from)',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)',
                textShadow: '1px 1px 2px #000000'
              }}
            >
              ← VOLVER AL INICIO
            </button>
          </div>

          {/* Visual Stage Full Screen */}
          <div className="w-full max-w-[1600px] mx-auto px-4">
            <VisualStage
              newsItems={newsItems}
              isReal={isReal}
              handleGenerateImage={handleGenerateImage}
              loadingImages={loadingImages}
              globalAspectRatio={globalAspectRatio}
              setGlobalAspectRatio={setGlobalAspectRatio}
              bulkImageCount={bulkImageCount}
              setBulkImageCount={setBulkImageCount}
              handleBulkGenerateImages={handleBulkGenerateImages}
              isBulkGenerating={isBulkGenerating}
              handleDownloadZip={handleDownloadZip}
              isZipping={isZipping}
              onUpdatePrompt={handleUpdatePrompt}
              sceneCount={sceneCount}
              setSceneCount={setSceneCount}
              scriptContent={scriptContent}
              setScriptContent={setScriptContent}
              onGenerateFromScript={handleGenerateFromScript}
              isGeneratingFromScript={status === GeneratorStatus.LOADING && scriptContent.trim().length > 0}
              onGenerateAllImages={handleGenerateAllImagesFromScript}
              onRegeneratePromptWithAI={handleRegeneratePromptWithAI}
              onDownloadSingleImage={handleDownloadSingleImage}
              hideScriptInput={false}
            />
          </div>
        </div>
      ) : (
        // Main Interface
        <div className="flex-grow flex flex-col items-center justify-center w-full max-w-[1600px] mx-auto px-4 py-12 relative z-10">

          {/* Header */}
          <header className="text-center mb-16 animate-smooth-fade-in">
            <h1 className="text-7xl md:text-9xl font-orbitron font-black mb-6 glitch-hover cursor-default select-none" style={{
              background: 'linear-gradient(90deg, var(--theme-primary-from) 0%, var(--theme-primary-to) 50%, var(--theme-primary-from) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              WebkitTextStroke: '2px #000000',
              backgroundSize: '200% auto',
              animation: 'gradient-shift 3s linear infinite'
            }}>
              Máquina<span style={{
                background: 'linear-gradient(90deg, var(--theme-secondary-from) 0%, var(--theme-secondary-to) 50%, var(--theme-secondary-from) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                WebkitTextStroke: '2px #000000',
                backgroundSize: '200% auto',
                animation: 'gradient-shift 3s linear infinite'
              }}>.News</span>
            </h1>
            <p className="text-lg font-inter font-medium tracking-wide" style={{
              color: 'var(--theme-primary-to)',
              textShadow: '1px 1px 2px #000000'
            }}>
              Create Stunning Storyboards with AI in Seconds
            </p>
          </header>

          {/* Generator */}
          <div className={`w-full max-w-3xl transition-all duration-500 ${status !== GeneratorStatus.SUCCESS ? 'scale-100' : 'scale-95 opacity-80'}`}>

            {/* Character Limit Selector - Dropdown */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                <select
                  value={characterLimit}
                  onChange={(e) => setCharacterLimit(Number(e.target.value))}
                  className="px-6 py-3 rounded-full text-xs font-montserrat font-bold tracking-widest cursor-pointer appearance-none pr-10"
                  style={{
                    background: isReal
                      ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.3))'
                      : 'linear-gradient(135deg, rgba(220, 38, 38, 0.2), rgba(185, 28, 28, 0.3))',
                    color: isReal ? '#34d399' : '#ef4444',
                    border: `1px solid ${isReal ? '#10b981' : '#dc2626'}`,
                    boxShadow: isReal
                      ? '0 0 20px rgba(16, 185, 129, 0.3)'
                      : '0 0 20px rgba(220, 38, 38, 0.3)'
                  }}
                >
                  <option value={100} style={{ background: '#1a1a2e', color: '#ffffff' }}>100 CARACTERES</option>
                  <option value={500} style={{ background: '#1a1a2e', color: '#ffffff' }}>500 CARACTERES</option>
                  <option value={1000} style={{ background: '#1a1a2e', color: '#ffffff' }}>1000 CARACTERES</option>
                  <option value={1050} style={{ background: '#1a1a2e', color: '#ffffff' }}>1050 CARACTERES</option>
                  <option value={1100} style={{ background: '#1a1a2e', color: '#ffffff' }}>1100 CARACTERES</option>
                  <option value={1400} style={{ background: '#1a1a2e', color: '#ffffff' }}>1400 CARACTERES</option>
                </select>
                {/* Arrow icon */}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                    <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
            </div>

            {/* AI Model Selector - Dropdown */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                <select
                  value={aiModel}
                  onChange={(e) => setAiModel(e.target.value as any)}
                  className="px-6 py-3 rounded-full text-xs font-montserrat font-bold tracking-widest cursor-pointer appearance-none pr-10"
                  style={{
                    background: isReal
                      ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.3))'
                      : 'linear-gradient(135deg, rgba(220, 38, 38, 0.2), rgba(185, 28, 28, 0.3))',
                    color: isReal ? '#34d399' : '#ef4444',
                    border: `1px solid ${isReal ? '#10b981' : '#dc2626'}`,
                    boxShadow: isReal
                      ? '0 0 20px rgba(16, 185, 129, 0.3)'
                      : '0 0 20px rgba(220, 38, 38, 0.3)'
                  }}
                >
                  <option value="gemini-1.5-flash" style={{ background: '#1a1a2e', color: '#ffffff' }}>FLASH 1.5 (RECOMENDADO)</option>
                  <option value="gemini-1.5-pro" style={{ background: '#1a1a2e', color: '#ffffff' }}>PRO 1.5</option>
                  <option value="gemini-2.0-flash-exp" style={{ background: '#1a1a2e', color: '#ffffff' }}>GEMINI 2.0 (EXP)</option>
                  <option value="claude-sonnet-4" style={{ background: '#1a1a2e', color: '#ffffff' }}>CLAUDE 3.5</option>
                </select>
                {/* Arrow icon */}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                    <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex justify-center items-center gap-6 mb-8">
              <div
                className="relative flex bg-black/40 border border-white/10 p-1 rounded-full shadow-2xl backdrop-blur-md cursor-pointer overflow-hidden group"
                onClick={() => setNewsStyle(isReal ? 'FAKE' : 'REAL')}
              >
                {/* Sliding Background */}
                <div
                  className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) ${isReal
                    ? 'left-1 bg-emerald-950/80 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                    : 'left-[calc(50%+4px)] bg-red-950/80 border border-red-500/30 shadow-[0_0_20px_rgba(220,38,38,0.2)]'
                    }`}
                ></div>

                {/* Text Labels */}
                <div className={`relative z-10 px-10 py-3 text-xs font-montserrat font-bold tracking-[0.2em] transition-colors duration-300 flex items-center gap-2 ${isReal ? 'text-emerald-400' : 'text-gray-500 group-hover:text-gray-400'}`}>
                  <span className={isReal ? 'opacity-100' : 'opacity-50'}>REALIDAD</span>
                </div>
                <div className={`relative z-10 px-10 py-3 text-xs font-montserrat font-bold tracking-[0.2em] transition-colors duration-300 flex items-center gap-2 ${!isReal ? 'text-red-500' : 'text-gray-500 group-hover:text-gray-400'}`}>
                  <span className={!isReal ? 'opacity-100' : 'opacity-50'}>CONSPIRACIÓN</span>
                </div>
              </div>

              {/* Quick Images Button */}
              <button
                onClick={() => setCurrentStage('VISUAL')}
                className="px-6 py-3 rounded-full text-xs font-montserrat font-bold tracking-widest transition-all duration-300 hover-lift"
                style={{
                  background: 'linear-gradient(135deg, var(--theme-primary-from), var(--theme-primary-to))',
                  color: '#FFFFFF',
                  border: '1px solid var(--theme-primary-from)',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)',
                  textShadow: '1px 1px 2px #000000'
                }}
              >
                🎨 GENERAR IMÁGENES
              </button>
            </div>

            <div className="perspective-container">
              <div className={`relative group smooth-transition ${status === GeneratorStatus.LOADING ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="absolute -inset-1 rounded-2xl blur-xl opacity-40 group-hover:opacity-70 smooth-transition" style={{
                  background: `linear-gradient(135deg, var(--theme-primary-from), var(--theme-primary-to))`
                }}></div>

                <div className="relative flex items-center backdrop-blur-xl rounded-2xl border-2 p-8 gap-6 smooth-transition" style={{
                  background: 'var(--theme-glass-bg)',
                  borderColor: 'var(--theme-primary-from)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}>
                  <input
                    type="text"
                    value={topic}
                    autoFocus
                    onChange={(e) => setTopic(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Describe your scene or paste your script here..."
                    className="flex-grow bg-transparent font-inter font-normal text-lg px-6 py-3 focus:outline-none"
                    style={{
                      color: 'var(--theme-text-primary)',
                      caretColor: 'var(--theme-primary-to)'
                    }}
                  />
                  <button
                    onClick={handleGenerate}
                    disabled={status === GeneratorStatus.LOADING || !topic.trim()}
                    className="px-10 py-4 rounded-xl font-bold text-white font-inter text-base transition-all duration-300"
                    style={{
                      background: status === GeneratorStatus.LOADING
                        ? 'rgba(100, 100, 100, 0.5)'
                        : 'linear-gradient(135deg, var(--theme-primary-from) 0%, var(--theme-primary-to) 100%)',
                      boxShadow: status === GeneratorStatus.LOADING
                        ? 'none'
                        : '0 4px 15px rgba(0, 0, 0, 0.4)',
                      cursor: status === GeneratorStatus.LOADING ? 'not-allowed' : 'pointer',
                      transform: status === GeneratorStatus.LOADING ? 'none' : 'translateY(0)',
                      textShadow: '1px 1px 3px #000000'
                    }}
                    onMouseEnter={(e) => {
                      if (status !== GeneratorStatus.LOADING && topic.trim()) {
                        e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 6px 25px rgba(0, 0, 0, 0.5)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      e.currentTarget.style.boxShadow = status === GeneratorStatus.LOADING ? 'none' : '0 4px 15px rgba(0, 0, 0, 0.4)';
                    }}
                  >
                    {status === GeneratorStatus.LOADING ? 'GENERATING...' : 'GENERATE'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          {status === GeneratorStatus.SUCCESS && newsItems.length > 0 && (
            <div className="w-full max-w-4xl mt-12 mb-8 animate-smooth-fade-in">
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setCurrentStage('SCRIPT')}
                  className={`px-6 py-3 border-b-2 text-xs font-montserrat font-bold uppercase tracking-widest smooth-transition ${currentStage === 'SCRIPT' ? (isReal ? 'border-emerald-500 text-emerald-400' : 'border-red-500 text-red-500') : 'border-transparent text-gray-600 hover:text-gray-400 hover:border-gray-700'}`}
                >
                  01 // GUIÓN ({newsItems.length})
                </button>
                <button
                  onClick={() => setCurrentStage('AUDIO')}
                  className={`px-6 py-3 border-b-2 text-xs font-montserrat font-bold uppercase tracking-widest smooth-transition ${currentStage === 'AUDIO' ? (isReal ? 'border-emerald-500 text-emerald-400' : 'border-red-500 text-red-500') : 'border-transparent text-gray-600 hover:text-gray-400 hover:border-gray-700'}`}
                >
                  02 // ESTUDIO DE AUDIO
                </button>
                <button
                  onClick={() => setCurrentStage('VISUAL')}
                  className={`px-6 py-3 border-b-2 text-xs font-montserrat font-bold uppercase tracking-widest smooth-transition ${currentStage === 'VISUAL' ? (isReal ? 'border-emerald-500 text-emerald-400' : 'border-red-500 text-red-500') : 'border-transparent text-gray-600 hover:text-gray-400 hover:border-gray-700'}`}
                >
                  03 // LABORATORIO VISUAL
                </button>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="w-full max-w-5xl flex flex-col items-center">

            {/* STAGE 1 - GUIÓN COMPLETO EDITABLE */}
            {status === GeneratorStatus.SUCCESS && newsItems.length > 0 && currentStage === 'SCRIPT' && (
              <>
                <ScriptStage
                  newsItems={newsItems}
                  isReal={isReal}
                  onRegenerate={handleGenerate}
                  isRegenerating={status === GeneratorStatus.LOADING}
                />

                <div className="w-full h-12 flex items-center justify-center">
                  <div className={`h-px w-full max-w-xs ${isReal ? 'bg-emerald-900' : 'bg-red-900'}`}></div>
                </div>

                <VisualStage
                  newsItems={newsItems}
                  isReal={isReal}
                  handleGenerateImage={handleGenerateImage}
                  loadingImages={loadingImages}
                  globalAspectRatio={globalAspectRatio}
                  setGlobalAspectRatio={setGlobalAspectRatio}
                  bulkImageCount={bulkImageCount}
                  setBulkImageCount={setBulkImageCount}
                  handleBulkGenerateImages={handleBulkGenerateImages}
                  isBulkGenerating={isBulkGenerating}
                  handleDownloadZip={handleDownloadZip}
                  isZipping={isZipping}
                  onUpdatePrompt={handleUpdatePrompt}
                  sceneCount={sceneCount}
                  setSceneCount={setSceneCount}
                  scriptContent={scriptContent}
                  setScriptContent={setScriptContent}
                  onGenerateFromScript={handleGenerateFromScript}
                  isGeneratingFromScript={status === GeneratorStatus.LOADING && scriptContent.trim().length > 0}
                  onGenerateAllImages={handleGenerateAllImagesFromScript}
                  onRegeneratePromptWithAI={handleRegeneratePromptWithAI}
                  onDownloadSingleImage={handleDownloadSingleImage}
                  hideScriptInput={true}
                />
              </>
            )}


            {/* STAGE 2 - ESTUDIO DE AUDIO SIMPLE */}
            {status === GeneratorStatus.SUCCESS && newsItems.length > 0 && currentStage === 'AUDIO' && (
              <AudioStage
                newsItems={newsItems}
                currentAudioUrl={currentAudioUrl}
                handleGenerateAudio={handleGenerateAudio}
                loadingAudios={loadingAudios}
                isReal={isReal}
                openVoiceSelection={openVoiceSelection}
                audioProvider={audioProvider}
                onAudioProviderChange={setAudioProvider}
              />
            )}

            {/* STAGE 3 */}
            {status === GeneratorStatus.SUCCESS && newsItems.length > 0 && currentStage === 'VISUAL' && (
              <VisualStage
                newsItems={newsItems}
                isReal={isReal}
                handleGenerateImage={handleGenerateImage}
                loadingImages={loadingImages}
                globalAspectRatio={globalAspectRatio}
                setGlobalAspectRatio={setGlobalAspectRatio}
                bulkImageCount={bulkImageCount}
                setBulkImageCount={setBulkImageCount}
                handleBulkGenerateImages={handleBulkGenerateImages}
                isBulkGenerating={isBulkGenerating}
                handleDownloadZip={handleDownloadZip}
                isZipping={isZipping}
                onUpdatePrompt={handleUpdatePrompt}
                sceneCount={sceneCount}
                setSceneCount={setSceneCount}
                scriptContent={scriptContent}
                setScriptContent={setScriptContent}
                onGenerateFromScript={handleGenerateFromScript}
                isGeneratingFromScript={status === GeneratorStatus.LOADING && scriptContent.trim().length > 0}
                onGenerateAllImages={handleGenerateAllImagesFromScript}
                onRegeneratePromptWithAI={handleRegeneratePromptWithAI}
                onDownloadSingleImage={handleDownloadSingleImage}
              />
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default App;