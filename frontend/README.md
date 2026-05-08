# EmprendePlus — Frontend

SPA construida con React 19 + Vite + TypeScript. Consume la API REST del backend y ofrece un dashboard completo para la gestión del negocio.

## Instalación

```bash
pnpm install
```

## Desarrollo

```bash
pnpm dev
```

El proxy de Vite redirige `/api/*` → `http://localhost:8000` automáticamente.

## Variables de entorno

Crea un archivo `.env` en esta carpeta (ver `.env.example`):

```env
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_REDIRECT_URI=http://localhost:5173
VITE_AUTH0_AUDIENCE=http://localhost:8000/api
VITE_BYPASS_AUTH=false
VITE_API_URL=
```

## Módulos principales

| Ruta             | Descripción                                      |
|------------------|--------------------------------------------------|
| `/`              | Dashboard con métricas, gráficas y producto estrella |
| `/sales`         | Registro y listado de ventas, generación de facturas PDF |
| `/products`      | Catálogo de productos con control de stock       |
| `/finances`      | Ingresos/egresos con gráficas de tendencias      |
| `/finances/details` | Presupuestos y análisis por categoría         |
| `/business`      | Configuración del negocio y exportación de datos |
| `/profile`       | Perfil del usuario                               |

## Build de producción

```bash
pnpm build
```
