# EmprendePlus

Plataforma web de gestión empresarial para emprendedores. Centraliza ventas, finanzas, productos, presupuestos y métricas en un solo lugar, con un asesor de IA integrado.

## Estructura del monorepo

```
emprendePlus/
├── frontend/   # React 19 + Vite + TypeScript
└── backend/    # FastAPI + SQLModel + SQLite
```

## Requisitos previos

- Node.js ≥ 18 y [pnpm](https://pnpm.io/)
- Python ≥ 3.11 y [uv](https://github.com/astral-sh/uv)
- Cuenta en [Auth0](https://auth0.com/) (o usar bypass de desarrollo)

## Inicio rápido

```bash
# Instalar dependencias
make install

# Levantar frontend y backend en paralelo
make dev
```

- Frontend: http://localhost:5173
- Backend:  http://localhost:8000

## Variables de entorno

### `frontend/.env`
```env
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_REDIRECT_URI=http://localhost:5173
VITE_AUTH0_AUDIENCE=http://localhost:8000/api
VITE_BYPASS_AUTH=false   # true para desarrollo sin Auth0
VITE_API_URL=            # vacío para usar el proxy de Vite
```

### `backend/.env`
```env
AUTH0_DOMAIN=your-tenant.auth0.com
API_AUDIENCE=http://localhost:8000/api
OPENAI_API_KEY=sk-...
BYPASS_AUTH=false        # true para desarrollo sin Auth0
DB_ECHO=false
```

## Modo bypass (desarrollo sin Auth0)

Poniendo `VITE_BYPASS_AUTH=true` en el frontend y `BYPASS_AUTH=true` en el backend, el servidor crea automáticamente un usuario de desarrollo con datos dummy (productos, ventas, finanzas y presupuestos) al arrancar.

## Comandos útiles

| Comando             | Descripción                        |
|---------------------|------------------------------------|
| `make dev`          | Frontend + backend en paralelo     |
| `make dev-frontend` | Solo frontend                      |
| `make dev-backend`  | Solo backend                       |
| `make build`        | Build de producción del frontend   |
| `make lint`         | Lint del frontend                  |

## Stack

| Capa        | Tecnología                                          |
|-------------|-----------------------------------------------------|
| Frontend    | React 19, Vite, TypeScript, Tailwind CSS            |
| Gráficas    | Apache ECharts, React PDF                           |
| Backend     | FastAPI, SQLModel, SQLite                           |
| Auth        | Auth0 (JWT)                                         |
| IA          | OpenAI API                                          |
| Package mgr | pnpm (frontend), uv (backend)                       |

## Autor

Isaac Escobar — [@mrescobar02](https://github.com/mrescobar02)
