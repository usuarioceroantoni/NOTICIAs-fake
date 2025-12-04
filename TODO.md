# TODO – Máquina de Hacer Guion

## 1️⃣ Actualizar SDK de Gemini
- Ejecutar `npm install @google/generative-ai@latest` para obtener la versión que permite especificar `apiVersion`.
- Verificar que `package.json` quede con la versión más reciente (p.ej. `0.4.x`).

## 2️⃣ Ajustar la inicialización del cliente
- En `services/geminiService.ts` reemplazar la función `getClient` por:
```ts
const getClient = (apiKey: string) => {
  if (!apiKey) {
    throw new Error("Gemini API Key is required.");
  }
  // Usa la versión estable de la API (v1)
  return new GoogleGenerativeAI(apiKey, { apiVersion: "v1" });
};
```
- Eliminar cualquier código anterior que intentara usar `process.env.GOOGLE_GENERATIVE_AI_API_VERSION`.

## 3️⃣ Verificar compilación
- Ejecutar `npm run dev` o `npm run build` para asegurarse de que el proyecto compila sin errores de tipos.
- Si aparecen errores de tipos, ejecutar `npm install -D @types/node` o ajustar la configuración de TypeScript.

## 4️⃣ Probar la conexión a Gemini
- Ejecutar `node test‑gemini.js` y proporcionar la API‑Key cuando se solicite.
- Esperar que al menos uno de los modelos (`gemini-1.5-flash-001`, `gemini-pro-001`, etc.) devuelva **✅ ÉXITO**.

## 5️⃣ Actualizar la UI (opcional)
- Si la generación funciona, probar la funcionalidad desde la UI (`App.tsx`).
- Verificar que los botones de generación y reproducción de audio muestren resultados.

## 6️⃣ Documentar cambios
- Añadir un registro en `CHANGELOG.md` indicando la actualización del SDK y la corrección del error 404.
- Actualizar el README con la nueva forma de inicializar el cliente Gemini.

---
**Nota:** Después de completar cada paso, elimina la sección correspondiente o márcala como completada (`- [x]`).
