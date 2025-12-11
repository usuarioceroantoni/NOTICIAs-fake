import Anthropic from '@anthropic-ai/sdk';
import { NewsItem, NewsStyle } from '../types';

const getClient = (apiKey: string) => {
   if (!apiKey) {
      throw new Error("Anthropic API Key is required.");
   }
   return new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
};

export const generateNewsWithClaude = async (
   topic: string,
   style: NewsStyle,
   apiKey: string,
   characterLimit: number = 1050
): Promise<NewsItem[]> => {
   const client = getClient(apiKey);

   let systemInstruction = "";
   let promptContext = "";

   if (style === 'REAL') {
      // REAL NEWS FORMULA
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
    `;
   } else {
      // FAKE / CONSPIRACY LOGIC
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
    ${promptContext}
    
    Devuelve UN ARRAY JSON con exactamente 3 objetos. Asegúrate de completar la historia en estas 3 escenas.
    
    FORMATO JSON ESPERADO:
    [
      {
        "headline": "titulo-en-slug-format",
        "summary": "texto de exactamente ${characterLimit} caracteres",
        "imagePrompt": "detailed visual prompt in English",
        "impactLevel": "Viral",
        "category": "categoria tematica",
        "hashtag": "#hashtag"
      }
    ]
  `;

   try {
      const response = await client.messages.create({
         model: "claude-sonnet-4-20250514",
         max_tokens: 8000,
         system: systemInstruction,
         messages: [
            {
               role: "user",
               content: prompt
            }
         ]
      });

      console.log("Claude response:", JSON.stringify(response, null, 2));

      // Extract text from Claude response
      const textContent = response.content.find(block => block.type === 'text');
      if (!textContent || textContent.type !== 'text') {
         console.error("Claude response content:", response.content);
         throw new Error('Claude no devolvió contenido de texto. Verifica tu API key.');
      }

      const text = textContent.text;
      console.log("Claude raw text:", text.substring(0, 200) + "...");

      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = text.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/) || text.match(/(\[[\s\S]*?\])/);

      if (!jsonMatch) {
         console.error("Full Claude response text:", text);
         throw new Error(`No se encontró un array JSON válido en la respuesta de Claude. La respuesta comienza con: "${text.substring(0, 100)}"`);
      }

      const jsonText = jsonMatch[1];
      console.log("Extracted JSON:", jsonText.substring(0, 300) + "...");

      try {
         const items = JSON.parse(jsonText) as NewsItem[];

         if (!Array.isArray(items) || items.length === 0) {
            throw new Error("La respuesta JSON de Claude no contiene elementos válidos");
         }

         console.log(`Claude generó ${items.length} escenas exitosamente`);
         return items.map(item => ({ ...item, style }));
      } catch (parseError) {
         console.error("JSON Parse Error:", parseError);
         console.error("Attempted to parse:", jsonText.substring(0, 500));
         throw new Error(`Error al parsear JSON de Claude: ${parseError instanceof Error ? parseError.message : 'Error desconocido'}`);
      }
   } catch (error) {
      console.error("Error generating news with Claude:", error);

      if (error instanceof Error) {
         // Provide more specific error messages
         if (error.message.includes('API key')) {
            throw new Error("API key de Claude inválida. Verifica tu configuración.");
         }
         if (error.message.includes('rate limit')) {
            throw new Error("Límite de uso de Claude alcanzado. Intenta más tarde.");
         }
         if (error.message.includes('model')) {
            throw new Error("El modelo de Claude especificado no está disponible.");
         }
      }

      throw error;
   }
};
