"""Cross-Border Services API"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

from app.services.cross_border_service import (
    calculate_cross_border_tax,
    search_cross_border_healthcare,
)

router = APIRouter(
    prefix="/api/v1/cross-border",
    tags=["cross-border"],
)


class TaxRequest(BaseModel):
    residence_country: str = Field(..., pattern="^(DE|FR|LU)$")
    work_country: str = Field(..., pattern="^(DE|FR|LU)$")
    annual_income: float = Field(..., ge=0)
    family_status: Optional[str] = "single"
    children_count: Optional[int] = 0
    special_circumstances: Optional[List[str]] = None


@router.post("/tax-calculator")
async def tax_calculator(req: TaxRequest) -> Dict[str, Any]:
    """Calculate income tax for cross-border workers."""
    try:
        data = await calculate_cross_border_tax(
            req.residence_country,
            req.work_country,
            req.annual_income,
            req.family_status,
            req.children_count,
            req.special_circumstances,
        )
        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/healthcare/search")
async def healthcare_search(
    location: str,
    specialty: Optional[str] = None,
    language: str = "de",
    radius_km: int = 50,
) -> Dict[str, Any]:
    """Find cross-border doctors and hospitals."""
    try:
        results = await search_cross_border_healthcare(
            location, specialty, language, radius_km
        )
        return {"status": "success", "providers": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
