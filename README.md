# Máquina.News Nexus 🎬

Una aplicación moderna y elegante para la generación automatizada de guiones de noticias con IA, incluyendo visuales y audio.

![Máquina.News Nexus](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF?logo=vite)

## ✨ Características

- 🤖 **Múltiples Modelos de IA**: Soporte para Gemini, Claude y GPT-4
- 📝 **Generación de Guiones**: Crea guiones de noticias "reales" o "conspirativas"
- 🎨 **Generación Visual**: Crea imágenes para tus escenas
- 🎙️ **Síntesis de Voz**: Genera audio con múltiples voces
- 📊 **Gestión de Escenas**: Maneja hasta 25 escenas por guión
- 💾 **Exportación**: Descarga guiones completos como archivos ZIP
- 🎭 **Interfaz Moderna**: Diseño elegante con efectos glassmorphism y animaciones

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+ 
- npm o yarn

### Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/tu-usuario/maquina-de-hacer-guion.git
cd maquina-de-hacer-guion
```

2. Instala las dependencias:
```bash
npm install
```

3. Crea un archivo `.env.local` en la raíz del proyecto con tus claves API:
```env
VITE_GEMINI_API_KEY=tu_clave_api_de_gemini
VITE_CLAUDE_API_KEY=tu_clave_api_de_claude
VITE_OPENAI_API_KEY=tu_clave_api_de_openai
```

4. Inicia el servidor de desarrollo:
```bash
npm run dev
```

5. Abre [http://localhost:3000](http://localhost:3000) en tu navegador

## 🔑 Obtener Claves API

- **Gemini**: [Google AI Studio](https://makersuite.google.com/app/apikey)
- **Claude**: [Anthropic Console](https://console.anthropic.com/)
- **OpenAI**: [OpenAI Platform](https://platform.openai.com/api-keys)

## 🛠️ Tecnologías

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 6
- **APIs de IA**: 
  - Google Gemini AI
  - Anthropic Claude
  - OpenAI GPT-4
- **Iconos**: Lucide React
- **Empaquetado**: JSZip

## 📁 Estructura del Proyecto

```
maquina-de-hacer-guion/
├── components/        # Componentes React
│   ├── stages/       # Componentes de etapas (Script, Visual, Audio)
│   └── ...           # Otros componentes
├── services/         # Servicios de API
├── hooks/            # Custom React Hooks
├── utils/            # Utilidades
├── types.ts          # Definiciones de TypeScript
└── App.tsx           # Componente principal
```

## 🎯 Uso

1. **Selecciona el tipo de contenido**: REAL o CONSPIRACIÓN
2. **Elige tu modelo de IA**: Gemini, Claude o GPT-4
3. **Configura el límite de caracteres**: 1050, 2100 o 4200
4. **Genera el guión**: Haz clic en "Generar Guion"
5. **Edita y refina**: Modifica el guión según necesites
6. **Genera visuales**: Crea imágenes para cada escena
7. **Genera audio**: Sintetiza voz para tu guión
8. **Comparte**: Descarga todo como ZIP

## 🌟 Capturas de Pantalla

_Próximamente..._

## 📝 Licencia

Este proyecto es privado y de uso personal.

## 👨‍💻 Desarrollo

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

## 🤝 Contribuir

Este es un proyecto personal, pero las sugerencias son bienvenidas.

## 📧 Contacto

Andrea Quintero - [@tu_usuario](https://github.com/tu_usuario)

---

Hecho con ❤️ usando React y múltiples APIs de IA
