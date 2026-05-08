# EmprendePlus — Backend

API REST construida con FastAPI + SQLModel + SQLite. Gestiona usuarios, negocios, productos, ventas, finanzas, presupuestos y el asesor de IA.

## Instalación

```bash
uv pip install -r requirements.txt
```

## Desarrollo

```bash
uvicorn main:app --reload --port 8000
```

Docs interactivas disponibles en http://localhost:8000/docs

## Variables de entorno

Crea un archivo `.env` en esta carpeta:

```env
AUTH0_DOMAIN=your-tenant.auth0.com
API_AUDIENCE=http://localhost:8000/api
OPENAI_API_KEY=sk-...
BYPASS_AUTH=false
DB_ECHO=false
```

## Modo bypass

Con `BYPASS_AUTH=true`, el servidor omite la validación JWT y crea automáticamente al arrancar:
- Usuario: `dev|bypass-001`
- Negocio con datos dummy (12 productos, 60 ventas, 24 movimientos financieros, 6 presupuestos)

## Endpoints principales

| Prefijo                   | Descripción              |
|---------------------------|--------------------------|
| `/api/users`              | Usuarios                 |
| `/api/business`           | Configuración del negocio|
| `/api/products`           | Productos                |
| `/api/sales`              | Ventas                   |
| `/api/finances`           | Finanzas                 |
| `/api/budgets`            | Presupuestos             |
| `/api/dashboard`          | Métricas del dashboard   |
| `/api/advisor`            | Asesor IA (OpenAI)       |
| `/api/generate-dummy-data`| Generador de datos demo  |

## Dependencias principales

- `fastapi` — framework HTTP
- `sqlmodel` — ORM sobre SQLAlchemy con tipado Pydantic
- `python-jose[cryptography]` — validación de JWT Auth0
- `openai` — asesor de IA
- `faker` — generación de datos dummy
- `python-multipart` — subida de imágenes
