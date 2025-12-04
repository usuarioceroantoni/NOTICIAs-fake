import { NewsItem, NewsStyle } from "../types";

/**
 * Declare Puter global object from the Puter SDK
 */
declare global {
    interface Window {
        puter: {
            auth: {
                signIn: (options?: any) => Promise<any>;
                signOut: () => Promise<void>;
                isSignedIn: () => boolean;
                getUser: () => Promise<any>;
                getMonthlyUsage: () => Promise<any>;
            };
            ai: {
                chat: (prompt: string, options?: { model?: string }) => Promise<string>;
                txt2speech: (text: string, options?: {
                    provider?: string;
                    model?: string;
                    voice?: string;
                    output_format?: string;
                }) => Promise<HTMLAudioElement>;
            };
        };
    }
}

/**
 * Check if user is signed in to Puter
 */
export const isPuterSignedIn = (): boolean => {
    if (typeof window === 'undefined' || !window.puter) {
        return false;
    }
    try {
        return window.puter.auth.isSignedIn();
    } catch (error) {
        console.error("Error checking Puter sign-in status:", error);
        return false;
    }
};

/**
 * Sign in to Puter
 * IMPORTANT: Must be called from a user action (button click)
 */
export const signInToPuter = async (): Promise<any> => {
    if (typeof window === 'undefined' || !window.puter) {
        throw new Error("Puter SDK no está disponible. Asegúrate de que el script esté cargado.");
    }

    try {
        console.log("Iniciando sesión en Puter...");
        const result = await window.puter.auth.signIn();
        console.log("✅ Sesión iniciada en Puter:", result);
        return result;
    } catch (error) {
        console.error("Error signing in to Puter:", error);
        throw new Error(`Error al iniciar sesión en Puter: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
};

/**
 * Sign out from Puter
 */
export const signOutFromPuter = async (): Promise<void> => {
    if (typeof window === 'undefined' || !window.puter) {
        throw new Error("Puter SDK no está disponible.");
    }

    try {
        await window.puter.auth.signOut();
        console.log("✅ Sesión cerrada en Puter");
    } catch (error) {
        console.error("Error signing out from Puter:", error);
        throw error;
    }
};

/**
 * Get current Puter user info
 */
export const getPuterUser = async (): Promise<any> => {
    if (typeof window === 'undefined' || !window.puter) return null;
    try {
        return await window.puter.auth.getUser();
    } catch (error) {
        console.error("Error getting Puter user:", error);
        return null;
    }
};

/**
 * Get Puter monthly usage stats
 */
export const getPuterUsage = async (): Promise<any> => {
    if (typeof window === 'undefined' || !window.puter) return null;
    try {
        return await window.puter.auth.getMonthlyUsage();
    } catch (error) {
        console.error("Error getting Puter usage:", error);
        return null;
    }
};

/**
 * Helper to ensure user is signed in before making AI calls
 */
async function ensurePuterAuth(): Promise<void> {
    if (!isPuterSignedIn()) {
        throw new Error("⚠️ Debes iniciar sesión en Puter primero. Haz clic en el botón 'Sign in to Puter' en la configuración.");
    }
}

/**
 * Helper to call Puter AI (GPT-5 nano)
 * This is FREE and doesn't require an API key!
 */
async function callPuterAI(prompt: string): Promise<string> {
    if (typeof window === 'undefined' || !window.puter) {
        throw new Error("Puter SDK no está disponible. Asegúrate de que el script esté cargado.");
    }

    await ensurePuterAuth();

    try {
        // Add a 60s timeout to prevent infinite loading
        const timeoutPromise = new Promise<string>((_, reject) =>
            setTimeout(() => reject(new Error("Puter tardó demasiado en responder (timeout 60s). Intenta de nuevo o usa Gemini Flash.")), 60000)
        );

        const chatPromise = window.puter.ai.chat(prompt, { model: "gpt-5-nano" });

        const response = await Promise.race([chatPromise, timeoutPromise]);
        return typeof response === 'string' ? response : JSON.stringify(response);
    } catch (error) {
        console.error("Error calling Puter AI:", error);
        throw new Error(`Error al llamar a Puter AI: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
}

/**
 * Generate news ideas using Puter AI (GPT-5 nano)
 * This is FREE - no API key required!
 */
export const generateNewsIdeasWithPuter = async (
    topic: string,
    style: NewsStyle,
    characterLimit: number = 1050
): Promise<NewsItem[]> => {
    let systemInstruction = "";
    let promptContext = "";

    if (style === "REAL") {
        systemInstruction = `Eres un productor de noticieros virales de alto impacto (Estilo Colglobal). Tu objetivo es crear guiones informativos de EXACTAMENTE ${characterLimit} caracteres. El tono es serio, urgente y periodístico. IMPORTANTE: La narración debe tener EXACTAMENTE ${characterLimit} caracteres.`;
        promptContext = `
      Tema del Reportaje: "${topic}".

      Genera EXACTAMENTE 3 ESCENAS que formen una narrativa continua periodística.

      FORMATO OBLIGATORIO PARA EL CAMPO 'summary' (NARRACIÓN):

      La narración debe seguir esta estructura y tener EXACTAMENTE ${characterLimit} CARACTERES:

      1. APERTURA IMPACTANTE (80-100 caracteres):
         - DEBE EMPEZAR OBLIGATORIAMENTE CON: "ÚLTIMA HORA.) ¡INFORMACIÓN CONFIRMADA!"
         - Titular periodístico directo a continuación

      2. CONTEXTO INMEDIATO (150-200 caracteres):
         - Responde Qué, Quién, Cuándo y Dónde
         - Cita fuentes oficiales o documentos
         - "Según informes oficiales de [ORGANISMO]..."

      3. DESARROLLO DE LOS HECHOS (400-500 caracteres):
         - "Los datos revelan una situación crítica:"
         - Lista 3-4 puntos clave de la noticia
         - Usa cifras, porcentajes y datos duros
         - Lenguaje técnico pero accesible

      4. DECLARACIÓN OFICIAL (100-150 caracteres):
         - Cita textual de una autoridad
         - Ejemplo: "El portavoz declaró: '[CITA]'"
         - Seguido de la reacción inmediata

      5. IMPLICACIONES DIRECTAS (200-250 caracteres):
         - "Esto impactará directamente en..."
         - Consecuencias económicas, sociales o políticas
         - Medidas que se están tomando

      6. PROYECCIÓN FINAL (100-150 caracteres):
         - "Se espera que en las próximas horas..."
         - Cierre con expectativa de actualización
         - Sin despedidas, mantener el ritmo noticioso

      REGLAS ESTRICTAS:
      - El campo 'summary' debe tener EXACTAMENTE ${characterLimit} caracteres (cuenta espacios y puntuación)
      - NO incluyas emojis, etiquetas ni conteos en el campo summary
      - Mantén el tono serio y profesional
      - NO uses despedidas ni cierres formales

      ESTRUCTURA DE CADA ESCENA:
      1. headline: Título slug-format en minúsculas con guiones
      2. summary: NARRACIÓN DE EXACTAMENTE ${characterLimit} CARACTERES
      3. imagePrompt: Visual en inglés estilo 'photojournalism', '4k', 'news broadcast'
      4. impactLevel: "Viral" o "Alto"
      5. category: categoría temática
      6. hashtag: hashtag relevante
    `;
    } else {
        systemInstruction = `Eres un creador de contenido conspirativo viral estilo ÚLTIMA HORA. Tu tarea es crear narraciones dramáticas de EXACTAMENTE ${characterLimit} caracteres. El tono es urgente, alarmista y revelador. IMPORTANTE: La narración debe tener EXACTAMENTE ${characterLimit} caracteres, ni uno más ni uno menos.`;
        promptContext = `
      Tema de la Conspiración: "${topic}".

      Genera EXACTAMENTE 3 ESCENAS que formen una narrativa continua de conspiración.

      FORMATO OBLIGATORIO PARA EL CAMPO 'summary' (NARRACIÓN):

      La narración debe seguir esta estructura y tener EXACTAMENTE ${characterLimit} CARACTERES:

      1. APERTURA DRAMÁTICA (80-100 caracteres):
         - DEBE EMPEZAR OBLIGATORIAMENTE CON: "ÚLTIMA HORA.) ¡EL DESASTRE YA EMPEZÓ!"
         - Gancho impactante e inmediato a continuación

      2. INTRODUCCIÓN DEL MISTERIO (150-200 caracteres):
         - Presenta el descubrimiento/revelación principal
         - Menciona el protagonista/fuente si aplica
         - Usa frases como "acaba de realizar el descubrimiento más misterioso"

      3. DETALLES ESCALOFRIANTES (400-500 caracteres):
         - "Descubre los detalles escalofriantes que [AUTORIDAD] intentó ocultar:"
         - Lista 3-4 puntos específicos de evidencia
         - Usa estructuras paralelas y datos concretos
         - Términos como "estructuras gigantescas", "marcas que se iluminaban", "figuras humanoides"

      4. DECLARACIÓN IMPACTANTE (100-150 caracteres):
         - Cita textual dramática entre comillas
         - Ejemplo: "Esto no es [X] vacío. Esto es [Y] y está vivo"
         - Seguido de consecuencia: "antes de que la señal sufriera interferencias"

      5. ADVERTENCIA VITAL (200-250 caracteres):
         - "Advertencia vital de seguridad: Es imprescindible, es urgente..."
         - Conecta con protección familiar/personal
         - Menciona el sacrificio o peligro

      6. PREGUNTA EXISTENCIAL FINAL (100-150 caracteres):
         - "Pregúntate: ¿Qué verdad es tan peligrosa..."
         - Cierre abierto que genera reflexión
         - Sin punto final para mantener tensión

      REGLAS ESTRICTAS:
      - El campo 'summary' debe tener EXACTAMENTE ${characterLimit} caracteres (cuenta espacios y puntuación)
      - NO incluyas emojis, etiquetas ni conteos en el campo summary
      - Usa negritas mentales (palabras impactantes) pero escríbelas normal
      - Mantén el tono urgente y conspirativo
      - NO uses despedidas ni cierres formales

      ESTRUCTURA DE CADA ESCENA:
      1. headline: Título slug-format en minúsculas con guiones
      2. summary: NARRACIÓN DE EXACTAMENTE ${characterLimit} CARACTERES
      3. imagePrompt: Visual en inglés estilo 'leaked document', 'classified footage', 'night vision'
      4. impactLevel: "Viral" o "Cataclísmico"
      5. category: categoría temática
      6. hashtag: hashtag relevante
    `;
    }

    const prompt = `
    ${systemInstruction}
    
    ${promptContext}
    
    Devuelve UN ARRAY JSON con exactamente 3 objetos. Asegúrate de completar la historia en estas 3 escenas.
    RESPONDE ÚNICAMENTE CON EL ARRAY JSON VÁLIDO. NO ESCRIBAS NADA MÁS.
  `;

    const text = await callPuterAI(prompt);
    console.log("Puter AI raw response:", text.substring(0, 200) + "...");

    // Robust JSON extraction
    const firstBracket = text.indexOf('[');
    const lastBracket = text.lastIndexOf(']');

    if (firstBracket === -1 || lastBracket === -1) {
        console.error("Full response text:", text);
        throw new Error(`No se encontró un array JSON válido en la respuesta de Puter AI. La respuesta comienza con: "${text.substring(0, 100)}"`);
    }

    const jsonString = text.substring(firstBracket, lastBracket + 1);

    try {
        const items = JSON.parse(jsonString) as NewsItem[];

        if (!Array.isArray(items) || items.length === 0) {
            throw new Error("La respuesta JSON de Puter AI no contiene elementos válidos");
        }

        console.log(`Puter AI (GPT-5 nano) generó ${items.length} escenas exitosamente - ¡GRATIS!`);
        return items.map(item => ({ ...item, style }));
    } catch (e) {
        console.error("JSON Parse Error:", e);
        console.error("Attempted to parse:", jsonString.substring(0, 500));
        throw new Error(`Error al parsear JSON de Puter AI: ${e instanceof Error ? e.message : 'Error desconocido'}`);
    }
};

/**
 * Parse a script into scenes using Puter AI
 */
export const parseScriptIntoScenesWithPuter = async (
    script: string,
    sceneCount: number,
    style: NewsStyle
): Promise<NewsItem[]> => {
    const systemInstruction = `Eres un experto en dividir guiones en escenas visuales. Tu tarea es tomar un guión y dividirlo en exactamente ${sceneCount} escenas, respetando la narrativa y extrayendo prompts visuales precisos para cada escena.`;

    const prompt = `
    ${systemInstruction}
    
    Tengo el siguiente guión que necesito dividir en EXACTAMENTE ${sceneCount} escenas:
    "${script}"
    
    TAREA:
    1. Divide el guión en ${sceneCount} escenas de manera equitativa y coherente
    2. Para cada escena, extrae:
       - headline: Un título descriptivo corto en formato slug (ej: "escena-1-apertura")
       - summary: El texto correspondiente a esa parte del guión (porción del texto original)
       - imagePrompt: Un prompt detallado en INGLÉS para generar una imagen que represente visualmente esa escena
       - impactLevel: "Medio" por defecto
       - category: La categoría temática
       - hashtag: Un hashtag relevante
    
    IMPORTANTE:
    - Debes generar EXACTAMENTE ${sceneCount} escenas, ni una más ni una menos
    - El imagePrompt debe ser muy descriptivo y en inglés
    - Mantén el orden narrativo del guión original
    - Cada summary debe contener la porción correspondiente del guión
    - RESPONDE ÚNICAMENTE CON EL ARRAY JSON VÁLIDO. NO ESCRIBAS NADA MÁS ANTES NI DESPUÉS.
  `;

    const text = await callPuterAI(prompt);
    console.log("Puter AI raw response (parseScript):", text.substring(0, 200) + "...");

    const firstBracket = text.indexOf('[');
    const lastBracket = text.lastIndexOf(']');

    if (firstBracket === -1 || lastBracket === -1) {
        console.error("Full response text:", text);
        throw new Error(`No se encontró un array JSON válido en la respuesta de Puter AI. La respuesta comienza con: "${text.substring(0, 100)}"`);
    }

    const jsonString = text.substring(firstBracket, lastBracket + 1);

    try {
        const items = JSON.parse(jsonString) as NewsItem[];

        if (!Array.isArray(items) || items.length === 0) {
            throw new Error("La respuesta JSON de Puter AI no contiene elementos válidos");
        }

        if (items.length !== sceneCount) {
            console.warn(`Se esperaban ${sceneCount} escenas pero se recibieron ${items.length}`);
        }

        return items.map(item => ({ ...item, style }));
    } catch (e) {
        console.error("JSON Parse Error:", e);
        console.error("Attempted to parse:", jsonString.substring(0, 500));
        throw new Error(`Error al parsear JSON de Puter AI: ${e instanceof Error ? e.message : 'Error desconocido'}`);
    }
};

/**
 * Regenerate an image prompt using Puter AI
 */
export const regenerateImagePromptWithPuter = async (
    currentPrompt: string,
    context: string
): Promise<string> => {
    const systemInstruction = "Eres un experto en crear prompts visuales detallados para generación de imágenes. Tu tarea es mejorar y optimizar prompts existentes.";

    const prompt = `
    ${systemInstruction}
    
    Tengo el siguiente prompt de imagen actual:
    "${currentPrompt}"
    
    Contexto de la escena:
    "${context}"
    
    TAREA:
    Mejora y optimiza este prompt para generar una imagen más impactante y visual.
    
    REGLAS:
    - El prompt debe estar en INGLÉS
    - Debe ser muy descriptivo y detallado
    - Incluye estilo visual, iluminación, composición
    - Usa términos como: "photorealistic", "cinematic", "dramatic lighting", "4k", "highly detailed"
    - Mantén la esencia del prompt original pero hazlo más potente
    - Máximo 200 palabras
    
    Devuelve SOLO el nuevo prompt mejorado, sin explicaciones adicionales.
  `;

    const text = await callPuterAI(prompt);
    const cleanedText = text.trim();

    if (!cleanedText) {
        throw new Error("No se pudo regenerar el prompt con Puter AI");
    }

    return cleanedText;
};

/**
 * Generate speech from text using ElevenLabs via Puter
 * This is FREE - no API key required!
 * 
 * Available voices:
 * - "21m00Tcm4TlvDq8ikWAM" - Rachel (female, English)
 * - "AZnzlk1XvdvUeBnXmlld" - Domi (female, English) 
 * - "EXAVITQu4vr4xnSDxMaL" - Bella (female, English)
 * - "ErXwobaYiN019PkySvjV" - Antoni (male, English)
 * - "MF3mGyEYCl7XYWbV9V6O" - Elli (female, English)
 * - "TxGEqnHWrfWFTfGW9XjX" - Josh (male, English)
 * - "VR6AewLTigWG4xSOukaG" - Arnold (male, English)
 * - "pNInz6obpgDQGcFmaJgB" - Adam (male, English)
 * - "yoZ06aMxZJJ28mfd3POQ" - Sam (male, English)
 */
export const generateSpeechWithPuter = async (
    text: string,
    voiceId: string = "21m00Tcm4TlvDq8ikWAM" // Default: Rachel
): Promise<string> => {
    if (typeof window === 'undefined' || !window.puter) {
        throw new Error("Puter SDK no está disponible. Asegúrate de que el script esté cargado.");
    }

    await ensurePuterAuth();

    try {
        console.log("Generando audio con ElevenLabs (Puter) - ¡GRATIS!", text.substring(0, 50) + "...");

        const audioElement = await window.puter.ai.txt2speech(text, {
            provider: "elevenlabs",
            model: "eleven_multilingual_v2",
            voice: voiceId,
            output_format: "mp3_44100_128"
        });

        // Convert HTMLAudioElement to base64 data URL
        return new Promise((resolve, reject) => {
            // The audio element already has the audio loaded
            const audioSrc = audioElement.src;

            if (audioSrc && audioSrc.startsWith('data:')) {
                // Already a data URL
                console.log("Audio generado exitosamente con ElevenLabs (Puter) - ¡GRATIS!");
                resolve(audioSrc);
            } else if (audioSrc && audioSrc.startsWith('blob:')) {
                // Convert blob to data URL
                fetch(audioSrc)
                    .then(response => response.blob())
                    .then(blob => {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            console.log("Audio generado exitosamente con ElevenLabs (Puter) - ¡GRATIS!");
                            resolve(reader.result as string);
                        };
                        reader.onerror = reject;
                        reader.readAsDataURL(blob);
                    })
                    .catch(reject);
            } else {
                reject(new Error("No se pudo obtener la URL del audio"));
            }
        });
    } catch (error) {
        console.error("Error generando audio con Puter:", error);
        throw new Error(`Error al generar audio con Puter: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
};

/**
 * Get list of available ElevenLabs voices through Puter
 * These are FREE to use!
 */
export const getPuterVoices = () => {
    return [
        {
            voice_id: "21m00Tcm4TlvDq8ikWAM",
            voice_name: "Rachel",
            gender: "Female",
            language: "English",
            isDefault: true,
            category: "american",
            description: "Calm, American, Professional",
            preview_url: "https://storage.googleapis.com/eleven-public-prod/premade/voices/21m00Tcm4TlvDq8ikWAM/6d93ee94-da67-46e6-9034-96efab13c8ed.mp3",
            sample_audio: "https://storage.googleapis.com/eleven-public-prod/premade/voices/21m00Tcm4TlvDq8ikWAM/6d93ee94-da67-46e6-9034-96efab13c8ed.mp3",
            cover_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rachel&backgroundColor=b6e3f4"
        },
        {
            voice_id: "AZnzlk1XvdvUeBnXmlld",
            voice_name: "Domi",
            gender: "Female",
            language: "English",
            isDefault: false,
            category: "american",
            description: "Strong, American, Narration",
            preview_url: "https://storage.googleapis.com/eleven-public-prod/premade/voices/AZnzlk1XvdvUeBnXmlld/69c5373f-0dc2-4efd-9232-2c43954dd87e.mp3",
            sample_audio: "https://storage.googleapis.com/eleven-public-prod/premade/voices/AZnzlk1XvdvUeBnXmlld/69c5373f-0dc2-4efd-9232-2c43954dd87e.mp3",
            cover_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Domi&backgroundColor=ffdfbf"
        },
        {
            voice_id: "EXAVITQu4vr4xnSDxMaL",
            voice_name: "Bella",
            gender: "Female",
            language: "English",
            isDefault: false,
            category: "american",
            description: "Soft, American, Conversational",
            preview_url: "https://storage.googleapis.com/eleven-public-prod/premade/voices/EXAVITQu4vr4xnSDxMaL/31c66256-b7cd-4762-a35b-25954eb46c9b.mp3",
            sample_audio: "https://storage.googleapis.com/eleven-public-prod/premade/voices/EXAVITQu4vr4xnSDxMaL/31c66256-b7cd-4762-a35b-25954eb46c9b.mp3",
            cover_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bella&backgroundColor=c0aede"
        },
        {
            voice_id: "ErXwobaYiN019PkySvjV",
            voice_name: "Antoni",
            gender: "Male",
            language: "English",
            isDefault: false,
            category: "american",
            description: "Deep, American, Promo",
            preview_url: "https://storage.googleapis.com/eleven-public-prod/premade/voices/ErXwobaYiN019PkySvjV/38d644ad-1984-4568-971d-99e3a50680e5.mp3",
            sample_audio: "https://storage.googleapis.com/eleven-public-prod/premade/voices/ErXwobaYiN019PkySvjV/38d644ad-1984-4568-971d-99e3a50680e5.mp3",
            cover_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Antoni&backgroundColor=d1d4f9"
        },
        {
            voice_id: "MF3mGyEYCl7XYWbV9V6O",
            voice_name: "Elli",
            gender: "Female",
            language: "English",
            isDefault: false,
            category: "american",
            description: "Young, American, Energetic",
            preview_url: "https://storage.googleapis.com/eleven-public-prod/premade/voices/MF3mGyEYCl7XYWbV9V6O/d8f57042-d055-4b8d-8063-9605301770bb.mp3",
            sample_audio: "https://storage.googleapis.com/eleven-public-prod/premade/voices/MF3mGyEYCl7XYWbV9V6O/d8f57042-d055-4b8d-8063-9605301770bb.mp3",
            cover_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elli&backgroundColor=ffd5dc"
        },
        {
            voice_id: "TxGEqnHWrfWFTfGW9XjX",
            voice_name: "Josh",
            gender: "Male",
            language: "English",
            isDefault: false,
            category: "american",
            description: "Deep, American, Storytelling",
            preview_url: "https://storage.googleapis.com/eleven-public-prod/premade/voices/TxGEqnHWrfWFTfGW9XjX/34060f30-2130-4135-98f8-7ca8bb1e9bca.mp3",
            sample_audio: "https://storage.googleapis.com/eleven-public-prod/premade/voices/TxGEqnHWrfWFTfGW9XjX/34060f30-2130-4135-98f8-7ca8bb1e9bca.mp3",
            cover_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Josh&backgroundColor=c0aede"
        },
        {
            voice_id: "VR6AewLTigWG4xSOukaG",
            voice_name: "Arnold",
            gender: "Male",
            language: "English",
            isDefault: false,
            category: "american",
            description: "Crisp, American, Narration",
            preview_url: "https://storage.googleapis.com/eleven-public-prod/premade/voices/VR6AewLTigWG4xSOukaG/166a617f-1337-4693-8a9d-296c87600395.mp3",
            sample_audio: "https://storage.googleapis.com/eleven-public-prod/premade/voices/VR6AewLTigWG4xSOukaG/166a617f-1337-4693-8a9d-296c87600395.mp3",
            cover_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arnold&backgroundColor=ffdfbf"
        },
        {
            voice_id: "pNInz6obpgDQGcFmaJgB",
            voice_name: "Adam",
            gender: "Male",
            language: "English",
            isDefault: false,
            category: "american",
            description: "Deep, American, News",
            preview_url: "https://storage.googleapis.com/eleven-public-prod/premade/voices/pNInz6obpgDQGcFmaJgB/5c41b8a9-4174-47a6-a44c-31f5a3b7d2e0.mp3",
            sample_audio: "https://storage.googleapis.com/eleven-public-prod/premade/voices/pNInz6obpgDQGcFmaJgB/5c41b8a9-4174-47a6-a44c-31f5a3b7d2e0.mp3",
            cover_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Adam&backgroundColor=d1d4f9"
        },
        {
            voice_id: "yoZ06aMxZJJ28mfd3POQ",
            voice_name: "Sam",
            gender: "Male",
            language: "English",
            isDefault: false,
            category: "american",
            description: "Raspy, American, Casual",
            preview_url: "https://storage.googleapis.com/eleven-public-prod/premade/voices/yoZ06aMxZJJ28mfd3POQ/1c4d417c-4562-4b1c-9333-26517819163e.mp3",
            sample_audio: "https://storage.googleapis.com/eleven-public-prod/premade/voices/yoZ06aMxZJJ28mfd3POQ/1c4d417c-4562-4b1c-9333-26517819163e.mp3",
            cover_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sam&backgroundColor=b6e3f4"
        },
    ];
};
