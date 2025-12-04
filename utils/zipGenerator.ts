import JSZip from 'jszip';
import { NewsItem } from '../types';

export interface ZipExportOptions {
    includeAudio: boolean;
    includeMusic: boolean;
    includeMetadata: boolean;
    projectName: string;
    topic: string;
    newsStyle: 'REAL' | 'FAKE';
}

export const generateEnhancedZip = async (
    newsItems: NewsItem[],
    bgMusicUrl: string | null,
    options: ZipExportOptions
): Promise<Blob> => {
    console.log('🏗️ [ZIP Generator] Iniciando generación de ZIP...');
    console.log('📊 [ZIP Generator] Total items recibidos:', newsItems.length);

    const zip = new JSZip();

    // Check if only images are being exported (no folders needed)
    const onlyImages = !options.includeAudio && !options.includeMusic && !options.includeMetadata;

    // Create folder structure only if needed
    const imagesFolder = onlyImages ? null : zip.folder('01_imagenes');
    const audioFolder = zip.folder('02_audio');
    const musicFolder = zip.folder('03_musica');
    const metadataFolder = zip.folder('00_metadata');

    // Add images
    const images = newsItems.filter(item => item.imageUrl);
    console.log('🖼️ [ZIP Generator] Imágenes a procesar:', images.length);

    let processedCount = 0;
    images.forEach((item, index) => {
        if (item.imageUrl) {
            try {
                // Validate base64 data
                const parts = item.imageUrl.split(',');
                if (parts.length < 2) {
                    console.warn(`⚠️ [ZIP Generator] Imagen ${index} tiene formato inválido`);
                    return;
                }

                const base64Data = parts[1];
                const safeHeadline = item.headline.replace(/[^a-z0-9]/gi, '_').substring(0, 50);
                const filename = `escena_${String(index + 1).padStart(2, '0')}_${safeHeadline}.png`;

                console.log(`✅ [ZIP Generator] Procesando imagen ${index + 1}/${images.length}: ${filename}`);

                // Add directly to root if only images, otherwise to folder
                if (onlyImages) {
                    zip.file(filename, base64Data, { base64: true });
                } else {
                    imagesFolder?.file(filename, base64Data, { base64: true });
                }

                processedCount++;
            } catch (imgError) {
                console.error(`❌ [ZIP Generator] Error procesando imagen ${index}:`, imgError);
            }
        }
    });

    console.log(`📦 [ZIP Generator] Total imágenes procesadas: ${processedCount}/${images.length}`);

    // Add audio narrations
    if (options.includeAudio) {
        const audios = newsItems.filter(item => item.audioUrl);
        for (let i = 0; i < audios.length; i++) {
            const item = audios[i];
            if (item.audioUrl) {
                try {
                    const response = await fetch(item.audioUrl);
                    const audioBlob = await response.blob();
                    const safeHeadline = item.headline.replace(/[^a-z0-9]/gi, '_').substring(0, 50);
                    const filename = `narracion_${String(i + 1).padStart(2, '0')}_${safeHeadline}.mp3`;
                    audioFolder?.file(filename, audioBlob);
                } catch (error) {
                    console.error('Error adding audio:', error);
                }
            }
        }
    }

    // Add background music
    if (options.includeMusic && bgMusicUrl) {
        try {
            const response = await fetch(bgMusicUrl);
            const musicBlob = await response.blob();
            musicFolder?.file('musica_fondo.mp3', musicBlob);
        } catch (error) {
            console.error('Error adding music:', error);
        }
    }

    // Add metadata JSON
    if (options.includeMetadata) {
        const metadata = {
            proyecto: options.projectName,
            tema: options.topic,
            estilo: options.newsStyle,
            fecha_exportacion: new Date().toISOString(),
            total_escenas: newsItems.length,
            escenas_con_imagen: images.length,
            escenas_con_audio: newsItems.filter(item => item.audioUrl).length,
            tiene_musica_fondo: !!bgMusicUrl,
            escenas: newsItems.map((item, index) => ({
                numero: index + 1,
                titulo: item.headline,
                guion: item.summary,
                prompt_imagen: item.imagePrompt,
                categoria: item.category,
                nivel_impacto: item.impactLevel,
                hashtag: item.hashtag,
                tiene_imagen: !!item.imageUrl,
                tiene_audio: !!item.audioUrl,
                voz_asignada: item.selectedVoiceId || null,
                aspect_ratio: item.aspectRatio || null,
            })),
        };

        metadataFolder?.file('proyecto.json', JSON.stringify(metadata, null, 2));

        // Add README
        const readme = `# ${options.projectName}

## Informaci\u00f3n del Proyecto
- **Tema:** ${options.topic}
- **Estilo:** ${options.newsStyle === 'REAL' ? 'Documental/Realidad' : 'Conspiración/Viral'}
- **Fecha de exportación:** ${new Date().toLocaleDateString('es-ES')}
- **Total de escenas:** ${newsItems.length}

## Estructura de Carpetas
- \`00_metadata/\` - Información del proyecto en JSON
- \`01_imagenes/\` - Imágenes generadas (${images.length} archivos)
- \`02_audio/\` - Narraciones de voz (${newsItems.filter(item => item.audioUrl).length} archivos)
- \`03_musica/\` - Música de fondo${bgMusicUrl ? ' (1 archivo)' : ' (vacío)'}

## Escenas

${newsItems.map((item, index) => `### Escena ${index + 1}: ${item.headline}
**Guion:** ${item.summary}
**Categoría:** ${item.category}
**Impacto:** ${item.impactLevel}
**Hashtag:** ${item.hashtag}
`).join('\n')}

---
Generado con MÁQUINA.NEWS v2.0
`;

        metadataFolder?.file('README.md', readme);
    }


    console.log('🔄 [ZIP Generator] Generando blob final...');

    const blob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
    });

    console.log(`✅ [ZIP Generator] ZIP completado! Tamaño: ${blob.size} bytes (${(blob.size / 1024).toFixed(2)} KB)`);

    return blob;
};
