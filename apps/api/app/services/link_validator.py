"""
Link Validator Service for AGENTLAND.SAARLAND
Ensures 100% authentic Saarland content with real, functional links.
"""

import asyncio
import aiohttp
import re
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from urllib.parse import urlparse, urljoin
from bs4 import BeautifulSoup
import logging

logger = logging.getLogger(__name__)

class SaarlandLinkValidator:
    """
    🔗 Link-Validator & Data-Crawler Subagent
    Mission: Ensure 100% authentic Saarland content
    """
    
    SAARLAND_DOMAINS = {
        # Government & Official
        'saarland.de', 'geoportal.saarland.de', 'statistik.saarland.de',
        'saarbruecken.de', 'neunkirchen.de', 'homburg.de', 'voelklingen.de',
        'merzig.de', 'saarlouis.de', 'st-wendel.de', 'dillingen-saar.de',
        
        # Education
        'uni-saarland.de', 'htwsaar.de', 'musikhochschule-saar.de',
        'hbksaar.de', 'iqb.hu-berlin.de', 'dfki.de',
        
        # Transportation
        'saarvv.de', 'bahn.de', 'flughafen-saarbruecken.de',
        
        # Tourism & Culture
        'urlaub.saarland', 'ticket-regional.de', 'staatstheater.saarland',
        'weltkulturerbe-voelklingen.de', 'villaborg.de',
        
        # Business & Industry
        'saarland-innovative.de', 'wtsh.de', 'saarwirtschaft.de',
        
        # Healthcare
        'uks.eu', 'marienhaus.de', 'shg-kliniken.de'
    }
    
    REPLACEMENT_URLS = {
        # Government Services
        'buergeramt': 'https://www.saarbruecken.de/rathaus/buergerservices',
        'kfz_zulassung': 'https://www.saarland.de/DE/portale/dienstleistungen/lebenslage/auto-verkehr/kfz-zulassung/_node.html',
        'einwohnermeldeamt': 'https://www.saarbruecken.de/rathaus/buergerservices/einwohnermeldeamt',
        'standesamt': 'https://www.saarbruecken.de/rathaus/buergerservices/standesamt',
        'auslaenderbehoerde': 'https://www.saarland.de/DE/portale/dienstleistungen/thema/migration-integration/_node.html',
        
        # Education
        'university': 'https://www.uni-saarland.de',
        'htw': 'https://www.htwsaar.de',
        'dfki': 'https://www.dfki.de',
        
        # Tourism
        'tourism_main': 'https://www.urlaub.saarland',
        'voelklingen_huette': 'https://www.weltkulturerbe-voelklingen.de',
        'saarschleife': 'https://www.urlaub.saarland/A-Z/S/Saarschleife',
        
        # Transportation
        'saarvv': 'https://www.saarvv.de',
        'db': 'https://www.bahn.de/service/buchung/fahrplan/regional',
        'flughafen': 'https://www.flughafen-saarbruecken.de',
        
        # Events & Culture
        'staatstheater': 'https://www.staatstheater.saarland',
        'ticket_regional': 'https://www.ticket-regional.de',
        'congresshalle': 'https://www.saarbruecken.de/kultur/veranstaltungsstaetten/congresshalle'
    }
    
    def __init__(self):
        self.session: Optional[aiohttp.ClientSession] = None
        self.link_health_cache = {}
        self.last_validation = {}
        
    async def __aenter__(self):
        timeout = aiohttp.ClientTimeout(total=30, connect=10)
        self.session = aiohttp.ClientSession(
            timeout=timeout,
            headers={
                'User-Agent': 'AGENTLAND.SAARLAND Link Validator 1.0 (Mozilla/5.0 compatible)'
            }
        )
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def validate_url(self, url: str) -> Dict:
        """Validate a single URL for accessibility and Saarland relevance"""
        if not url or not url.startswith(('http://', 'https://')):
            return {
                'url': url,
                'status': 'invalid',
                'error': 'Invalid URL format',
                'is_saarland': False,
                'replacement': None
            }
        
        try:
            async with self.session.get(url, allow_redirects=True) as response:
                content = await response.text()
                
                # Check if domain is Saarland-related
                domain = urlparse(url).netloc.lower()
                is_saarland_domain = any(saar_domain in domain for saar_domain in self.SAARLAND_DOMAINS)
                
                # Check content for Saarland relevance
                is_saarland_content = self._check_saarland_content(content)
                
                result = {
                    'url': url,
                    'status': 'ok' if response.status == 200 else f'error_{response.status}',
                    'response_code': response.status,
                    'is_saarland': is_saarland_domain or is_saarland_content,
                    'domain': domain,
                    'content_length': len(content),
                    'has_ssl': url.startswith('https://'),
                    'validated_at': datetime.utcnow().isoformat(),
                    'replacement': None
                }
                
                # If not Saarland-related, suggest replacement
                if not (is_saarland_domain or is_saarland_content):
                    result['replacement'] = self._suggest_replacement(url, content)
                
                return result
                
        except Exception as e:
            logger.error(f"Error validating URL {url}: {str(e)}")
            return {
                'url': url,
                'status': 'error',
                'error': str(e),
                'is_saarland': False,
                'replacement': self._suggest_replacement(url, '')
            }
    
    def _check_saarland_content(self, content: str) -> bool:
        """Check if content is Saarland-related"""
        saarland_keywords = [
            'saarland', 'saarbrücken', 'neunkirchen', 'homburg', 'völklingen',
            'merzig', 'saarlouis', 'st. wendel', 'dillingen', 'saar',
            'universität des saarlandes', 'htw saar', 'saarVV', 'völklinger hütte',
            'saarschleife', 'staatstheater saarbrücken'
        ]
        
        content_lower = content.lower()
        return any(keyword in content_lower for keyword in saarland_keywords)
    
    def _suggest_replacement(self, url: str, content: str) -> Optional[str]:
        """Suggest authentic Saarland replacement for invalid URLs"""
        url_lower = url.lower()
        
        # Government services
        if any(term in url_lower for term in ['buergeramt', 'citizen', 'bürger']):
            return self.REPLACEMENT_URLS['buergeramt']
        elif any(term in url_lower for term in ['kfz', 'vehicle', 'fahrzeug']):
            return self.REPLACEMENT_URLS['kfz_zulassung']
        elif any(term in url_lower for term in ['einwohner', 'resident', 'meldeamt']):
            return self.REPLACEMENT_URLS['einwohnermeldeamt']
        elif any(term in url_lower for term in ['standesamt', 'marriage', 'heirat']):
            return self.REPLACEMENT_URLS['standesamt']
        
        # Education
        elif any(term in url_lower for term in ['university', 'universität', 'uni']):
            return self.REPLACEMENT_URLS['university']
        elif any(term in url_lower for term in ['htw', 'hochschule']):
            return self.REPLACEMENT_URLS['htw']
        
        # Tourism
        elif any(term in url_lower for term in ['tourism', 'tourist', 'urlaub', 'visit']):
            return self.REPLACEMENT_URLS['tourism_main']
        elif any(term in url_lower for term in ['völklinger', 'huette', 'heritage']):
            return self.REPLACEMENT_URLS['voelklingen_huette']
        elif any(term in url_lower for term in ['saarschleife', 'bend', 'loop']):
            return self.REPLACEMENT_URLS['saarschleife']
        
        # Transportation
        elif any(term in url_lower for term in ['transport', 'verkehr', 'bus', 'bahn']):
            if 'local' in url_lower or 'regional' in url_lower:
                return self.REPLACEMENT_URLS['saarvv']
            else:
                return self.REPLACEMENT_URLS['db']
        elif any(term in url_lower for term in ['airport', 'flughafen', 'flight']):
            return self.REPLACEMENT_URLS['flughafen']
        
        # Events & Culture
        elif any(term in url_lower for term in ['theater', 'theatre', 'show']):
            return self.REPLACEMENT_URLS['staatstheater']
        elif any(term in url_lower for term in ['ticket', 'event', 'veranstaltung']):
            return self.REPLACEMENT_URLS['ticket_regional']
        
        return None
    
    async def validate_bulk_urls(self, urls: List[str]) -> List[Dict]:
        """Validate multiple URLs concurrently"""
        if not urls:
            return []
        
        # Limit concurrent requests
        semaphore = asyncio.Semaphore(10)
        
        async def validate_with_semaphore(url):
            async with semaphore:
                return await self.validate_url(url)
        
        tasks = [validate_with_semaphore(url) for url in urls]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Handle exceptions
        validated_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                validated_results.append({
                    'url': urls[i],
                    'status': 'error',
                    'error': str(result),
                    'is_saarland': False,
                    'replacement': self._suggest_replacement(urls[i], '')
                })
            else:
                validated_results.append(result)
        
        return validated_results
    
    async def scan_codebase_links(self, base_path: str) -> Dict:
        """Scan codebase for all external links"""
        import os
        import glob
        
        all_links = set()
        file_links = {}
        
        # File patterns to scan
        patterns = [
            f"{base_path}/**/*.tsx",
            f"{base_path}/**/*.ts", 
            f"{base_path}/**/*.py",
            f"{base_path}/**/*.json",
            f"{base_path}/**/*.md"
        ]
        
        url_pattern = re.compile(r'https?://[^\s"\'<>]+')
        
        for pattern in patterns:
            for filepath in glob.glob(pattern, recursive=True):
                if 'node_modules' in filepath or '.next' in filepath:
                    continue
                
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()
                        urls = url_pattern.findall(content)
                        
                        if urls:
                            file_links[filepath] = urls
                            all_links.update(urls)
                            
                except Exception as e:
                    logger.warning(f"Could not read {filepath}: {e}")
        
        return {
            'total_links': len(all_links),
            'unique_links': list(all_links),
            'file_distribution': file_links,
            'scan_timestamp': datetime.utcnow().isoformat()
        }
    
    async def generate_link_health_report(self, base_path: str) -> Dict:
        """Generate comprehensive link health report"""
        logger.info("Starting comprehensive link validation...")
        
        # Scan codebase for links
        scan_result = await self.scan_codebase_links(base_path)
        links = scan_result['unique_links']
        
        # Validate all found links
        validation_results = await self.validate_bulk_urls(links)
        
        # Categorize results
        healthy_links = [r for r in validation_results if r['status'] == 'ok' and r['is_saarland']]
        broken_links = [r for r in validation_results if r['status'] != 'ok']
        non_saarland_links = [r for r in validation_results if r['status'] == 'ok' and not r['is_saarland']]
        
        # Generate recommendations
        recommendations = []
        
        for result in broken_links + non_saarland_links:
            if result.get('replacement'):
                recommendations.append({
                    'original_url': result['url'],
                    'recommended_replacement': result['replacement'],
                    'reason': 'broken_link' if result in broken_links else 'not_saarland_relevant',
                    'priority': 'high' if result in broken_links else 'medium'
                })
        
        report = {
            'scan_summary': scan_result,
            'validation_summary': {
                'total_links_tested': len(validation_results),
                'healthy_saarland_links': len(healthy_links),
                'broken_links': len(broken_links),
                'non_saarland_links': len(non_saarland_links),
                'health_score': (len(healthy_links) / len(validation_results) * 100) if validation_results else 0
            },
            'detailed_results': validation_results,
            'recommendations': recommendations,
            'generated_at': datetime.utcnow().isoformat()
        }
        
        return report

# Service instance for dependency injection
link_validator = SaarlandLinkValidator()

async def validate_links_endpoint(urls: List[str]) -> Dict:
    """API endpoint for link validation"""
    async with SaarlandLinkValidator() as validator:
        results = await validator.validate_bulk_urls(urls)
        return {
            'validation_results': results,
            'summary': {
                'total_validated': len(results),
                'healthy_links': len([r for r in results if r['status'] == 'ok']),
                'saarland_links': len([r for r in results if r.get('is_saarland', False)])
            }
        }

async def generate_health_report_endpoint(base_path: str = "/Users/deepsleeping/agentlandos") -> Dict:
    """API endpoint for comprehensive health report"""
    async with SaarlandLinkValidator() as validator:
        return await validator.generate_link_health_report(base_path)