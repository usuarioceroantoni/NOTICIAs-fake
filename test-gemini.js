import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log("=== DIAGNÓSTICO DE CONEXIÓN GEMINI (FETCH) ===");
console.log("Este script probará la conexión directa con la API de Google usando fetch (v1).");

async function callGemini(model, prompt, apiKey) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const body = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
    };
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Gemini API error ${response.status}: ${err}`);
    }
    return response.json();
}

rl.question('Por favor, pega tu API Key de Gemini aquí (no se guardará): ', async (apiKey) => {
    if (!apiKey || apiKey.trim() === '') {
        console.error("❌ Error: Se requiere una API Key.");
        rl.close();
        return;
    }

    const modelsToTest = ["gemini-2.0-flash", "gemini-2.0-flash-001"];

    for (const modelName of modelsToTest) {
        console.log(`\n----------------------------------------`);
        console.log(`Probando modelo: ${modelName}...`);
        try {
            const result = await callGemini(modelName, "Responde solo con la palabra: FUNCIONA", apiKey.trim());
            const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
            console.log(`✅ ÉXITO: El modelo ${modelName} respondió: "${text?.trim()}"`);
        } catch (error) {
            console.error(`❌ FALLÓ ${modelName}:`);
            console.error(`   Mensaje: ${error.message}`);
        }
    }

    console.log(`\n----------------------------------------`);
    console.log("Diagnóstico finalizado.");
    rl.close();
});
