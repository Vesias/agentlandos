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

# Demo user ID for demonstration purposes
DEMO_USER_ID = UUID("00000000-0000-0000-0000-000000000001")

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
