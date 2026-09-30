# Gestión inmobiliaria con IA (Next.js 16 + Supabase + Gemini)

Asistente para agencias inmobiliarias de la Comunidad de Madrid. El chat **cuenta y filtra con SQL** y **lee documentos con búsqueda semántica**; un **lector de contratos** extrae los datos de un PDF para que el agente los verifique antes de guardarlos.

## Qué incluye

| Área | Descripción |
|---|---|
| **Asistente** | Function calling de Gemini con herramientas SQL parametrizadas (nunca SQL libre), búsqueda híbrida en documentos (vectorial + texto) con citas `[F1]`, streaming y transparencia de las consultas hechas. |
| **Propiedades** | Explorador con filtros y ficha (contrato, inquilino, cobros, documentos, clientes interesados). |
| **Alertas** | Vencimientos, actualización de renta, certificados, fianzas e impagos, calculados en vivo. |
| **Clientes** | Cruce demanda ↔ oferta con puntuación. |
| **Documentos** | PDF/MD/TXT en Storage privado, OCR de escaneos, troceado por cláusulas, versiones y vigencia. |
| **Lector de contratos** | PDF a la izquierda, datos a la derecha con confianza y cita; borrador aislado, catálogo cerrado de campos, comparación con la BD, revisor de cláusulas y auditoría. |

## Puesta en marcha

```bash
pnpm install
cp .env.example .env        # rellena las claves

# 1. Esquema: pega supabase/all-migrations.sql en el SQL Editor de Supabase
pnpm db:bundle              # genera ese archivo   (o `pnpm db:migrate` con SUPABASE_DB_URL)

# 2. Datos de demostración (ficticios): ~1.300 propiedades, ~1.200 inquilinos, ~16.000 pagos
pnpm seed
pnpm seed:embeddings        # embeddings de descripciones y notas de clientes
pnpm seed:docs              # 79 documentos (contratos, normas, actas…) + contratos de prueba para el lector

pnpm dev
```

Los PDF de prueba del lector quedan en `seed-output/pdfs/prueba-lector/` (uno con inquilino nuevo, uno con inquilino ya existente y uno escaneado).

## Pruebas locales sin tocar Supabase

Las migraciones, el seed y el agente se prueban contra un Postgres en memoria (PGlite):

```bash
pnpm db:check                                    # aplica las migraciones
pnpm seed:test                                   # carga el seed y comprueba coherencia
pnpm agent:test -- --docs "¿Se permiten mascotas en Calle de Toledo 45?"
pnpm lector:test                                 # lee los 3 PDFs de prueba y confirma
```

## Seguridad

- **La app está abierta por defecto** (sin login): cualquiera con la URL puede ver y borrar datos. Para exigir contraseña define `APP_REQUIRE_LOGIN=true`, `APP_PASSWORD` y `APP_ADMIN_PASSWORD`.
- La clave `service_role` solo se usa en el servidor. Las tablas tienen RLS activado sin políticas y las funciones no son ejecutables con la clave pública.
- Los campos nuevos los aprueba un administrador y siempre entran como atributos tipados, nunca como columnas.
- Los datos de inquilinos son **ficticios**. Antes de usar datos reales: plan de pago de Gemini (la capa gratuita puede usar los datos para entrenar) y autenticación por usuario con políticas RLS.

## Gemini y cuota

Modelo por defecto: `gemini-flash-lite-latest`. Cada pregunta del chat hace 2-4 llamadas. La capa gratuita tiene topes diarios muy bajos; si se agotan, el sistema pasa a `GEMINI_FALLBACK_MODELS`. Para uso real, activa la facturación.

## Aviso legal

Las respuestas y el revisor de cláusulas sobre LAU/Ley 12/2023 son **orientativos**, no asesoramiento jurídico.
