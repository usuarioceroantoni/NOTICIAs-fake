# 📺 Estilo Narrativo - Máquina News Nexus

## 🎯 Referencia Principal

Este documento define el estilo narrativo que la aplicación debe seguir al generar noticias de tipo **ÚLTIMA HORA** con tono viral y sensacionalista.

### Ejemplo de Referencia (Marina de México)

```
ÚLTIMA HORA.) ¡EL DESASTRE YA EMPEZÓ! La diplomacia ha sido reemplazada por la Marina. 
México acaba de enviar un mensaje directo y contundente a Estados Unidos sin decir una 
sola palabra. Descubre los detalles escalofriantes que desataron la crisis en la frontera: 

Elementos de la Marina de México llegaron en formación a Playa Bagdad, Matamoros, 
Tamaulipas, para retirar los letreros colocados por oficiales de Estados Unidos. No fue 
mantenimiento: fue una reafirmación de soberanía nacional. Mientras la bandera de México 
ondeaba con fuerza, los letreros extranjeros fueron quitados, uno por uno. 

El mensaje es claro: "Aquí manda México, este es territorio nacional." El acto se ejecutó 
para dejar claro que ninguna señal extranjera puede estar por encima de la Constitución. 
La operación silenciosa, pero militar, ha encendido la alerta: ¿esto provocará una escalada 
de tensiones con Estados Unidos, o es el inicio de una nueva era de respeto fronterizo? 
Lo que nadie niega es que la acción ya es un símbolo nacional. 

Advertencia vital: El acto reafirma la soberanía, pero abre un riesgo diplomático. El 
riesgo de esta confrontación es el precio de la dignidad nacional. 

¿Crees que la Marina de México hizo lo correcto al desafiar en la frontera? Comenta abajo 
si este es el inicio de una nueva era de respeto o de tensión con Estados Unidos.
```

---

## 📋 Estructura de 6 Bloques (EXACTAMENTE 1050 caracteres)

### 1️⃣ GANCHO INICIAL (80-100 caracteres)
- **Apertura obligatoria:** `"ÚLTIMA HORA.) ¡EL DESASTRE YA EMPEZÓ!"`
- Seguido de una frase impactante que establezca el tema
- **Ejemplo:** "La diplomacia ha sido reemplazada por la Marina."

### 2️⃣ MENSAJE DIRECTO SIN PALABRAS (100-150 caracteres)
- Describe la acción principal en **narrativa continua**
- **Ejemplo:** "México acaba de enviar un mensaje directo y contundente a Estados Unidos sin decir una sola palabra."
- **Transición:** "Descubre los detalles escalofriantes que desataron la crisis:"

### 3️⃣ DESARROLLO NARRATIVO FLUIDO (400-500 caracteres)
- **CRÍTICO:** Usa NARRATIVA CONTINUA, **NO listas de puntos**
- Conectores fluidos: "Mientras...", "El acto se ejecutó para...", "Lo que nadie niega es que..."
- Incluye detalles específicos: lugares, nombres, acciones concretas
- Frases cortas (15-25 palabras) para mantener ritmo urgente
- **Ejemplo:** "Elementos de la Marina llegaron en formación para retirar los letreros. No fue mantenimiento: fue una reafirmación de soberanía. Mientras la bandera ondeaba, los letreros fueron quitados uno por uno."

### 4️⃣ MENSAJE CLARO (80-120 caracteres)
- Frase contundente **en comillas** que resume el mensaje
- **Estructura:** `"El mensaje es claro: [FRASE PODEROSA]"`
- **Ejemplo:** "El mensaje es claro: 'Aquí manda México, este es territorio nacional.'"

### 5️⃣ ADVERTENCIA VITAL (150-200 caracteres)
- **Estructura:** `"Advertencia vital: [RIESGO O CONSECUENCIA]"`
- Conecta el **costo** con el **valor** (dignidad, soberanía, verdad)
- **Ejemplo:** "Advertencia vital: El acto reafirma la soberanía, pero abre un riesgo diplomático. El riesgo de esta confrontación es el precio de la dignidad nacional."

### 6️⃣ PREGUNTA DE ENGAGEMENT FINAL (100-150 caracteres)
- Pregunta **DIRECTA** al lector para generar comentarios
- **Estructura:** `"¿Crees que [PROTAGONISTA] hizo lo correcto al [ACCIÓN]?"`
- **Cierre:** "Comenta si esto es el inicio de [OPCIÓN A] o de [OPCIÓN B]."

---

## ✅ Reglas de Estilo Críticas

### 📝 Narrativa Fluida
- ❌ **NO usar listas de puntos** en el texto final
- ✅ **SÍ usar narrativa continua** con conectores fluidos
- Ejemplos de conectores: "Mientras", "El mensaje es claro", "Lo que nadie niega", "El acto se ejecutó para"

### 📏 Longitud Exacta
- El campo `summary` debe tener **EXACTAMENTE 1050 caracteres** (cuenta espacios y puntuación)
- ❌ NO incluyas emojis, hashtags ni conteos en el summary

### ⚡ Ritmo Urgente
- Frases cortas: **15-25 palabras máximo** por frase
- Mantén coherencia temática de inicio a fin
- Sin despedidas formales, termina con la pregunta de engagement

### 🎯 Elementos Clave
- **Detalles específicos:** Lugares (Playa Bagdad, Matamoros), nombres, acciones concretas
- **Contraste dramático:** "No fue X: fue Y"
- **Preguntas retóricas:** "¿Esto provocará...?"
- **Simbolismo nacional:** "Ya es un símbolo nacional"

---

## 🔧 Implementación Técnica

El estilo ha sido implementado en:

1. **`services/geminiService.ts`** - Líneas 100-157
2. **`services/claudeService.ts`** - Líneas 76-134  
3. **`services/openaiService.ts`** - Líneas 98-154

Todos los servicios de IA ahora siguen esta estructura para generar contenido consistente y de alta calidad.

---

## 📊 Checklist de Calidad

Antes de publicar una narración, verifica:

- [ ] Empieza con "ÚLTIMA HORA.) ¡EL DESASTRE YA EMPEZÓ!"
- [ ] Tiene EXACTAMENTE 1050 caracteres
- [ ] Usa narrativa continua (NO listas de puntos)
- [ ] Incluye "El mensaje es claro: [FRASE]"
- [ ] Incluye "Advertencia vital: [CONSECUENCIA]"
- [ ] Termina con pregunta de engagement
- [ ] Usa frases cortas (15-25 palabras)
- [ ] Incluye detalles específicos (lugares, nombres)
- [ ] Sin emojis ni hashtags en el texto

---

## 🎬 Resultado Esperado

Una narración que:
- ✅ Captura la atención inmediatamente
- ✅ Mantiene el ritmo urgente de principio a fin
- ✅ Fluye de manera natural y coherente
- ✅ Genera engagement con pregunta final
- ✅ Transmite dramatismo sin perder credibilidad narrativa

---

**Última actualización:** Diciembre 6, 2025  
**Versión:** 2.0 - Estilo Narrativo Fluido
