"""
Authentifizierungs-Endpoints
"""

from datetime import datetime, timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr

from app.core.config import settings

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


async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
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
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    # TODO: Benutzer aus Datenbank laden
    return token_data


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
    """
    # TODO: Benutzer aus Datenbank laden und verifizieren
    # Für MVP: Hardcoded Demo-User
    if form_data.username != "demo" or form_data.password != "saarland2024":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Falsche Anmeldedaten",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": form_data.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


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