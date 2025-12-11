import { NewsItem, NewsStyle } from "../types";

/**
 * Helper to call Gemini model via REST API (v1).
 * Returns the raw JSON response from the model.
 */
async function callGemini(model: string, prompt: string, apiKey: string): Promise<any> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const body = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.text();

      // Handle quota exceeded error (429)
      if (response.status === 429) {
        throw new Error(
          `🚫 CUOTA DE GEMINI EXCEDIDA\n\n` +
          `Tu API key es válida pero alcanzaste el límite de uso.\n\n` +
          `✅ SOLUCIONES:\n` +
          `1. Espera unas horas (la cuota se resetea cada 24h)\n` +
          `2. Usa GPT-5 Nano GRATIS (sin límites) - Ya estás conectado como Antoni0355\n` +
          `3. Actualiza tu plan de Gemini en: https://aistudio.google.com/\n\n` +
          `💡 TIP: El modelo "gemini-1.5-flash" (gratuito) tiene mejor cuota que gemini-2.0`
        );
      }

      // Handle authentication errors (401, 403)
      if (response.status === 401 || response.status === 403) {
        throw new Error(
          `🔑 API KEY INVÁLIDA\n\n` +
          `Tu API key de Gemini no es válida o no tiene permisos.\n\n` +
          `✅ SOLUCIÓN:\n` +
          `Verifica tu API key en: https://aistudio.google.com/app/apikey`
        );
      }

      // Other errors
      throw new Error(`❌ Error de Gemini API (${response.status}): ${err}`);
    }

    return response.json();
  } catch (error) {
    // Re-throw our custom errors
    if (error instanceof Error && error.message.includes('CUOTA DE GEMINI')) {
      throw error;
    }
    if (error instanceof Error && error.message.includes('API KEY INVÁLIDA')) {
      throw error;
    }

    // Handle network errors
    throw new Error(
      `🌐 ERROR DE CONEXIÓN\n\n` +
      `No se pudo conectar con Gemini API.\n\n` +
      `✅ VERIFICA:\n` +
      `1. Tu conexión a internet\n` +
      `2. Que la API key esté correcta\n` +
      `3. Intenta de nuevo en unos segundos\n\n` +
      `Error original: ${error instanceof Error ? error.message : 'Desconocido'}`
    );
  }
}

/**
 * Generate news ideas using Gemini.
 */
export const generateNewsIdeas = async (
  topic: string,
  style: NewsStyle,
  apiKey: string,
  characterLimit: number = 1050,
  aiModel: string = "gemini-1.5-flash"
): Promise<NewsItem[]> => {
  // Map friendly model names to API specific names
  // Use gemini-1.5-flash as default (FREE tier with better quota)
  let modelName = aiModel;

  // Normalize model names to use the most stable free versions
  if (aiModel.includes("2.0") || aiModel.includes("pro")) {
    // Use 1.5-flash for better quota on free tier
    modelName = "gemini-1.5-flash";
    console.log("⚡ Usando gemini-1.5-flash (mejor cuota gratuita)");
  } else if (aiModel.includes("1.5")) {
    modelName = "gemini-1.5-flash";
  } else {
    // Default to free tier model
    modelName = "gemini-1.5-flash";
  }

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
      - El campo 'summary' debe tener EXACTAMENTE 1050 caracteres (cuenta espacios y puntuación)
      - NO incluyas emojis, etiquetas ni conteos en el campo summary
      - Mantén el tono serio y profesional
      - NO uses despedidas ni cierres formales

      ESTRUCTURA DE CADA ESCENA:
      1. headline: Título slug-format en minúsculas con guiones
      2. summary: NARRACIÓN DE EXACTAMENTE 1050 CARACTERES
      3. imagePrompt: Visual en inglés estilo 'photojournalism', '4k', 'news broadcast'
      4. impactLevel: "Viral" o "Alto"
    `;
  } else {
    systemInstruction = `Eres un creador de contenido de ÚLTIMA HORA estilo viral sensacionalista. Tu tarea es crear narraciones dramáticas FLUIDAS de EXACTAMENTE ${characterLimit} caracteres. El tono es urgente, narrativo y contundente con estructura escalada. IMPORTANTE: La narración debe tener EXACTAMENTE ${characterLimit} caracteres, ni uno más ni uno menos.`;
    promptContext = `
      Tema Central: "${topic}".

      Genera EXACTAMENTE 3 ESCENAS que formen una narrativa continua escalada.

      FORMATO OBLIGATORIO PARA EL CAMPO 'summary' (NARRACIÓN):

      La narración debe seguir esta ESTRUCTURA FLUIDA de EXACTAMENTE ${characterLimit} CARACTERES:

      1. GANCHO INICIAL (80-100 caracteres):
         - DEBE EMPEZAR OBLIGATORIAMENTE CON: "ÚLTIMA HORA.) ¡EL DESASTRE YA EMPEZÓ!"
         - Seguido de una frase impactante que establezca el tema
         - Ejemplo: "La diplomacia ha sido reemplazada por la Marina."

      2. MENSAJE DIRECTO SIN PALABRAS (100-150 caracteres):
         - Describe la acción principal en narrativa continua
         - Ejemplo: "México acaba de enviar un mensaje directo y contundente a Estados Unidos sin decir una sola palabra."
         - Transición: "Descubre los detalles escalofriantes que desataron la crisis:"

      3. DESARROLLO NARRATIVO FLUIDO (400-500 caracteres):
         - Describe los hechos en NARRATIVA CONTINUA, NO en puntos de lista
         - Usa conectores fluidos como "Mientras...", "El acto se ejecutó para...", "Lo que nadie niega es que..."
         - Incluye detalles específicos: lugares, nombres, acciones concretas
         - Mantén el ritmo urgente con frases cortas y directas
         - Ejemplo: "Elementos de la Marina llegaron en formación para retirar los letreros. No fue mantenimiento: fue una reafirmación de soberanía. Mientras la bandera ondeaba, los letreros fueron quitados uno por uno."

      4. MENSAJE CLARO (80-120 caracteres):
         - Frase contundente en comillas que resume el mensaje
         - Estructura: "El mensaje es claro: [FRASE PODEROSA]"
         - Ejemplo: "El mensaje es claro: 'Aquí manda México, este es territorio nacional.'"

      5. ADVERTENCIA VITAL (150-200 caracteres):
         - Estructura: "Advertencia vital: [RIESGO O CONSECUENCIA]"
         - Conecta el costo con el valor (dignidad, soberanía, verdad)
         - Ejemplo: "Advertencia vital: El acto reafirma la soberanía, pero abre un riesgo diplomático. El riesgo de esta confrontación es el precio de la dignidad nacional."

      6. PREGUNTA DE ENGAGEMENT FINAL (100-150 caracteres):
         - Pregunta DIRECTA al lector para generar comentarios
         - Estructura: "¿Crees que [PROTAGONISTA] hizo lo correcto al [ACCIÓN]?"
         - Cierre con alternativas: "Comenta si esto es el inicio de [OPCIÓN A] o de [OPCIÓN B]."

      REGLAS DE ESTILO (CRÍTICO):
      - Narrativa FLUIDA y continua, NO uses listas de puntos en el texto final
      - El campo 'summary' debe tener EXACTAMENTE ${characterLimit} caracteres (cuenta espacios y puntuación)
      - NO incluyas emojis, hashtags ni conteos en el campo summary
      - Usa frases cortas (15-25 palabras máximo) para mantener ritmo urgente
      - Conectores narrativos: "Mientras", "El mensaje es claro", "Lo que nadie niega"
      - Mantén coherencia temática de inicio a fin
      - Sin despedidas formales, termina con la pregunta de engagement

      ESTRUCTURA DE CADA ESCENA:
      1. headline: Título slug-format en minúsculas con guiones
      2. summary: NARRACIÓN FLUIDA DE EXACTAMENTE ${characterLimit} CARACTERES
      3. imagePrompt: Visual en inglés estilo 'dramatic news footage', 'breaking news', 'high tension scene', '4k photojournalism'
      4. impactLevel: "Viral" o "Cataclísmico"
    `;
  }

  const prompt = `
    ${systemInstruction}
    
    ${promptContext}
    
    Devuelve UN ARRAY JSON con exactamente 3 objetos. Asegúrate de completar la historia en estas 3 escenas.
    RESPONDE ÚNICAMENTE CON EL ARRAY JSON VÁLIDO. NO ESCRIBAS NADA MÁS.
  `;

  const raw = await callGemini(modelName, prompt, apiKey);

  // Check if we got a valid response
  if (!raw?.candidates?.[0]?.content?.parts?.[0]?.text) {
    console.error("Raw Gemini response:", JSON.stringify(raw, null, 2));

    // Check for safety blocks
    if (raw?.candidates?.[0]?.finishReason === "SAFETY") {
      throw new Error("Gemini bloqueó la respuesta por razones de seguridad. Intenta reformular el prompt.");
    }

    throw new Error("Gemini no devolvió ningún texto. Verifica tu API key.");
  }

  const text = raw.candidates[0].content.parts[0].text;
  console.log("Gemini raw response:", text.substring(0, 200) + "..."); // Log first 200 chars

  // Robust JSON extraction
  const firstBracket = text.indexOf('[');
  const lastBracket = text.lastIndexOf(']');

  if (firstBracket === -1 || lastBracket === -1) {
    console.error("Full response text:", text);
    throw new Error(`No se encontró un array JSON válido en la respuesta. La respuesta comienza con: "${text.substring(0, 100)}"`);
  }

  const jsonString = text.substring(firstBracket, lastBracket + 1);

  try {
    const items = JSON.parse(jsonString) as NewsItem[];

    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("La respuesta JSON no contiene elementos válidos");
    }

    return items.map(item => ({ ...item, style }));
  } catch (e) {
    console.error("JSON Parse Error:", e);
    console.error("Attempted to parse:", jsonString.substring(0, 500));
    throw new Error(`Error al parsear JSON de Gemini: ${e instanceof Error ? e.message : 'Error desconocido'}`);
  }
};

/**
 * Divide a script into a fixed number of scenes.
 */
export const parseScriptIntoScenes = async (
  script: string,
  sceneCount: number,
  style: NewsStyle,
  apiKey: string
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

  const raw = await callGemini("gemini-1.5-flash", prompt, apiKey);

  // Check if we got a valid response
  if (!raw?.candidates?.[0]?.content?.parts?.[0]?.text) {
    console.error("Raw Gemini response:", JSON.stringify(raw, null, 2));

    // Check for safety blocks
    if (raw?.candidates?.[0]?.finishReason === "SAFETY") {
      throw new Error("Gemini bloqueó la respuesta por razones de seguridad. Intenta reformular el guión.");
    }

    throw new Error("Gemini no devolvió ningún texto. Verifica tu API key.");
  }

  const text = raw.candidates[0].content.parts[0].text;
  console.log("Gemini raw response (parseScript):", text.substring(0, 200) + "..."); // Log first 200 chars

  // Robust JSON extraction: find the first '[' and last ']'
  const firstBracket = text.indexOf('[');
  const lastBracket = text.lastIndexOf(']');

  if (firstBracket === -1 || lastBracket === -1) {
    console.error("Full response text:", text);
    throw new Error(`No se encontró un array JSON válido en la respuesta. La respuesta comienza con: "${text.substring(0, 100)}"`);
  }

  const jsonString = text.substring(firstBracket, lastBracket + 1);

  try {
    const items = JSON.parse(jsonString) as NewsItem[];

    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("La respuesta JSON no contiene elementos válidos");
    }

    if (items.length !== sceneCount) {
      console.warn(`Se esperaban ${sceneCount} escenas pero se recibieron ${items.length}`);
    }

    return items.map(item => ({ ...item, style }));
  } catch (e) {
    console.error("JSON Parse Error:", e);
    console.error("Attempted to parse:", jsonString.substring(0, 500));
    throw new Error(`Error al parsear JSON de Gemini: ${e instanceof Error ? e.message : 'Error desconocido'}`);
  }
};

/**
 * Regenerate an image prompt using Gemini.
 */
export const regenerateImagePrompt = async (
  currentPrompt: string,
  context: string,
  apiKey: string
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

  const raw = await callGemini("gemini-1.5-flash", prompt, apiKey);
  const text = raw?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) {
    throw new Error("No se pudo regenerar el prompt");
  }
  return text;
};