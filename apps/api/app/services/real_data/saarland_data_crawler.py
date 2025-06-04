"""
Authentic Saarland Data Crawler
Crawls official Saarland sources to build a database of verified, authentic URLs and content
"""

import asyncio
import aiohttp
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Set
from dataclasses import dataclass, asdict
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import re
import xml.etree.ElementTree as ET
import sqlite3
from pathlib import Path

logger = logging.getLogger(__name__)

@dataclass
class AuthenticSaarlandContent:
    """Authentic Saarland content entry"""
    url: str
    title: str
    description: str
    category: str
    source: str
    content_type: str
    last_verified: datetime
    confidence_score: float
    metadata: Dict[str, Any]

class SaarlandDataCrawler:
    """Crawler for authentic Saarland data sources"""
    
    def __init__(self, db_path: str = "/tmp/saarland_authentic_data.db"):
        self.db_path = db_path
        self.session: Optional[aiohttp.ClientSession] = None
        
        # Official Saarland data sources
        self.official_sources = {
            "government": {
                "name": "Saarland Government Portal",
                "url": "https://www.saarland.de",
                "crawl_patterns": [
                    "/politik",
                    "/wirtschaft", 
                    "/bildung",
                    "/kultur",
                    "/tourismus"
                ],
                "api_endpoints": [
                    "https://www.saarland.de/SharedDocs/Downloads/DE/saarland/service_sitemap.xml"
                ]
            },
            "tourism": {
                "name": "Tourismus Zentrale Saarland",
                "url": "https://www.urlaub.saarland",
                "crawl_patterns": [
                    "/sehenswuerdigkeiten",
                    "/veranstaltungen",
                    "/unterkuenfte",
                    "/aktivitaeten"
                ],
                "feeds": [
                    "https://www.urlaub.saarland/Media/Aktuelles.rss"
                ]
            },
            "education": {
                "name": "Universität des Saarlandes",
                "url": "https://www.uni-saarland.de",
                "crawl_patterns": [
                    "/studium",
                    "/forschung",
                    "/fakultaeten"
                ]
            },
            "transport": {
                "name": "saarVV Verkehrsverbund",
                "url": "https://www.saarvv.de",
                "crawl_patterns": [
                    "/fahrplaene",
                    "/tickets",
                    "/service"
                ]
            },
            "culture": {
                "name": "Völklinger Hütte UNESCO Welterbe",
                "url": "https://www.voelklinger-huette.org",
                "crawl_patterns": [
                    "/ausstellungen",
                    "/veranstaltungen",
                    "/besucherinfos"
                ]
            },
            "news": {
                "name": "Saarländischer Rundfunk",
                "url": "https://www.sr.de",
                "feeds": [
                    "https://www.sr.de/sr/home/nachrichten/nachrichten_rss.xml",
                    "https://www.sr.de/sr/home/sport/sport_rss.xml"
                ]
            },
            "municipalities": [
                {"name": "Saarbrücken", "url": "https://www.saarbruecken.de"},
                {"name": "Neunkirchen", "url": "https://www.neunkirchen.de"},
                {"name": "Homburg", "url": "https://www.homburg.de"},
                {"name": "Völklingen", "url": "https://www.voelklingen.de"},
                {"name": "Merzig", "url": "https://www.merzig.de"},
                {"name": "Sankt Wendel", "url": "https://www.sankt-wendel.de"}
            ]
        }
        
        # Quality indicators for authentic content
        self.quality_indicators = {
            "high_confidence": [
                "saarland.de",
                "uni-saarland.de",
                "htwsaar.de",
                "saarvv.de",
                "sr.de",
                "urlaub.saarland"
            ],
            "medium_confidence": [
                "saarbruecken.de",
                "voelklinger-huette.org",
                "neunkirchen.de",
                "homburg.de"
            ],
            "keywords": [
                "saarland",
                "saarbrücken", 
                "völklingen",
                "neunkirchen",
                "homburg",
                "merzig",
                "sankt wendel",
                "saar"
            ]
        }
        
        self._init_database()
    
    def _init_database(self):
        """Initialize database for authentic content"""
        try:
            Path(self.db_path).parent.mkdir(parents=True, exist_ok=True)
            
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS authentic_content (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    url TEXT UNIQUE NOT NULL,
                    title TEXT NOT NULL,
                    description TEXT,
                    category TEXT NOT NULL,
                    source TEXT NOT NULL,
                    content_type TEXT NOT NULL,
                    last_verified TIMESTAMP NOT NULL,
                    confidence_score REAL NOT NULL,
                    metadata TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS crawl_sessions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    source TEXT NOT NULL,
                    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    completed_at TIMESTAMP,
                    urls_discovered INTEGER,
                    urls_validated INTEGER,
                    errors INTEGER
                )
            ''')
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"Database initialization failed: {e}")
    
    async def __aenter__(self):
        """Async context manager entry"""
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=15),
            headers={
                "User-Agent": "AGENTLAND.SAARLAND Data Crawler/1.0",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "de-DE,de;q=0.9,en;q=0.8"
            }
        )
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        if self.session:
            await self.session.close()
    
    async def crawl_all_sources(self) -> Dict[str, Any]:
        """Crawl all official Saarland sources"""
        results = {
            "total_urls": 0,
            "validated_urls": 0,
            "high_confidence_urls": 0,
            "sources_crawled": 0,
            "errors": 0,
            "by_category": {}
        }
        
        logger.info("🕷️  Starting comprehensive Saarland data crawl")
        
        # Crawl government sources
        gov_results = await self._crawl_government_sources()
        results["by_category"]["government"] = gov_results
        results["total_urls"] += gov_results.get("urls_found", 0)
        
        # Crawl tourism sources
        tourism_results = await self._crawl_tourism_sources()
        results["by_category"]["tourism"] = tourism_results
        results["total_urls"] += tourism_results.get("urls_found", 0)
        
        # Crawl education sources
        edu_results = await self._crawl_education_sources()
        results["by_category"]["education"] = edu_results
        results["total_urls"] += edu_results.get("urls_found", 0)
        
        # Crawl transport sources
        transport_results = await self._crawl_transport_sources()
        results["by_category"]["transport"] = transport_results
        results["total_urls"] += transport_results.get("urls_found", 0)
        
        # Crawl municipalities
        muni_results = await self._crawl_municipalities()
        results["by_category"]["municipalities"] = muni_results
        results["total_urls"] += muni_results.get("urls_found", 0)
        
        # Crawl RSS feeds
        rss_results = await self._crawl_rss_feeds()
        results["by_category"]["news"] = rss_results
        results["total_urls"] += rss_results.get("urls_found", 0)
        
        logger.info(f"✅ Crawl completed: {results['total_urls']} URLs discovered")
        return results
    
    async def _crawl_government_sources(self) -> Dict[str, Any]:
        """Crawl official government sources"""
        source_info = self.official_sources["government"]
        session_id = self._start_crawl_session("government")
        
        urls_found = []
        errors = 0
        
        try:
            # Crawl main site
            base_url = source_info["url"]
            
            async with self.session.get(base_url) as response:
                if response.status == 200:
                    content = await response.text()
                    soup = BeautifulSoup(content, 'html.parser')
                    
                    # Extract all internal links
                    for link in soup.find_all('a', href=True):
                        href = link['href']
                        if href.startswith('/'):
                            full_url = urljoin(base_url, href)
                        elif href.startswith('http') and 'saarland.de' in href:
                            full_url = href
                        else:
                            continue
                        
                        # Extract title and description
                        title = link.get_text().strip() or "Government Page"
                        description = self._extract_description_from_context(link)
                        
                        content_entry = AuthenticSaarlandContent(
                            url=full_url,
                            title=title,
                            description=description,
                            category="government",
                            source=source_info["name"],
                            content_type="webpage",
                            last_verified=datetime.now(),
                            confidence_score=self._calculate_confidence_score(full_url, title),
                            metadata={"crawl_date": datetime.now().isoformat()}
                        )
                        
                        urls_found.append(content_entry)
            
            # Crawl specific patterns
            for pattern in source_info.get("crawl_patterns", []):
                try:
                    pattern_url = urljoin(base_url, pattern)
                    pattern_urls = await self._crawl_url_pattern(pattern_url, "government")
                    urls_found.extend(pattern_urls)
                except Exception as e:
                    logger.error(f"Error crawling pattern {pattern}: {e}")
                    errors += 1
            
        except Exception as e:
            logger.error(f"Error crawling government sources: {e}")
            errors += 1
        
        # Save to database
        self._save_authentic_content(urls_found)
        self._complete_crawl_session(session_id, len(urls_found), len(urls_found), errors)
        
        return {
            "urls_found": len(urls_found),
            "high_confidence": len([u for u in urls_found if u.confidence_score >= 0.8]),
            "errors": errors
        }
    
    async def _crawl_tourism_sources(self) -> Dict[str, Any]:
        """Crawl tourism sources"""
        source_info = self.official_sources["tourism"]
        session_id = self._start_crawl_session("tourism")
        
        urls_found = []
        errors = 0
        
        try:
            base_url = source_info["url"]
            
            # Crawl main tourism site
            async with self.session.get(base_url) as response:
                if response.status == 200:
                    content = await response.text()
                    soup = BeautifulSoup(content, 'html.parser')
                    
                    # Look for event and attraction links
                    for link in soup.find_all('a', href=True):
                        href = link['href']
                        if href.startswith('/'):
                            full_url = urljoin(base_url, href)
                        elif href.startswith('http') and any(domain in href for domain in ['urlaub.saarland', 'saarland-tourismus']):
                            full_url = href
                        else:
                            continue
                        
                        # Tourism-specific content detection
                        link_text = link.get_text().strip().lower()
                        if any(keyword in link_text for keyword in ['event', 'veranstaltung', 'sehenswürdigkeit', 'attraction', 'hotel', 'restaurant']):
                            
                            content_entry = AuthenticSaarlandContent(
                                url=full_url,
                                title=link.get_text().strip() or "Tourism Page",
                                description=self._extract_description_from_context(link),
                                category="tourism",
                                source=source_info["name"],
                                content_type="webpage",
                                last_verified=datetime.now(),
                                confidence_score=self._calculate_confidence_score(full_url, link.get_text()),
                                metadata={"crawl_date": datetime.now().isoformat(), "keywords": link_text}
                            )
                            
                            urls_found.append(content_entry)
            
            # Crawl RSS feeds for events
            for feed_url in source_info.get("feeds", []):
                try:
                    feed_entries = await self._crawl_rss_feed(feed_url, "tourism")
                    urls_found.extend(feed_entries)
                except Exception as e:
                    logger.error(f"Error crawling RSS feed {feed_url}: {e}")
                    errors += 1
        
        except Exception as e:
            logger.error(f"Error crawling tourism sources: {e}")
            errors += 1
        
        self._save_authentic_content(urls_found)
        self._complete_crawl_session(session_id, len(urls_found), len(urls_found), errors)
        
        return {
            "urls_found": len(urls_found),
            "high_confidence": len([u for u in urls_found if u.confidence_score >= 0.8]),
            "errors": errors
        }
    
    async def _crawl_education_sources(self) -> Dict[str, Any]:
        """Crawl education sources"""
        source_info = self.official_sources["education"]
        session_id = self._start_crawl_session("education")
        
        urls_found = []
        errors = 0
        
        education_sources = [
            {"url": "https://www.uni-saarland.de", "name": "Universität des Saarlandes"},
            {"url": "https://www.htwsaar.de", "name": "htw saar"},
            {"url": "https://www.hfm.saarland.de", "name": "HfM Saar"},
            {"url": "https://www.bildungsserver.saarland.de", "name": "Bildungsserver Saarland"}
        ]
        
        for edu_source in education_sources:
            try:
                async with self.session.get(edu_source["url"]) as response:
                    if response.status == 200:
                        content = await response.text()
                        soup = BeautifulSoup(content, 'html.parser')
                        
                        # Look for study programs and courses
                        for link in soup.find_all('a', href=True):
                            href = link['href']
                            if href.startswith('/'):
                                full_url = urljoin(edu_source["url"], href)
                            elif href.startswith('http') and any(domain in href for domain in ['uni-saarland.de', 'htwsaar.de', 'hfm.saarland.de']):
                                full_url = href
                            else:
                                continue
                            
                            link_text = link.get_text().strip().lower()
                            if any(keyword in link_text for keyword in ['studium', 'bachelor', 'master', 'kurs', 'fakultät', 'fachbereich']):
                                
                                content_entry = AuthenticSaarlandContent(
                                    url=full_url,
                                    title=link.get_text().strip() or "Education Page",
                                    description=self._extract_description_from_context(link),
                                    category="education",
                                    source=edu_source["name"],
                                    content_type="webpage",
                                    last_verified=datetime.now(),
                                    confidence_score=self._calculate_confidence_score(full_url, link.get_text()),
                                    metadata={"crawl_date": datetime.now().isoformat(), "institution": edu_source["name"]}
                                )
                                
                                urls_found.append(content_entry)
            
            except Exception as e:
                logger.error(f"Error crawling {edu_source['url']}: {e}")
                errors += 1
        
        self._save_authentic_content(urls_found)
        self._complete_crawl_session(session_id, len(urls_found), len(urls_found), errors)
        
        return {
            "urls_found": len(urls_found),
            "high_confidence": len([u for u in urls_found if u.confidence_score >= 0.8]),
            "errors": errors
        }
    
    async def _crawl_transport_sources(self) -> Dict[str, Any]:
        """Crawl transport sources"""
        session_id = self._start_crawl_session("transport")
        
        urls_found = []
        errors = 0
        
        transport_sources = [
            {"url": "https://www.saarvv.de", "name": "saarVV"},
            {"url": "https://www.saarbruecken-airport.de", "name": "Flughafen Saarbrücken"},
            {"url": "https://www.adfc-saarland.de", "name": "ADFC Saarland"}
        ]
        
        for transport_source in transport_sources:
            try:
                async with self.session.get(transport_source["url"]) as response:
                    if response.status == 200:
                        content = await response.text()
                        soup = BeautifulSoup(content, 'html.parser')
                        
                        for link in soup.find_all('a', href=True):
                            href = link['href']
                            if href.startswith('/'):
                                full_url = urljoin(transport_source["url"], href)
                            elif href.startswith('http') and 'saar' in href:
                                full_url = href
                            else:
                                continue
                            
                            link_text = link.get_text().strip().lower()
                            if any(keyword in link_text for keyword in ['fahrplan', 'ticket', 'bus', 'bahn', 'verkehr', 'flug']):
                                
                                content_entry = AuthenticSaarlandContent(
                                    url=full_url,
                                    title=link.get_text().strip() or "Transport Page",
                                    description=self._extract_description_from_context(link),
                                    category="transport",
                                    source=transport_source["name"],
                                    content_type="webpage",
                                    last_verified=datetime.now(),
                                    confidence_score=self._calculate_confidence_score(full_url, link.get_text()),
                                    metadata={"crawl_date": datetime.now().isoformat()}
                                )
                                
                                urls_found.append(content_entry)
            
            except Exception as e:
                logger.error(f"Error crawling {transport_source['url']}: {e}")
                errors += 1
        
        self._save_authentic_content(urls_found)
        self._complete_crawl_session(session_id, len(urls_found), len(urls_found), errors)
        
        return {
            "urls_found": len(urls_found),
            "high_confidence": len([u for u in urls_found if u.confidence_score >= 0.8]),
            "errors": errors
        }
    
    async def _crawl_municipalities(self) -> Dict[str, Any]:
        """Crawl municipal websites"""
        session_id = self._start_crawl_session("municipalities")
        
        urls_found = []
        errors = 0
        
        for municipality in self.official_sources["municipalities"]:
            try:
                async with self.session.get(municipality["url"]) as response:
                    if response.status == 200:
                        content = await response.text()
                        soup = BeautifulSoup(content, 'html.parser')
                        
                        for link in soup.find_all('a', href=True):
                            href = link['href']
                            domain = urlparse(municipality["url"]).netloc
                            
                            if href.startswith('/'):
                                full_url = urljoin(municipality["url"], href)
                            elif href.startswith('http') and domain in href:
                                full_url = href
                            else:
                                continue
                            
                            content_entry = AuthenticSaarlandContent(
                                url=full_url,
                                title=link.get_text().strip() or f"{municipality['name']} Page",
                                description=self._extract_description_from_context(link),
                                category="municipality",
                                source=municipality["name"],
                                content_type="webpage",
                                last_verified=datetime.now(),
                                confidence_score=self._calculate_confidence_score(full_url, link.get_text()),
                                metadata={"crawl_date": datetime.now().isoformat(), "city": municipality["name"]}
                            )
                            
                            urls_found.append(content_entry)
            
            except Exception as e:
                logger.error(f"Error crawling {municipality['name']}: {e}")
                errors += 1
        
        self._save_authentic_content(urls_found)
        self._complete_crawl_session(session_id, len(urls_found), len(urls_found), errors)
        
        return {
            "urls_found": len(urls_found),
            "high_confidence": len([u for u in urls_found if u.confidence_score >= 0.8]),
            "errors": errors
        }
    
    async def _crawl_rss_feeds(self) -> Dict[str, Any]:
        """Crawl RSS feeds for news"""
        session_id = self._start_crawl_session("rss_feeds")
        
        urls_found = []
        errors = 0
        
        rss_feeds = [
            "https://www.sr.de/sr/home/nachrichten/nachrichten_rss.xml",
            "https://www.sr.de/sr/home/sport/sport_rss.xml",
            "https://www.urlaub.saarland/Media/Aktuelles.rss"
        ]
        
        for feed_url in rss_feeds:
            try:
                feed_entries = await self._crawl_rss_feed(feed_url, "news")
                urls_found.extend(feed_entries)
            except Exception as e:
                logger.error(f"Error crawling RSS feed {feed_url}: {e}")
                errors += 1
        
        self._save_authentic_content(urls_found)
        self._complete_crawl_session(session_id, len(urls_found), len(urls_found), errors)
        
        return {
            "urls_found": len(urls_found),
            "high_confidence": len([u for u in urls_found if u.confidence_score >= 0.8]),
            "errors": errors
        }
    
    async def _crawl_rss_feed(self, feed_url: str, category: str) -> List[AuthenticSaarlandContent]:
        """Crawl a single RSS feed"""
        entries = []
        
        try:
            async with self.session.get(feed_url) as response:
                if response.status == 200:
                    content = await response.text()
                    root = ET.fromstring(content)
                    
                    for item in root.findall('.//item'):
                        title_elem = item.find('title')
                        link_elem = item.find('link')
                        desc_elem = item.find('description')
                        
                        if title_elem is not None and link_elem is not None:
                            entry = AuthenticSaarlandContent(
                                url=link_elem.text,
                                title=title_elem.text,
                                description=desc_elem.text if desc_elem is not None else "",
                                category=category,
                                source="RSS Feed",
                                content_type="news_article",
                                last_verified=datetime.now(),
                                confidence_score=0.9,  # RSS feeds are generally reliable
                                metadata={"feed_url": feed_url, "crawl_date": datetime.now().isoformat()}
                            )
                            entries.append(entry)
        
        except ET.ParseError as e:
            logger.error(f"XML parsing error for {feed_url}: {e}")
        except Exception as e:
            logger.error(f"Error crawling RSS feed {feed_url}: {e}")
        
        return entries
    
    async def _crawl_url_pattern(self, url: str, category: str) -> List[AuthenticSaarlandContent]:
        """Crawl a specific URL pattern"""
        entries = []
        
        try:
            async with self.session.get(url) as response:
                if response.status == 200:
                    content = await response.text()
                    soup = BeautifulSoup(content, 'html.parser')
                    
                    # Extract page title and description
                    title_tag = soup.find('title')
                    title = title_tag.get_text().strip() if title_tag else "Page"
                    
                    meta_desc = soup.find('meta', attrs={'name': 'description'})
                    description = meta_desc.get('content', '').strip() if meta_desc else ""
                    
                    entry = AuthenticSaarlandContent(
                        url=url,
                        title=title,
                        description=description,
                        category=category,
                        source="Pattern Crawl",
                        content_type="webpage",
                        last_verified=datetime.now(),
                        confidence_score=self._calculate_confidence_score(url, title),
                        metadata={"crawl_date": datetime.now().isoformat()}
                    )
                    
                    entries.append(entry)
        
        except Exception as e:
            logger.error(f"Error crawling pattern URL {url}: {e}")
        
        return entries
    
    def _calculate_confidence_score(self, url: str, title: str) -> float:
        """Calculate confidence score for content authenticity"""
        score = 0.0
        
        # Domain-based scoring
        if any(domain in url for domain in self.quality_indicators["high_confidence"]):
            score += 0.4
        elif any(domain in url for domain in self.quality_indicators["medium_confidence"]):
            score += 0.3
        
        # Content-based scoring
        combined_text = f"{url} {title}".lower()
        keyword_matches = sum(1 for keyword in self.quality_indicators["keywords"] if keyword in combined_text)
        score += min(keyword_matches * 0.1, 0.3)
        
        # URL structure scoring
        if '/de/' in url or url.endswith('.de'):
            score += 0.2
        
        if 'https://' in url:
            score += 0.1
        
        return min(score, 1.0)
    
    def _extract_description_from_context(self, link_element) -> str:
        """Extract description from link context"""
        # Try to find description in title attribute
        if link_element.get('title'):
            return link_element['title']
        
        # Try to find description in parent elements
        parent = link_element.find_parent()
        if parent:
            text = parent.get_text().strip()
            if len(text) > len(link_element.get_text().strip()) + 10:
                return text[:200] + "..." if len(text) > 200 else text
        
        return ""
    
    def _start_crawl_session(self, source: str) -> int:
        """Start a crawl session"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO crawl_sessions (source, started_at)
                VALUES (?, ?)
            ''', (source, datetime.now()))
            
            session_id = cursor.lastrowid
            conn.commit()
            conn.close()
            
            return session_id
        except Exception as e:
            logger.error(f"Failed to start crawl session: {e}")
            return 0
    
    def _complete_crawl_session(self, session_id: int, urls_discovered: int, urls_validated: int, errors: int):
        """Complete a crawl session"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                UPDATE crawl_sessions 
                SET completed_at = ?, urls_discovered = ?, urls_validated = ?, errors = ?
                WHERE id = ?
            ''', (datetime.now(), urls_discovered, urls_validated, errors, session_id))
            
            conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"Failed to complete crawl session: {e}")
    
    def _save_authentic_content(self, content_list: List[AuthenticSaarlandContent]):
        """Save authentic content to database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            for content in content_list:
                cursor.execute('''
                    INSERT OR REPLACE INTO authentic_content (
                        url, title, description, category, source, content_type,
                        last_verified, confidence_score, metadata, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    content.url,
                    content.title,
                    content.description,
                    content.category,
                    content.source,
                    content.content_type,
                    content.last_verified,
                    content.confidence_score,
                    json.dumps(content.metadata),
                    datetime.now()
                ))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"Failed to save authentic content: {e}")
    
    def get_authentic_urls_by_category(self, category: str, min_confidence: float = 0.7) -> List[Dict[str, Any]]:
        """Get authentic URLs by category"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT url, title, description, confidence_score, source, metadata
                FROM authentic_content 
                WHERE category = ? AND confidence_score >= ?
                ORDER BY confidence_score DESC, last_verified DESC
            ''', (category, min_confidence))
            
            results = []
            for row in cursor.fetchall():
                results.append({
                    "url": row[0],
                    "title": row[1],
                    "description": row[2],
                    "confidence_score": row[3],
                    "source": row[4],
                    "metadata": json.loads(row[5]) if row[5] else {}
                })
            
            conn.close()
            return results
            
        except Exception as e:
            logger.error(f"Failed to get authentic URLs: {e}")
            return []
    
    def get_replacement_suggestions(self, broken_category: str, broken_keywords: List[str]) -> List[str]:
        """Get replacement suggestions for broken links"""
        authentic_urls = self.get_authentic_urls_by_category(broken_category)
        
        suggestions = []
        for url_data in authentic_urls:
            # Simple keyword matching
            title_lower = url_data["title"].lower()
            url_lower = url_data["url"].lower()
            
            matches = sum(1 for keyword in broken_keywords if keyword.lower() in title_lower or keyword.lower() in url_lower)
            
            if matches > 0:
                suggestions.append({
                    "url": url_data["url"],
                    "match_score": matches,
                    "confidence": url_data["confidence_score"],
                    "title": url_data["title"]
                })
        
        # Sort by match score and confidence
        suggestions.sort(key=lambda x: (x["match_score"], x["confidence"]), reverse=True)
        
        return [s["url"] for s in suggestions[:5]]

async def main():
    """Main function for testing the crawler"""
    print("🕷️  Starting Saarland Authentic Data Crawler...")
    
    async with SaarlandDataCrawler() as crawler:
        results = await crawler.crawl_all_sources()
        
        print(f"\n✅ Crawl Results:")
        print(f"Total URLs discovered: {results['total_urls']}")
        print(f"High confidence URLs: {results['high_confidence_urls']}")
        print(f"Sources crawled: {len(results['by_category'])}")
        
        print(f"\nBy Category:")
        for category, data in results['by_category'].items():
            print(f"  • {category.title()}: {data['urls_found']} URLs")
        
        # Test replacement suggestions
        print(f"\n🔄 Testing replacement suggestions...")
        education_urls = crawler.get_authentic_urls_by_category("education")
        print(f"Education URLs found: {len(education_urls)}")
        
        if education_urls:
            print("Sample education URLs:")
            for url in education_urls[:3]:
                print(f"  • {url['url']} (confidence: {url['confidence_score']:.2f})")

if __name__ == "__main__":
    asyncio.run(main())