"""
Datenbankverbindung und -konfiguration
"""

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import DeclarativeMeta, declarative_base, sessionmaker

from app.core.config import settings

# Async Engine erstellen - OPTIMIERT FÜR 200K USERS
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True,
    pool_pre_ping=True,
    pool_size=50,  # Erhöht von 10 auf 50 für hohe Last
    max_overflow=100,  # Erhöht von 20 auf 100 für Spitzenlasten
    pool_timeout=30,  # Timeout für Pool-Connections
    pool_recycle=3600,  # Recycle Connections nach 1 Stunde
    pool_reset_on_return='commit',  # Reset Connection nach Commit
    connect_args={
        "server_settings": {
            "jit": "off",  # Deaktiviert JIT für bessere Performance
            "statement_timeout": "30000",  # 30 Sekunden Statement Timeout
            "idle_in_transaction_session_timeout": "60000",  # 60 Sekunden Idle Timeout
        },
        "command_timeout": 60,  # Command Timeout
        "prepared_statement_cache_size": 100,  # Prepared Statement Cache
    }
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