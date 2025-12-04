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
