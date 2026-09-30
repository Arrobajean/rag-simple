# rag-simple

Sistema RAG (*Retrieval-Augmented Generation*) completo y moderno con **doble interfaz**:
1. **Interfaz Web / Dashboard**: Desarrollada en **Next.js 16**, **Tailwind CSS v4** y componentes de **shadcn/ui** (`dashboard-01`), lista para desplegar en **Vercel**.
2. **Scripts CLI en Python**: Herramientas en consola para indexación y consultas directas sin dependencias pesadas (sin LangChain ni LlamaIndex).

Ambas interfaces utilizan la misma base de conocimiento: **Supabase (pgvector)** como base de datos vectorial y la API oficial de **Google Gemini** para embeddings (`gemini-embedding-001`, 768 dims) y respuestas (`gemini-flash-latest`).

---

## 🏗 Arquitectura y Flujo

```
[ Documentos (.md, .txt, .pdf) ]
        │
        ├──► (Web UI: /api/documents) ──┐
        └──► (CLI: python ingest.py)   │
                                       ▼ (gemini-embedding-001)
                              [ Embeddings 768d ]
                                       │
                                       ▼
                             [ Supabase (pgvector) ]
                                       ▲
                                       │ Búsqueda por similitud coseno (match_documents)
                                       │
      [ Pregunta del usuario ] ────────┘
                 │
                 ▼ (gemini-flash-latest)
       [ Respuesta con citas de fuentes ]
```

---

## 🌐 1. Interfaz Web (Next.js + shadcn/ui)

### Características del Dashboard
- **Chat RAG interactivo**: Mensajería en tiempo real con recuperación semántica, visor de fragmentos de contexto y porcentaje de similitud.
- **Gestión de Documentos**: Visualización de fuentes indexadas en Supabase, vista previa de fragmentos, subida de nuevos documentos y eliminación directa.
- **Métricas del Vector Store**: Tarjetas con conteo de documentos, vectores almacenados y modelos utilizados.

### Ejecución Local

```powershell
# Instalar dependencias
pnpm install

# Iniciar servidor de desarrollo
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### Despliegue en Vercel 🚀

1. Entra a [vercel.com](https://vercel.com) e inicia sesión con tu cuenta de GitHub.
2. Haz clic en **Add New...** → **Project** e importa el repositorio `rag-simple`.
3. Vercel detectará automáticamente **Next.js** en la raíz.
4. En **Environment Variables**, añade las 4 variables de tu `.env`:
   - `GEMINI_API_KEY`: Tu clave de Google AI Studio.
   - `SUPABASE_URL`: `https://xxxxxxxx.supabase.co`.
   - `SUPABASE_KEY`: Tu clave secreta `service_role`.
   - `GEMINI_CHAT_MODEL`: `gemini-flash-latest`.
5. Haz clic en **Deploy**. ¡Listo!

---

## 🐍 2. Scripts CLI en Python

Si prefieres trabajar desde la terminal:

### Preparar entorno virtual
```powershell
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

### Indexar documentos
Coloca tus archivos en [`docs/`](docs/) y ejecuta:
```powershell
python ingest.py
```

### Consultar al RAG
```powershell
# Pregunta directa:
python ask.py "¿Cuántos días de vacaciones tengo?"

# O modo chat interactivo:
python ask.py
```

---

## ⚙️ Configuración Inicial de Base de Datos (Supabase)

1. En tu proyecto de Supabase, abre el **SQL Editor**.
2. Ejecuta el archivo [`schema.sql`](schema.sql) para crear:
   - La extensión `vector` (pgvector).
   - La tabla `documents` con índice HNSW.
   - La función `match_documents` para búsqueda por similitud de coseno.

---

## 📂 Estructura del Proyecto

```
rag-simple/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/route.ts       # Endpoint de chat RAG con Gemini
│   │   │   └── documents/route.ts  # Endpoint para listar/subir/eliminar documentos
│   │   ├── dashboard/page.tsx      # Dashboard con componentes shadcn
│   │   ├── layout.tsx              # RootLayout con Sonner y TooltipProvider
│   │   └── page.tsx                # Página principal (renderiza Dashboard)
│   ├── components/
│   │   ├── ui/                     # Componentes shadcn (Card, Badge, Button, etc.)
│   │   ├── app-sidebar.tsx         # Sidebar de navegación
│   │   ├── rag-chat.tsx            # Chat RAG interactivo con citas
│   │   ├── rag-documents.tsx       # Gestor y subida de documentos
│   │   ├── section-cards.tsx       # Tarjetas de métricas RAG
│   │   └── site-header.tsx         # Cabecera con breadcrumb y estado
│   └── lib/
│       ├── rag.ts                  # Cliente Supabase & Gemini para Node.js
│       └── utils.ts                # Utilidades de shadcn (cn)
├── docs/                           # Documentos locales (.md, .txt, .pdf)
├── ask.py                          # CLI de consulta en Python
├── ingest.py                       # CLI de indexación en Python
├── rag.py                          # Módulo RAG central de Python
├── schema.sql                      # Script SQL para Supabase pgvector
├── components.json                 # Configuración de shadcn/ui
├── package.json                    # Dependencias Node.js (Next 16, Tailwind 4)
└── requirements.txt                # Dependencias Python
```
