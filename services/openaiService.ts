import { NewsItem, NewsStyle } from "../types";

/**
 * Helper to call OpenAI GPT API via chat completions.
 * Returns the raw JSON response from the model.
 */
async function callOpenAI(prompt: string, apiKey: string, model: string = "gpt-3.5-turbo"): Promise<any> {
    const url = 'https://api.openai.com/v1/chat/completions';
    const body = {
        model: model,
        messages: [
            {
                role: "user",
                content: prompt
            }
        ],
        temperature: 0.7,
        max_tokens: 2000
    };

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`OpenAI API error ${response.status}: ${err}`);
    }

    return response.json();
}

// NOTA: /v1/responses NO ES UN ENDPOINT VÁLIDO DE OPENAI
// GPT-5-nano no existe en la API oficial de OpenAI
// Para usar GPT-5-nano gratis, usa Puter en puterService.ts

/**
 * Generate news ideas using OpenAI.
 */
export const generateNewsIdeas = async (
    topic: string,
    style: NewsStyle,
    apiKey: string,
    characterLimit: number = 1050,
    model: string = "gpt-3.5-turbo"
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

      3. DESARROLLO DE LOS HECHOS (400-500 caracteres):
         - Lista 3-4 puntos clave de la noticia
         - Usa cifras, porcentajes y datos duros

      4. DECLARACIÓN OFICIAL (100-150 caracteres):
         - Cita textual de una autoridad

      5. IMPLICACIONES DIRECTAS (200-250 caracteres):
         - Consecuencias económicas, sociales o políticas

      6. PROYECCIÓN FINAL (100-150 caracteres):
         - Cierre con expectativa de actualización

      REGLAS ESTRICTAS:
      - El campo 'summary' debe tener EXACTAMENTE ${characterLimit} caracteres
      - NO incluyas emojis, etiquetas ni conteos
      - Mantén el tono serio y profesional

      ESTRUCTURA DE CADA ESCENA:
      1. headline: Título slug-format en minúsculas con guiones
      2. summary: NARRACIÓN DE EXACTAMENTE ${characterLimit} CARACTERES
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

    const fullPrompt = `
    ${systemInstruction}
    
    ${promptContext}
    
    Devuelve UN ARRAY JSON con exactamente 3 objetos.
    RESPONDE ÚNICAMENTE CON EL ARRAY JSON VÁLIDO. NO ESCRIBAS NADA MÁS.
  `;

    // NOTA: Si intentas usar "gpt-5-nano", usa puterService.ts en su lugar
    // OpenAI no tiene un modelo llamado "gpt-5-nano"
    if (model === "gpt-5-nano") {
        throw new Error("GPT-5-nano no está disponible vía OpenAI. Por favor usa 'GPT-5 NANO (GRATIS 🎉)' desde el selector de modelos, que usa Puter.com gratuitamente.");
    }

    const raw = await callOpenAI(fullPrompt, apiKey, model);
    const text = raw?.choices?.[0]?.message?.content ?? "";

    if (!text) {
        console.error("OpenAI raw response:", JSON.stringify(raw, null, 2));
        throw new Error("OpenAI no devolvió ningún texto. Verifica tu API key.");
    }

    console.log("OpenAI raw response:", text.substring(0, 200) + "...");

    // Robust JSON extraction
    const firstBracket = text.indexOf('[');
    const lastBracket = text.lastIndexOf(']');

    if (firstBracket === -1 || lastBracket === -1) {
        console.error("Full response text:", text);
        throw new Error(`No se encontró un array JSON válido en la respuesta de OpenAI. La respuesta comienza con: "${text.substring(0, 100)}"`);
    }

    const jsonString = text.substring(firstBracket, lastBracket + 1);

    try {
        const items = JSON.parse(jsonString) as NewsItem[];

        if (!Array.isArray(items) || items.length === 0) {
            throw new Error("La respuesta JSON de OpenAI no contiene elementos válidos");
        }

        console.log(`OpenAI generó ${items.length} escenas exitosamente`);
        return items.map(item => ({ ...item, style }));
    } catch (e) {
        console.error("JSON Parse Error:", e);
        console.error("Attempted to parse:", jsonString.substring(0, 500));
        throw new Error(`Error al parsear JSON de OpenAI: ${e instanceof Error ? e.message : 'Error desconocido'}`);
    }
};

/**
 * Divide a script into scenes using GPT-5 Nano.
 */
export const parseScriptIntoScenes = async (
    script: string,
    sceneCount: number,
    style: NewsStyle,
    apiKey: string
): Promise<NewsItem[]> => {
    const prompt = `
    Eres un experto en dividir guiones en escenas visuales.
    
    Tengo el siguiente guión que necesito dividir en EXACTAMENTE ${sceneCount} escenas:
    "${script}"
    
    TAREA:
    1. Divide el guión en ${sceneCount} escenas de manera equitativa
    2. Para cada escena, extrae:
       - headline: Título descriptivo corto en formato slug
       - summary: El texto correspondiente a esa parte del guión
       - imagePrompt: Prompt detallado en INGLÉS para generar imagen
       - impactLevel: "Medio" por defecto
    
    Debes generar EXACTAMENTE ${sceneCount} escenas.
    RESPONDE ÚNICAMENTE CON EL ARRAY JSON VÁLIDO.
  `;

    const raw = await callOpenAI(prompt, apiKey, "gpt-3.5-turbo");
    const text = raw?.choices?.[0]?.message?.content ?? "";

    if (!text) {
        console.error("OpenAI raw response:", JSON.stringify(raw, null, 2));
        throw new Error("OpenAI no devolvió ningún texto. Verifica tu API key.");
    }

    console.log("OpenAI raw response (parseScript):", text.substring(0, 200) + "...");

    const firstBracket = text.indexOf('[');
    const lastBracket = text.lastIndexOf(']');

    if (firstBracket === -1 || lastBracket === -1) {
        console.error("Full response text:", text);
        throw new Error(`No se encontró un array JSON válido en la respuesta de OpenAI. La respuesta comienza con: "${text.substring(0, 100)}"`);
    }

    const jsonString = text.substring(firstBracket, lastBracket + 1);

    try {
        const items = JSON.parse(jsonString) as NewsItem[];

        if (!Array.isArray(items) || items.length === 0) {
            throw new Error("La respuesta JSON de OpenAI no contiene elementos válidos");
        }

        if (items.length !== sceneCount) {
            console.warn(`Se esperaban ${sceneCount} escenas pero se recibieron ${items.length}`);
        }

        return items.map(item => ({ ...item, style }));
    } catch (e) {
        console.error("JSON Parse Error:", e);
        console.error("Attempted to parse:", jsonString.substring(0, 500));
        throw new Error(`Error al parsear JSON de OpenAI: ${e instanceof Error ? e.message : 'Error desconocido'}`);
    }
};

/**
 * Regenerate image prompt using GPT-5 Nano.
 */
export const regenerateImagePrompt = async (
    currentPrompt: string,
    context: string,
    apiKey: string
): Promise<string> => {
    const prompt = `
    Mejora este prompt de imagen:
    "${currentPrompt}"
    
    Contexto: "${context}"
    
    REGLAS:
    - Prompt en INGLÉS
    - Muy descriptivo y detallado
    - Usa términos como: "photorealistic", "cinematic", "4k"
    - Máximo 200 palabras
    
    Devuelve SOLO el nuevo prompt mejorado.
  `;

    const raw = await callOpenAI(prompt, apiKey);
    const text = raw?.choices?.[0]?.message?.content?.trim() ?? "";

    if (!text) {
        throw new Error("No se pudo regenerar el prompt");
    }

    return text;
};
