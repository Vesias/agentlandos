"""
Enhanced Navigator Agent for AGENT_LAND_SAARLAND
Central coordinator for all regional AI agents
"""

from typing import Dict, List, Optional, Any
from datetime import datetime
import json
import logging
from enum import Enum

logger = logging.getLogger(__name__)


class QueryCategory(Enum):
    """Categories of user queries to route to appropriate agents"""
    TOURISM = "tourism"
    ADMINISTRATION = "administration"
    BUSINESS = "business"
    EDUCATION = "education"
    CULTURE = "culture"
    GENERAL = "general"
    EMERGENCY = "emergency"