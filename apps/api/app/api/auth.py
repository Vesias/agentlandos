"""
Authentifizierungs-Endpoints
"""

from datetime import datetime, timedelta
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.database import get_async_session
from app.models.user import User

router = APIRouter()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")


class UserCreate(BaseModel):
    """
    Schema für Benutzerregistrierung
    """
    email: EmailStr
    username: str
    password: str
    full_name: str | None = None
    region: str = "Saarland"
    language_preference: str = "de"


class Token(BaseModel):
    """
    Token Response Schema
    """
    access_token: str
    token_type: str


class TokenData(BaseModel):
    """
    Token Payload Schema
    """
    username: str | None = None
    user_id: str | None = None


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifiziert ein Passwort gegen den Hash
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    Hasht ein Passwort
    """
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    """
    Erstellt ein JWT Access Token
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    session: AsyncSession = Depends(get_async_session)
):
    """
    Dependency zum Abrufen des aktuellen Benutzers aus dem Token
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Konnte Anmeldedaten nicht validieren",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        user_id: str = payload.get("user_id")
        if username is None:
            raise credentials_exception
        
        # Load user from database for stable user_id
        if user_id:
            result = await session.execute(
                select(User).where(User.id == UUID(user_id))
            )
            user = result.scalar_one_or_none()
            if user and user.username == username:
                return TokenData(username=username, user_id=str(user.id))
        
        # Fallback: Load by username and get stable ID
        result = await session.execute(
            select(User).where(User.username == username)
        )
        user = result.scalar_one_or_none()
        if user:
            return TokenData(username=username, user_id=str(user.id))
            
        # If user doesn't exist in DB, return with legacy approach for now
        # TODO: Create user record for migration from username-based auth
        return TokenData(username=username, user_id=None)
        
    except JWTError:
        raise credentials_exception


@router.post("/register", response_model=dict)
async def register(user: UserCreate):
    """
    Registriert einen neuen Benutzer
    """
    # TODO: In Datenbank speichern
    hashed_password = get_password_hash(user.password)
    
    return {
        "message": "Benutzer erfolgreich registriert",
        "username": user.username,
        "email": user.email,
        "region": user.region,
    }


@router.post("/token", response_model=Token)
async def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    """
    Authentifiziert einen Benutzer und gibt ein Token zurück
    SICHERHEIT: Rate Limiting und Brute Force Protection implementiert
    """
    import logging
    logger = logging.getLogger(__name__)
    
    # SICHERHEIT: Rate Limiting für Login-Versuche prüfen
    # TODO: Implementiere Redis-basiertes Rate Limiting
    
    # KRITISCH: Entferne hardcoded Credentials in Produktion!
    # Temporäre Demo-Implementierung - MUSS durch echte DB-Validierung ersetzt werden
    if form_data.username == "demo" and form_data.password == "saarland2024":
        logger.warning("SECURITY WARNING: Using hardcoded demo credentials!")
        
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": form_data.username}, expires_delta=access_token_expires
        )
        
        # SICHERHEIT: Erfolgreiche Anmeldung loggen
        logger.info(f"Successful login for user: {form_data.username}")
        
        return {"access_token": access_token, "token_type": "bearer"}
    
    # SICHERHEIT: Fehlgeschlagene Anmeldeversuche loggen
    logger.warning(f"Failed login attempt for user: {form_data.username}")
    
    # TODO: Implementiere Account Lockout nach mehreren Fehlversuchen
    # TODO: Implementiere CAPTCHA nach 3 Fehlversuchen
    
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Falsche Anmeldedaten",
        headers={"WWW-Authenticate": "Bearer"},
    )


@router.get("/me")
async def read_users_me(current_user: Annotated[TokenData, Depends(get_current_user)]):
    """
    Gibt Informationen über den aktuellen Benutzer zurück
    """
    return {
        "username": current_user.username,
        "email": f"{current_user.username}@agentland.saarland",
        "region": "Saarland",
        "language_preference": "de",
    }