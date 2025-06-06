from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, Optional, List

import httpx

DATA_FILE = Path(__file__).resolve().parent.parent / "data" / "cross_border_tax_rates.json"

with DATA_FILE.open() as f:
    TAX_DATA = json.load(f)


async def calculate_cross_border_tax(
    residence_country: str,
    work_country: str,
    annual_income: float,
    family_status: str = "single",
    children_count: int = 0,
    special_circumstances: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """Calculate simplified income tax using real tax rate data."""

    residence_info = TAX_DATA.get(residence_country)
    work_info = TAX_DATA.get(work_country)
    if not residence_info or not work_info:
        raise ValueError("Unsupported country code")

    taxable_income = max(0, annual_income - residence_info["allowance"])
    tax_due = taxable_income * work_info["flat_rate"]

    return {
        "residence_country": residence_country,
        "work_country": work_country,
        "taxable_income": taxable_income,
        "tax_rate": work_info["flat_rate"],
        "tax_due": round(tax_due, 2),
    }


async def search_cross_border_healthcare(
    location: str,
    specialty: Optional[str] = None,
    language: str = "de",
    radius_km: int = 50,
) -> List[Dict[str, Any]]:
    """Search doctors or hospitals across borders using the public Nominatim API."""

    query = specialty if specialty else "doctor"
    params = {
        "q": f"{query} {location}",
        "format": "json",
        "limit": 10,
    }
    headers = {"User-Agent": "agentland-os/1.0", "Accept-Language": language}

    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get("https://nominatim.openstreetmap.org/search", params=params, headers=headers)
        resp.raise_for_status()
        data = resp.json()

    results = [
        {
            "name": item.get("display_name"),
            "lat": item.get("lat"),
            "lon": item.get("lon"),
        }
        for item in data
    ]

    return results
