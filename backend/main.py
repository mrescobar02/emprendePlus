from fastapi import Depends, FastAPI
from routers import blacklist
from fastapi.middleware.cors import CORSMiddleware
from db.utils import create_tables
from contextlib import asynccontextmanager
from db import models
from routers import budgets, business, dashboard, finances, users, products, sales, advisor, generate_dummy_data, download_data
from services.register_session import handle_register_session
from fastapi.staticfiles import StaticFiles
import os

def _setup_bypass_user():
    from sqlmodel import Session, select
    from db.models import User, Business
    from db.dummy_generator import generate_dummy_data_for_user
    from db.connection import engine
    import uuid

    user_id = "dev|bypass-001"
    with Session(engine) as session:
        if session.exec(select(User).where(User.id == user_id)).first():
            return
        user = User(id=user_id, name="Dev User", email="dev@localhost.com")
        session.add(user)
        business = Business(
            id=uuid.uuid4(),
            name="Dev Business",
            description="Negocio de desarrollo",
            owner_id=user_id,
        )
        session.add(business)
        session.commit()

    with Session(engine) as session:
        generate_dummy_data_for_user(
            user_id=user_id,
            session=session,
            products_count=12,
            sales_count=60,
            finances_count=24,
            budgets_count=6,
        )
    print("✅ Bypass user created with dummy data")

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_tables()
    if os.getenv("BYPASS_AUTH", "false").lower() == "true":
        _setup_bypass_user()
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
IMAGE_DIR = os.path.join(BASE_DIR, "image")
app.mount("/image", StaticFiles(directory=IMAGE_DIR), name="image")

app.include_router(users.router, prefix="/api/users", tags=["Usuarios"])
app.include_router(products.router, prefix="/api/products", tags=["Productos"])
app.include_router(sales.router, prefix="/api/sales", tags=["Ventas"])
app.include_router(business.router, prefix="/api/business", tags=["Negocios"])
app.include_router(finances.router, prefix="/api/finances", tags=["Finanzas"])
app.include_router(budgets.router, prefix="/api/budgets", tags=["Presupuestos"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Tablero"])

app.include_router(download_data.router, prefix="/api", tags=["Descarga Data"])
app.include_router(advisor.router, prefix="/api/advisor", tags=["Modaldobot"])
app.include_router(generate_dummy_data.router, prefix="/api/generate-dummy-data", tags=["Generar Data"])
app.include_router(blacklist.router, tags=["Blacklist"])


# Ruta base
@app.get("/")
def read_root():
    return {"Base de datos creada"}

@app.post("/api/register-session")
def register_session(response=Depends(handle_register_session)):
    return response