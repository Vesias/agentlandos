"""
Input Validation und Sanitization für AGENTLAND.SAARLAND
Schutz vor XSS, SQL Injection und anderen Angriffsvektoren
"""

import re
import bleach
import html
from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field, validator
import logging

logger = logging.getLogger(__name__)


class SecurityError(Exception):
    """Custom Security Exception"""
    pass


class InputSanitizer:
    """
    Zentrale Klasse für Input Sanitization
    """
    
    # Erlaubte HTML Tags für Rich Text (sehr restriktiv)
    ALLOWED_TAGS = ['b', 'i', 'em', 'strong', 'p', 'br']
    ALLOWED_ATTRIBUTES = {}
    
    # Gefährliche Patterns
    DANGEROUS_PATTERNS = [
        # SQL Injection
        r'(\bUNION\b.*\bSELECT\b)|(\bSELECT\b.*\bFROM\b)',
        r'(\bINSERT\b.*\bINTO\b)|(\bUPDATE\b.*\bSET\b)',
        r'(\bDELETE\b.*\bFROM\b)|(\bDROP\b.*\bTABLE\b)',
        r'(\bALTER\b.*\bTABLE\b)|(\bCREATE\b.*\bTABLE\b)',
        
        # Script Injection
        r'<\s*script[^>]*>.*?<\s*/\s*script\s*>',
        r'javascript\s*:',
        r'on\w+\s*=',
        
        # Command Injection
        r'(\|\s*\w+)|(\;\s*\w+)',
        r'(\`[^`]*\`)|(\$\([^)]*\))',
        
        # Path Traversal
        r'\.\.(/|\\)',
        r'(\.\.%2f)|(\.\.%5c)',
        
        # LDAP Injection
        r'(\(\|)|(\)\()|(\*\))',
        
        # XML/XPath Injection
        r'(\[\s*@\w+)|(\]\s*\[)',
    ]
    
    @classmethod
    def sanitize_text(cls, text: str, allow_html: bool = False) -> str:
        """
        Text sanitization
        """
        if not isinstance(text, str):
            return str(text)
        
        # HTML escaping
        if not allow_html:
            text = html.escape(text)
        else:
            # Gefährliche HTML Tags entfernen
            text = bleach.clean(
                text,
                tags=cls.ALLOWED_TAGS,
                attributes=cls.ALLOWED_ATTRIBUTES,
                strip=True
            )
        
        # Gefährliche Patterns prüfen
        for pattern in cls.DANGEROUS_PATTERNS:
            if re.search(pattern, text, re.IGNORECASE):
                logger.warning(f"Dangerous pattern detected: {pattern}")
                raise SecurityError(f"Invalid input detected")
        
        # Unicode normalization
        text = text.encode('utf-8', 'ignore').decode('utf-8')
        
        return text.strip()
    
    @classmethod
    def sanitize_filename(cls, filename: str) -> str:
        """
        Dateiname sanitization
        """
        if not filename:
            return "unknown"
        
        # Gefährliche Zeichen entfernen
        filename = re.sub(r'[<>:"/\\|?*]', '', filename)
        filename = re.sub(r'\.\.', '', filename)  # Path traversal
        filename = re.sub(r'^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$', 'file', filename, re.IGNORECASE)
        
        # Länge begrenzen
        if len(filename) > 255:
            name, ext = filename.rsplit('.', 1) if '.' in filename else (filename, '')
            filename = name[:250] + ('.' + ext if ext else '')
        
        return filename or "unnamed"
    
    @classmethod
    def validate_email(cls, email: str) -> bool:
        """
        E-Mail Validation
        """
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email)) and len(email) <= 254
    
    @classmethod
    def validate_phone(cls, phone: str) -> bool:
        """
        Telefonnummer Validation (Deutsche/EU Standards)
        """
        # Nur Ziffern, +, -, (, ), Leerzeichen erlaubt
        clean_phone = re.sub(r'[^\d+\-() ]', '', phone)
        
        # Deutsche/EU Telefonnummer Pattern
        patterns = [
            r'^\+49[1-9][0-9]{1,14}$',  # Deutsche Handynummern
            r'^0[1-9][0-9]{1,14}$',     # Deutsche Festnetz
            r'^\+[1-9][0-9]{1,14}$',    # International
        ]
        
        return any(re.match(pattern, clean_phone) for pattern in patterns)


class SecureChatRequest(BaseModel):
    """
    Sichere Chat Request Validierung
    """
    message: str = Field(..., min_length=1, max_length=2000)
    language: str = Field(default="de", regex=r'^(de|fr|en|saar)$')
    context: Optional[Dict[str, Any]] = None
    conversationHistory: Optional[List[Dict]] = Field(default=None, max_items=10)
    userInterests: Optional[Dict[str, float]] = None
    
    @validator('message')
    def validate_message(cls, v):
        """Message Validation und Sanitization"""
        try:
            sanitized = InputSanitizer.sanitize_text(v, allow_html=False)
            
            # Zusätzliche Chat-spezifische Prüfungen
            if len(sanitized.strip()) == 0:
                raise ValueError('Message cannot be empty')
            
            # Spam Detection (einfach)
            if sanitized.count('http') > 3:
                raise ValueError('Too many links in message')
                
            return sanitized
        except SecurityError as e:
            raise ValueError(f'Security validation failed: {str(e)}')
    
    @validator('context')
    def validate_context(cls, v):
        """Context Validation"""
        if v is None:
            return v
        
        # Maximale Context-Größe
        if len(str(v)) > 1000:
            raise ValueError('Context too large')
        
        # Gefährliche Keys prüfen
        dangerous_keys = ['__proto__', 'constructor', 'prototype']
        if any(key in str(v).lower() for key in dangerous_keys):
            raise ValueError('Invalid context structure')
        
        return v
    
    @validator('conversationHistory')
    def validate_history(cls, v):
        """Conversation History Validation"""
        if not v:
            return v
        
        for message in v:
            if not isinstance(message, dict):
                raise ValueError('Invalid message format')
            
            if 'content' in message:
                try:
                    message['content'] = InputSanitizer.sanitize_text(
                        str(message['content']), 
                        allow_html=False
                    )
                except SecurityError:
                    raise ValueError('Invalid content in conversation history')
        
        return v


class SecureUserRegistration(BaseModel):
    """
    Sichere User Registration Validierung
    """
    email: str = Field(..., max_length=254)
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8, max_length=128)
    full_name: Optional[str] = Field(None, max_length=255)
    region: str = Field(default="Saarland", max_length=100)
    language_preference: str = Field(default="de", regex=r'^(de|fr|en)$')
    
    @validator('email')
    def validate_email(cls, v):
        """E-Mail Validation"""
        v = v.lower().strip()
        if not InputSanitizer.validate_email(v):
            raise ValueError('Invalid email format')
        return v
    
    @validator('username')
    def validate_username(cls, v):
        """Username Validation"""
        v = InputSanitizer.sanitize_text(v, allow_html=False)
        
        # Nur alphanumerisch + Unterstrich erlaubt
        if not re.match(r'^[a-zA-Z0-9_]+$', v):
            raise ValueError('Username must contain only letters, numbers and underscores')
        
        # Reservierte Namen prüfen
        reserved = ['admin', 'root', 'user', 'test', 'api', 'system']
        if v.lower() in reserved:
            raise ValueError('Username is reserved')
        
        return v
    
    @validator('password')
    def validate_password(cls, v):
        """Password Strength Validation"""
        # Mindestanforderungen für sicheres Passwort
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        
        checks = [
            (r'[a-z]', 'lowercase letter'),
            (r'[A-Z]', 'uppercase letter'),
            (r'[0-9]', 'number'),
            (r'[!@#$%^&*(),.?":{}|<>]', 'special character')
        ]
        
        missing = []
        for pattern, description in checks:
            if not re.search(pattern, v):
                missing.append(description)
        
        if len(missing) > 1:  # Mindestens 3 von 4 Kategorien
            raise ValueError(f'Password must contain: {", ".join(missing)}')
        
        # Häufige Passwörter prüfen
        common_passwords = [
            'password', '123456', 'qwerty', 'abc123',
            'saarland', 'agentland', 'admin123'
        ]
        if v.lower() in common_passwords:
            raise ValueError('Password is too common')
        
        return v
    
    @validator('full_name')
    def validate_full_name(cls, v):
        """Full Name Validation"""
        if v is None:
            return v
        
        v = InputSanitizer.sanitize_text(v, allow_html=False)
        
        # Nur Buchstaben, Leerzeichen, Bindestriche erlaubt
        if not re.match(r'^[a-zA-ZäöüÄÖÜß\s\-\.]+$', v):
            raise ValueError('Full name contains invalid characters')
        
        return v.strip()


class SecureFileUpload(BaseModel):
    """
    Sichere File Upload Validierung
    """
    filename: str = Field(..., max_length=255)
    content_type: str = Field(..., max_length=100)
    size: int = Field(..., gt=0, le=10*1024*1024)  # Max 10MB
    
    @validator('filename')
    def validate_filename(cls, v):
        """Filename Validation"""
        return InputSanitizer.sanitize_filename(v)
    
    @validator('content_type')
    def validate_content_type(cls, v):
        """Content Type Validation"""
        allowed_types = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'application/pdf', 'text/plain', 'text/csv',
            'application/json', 'application/xml'
        ]
        
        if v not in allowed_types:
            raise ValueError(f'File type {v} not allowed')
        
        return v


class GDPRCompliantData(BaseModel):
    """
    GDPR-konforme Datenverarbeitung
    """
    data_subject_consent: bool = Field(True)
    data_purpose: str = Field(..., max_length=255)
    retention_period_days: int = Field(default=365, ge=1, le=2555)  # Max 7 Jahre
    
    @validator('data_purpose')
    def validate_purpose(cls, v):
        """Zweck der Datenverarbeitung validieren"""
        allowed_purposes = [
            'user_account_management',
            'service_provision',
            'analytics_anonymous',
            'customer_support',
            'legal_compliance'
        ]
        
        if v not in allowed_purposes:
            raise ValueError(f'Data purpose must be one of: {allowed_purposes}')
        
        return v


# Rate Limiting Helper
class RateLimitExceeded(Exception):
    """Rate Limit Exceeded Exception"""
    def __init__(self, retry_after: int = 60):
        self.retry_after = retry_after
        super().__init__(f"Rate limit exceeded. Retry after {retry_after} seconds")


def validate_ip_address(ip: str) -> bool:
    """
    IP Address Validation
    """
    import ipaddress
    try:
        ipaddress.ip_address(ip)
        return True
    except ValueError:
        return False


def detect_bot_traffic(user_agent: str, ip: str) -> bool:
    """
    Bot Traffic Detection
    """
    bot_indicators = [
        'bot', 'crawler', 'spider', 'scraper',
        'wget', 'curl', 'python', 'requests'
    ]
    
    ua_lower = user_agent.lower()
    is_bot = any(indicator in ua_lower for indicator in bot_indicators)
    
    # Zusätzliche Prüfungen
    if len(user_agent) < 10 or user_agent == '-':
        is_bot = True
    
    return is_bot


def check_content_safety(text: str) -> Dict[str, Any]:
    """
    Content Safety Check (Hate Speech, Spam, etc.)
    """
    # Einfache Implementierung - in Produktion erweiterte KI-basierte Prüfung
    
    hate_words = [
        # Füge hier Hate Speech Keywords hinzu (sprachspezifisch)
    ]
    
    spam_patterns = [
        r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+',
        r'\b[A-Z]{3,}\b.*\b[A-Z]{3,}\b',  # Viele Großbuchstaben
        r'(.)\1{4,}',  # Wiederholende Zeichen
    ]
    
    issues = []
    
    text_lower = text.lower()
    
    # Hate Speech Check
    if any(word in text_lower for word in hate_words):
        issues.append('hate_speech')
    
    # Spam Check
    if any(re.search(pattern, text) for pattern in spam_patterns):
        issues.append('spam')
    
    # Excessive Caps
    if len(re.findall(r'[A-Z]', text)) / max(len(text), 1) > 0.5:
        issues.append('excessive_caps')
    
    return {
        'is_safe': len(issues) == 0,
        'issues': issues,
        'confidence': 0.8 if issues else 0.95
    }