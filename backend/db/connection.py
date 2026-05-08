import os
from sqlmodel import SQLModel, create_engine

sqlite_file_name = "database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

_echo = os.getenv("DB_ECHO", "false").lower() == "true"
engine = create_engine(sqlite_url, echo=_echo)

def init_db():
    """
    Importa los modelos y crea todas las tablas en la base de datos.
    """
    import models  # Esto importa tu archivo models.py para registrar todos los modelos en SQLModel.metadata
    SQLModel.metadata.create_all(engine)