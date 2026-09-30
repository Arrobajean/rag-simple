# rag-simple

Sistema RAG (*Retrieval-Augmented Generation*) mínimo y directo en Python, utilizando **Supabase (pgvector)** como base de datos vectorial y la API de **Google Gemini** para generación de respuestas y embeddings.

Sin frameworks pesados como LangChain o LlamaIndex: código transparente y fácil de entender.

---

## 🏗 Arquitectura y Flujo

```
[ Documentos (docs/) ]
        │
        ▼ (ingest.py: troceo)
[ Fragmentos de texto ]
        │
        ▼ (rag.py: gemini-embedding-001)
  [ Embeddings 768d ]
        │
        ▼
[ Supabase (pgvector) ]
        ▲
        │ Búsqueda por similitud coseno (match_documents)
        │
   [ Pregunta ]
        │
        ▼ (ask.py)
[ Prompt: Contexto + Pregunta ]
        │
        ▼ (Gemini Flash)
  [ Respuesta con citas ]
```

---

## 📋 Requisitos Previos

- **Python 3.12+**
- **Cuenta en Supabase** (plan gratuito): para la base de datos PostgreSQL con `pgvector`.
- **API Key de Google Gemini** (Google AI Studio): plan gratuito.

---

## 🚀 Puesta en Marcha

### 1. Clonar el repositorio y preparar el entorno

```powershell
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configurar Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. Entra en el **SQL Editor** de tu proyecto Supabase.
3. Copia y ejecuta todo el código de [`schema.sql`](schema.sql). Esto habilitará la extensión `vector`, creará la tabla `documents`, el índice HNSW y la función de búsqueda `match_documents`.

### 3. Variables de entorno

Copia `.env.example` a `.env` y rellena con tus claves:

```env
GEMINI_API_KEY=tu_api_key_de_google_ai_studio
SUPABASE_URL=https://xxxxxxxx.supabase.co
SUPABASE_KEY=tu_service_role_key
GEMINI_CHAT_MODEL=gemini-2.5-flash
```

> **Importante:** Usa la clave `service_role` (Project Settings → API → `service_role`) para que el script pueda escribir en la base de datos con RLS activado. **Nunca compartas ni subas tu archivo `.env`**.

---

## 📖 Uso

### Indexar documentos (`ingest.py`)

Coloca tus archivos (`.md`, `.txt`, `.pdf`) en la carpeta `docs/` y ejecuta:

```powershell
python ingest.py
```

El script leerá los documentos, los dividirá en fragmentos, generará los embeddings con Gemini y los guardará en Supabase.

### Hacer preguntas (`ask.py`)

Haz preguntas sobre tus documentos desde la consola:

```powershell
python ask.py "¿Cuántos días de vacaciones tengo?"
```

El script buscará los fragmentos más relevantes en Supabase, los inyectará en el prompt de Gemini y te devolverá la respuesta citando la fuente (`[ejemplo.md]`).

---

## 📂 Estructura del Proyecto

```
rag-simple/
├── docs/               # Directorio para tus archivos (.md, .txt, .pdf)
│   └── ejemplo.md      # Documento de prueba inicial
├── ask.py              # Script CLI para consultar al asistente RAG
├── ingest.py           # Script para procesar e indexar documentos
├── rag.py              # Lógica central (conexión Supabase, embeddings y chat Gemini)
├── schema.sql          # Esquema SQL con pgvector para Supabase
├── requirements.txt    # Dependencias de Python
├── .env.example        # Plantilla de variables de entorno
├── .gitignore          # Exclusiones de Git (.env, .venv, etc.)
└── README.md           # Documentación del proyecto
```
