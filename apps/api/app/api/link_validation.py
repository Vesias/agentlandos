"""
Link Validation API Endpoints for AGENTLAND.SAARLAND
Real-time link health monitoring and validation
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import List, Dict, Optional
import asyncio
from datetime import datetime

from ..services.link_validator import (
    SaarlandLinkValidator, 
    validate_links_endpoint, 
    generate_health_report_endpoint
)

router = APIRouter(prefix="/api/v1/link-validation", tags=["Link Validation"])

# Global validation cache
validation_cache: Dict = {}
last_full_scan: Optional[datetime] = None

@router.post("/validate")
async def validate_urls(urls: List[str]) -> Dict:
    """
    🔗 Validate list of URLs for accessibility and Saarland relevance
    """
    if not urls:
        raise HTTPException(status_code=400, detail="No URLs provided")
    
    if len(urls) > 100:
        raise HTTPException(status_code=400, detail="Too many URLs (max 100)")
    
    try:
        result = await validate_links_endpoint(urls)
        return {
            "status": "success",
            "data": result,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Validation failed: {str(e)}")

@router.get("/health-report")
async def get_link_health_report(force_refresh: bool = False) -> Dict:
    """
    📊 Get comprehensive link health report for entire codebase
    """
    global validation_cache, last_full_scan
    
    # Check if we have recent cache (within 1 hour) and not forcing refresh
    if (not force_refresh and 
        last_full_scan and 
        (datetime.utcnow() - last_full_scan).total_seconds() < 3600 and
        validation_cache):
        return {
            "status": "success",
            "data": validation_cache,
            "cached": True,
            "cache_age_minutes": int((datetime.utcnow() - last_full_scan).total_seconds() / 60)
        }
    
    try:
        report = await generate_health_report_endpoint()
        
        # Update cache
        validation_cache = report
        last_full_scan = datetime.utcnow()
        
        return {
            "status": "success", 
            "data": report,
            "cached": False,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report generation failed: {str(e)}")

@router.get("/quick-check")
async def quick_link_check() -> Dict:
    """
    ⚡ Quick check of critical Saarland links
    """
    critical_links = [
        "https://www.saarland.de",
        "https://www.saarbruecken.de", 
        "https://www.uni-saarland.de",
        "https://www.saarvv.de",
        "https://www.urlaub.saarland",
        "https://www.ticket-regional.de",
        "https://www.staatstheater.saarland"
    ]
    
    try:
        result = await validate_links_endpoint(critical_links)
        
        # Calculate quick health score
        healthy_count = result['summary']['healthy_links']
        total_count = result['summary']['total_validated']
        health_score = (healthy_count / total_count * 100) if total_count > 0 else 0
        
        return {
            "status": "success",
            "health_score": round(health_score, 1),
            "critical_links_status": {
                "total": total_count,
                "healthy": healthy_count,
                "issues": total_count - healthy_count
            },
            "details": result['validation_results'],
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Quick check failed: {str(e)}")

@router.post("/fix-recommendations")
async def get_fix_recommendations(broken_urls: List[str]) -> Dict:
    """
    🔧 Get fix recommendations for broken or non-Saarland URLs
    """
    if not broken_urls:
        raise HTTPException(status_code=400, detail="No URLs provided")
    
    try:
        async with SaarlandLinkValidator() as validator:
            recommendations = []
            
            for url in broken_urls:
                # Get suggested replacement
                replacement = validator._suggest_replacement(url, "")
                
                if replacement:
                    # Validate the replacement to ensure it works
                    validation = await validator.validate_url(replacement)
                    
                    recommendations.append({
                        "original_url": url,
                        "recommended_replacement": replacement,
                        "replacement_status": validation['status'],
                        "replacement_is_saarland": validation.get('is_saarland', False),
                        "confidence": "high" if validation['status'] == 'ok' else "medium"
                    })
                else:
                    recommendations.append({
                        "original_url": url,
                        "recommended_replacement": None,
                        "message": "No automatic replacement found",
                        "confidence": "manual_review_needed"
                    })
        
        return {
            "status": "success",
            "recommendations": recommendations,
            "total_fixes": len([r for r in recommendations if r.get('recommended_replacement')]),
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fix recommendations failed: {str(e)}")

@router.post("/schedule-monitoring")
async def schedule_link_monitoring(background_tasks: BackgroundTasks) -> Dict:
    """
    📅 Schedule regular link monitoring (background task)
    """
    async def monitor_links():
        """Background monitoring task"""
        try:
            report = await generate_health_report_endpoint()
            
            # Check if health score is below threshold
            health_score = report['validation_summary']['health_score']
            
            if health_score < 80:
                # Log critical health issues
                broken_links = [r for r in report['detailed_results'] if r['status'] != 'ok']
                print(f"🚨 LINK HEALTH ALERT: Score {health_score}% - {len(broken_links)} broken links")
                
                # Could integrate with notification system here
                
        except Exception as e:
            print(f"❌ Link monitoring failed: {e}")
    
    background_tasks.add_task(monitor_links)
    
    return {
        "status": "success", 
        "message": "Link monitoring scheduled",
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/stats")
async def get_validation_stats() -> Dict:
    """
    📈 Get link validation statistics and trends
    """
    global validation_cache, last_full_scan
    
    if not validation_cache:
        return {
            "status": "no_data",
            "message": "No validation data available. Run health-report first."
        }
    
    summary = validation_cache.get('validation_summary', {})
    
    return {
        "status": "success",
        "statistics": {
            "total_links_in_codebase": summary.get('total_links_tested', 0),
            "healthy_saarland_links": summary.get('healthy_saarland_links', 0),
            "broken_links": summary.get('broken_links', 0),
            "non_saarland_links": summary.get('non_saarland_links', 0),
            "overall_health_score": round(summary.get('health_score', 0), 1),
            "last_scan": last_full_scan.isoformat() if last_full_scan else None,
            "recommendations_available": len(validation_cache.get('recommendations', []))
        },
        "health_status": "excellent" if summary.get('health_score', 0) >= 90 else 
                        "good" if summary.get('health_score', 0) >= 75 else
                        "needs_attention" if summary.get('health_score', 0) >= 50 else
                        "critical",
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/domains/saarland")
async def get_saarland_domains() -> Dict:
    """
    🏛️ Get list of verified Saarland domains for validation
    """
    validator = SaarlandLinkValidator()
    
    return {
        "status": "success",
        "saarland_domains": {
            "government": [
                "saarland.de", "saarbruecken.de", "neunkirchen.de", 
                "homburg.de", "voelklingen.de", "merzig.de"
            ],
            "education": [
                "uni-saarland.de", "htwsaar.de", "musikhochschule-saar.de",
                "hbksaar.de", "dfki.de"
            ],
            "transportation": [
                "saarvv.de", "bahn.de", "flughafen-saarbruecken.de"
            ],
            "tourism": [
                "urlaub.saarland", "ticket-regional.de", "staatstheater.saarland",
                "weltkulturerbe-voelklingen.de"
            ],
            "business": [
                "saarland-innovative.de", "wtsh.de", "saarwirtschaft.de"
            ]
        },
        "total_verified_domains": len(validator.SAARLAND_DOMAINS),
        "timestamp": datetime.utcnow().isoformat()
    }