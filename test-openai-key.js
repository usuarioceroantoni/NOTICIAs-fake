// Test temporal para verificar la API key de OpenAI
const apiKey = 'sk-bGBjSLVb32D54f619126T3BLbKFJ5fb2ed25D083441da90C';

async function testOpenAIKey() {
    try {
        console.log('🔐 Verificando clave de OpenAI...');

        const response = await fetch('https://api.openai.com/v1/models', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('✅ CLAVE VÁLIDA!');
            console.log('📊 Modelos disponibles:', data.data.length);
            console.log('🎯 Algunos modelos:', data.data.slice(0, 3).map(m => m.id));
            return true;
        } else {
            const error = await response.json();
            console.error('❌ CLAVE INVÁLIDA');
            console.error('Error:', error);
            return false;
        }
    } catch (err) {
        console.error('❌ Error verificando la clave:', err.message);
        return false;
    }
}

testOpenAIKey();
