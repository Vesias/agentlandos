"""
Benutzer-Management Endpoints
"""

from typing import List, Any
from uuid import UUID

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr

from app.api.auth import get_current_user, TokenData

router = APIRouter()


class UserProfile(BaseModel):
    """
    Benutzerprofil Schema
    """
    id: UUID
    username: str
    email: EmailStr
    full_name: str | None
    region: str
    language_preference: str
    role: str
    is_active: bool


class UserPreferences(BaseModel):
    """
    Benutzereinstellungen Schema
    """
    language: str
    notifications_enabled: bool
    agent_preferences: dict[str, Any]
    accessibility_options: dict[str, Any]


@router.get("/profile", response_model=UserProfile)
async def get_user_profile(
    current_user: TokenData = Depends(get_current_user)
):
    """
    Ruft das Benutzerprofil ab
    """
    # TODO: Aus Datenbank laden
    return UserProfile(
        id=UUID("00000000-0000-0000-0000-000000000001"),
        username=current_user.username,
        email=f"{current_user.username}@agentland.saarland",
        full_name="Demo Benutzer",
        region="Saarland",
        language_preference="de",
        role="user",
        is_active=True,
    )


@router.put("/profile")
async def update_user_profile(
    full_name: str | None = None,
    region: str | None = None,
    language_preference: str | None = None,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Aktualisiert das Benutzerprofil
    """
    # TODO: In Datenbank aktualisieren
    return {
        "message": "Profil erfolgreich aktualisiert",
        "username": current_user.username,
    }


@router.get("/preferences", response_model=UserPreferences)
async def get_user_preferences(
    current_user: TokenData = Depends(get_current_user)
):
    """
    Ruft die Benutzereinstellungen ab
    """
    # TODO: Aus Datenbank laden
    return UserPreferences(
        language="de",
        notifications_enabled=True,
        agent_preferences={
            "preferred_agents": ["navigator", "tourism"],
            "response_style": "detailed",
        },
        accessibility_options={
            "high_contrast": False,
            "large_text": False,
            "screen_reader": False,
        }
    )


@router.put("/preferences")
async def update_user_preferences(
    preferences: UserPreferences,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Aktualisiert die Benutzereinstellungen
    """
    # TODO: In Datenbank speichern
    return {
        "message": "Einstellungen erfolgreich aktualisiert",
        "username": current_user.username,
    }


@router.get("/conversations")
async def get_user_conversations(
    current_user: TokenData = Depends(get_current_user)
):
    """
    Ruft die Konversationshistorie des Benutzers ab
    """
    # TODO: Aus Datenbank laden
    return {
        "conversations": [
            {
                "id": "00000000-0000-0000-0000-000000000001",
                "title": "Tourismus im Saarland",
                "last_message": "Die Saarschleife ist ein beliebtes Ausflugsziel...",
                "timestamp": "2024-01-15T10:30:00Z",
                "agent": "tourism",
            },
            {
                "id": "00000000-0000-0000-0000-000000000002",
                "title": "Behördengang Hilfe",
                "last_message": "Für die Anmeldung benötigen Sie folgende Unterlagen...",
                "timestamp": "2024-01-14T14:15:00Z",
                "agent": "administration",
            }
        ]
    }


@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: UUID,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Löscht eine Konversation
    """
    # TODO: Aus Datenbank löschen
    return {
        "message": "Konversation erfolgreich gelöscht",
        "conversation_id": str(conversation_id),
    }