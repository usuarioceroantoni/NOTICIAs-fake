export const validateApiKey = (key: string, type: 'gemini' | 'reve' | 'ai33'): boolean => {
    if (!key || key.trim().length === 0) {
        return false;
    }

    // Basic validation based on known API key formats
    switch (type) {
        case 'gemini':
            // Gemini keys typically start with "AI"
            return key.startsWith('AI') && key.length > 20;
        case 'reve':
        case 'ai33':
            // Generic validation for other keys
            return key.length > 10;
        default:
            return false;
    }
};

export const sanitizeInput = (input: string): string => {
    return input
        .trim()
        .replace(/[<>]/g, '') // Remove potential HTML tags
        .substring(0, 500); // Limit length
};

export const validateFileUpload = (file: File, allowedTypes: string[], maxSizeMB: number = 10): { valid: boolean; error?: string } => {
    const maxSize = maxSizeMB * 1024 * 1024; // Convert to bytes

    if (!allowedTypes.includes(file.type)) {
        return {
            valid: false,
            error: `Tipo de archivo no permitido. Permitidos: ${allowedTypes.join(', ')}`,
        };
    }

    if (file.size > maxSize) {
        return {
            valid: false,
            error: `Archivo demasiado grande. Máximo: ${maxSizeMB}MB`,
        };
    }

    return { valid: true };
};

export const validateProjectName = (name: string): { valid: boolean; error?: string } => {
    if (!name || name.trim().length === 0) {
        return { valid: false, error: 'El nombre no puede estar vacío' };
    }

    if (name.length > 50) {
        return { valid: false, error: 'El nombre es demasiado largo (máx. 50 caracteres)' };
    }

    // Check for invalid characters
    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(name)) {
        return { valid: false, error: 'El nombre contiene caracteres no permitidos' };
    }

    return { valid: true };
};
