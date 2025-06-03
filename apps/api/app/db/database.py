"""
Datenbankverbindung und -konfiguration
"""

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import DeclarativeMeta, declarative_base, sessionmaker

from app.core.config import settings

# Async Engine erstellen
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)

# Async Session Factory
async_session_maker = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# Declarative Base für Modelle
Base: DeclarativeMeta = declarative_base()


async def create_db_and_tables():
    """
    Erstellt die Datenbank und alle Tabellen
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_async_session() -> AsyncSession:
    """
    Dependency für FastAPI zur Bereitstellung von Datenbanksessions
    """
    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()