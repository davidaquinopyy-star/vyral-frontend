# Vyral

Frontend inicial de Vyral, una plataforma de inteligencia de contenido para creadores y negocios.

## Stack
- React + Vite + TypeScript
- Supabase Auth
- Lucide React
- CSS responsive mobile-first

## Desarrollo local
1. Instalar Node.js 20 o superior.
2. Ejecutar `npm install`.
3. Copiar `.env.example` a `.env.local`.
4. Completar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
5. Ejecutar `npm run dev`.

## Build
`npm run build` genera el sitio en `dist/`.

## Cloudflare Pages
- Framework preset: Vite
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: `/`

Variables de entorno necesarias:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Usá únicamente la publishable key (o anon key legacy) en el frontend. Nunca agregues `service_role`, secret keys, claves de NVIDIA ni credenciales de proveedores sociales al código del navegador.

## Estado del producto
El acceso con Supabase Auth y la navegación del dashboard están implementados. Los módulos de análisis y generación se muestran como preparación inicial hasta conectar proveedores de datos sociales y funciones backend. No se simulan métricas ni resultados de IA.

La compilación se valida automáticamente con GitHub Actions en cada push a `main`.

CI setup adjusted.
