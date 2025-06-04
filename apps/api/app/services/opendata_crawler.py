"""
OpenData Crawler Service for AGENTLAND.SAARLAND
Real Saarland data mining and validation engine
"""

import asyncio
import aiohttp
import json
import re
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup
import logging
from dataclasses import dataclass
import hashlib

logger = logging.getLogger(__name__)

@dataclass
class SaarlandDataSource:
    """Represents a Saarland open data source"""
    name: str
    url: str
    type: str  # 'api', 'html', 'rss', 'json'
    category: str  # 'government', 'transport', 'events', 'education', 'tourism'
    update_frequency: str  # 'hourly', 'daily', 'weekly'
    last_crawled: Optional[datetime] = None
    data_hash: Optional[str] = None
    status: str = 'active'

class SaarlandOpenDataCrawler:
    """
    🔍 Crawler Subagent
    Mission: Mine authentic Saarland open data and validate all content
    """
    
    SAARLAND_DATA_SOURCES = [
        # Government & Official Data
        SaarlandDataSource(
            "Saarland GeoPortal",
            "https://geoportal.saarland.de",
            "api",
            "government",
            "daily"
        ),
        SaarlandDataSource(
            "Statistisches Amt Saarland",
            "https://statistik.saarland.de",
            "html",
            "government", 
            "monthly"
        ),
        SaarlandDataSource(
            "Stadt Saarbrücken Open Data",
            "https://www.saarbruecken.de/rathaus/verwaltung/aemter_dienststellen/amt_fuer_stadtentwicklung_und_statistik/statistik/open_data",
            "html",
            "government",
            "weekly"
        ),
        
        # Transportation
        SaarlandDataSource(
            "saarVV GTFS-RT",
            "https://www.saarvv.de/fahrgaeste/fahrplanauskunft/opendata",
            "api",
            "transport",
            "hourly"
        ),
        SaarlandDataSource(
            "Deutsche Bahn Regional",
            "https://data.deutschebahn.com/dataset/data-haltestellen",
            "api",
            "transport",
            "daily"
        ),
        
        # Events & Culture
        SaarlandDataSource(
            "Staatstheater Saarbrücken",
            "https://www.staatstheater.saarland/programm",
            "html",
            "events",
            "daily"
        ),
        SaarlandDataSource(
            "Ticket Regional Saarland",
            "https://www.ticket-regional.de/events?region=saarland",
            "html",
            "events",
            "daily"
        ),
        SaarlandDataSource(
            "Saarbrücken Veranstaltungen",
            "https://www.saarbruecken.de/kultur/veranstaltungen",
            "html",
            "events",
            "daily"
        ),
        
        # Tourism
        SaarlandDataSource(
            "Tourismus Zentrale Saarland",
            "https://www.urlaub.saarland",
            "html",
            "tourism",
            "weekly"
        ),
        SaarlandDataSource(
            "Völklinger Hütte",
            "https://www.weltkulturerbe-voelklingen.de",
            "html",
            "tourism",
            "weekly"
        ),
        
        # Education
        SaarlandDataSource(
            "Universität des Saarlandes",
            "https://www.uni-saarland.de/aktuelles.html",
            "html",
            "education",
            "daily"
        ),
        SaarlandDataSource(
            "HTW Saar",
            "https://www.htwsaar.de/aktuelles",
            "html",
            "education",
            "daily"
        ),
        
        # Business & Innovation
        SaarlandDataSource(
            "Saarland Innovation",
            "https://www.saarland-innovative.de",
            "html",
            "business",
            "weekly"
        ),
        SaarlandDataSource(
            "WTSH Saarland",
            "https://www.wtsh.de",
            "html",
            "business",
            "weekly"
        )
    ]
    
    def __init__(self):
        self.session: Optional[aiohttp.ClientSession] = None
        self.crawl_cache = {}
        self.content_hashes = {}
        
    async def __aenter__(self):
        timeout = aiohttp.ClientTimeout(total=60, connect=15)
        self.session = aiohttp.ClientSession(
            timeout=timeout,
            headers={
                'User-Agent': 'AGENTLAND.SAARLAND Data Crawler 1.0 (compatible; +https://agentland.saarland)'
            }
        )
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def crawl_data_source(self, source: SaarlandDataSource) -> Dict[str, Any]:
        """Crawl a single data source and extract relevant information"""
        logger.info(f"Crawling {source.name}: {source.url}")
        
        try:
            async with self.session.get(source.url) as response:
                content = await response.text()
                
                # Generate content hash for change detection
                content_hash = hashlib.md5(content.encode()).hexdigest()
                
                # Check if content has changed
                if source.data_hash == content_hash:
                    return {
                        'source': source.name,
                        'status': 'unchanged',
                        'last_crawled': datetime.utcnow().isoformat(),
                        'content_hash': content_hash
                    }
                
                # Extract data based on source type
                extracted_data = await self._extract_data(source, content)
                
                # Validate Saarland relevance
                relevance_score = self._calculate_saarland_relevance(content)
                
                result = {
                    'source': source.name,
                    'url': source.url,
                    'category': source.category,
                    'status': 'success',
                    'response_code': response.status,
                    'content_length': len(content),
                    'content_hash': content_hash,
                    'saarland_relevance': relevance_score,
                    'extracted_data': extracted_data,
                    'crawled_at': datetime.utcnow().isoformat(),
                    'data_quality': self._assess_data_quality(extracted_data),
                    'update_needed': content_hash != source.data_hash
                }
                
                # Update source hash
                source.data_hash = content_hash
                source.last_crawled = datetime.utcnow()
                
                return result
                
        except Exception as e:
            logger.error(f"Error crawling {source.name}: {str(e)}")
            return {
                'source': source.name,
                'url': source.url,
                'status': 'error',
                'error': str(e),
                'crawled_at': datetime.utcnow().isoformat()
            }
    
    async def _extract_data(self, source: SaarlandDataSource, content: str) -> Dict[str, Any]:
        """Extract relevant data based on source type and category"""
        
        if source.category == 'events':
            return await self._extract_events_data(content, source.url)
        elif source.category == 'government':
            return await self._extract_government_data(content, source.url)
        elif source.category == 'transport':
            return await self._extract_transport_data(content, source.url)
        elif source.category == 'tourism':
            return await self._extract_tourism_data(content, source.url)
        elif source.category == 'education':
            return await self._extract_education_data(content, source.url)
        elif source.category == 'business':
            return await self._extract_business_data(content, source.url)
        else:
            return await self._extract_generic_data(content, source.url)
    
    async def _extract_events_data(self, content: str, base_url: str) -> Dict[str, Any]:
        """Extract events data from HTML content"""
        soup = BeautifulSoup(content, 'html.parser')
        events = []
        
        # Common event selectors
        event_selectors = [
            '.event', '.veranstaltung', '.programm-item',
            '[class*="event"]', '[class*="veranstaltung"]',
            '.event-card', '.event-item', '.program-item'
        ]
        
        for selector in event_selectors:
            event_elements = soup.select(selector)
            for element in event_elements[:10]:  # Limit to 10 events per source
                event_data = {
                    'title': self._extract_text(element, ['h1', 'h2', 'h3', '.title', '.name']),
                    'date': self._extract_date(element),
                    'location': self._extract_text(element, ['.location', '.venue', '.ort']),
                    'description': self._extract_text(element, ['.description', '.text', 'p']),
                    'url': self._extract_link(element, base_url),
                    'category': 'event',
                    'source_url': base_url
                }
                
                if event_data['title']:  # Only add if we found a title
                    events.append(event_data)
        
        return {
            'events': events,
            'total_found': len(events),
            'extraction_method': 'html_parsing'
        }
    
    async def _extract_government_data(self, content: str, base_url: str) -> Dict[str, Any]:
        """Extract government services and contact information"""
        soup = BeautifulSoup(content, 'html.parser')
        
        services = []
        contacts = []
        
        # Extract service information
        service_selectors = ['.service', '.dienstleistung', '.buergerservice']
        for selector in service_selectors:
            elements = soup.select(selector)
            for element in elements[:20]:
                service = {
                    'name': self._extract_text(element, ['h1', 'h2', 'h3', '.title']),
                    'description': self._extract_text(element, ['.description', 'p']),
                    'url': self._extract_link(element, base_url),
                    'category': 'government_service'
                }
                if service['name']:
                    services.append(service)
        
        # Extract contact information
        phone_pattern = r'[\+\d\s\-\(\)\/]{10,}'
        email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
        
        phones = re.findall(phone_pattern, content)
        emails = re.findall(email_pattern, content)
        
        return {
            'services': services,
            'contact_phones': phones[:5],  # Limit to 5 phone numbers
            'contact_emails': emails[:5],  # Limit to 5 email addresses
            'total_services': len(services)
        }
    
    async def _extract_transport_data(self, content: str, base_url: str) -> Dict[str, Any]:
        """Extract transportation data"""
        soup = BeautifulSoup(content, 'html.parser')
        
        # Look for schedule information, stations, routes
        stations = []
        routes = []
        
        station_selectors = ['.station', '.haltestelle', '.bahnhof']
        for selector in station_selectors:
            elements = soup.select(selector)
            for element in elements[:20]:
                station = {
                    'name': self._extract_text(element, ['h1', 'h2', 'h3', '.name']),
                    'location': self._extract_text(element, ['.location', '.address']),
                    'services': self._extract_text(element, ['.services', '.info'])
                }
                if station['name']:
                    stations.append(station)
        
        return {
            'stations': stations,
            'routes': routes,
            'total_stations': len(stations)
        }
    
    async def _extract_tourism_data(self, content: str, base_url: str) -> Dict[str, Any]:
        """Extract tourism attractions and information"""
        soup = BeautifulSoup(content, 'html.parser')
        
        attractions = []
        
        attraction_selectors = [
            '.attraction', '.sehenswuerdigkeit', '.highlight',
            '.tourist-info', '.poi', '.location'
        ]
        
        for selector in attraction_selectors:
            elements = soup.select(selector)
            for element in elements[:15]:
                attraction = {
                    'name': self._extract_text(element, ['h1', 'h2', 'h3', '.title', '.name']),
                    'description': self._extract_text(element, ['.description', '.text', 'p']),
                    'location': self._extract_text(element, ['.location', '.address']),
                    'opening_hours': self._extract_text(element, ['.hours', '.zeiten', '.oeffnungszeiten']),
                    'url': self._extract_link(element, base_url),
                    'category': 'tourism'
                }
                if attraction['name']:
                    attractions.append(attraction)
        
        return {
            'attractions': attractions,
            'total_found': len(attractions)
        }
    
    async def _extract_education_data(self, content: str, base_url: str) -> Dict[str, Any]:
        """Extract education-related information"""
        soup = BeautifulSoup(content, 'html.parser')
        
        courses = []
        news = []
        
        # Extract course/program information
        course_selectors = ['.course', '.studiengang', '.program', '.ausbildung']
        for selector in course_selectors:
            elements = soup.select(selector)
            for element in elements[:10]:
                course = {
                    'name': self._extract_text(element, ['h1', 'h2', 'h3', '.title']),
                    'description': self._extract_text(element, ['.description', 'p']),
                    'duration': self._extract_text(element, ['.duration', '.dauer']),
                    'url': self._extract_link(element, base_url)
                }
                if course['name']:
                    courses.append(course)
        
        # Extract news/announcements
        news_selectors = ['.news', '.announcement', '.aktuelles', '.mitteilung']
        for selector in news_selectors:
            elements = soup.select(selector)
            for element in elements[:5]:
                news_item = {
                    'title': self._extract_text(element, ['h1', 'h2', 'h3', '.title']),
                    'date': self._extract_date(element),
                    'content': self._extract_text(element, ['.content', '.text', 'p']),
                    'url': self._extract_link(element, base_url)
                }
                if news_item['title']:
                    news.append(news_item)
        
        return {
            'courses': courses,
            'news': news,
            'total_courses': len(courses),
            'total_news': len(news)
        }
    
    async def _extract_business_data(self, content: str, base_url: str) -> Dict[str, Any]:
        """Extract business and innovation data"""
        soup = BeautifulSoup(content, 'html.parser')
        
        programs = []
        funding = []
        
        # Extract funding programs
        funding_selectors = ['.funding', '.foerderung', '.program', '.support']
        for selector in funding_selectors:
            elements = soup.select(selector)
            for element in elements[:10]:
                program = {
                    'name': self._extract_text(element, ['h1', 'h2', 'h3', '.title']),
                    'description': self._extract_text(element, ['.description', 'p']),
                    'deadline': self._extract_date(element),
                    'amount': self._extract_text(element, ['.amount', '.summe', '.euro']),
                    'url': self._extract_link(element, base_url)
                }
                if program['name']:
                    programs.append(program)
        
        return {
            'funding_programs': programs,
            'total_programs': len(programs)
        }
    
    async def _extract_generic_data(self, content: str, base_url: str) -> Dict[str, Any]:
        """Generic data extraction for unspecified sources"""
        soup = BeautifulSoup(content, 'html.parser')
        
        # Extract basic page information
        title = soup.find('title')
        headings = [h.get_text().strip() for h in soup.find_all(['h1', 'h2', 'h3'])[:10]]
        links = [urljoin(base_url, a.get('href')) for a in soup.find_all('a', href=True)[:20]]
        
        return {
            'page_title': title.get_text().strip() if title else '',
            'headings': headings,
            'external_links': links,
            'extraction_method': 'generic'
        }
    
    def _extract_text(self, element, selectors: List[str]) -> str:
        """Extract text from element using CSS selectors"""
        for selector in selectors:
            found = element.select_one(selector)
            if found:
                return found.get_text().strip()
        return element.get_text().strip()[:200] if element else ""
    
    def _extract_link(self, element, base_url: str) -> str:
        """Extract link from element"""
        link = element.find('a')
        if link and link.get('href'):
            return urljoin(base_url, link.get('href'))
        return ""
    
    def _extract_date(self, element) -> Optional[str]:
        """Extract date information from element"""
        date_patterns = [
            r'\d{1,2}\.\d{1,2}\.\d{4}',  # DD.MM.YYYY
            r'\d{4}-\d{2}-\d{2}',       # YYYY-MM-DD
            r'\d{1,2}\.\s\w+\s\d{4}'    # DD. Month YYYY
        ]
        
        text = element.get_text()
        for pattern in date_patterns:
            match = re.search(pattern, text)
            if match:
                return match.group()
        return None
    
    def _calculate_saarland_relevance(self, content: str) -> float:
        """Calculate how relevant content is to Saarland"""
        saarland_keywords = [
            'saarland', 'saarbrücken', 'neunkirchen', 'homburg', 'völklingen',
            'merzig', 'saarlouis', 'st. wendel', 'dillingen', 'saar',
            'universität des saarlandes', 'htw saar', 'saarVV', 'völklinger hütte',
            'saarschleife', 'staatstheater', 'geoportal', 'landeshauptstadt'
        ]
        
        content_lower = content.lower()
        matches = sum(1 for keyword in saarland_keywords if keyword in content_lower)
        relevance = min(matches / 5.0, 1.0)  # Normalize to 0-1 scale
        
        return round(relevance, 2)
    
    def _assess_data_quality(self, data: Dict[str, Any]) -> str:
        """Assess the quality of extracted data"""
        if not data:
            return 'poor'
        
        # Count non-empty values
        filled_fields = 0
        total_fields = 0
        
        def count_fields(obj):
            nonlocal filled_fields, total_fields
            if isinstance(obj, dict):
                for value in obj.values():
                    if isinstance(value, (dict, list)):
                        count_fields(value)
                    else:
                        total_fields += 1
                        if value and str(value).strip():
                            filled_fields += 1
            elif isinstance(obj, list):
                for item in obj:
                    count_fields(item)
        
        count_fields(data)
        
        if total_fields == 0:
            return 'poor'
        
        quality_ratio = filled_fields / total_fields
        
        if quality_ratio >= 0.8:
            return 'excellent'
        elif quality_ratio >= 0.6:
            return 'good'
        elif quality_ratio >= 0.4:
            return 'fair'
        else:
            return 'poor'
    
    async def crawl_all_sources(self) -> Dict[str, Any]:
        """Crawl all Saarland data sources concurrently"""
        logger.info("Starting comprehensive Saarland data crawling...")
        
        # Limit concurrent requests
        semaphore = asyncio.Semaphore(5)
        
        async def crawl_with_semaphore(source):
            async with semaphore:
                return await self.crawl_data_source(source)
        
        tasks = [crawl_with_semaphore(source) for source in self.SAARLAND_DATA_SOURCES]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Process results
        successful_crawls = []
        failed_crawls = []
        
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                failed_crawls.append({
                    'source': self.SAARLAND_DATA_SOURCES[i].name,
                    'error': str(result)
                })
            else:
                if result['status'] == 'success':
                    successful_crawls.append(result)
                else:
                    failed_crawls.append(result)
        
        # Generate summary report
        summary = {
            'crawl_session': {
                'started_at': datetime.utcnow().isoformat(),
                'total_sources': len(self.SAARLAND_DATA_SOURCES),
                'successful_crawls': len(successful_crawls),
                'failed_crawls': len(failed_crawls),
                'success_rate': len(successful_crawls) / len(self.SAARLAND_DATA_SOURCES) * 100
            },
            'results': successful_crawls,
            'failures': failed_crawls,
            'data_quality_overview': self._generate_quality_overview(successful_crawls),
            'saarland_relevance_overview': self._generate_relevance_overview(successful_crawls),
            'recommendations': self._generate_recommendations(successful_crawls, failed_crawls)
        }
        
        return summary
    
    def _generate_quality_overview(self, results: List[Dict]) -> Dict[str, Any]:
        """Generate data quality overview"""
        quality_counts = {'excellent': 0, 'good': 0, 'fair': 0, 'poor': 0}
        
        for result in results:
            quality = result.get('data_quality', 'poor')
            quality_counts[quality] += 1
        
        return quality_counts
    
    def _generate_relevance_overview(self, results: List[Dict]) -> Dict[str, Any]:
        """Generate Saarland relevance overview"""
        total_relevance = sum(result.get('saarland_relevance', 0) for result in results)
        avg_relevance = total_relevance / len(results) if results else 0
        
        high_relevance = len([r for r in results if r.get('saarland_relevance', 0) >= 0.7])
        medium_relevance = len([r for r in results if 0.4 <= r.get('saarland_relevance', 0) < 0.7])
        low_relevance = len([r for r in results if r.get('saarland_relevance', 0) < 0.4])
        
        return {
            'average_relevance': round(avg_relevance, 2),
            'high_relevance_sources': high_relevance,
            'medium_relevance_sources': medium_relevance,
            'low_relevance_sources': low_relevance
        }
    
    def _generate_recommendations(self, successful: List[Dict], failed: List[Dict]) -> List[str]:
        """Generate improvement recommendations"""
        recommendations = []
        
        if failed:
            recommendations.append(f"Investigate {len(failed)} failed crawls and implement retry logic")
        
        low_quality = [r for r in successful if r.get('data_quality') in ['poor', 'fair']]
        if low_quality:
            recommendations.append(f"Improve data extraction for {len(low_quality)} sources with poor/fair quality")
        
        low_relevance = [r for r in successful if r.get('saarland_relevance', 0) < 0.5]
        if low_relevance:
            recommendations.append(f"Review {len(low_relevance)} sources with low Saarland relevance")
        
        if len(successful) < len(self.SAARLAND_DATA_SOURCES) * 0.8:
            recommendations.append("Overall crawling success rate below 80% - review crawler stability")
        
        return recommendations

# Service instance
opendata_crawler = SaarlandOpenDataCrawler()

async def crawl_all_saarland_data() -> Dict[str, Any]:
    """API endpoint for comprehensive data crawling"""
    async with SaarlandOpenDataCrawler() as crawler:
        return await crawler.crawl_all_sources()

async def crawl_category_data(category: str) -> Dict[str, Any]:
    """API endpoint for category-specific data crawling"""
    async with SaarlandOpenDataCrawler() as crawler:
        sources = [s for s in crawler.SAARLAND_DATA_SOURCES if s.category == category]
        
        if not sources:
            return {'error': f'No sources found for category: {category}'}
        
        results = []
        for source in sources:
            result = await crawler.crawl_data_source(source)
            results.append(result)
        
        return {
            'category': category,
            'sources_crawled': len(sources),
            'results': results,
            'crawled_at': datetime.utcnow().isoformat()
        }