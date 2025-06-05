"""
Comprehensive Link Validation Service for AGENTLAND.SAARLAND
Validates and monitors all external links, replaces dead links with authentic Saarland content
"""

import asyncio
import aiohttp
import json
import logging
import re
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple, Set
from dataclasses import dataclass, asdict
from enum import Enum
from urllib.parse import urlparse, urljoin
import xml.etree.ElementTree as ET
from bs4 import BeautifulSoup
import hashlib
import sqlite3
import os
from pathlib import Path

# Configure logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

class LinkStatus(Enum):
    """Link validation status"""
    VALID = "valid"
    BROKEN = "broken"
    REDIRECT = "redirect"
    TIMEOUT = "timeout"
    SSL_ERROR = "ssl_error"
    UNKNOWN = "unknown"
    PLACEHOLDER = "placeholder"

class LinkCategory(Enum):
    """Categories of links"""
    EDUCATION = "education"
    GOVERNMENT = "government"
    TOURISM = "tourism"
    TRANSPORT = "transport"
    BUSINESS = "business"
    NEWS = "news"
    EMERGENCY = "emergency"
    OTHER = "other"

@dataclass
class LinkInfo:
    """Information about a link"""
    url: str
    category: LinkCategory
    source_file: str
    source_line: Optional[int] = None
    status: LinkStatus = LinkStatus.UNKNOWN
    last_checked: Optional[datetime] = None
    response_time: Optional[float] = None
    status_code: Optional[int] = None
    redirect_url: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    is_placeholder: bool = False
    replacement_url: Optional[str] = None
    confidence_score: float = 0.0

class SaarlandLinkValidator:
    """Comprehensive link validator for Saarland-specific content"""
    
    def __init__(self, db_path: str = "/tmp/link_validation.db"):
        self.db_path = db_path
        self.session: Optional[aiohttp.ClientSession] = None
        self.placeholder_patterns = [
            r'example\.com',
            r'placeholder',
            r'dummy',
            r'test\.de',
            r'localhost',
            r'127\.0\.0\.1',
            r'0\.0\.0\.0',
            r'#',
            r'javascript:void\(0\)',
            r'todo',
            r'tbd',
            r'coming-soon'
        ]
        
        # Real Saarland URLs database
        self.authentic_saarland_urls = {
            LinkCategory.EDUCATION: [
                "https://www.uni-saarland.de",
                "https://www.htwsaar.de", 
                "https://www.hfm.saarland.de",
                "https://www.bildungsserver.saarland.de",
                "https://www.saarland.de/bildung"
            ],
            LinkCategory.GOVERNMENT: [
                "https://www.saarland.de",
                "https://www.saarbruecken.de",
                "https://www.neunkirchen.de",
                "https://www.homburg.de",
                "https://www.völklingen.de",
                "https://www.merzig.de",
                "https://www.sankt-wendel.de"
            ],
            LinkCategory.TOURISM: [
                "https://www.urlaub.saarland",
                "https://www.saarland-tourismus.de",
                "https://www.saarbruecken-tourismus.de",
                "https://www.voelklinger-huette.org",
                "https://www.weltkulturerbe-voelklingen.de"
            ],
            LinkCategory.TRANSPORT: [
                "https://www.saarvv.de",
                "https://www.deutsche-bahn.com",
                "https://www.saarbruecken-airport.de",
                "https://www.adfc-saarland.de"
            ],
            LinkCategory.NEWS: [
                "https://www.sr.de",
                "https://www.saarbruecker-zeitung.de",
                "https://www.sol.de"
            ]
        }
        
        self._init_database()
    
    def _init_database(self):
        """Initialize SQLite database for link tracking"""
        try:
            Path(self.db_path).parent.mkdir(parents=True, exist_ok=True)
            
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS links (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    url TEXT UNIQUE NOT NULL,
                    category TEXT NOT NULL,
                    source_file TEXT NOT NULL,
                    source_line INTEGER,
                    status TEXT NOT NULL,
                    last_checked TIMESTAMP,
                    response_time REAL,
                    status_code INTEGER,
                    redirect_url TEXT,
                    title TEXT,
                    description TEXT,
                    is_placeholder BOOLEAN DEFAULT 0,
                    replacement_url TEXT,
                    confidence_score REAL DEFAULT 0.0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS validation_runs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    completed_at TIMESTAMP,
                    total_links INTEGER,
                    valid_links INTEGER,
                    broken_links INTEGER,
                    placeholder_links INTEGER,
                    replacement_suggestions INTEGER
                )
            ''')
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"Database initialization failed: {e}")
    
    async def __aenter__(self):
        """Async context manager entry"""
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=10),
            headers={
                "User-Agent": "AGENTLAND.SAARLAND Link Validator/1.0",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
            }
        )
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        if self.session:
            await self.session.close()
    
    def extract_links_from_codebase(self, base_path: str) -> List[LinkInfo]:
        """Extract all external links from the codebase"""
        links = []
        
        # File patterns to scan
        file_patterns = {
            "**/*.tsx": LinkCategory.OTHER,
            "**/*.ts": LinkCategory.OTHER,
            "**/*.py": LinkCategory.OTHER,
            "**/*.js": LinkCategory.OTHER,
            "**/*.json": LinkCategory.OTHER,
            "**/*.md": LinkCategory.OTHER
        }
        
        url_pattern = re.compile(
            r'https?://[^\s"\'<>)\]},;]+',
            re.IGNORECASE
        )
        
        for pattern in file_patterns:
            try:
                from pathlib import Path
                base = Path(base_path)
                
                for file_path in base.glob(pattern):
                    if file_path.is_file():
                        try:
                            with open(file_path, 'r', encoding='utf-8') as f:
                                content = f.read()
                                
                            for line_num, line in enumerate(content.split('\n'), 1):
                                urls = url_pattern.findall(line)
                                for url in urls:
                                    # Clean URL
                                    url = url.rstrip('.,;:)"\'')
                                    
                                    # Categorize link
                                    category = self._categorize_url(url)
                                    
                                    link_info = LinkInfo(
                                        url=url,
                                        category=category,
                                        source_file=str(file_path.relative_to(base)),
                                        source_line=line_num,
                                        is_placeholder=self._is_placeholder_url(url)
                                    )
                                    
                                    links.append(link_info)
                                    
                        except (UnicodeDecodeError, PermissionError):
                            continue
                            
            except Exception as e:
                logger.error(f"Error scanning {pattern}: {e}")
        
        # Remove duplicates
        unique_links = {}
        for link in links:
            if link.url not in unique_links:
                unique_links[link.url] = link
        
        return list(unique_links.values())
    
    def _categorize_url(self, url: str) -> LinkCategory:
        """Categorize URL based on domain and content"""
        url_lower = url.lower()
        
        # Education
        if any(keyword in url_lower for keyword in [
            'uni-', 'htwsaar', 'hfm.saarland', 'bildung', 'schule', 'education'
        ]):
            return LinkCategory.EDUCATION
        
        # Government
        if any(keyword in url_lower for keyword in [
            'saarland.de', 'saarbruecken.de', 'rathaus', 'buergeramt', 'verwaltung'
        ]):
            return LinkCategory.GOVERNMENT
        
        # Tourism
        if any(keyword in url_lower for keyword in [
            'urlaub.saarland', 'tourismus', 'ticket', 'event', 'kultur', 'museum'
        ]):
            return LinkCategory.TOURISM
        
        # Transport
        if any(keyword in url_lower for keyword in [
            'saarvv', 'bahn', 'verkehr', 'transport', 'airport'
        ]):
            return LinkCategory.TRANSPORT
        
        # News
        if any(keyword in url_lower for keyword in [
            'sr.de', 'saarbruecker-zeitung', 'sol.de', 'news', 'nachrichten'
        ]):
            return LinkCategory.NEWS
        
        return LinkCategory.OTHER
    
    def _is_placeholder_url(self, url: str) -> bool:
        """Check if URL is a placeholder"""
        for pattern in self.placeholder_patterns:
            if re.search(pattern, url, re.IGNORECASE):
                return True
        return False
    
    async def validate_link(self, link_info: LinkInfo) -> LinkInfo:
        """Validate a single link"""
        start_time = datetime.now()
        
        try:
            async with self.session.get(link_info.url, allow_redirects=True) as response:
                link_info.status_code = response.status
                link_info.response_time = (datetime.now() - start_time).total_seconds()
                
                if response.status == 200:
                    link_info.status = LinkStatus.VALID
                    
                    # Extract title and description
                    if 'text/html' in response.headers.get('content-type', ''):
                        content = await response.text()
                        soup = BeautifulSoup(content, 'html.parser')
                        
                        title_tag = soup.find('title')
                        if title_tag:
                            link_info.title = title_tag.get_text().strip()
                        
                        meta_desc = soup.find('meta', attrs={'name': 'description'})
                        if meta_desc:
                            link_info.description = meta_desc.get('content', '').strip()
                
                elif response.status in [301, 302, 303, 307, 308]:
                    link_info.status = LinkStatus.REDIRECT
                    link_info.redirect_url = str(response.url)
                
                else:
                    link_info.status = LinkStatus.BROKEN
                    
        except asyncio.TimeoutError:
            link_info.status = LinkStatus.TIMEOUT
            link_info.response_time = (datetime.now() - start_time).total_seconds()
            
        except aiohttp.ClientSSLError:
            link_info.status = LinkStatus.SSL_ERROR
            
        except Exception as e:
            logger.error(f"Error validating {link_info.url}: {e}")
            link_info.status = LinkStatus.BROKEN
        
        link_info.last_checked = datetime.now()
        
        # Suggest replacement if needed
        if link_info.status in [LinkStatus.BROKEN, LinkStatus.TIMEOUT] or link_info.is_placeholder:
            link_info.replacement_url = self._suggest_replacement(link_info)
        
        return link_info
    
    def _suggest_replacement(self, link_info: LinkInfo) -> Optional[str]:
        """Suggest authentic Saarland replacement URL"""
        category_urls = self.authentic_saarland_urls.get(link_info.category, [])
        
        if not category_urls:
            return None
        
        # Simple suggestion based on category
        # Could be enhanced with ML/NLP for better matching
        return category_urls[0] if category_urls else None
    
    async def validate_all_links(self, links: List[LinkInfo], max_concurrent: int = 10) -> List[LinkInfo]:
        """Validate all links with concurrency control"""
        semaphore = asyncio.Semaphore(max_concurrent)
        
        async def validate_with_semaphore(link):
            async with semaphore:
                return await self.validate_link(link)
        
        tasks = [validate_with_semaphore(link) for link in links]
        return await asyncio.gather(*tasks, return_exceptions=True)
    
    def save_to_database(self, links: List[LinkInfo]):
        """Save validation results to database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            for link in links:
                cursor.execute('''
                    INSERT OR REPLACE INTO links (
                        url, category, source_file, source_line, status,
                        last_checked, response_time, status_code, redirect_url,
                        title, description, is_placeholder, replacement_url,
                        confidence_score, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    link.url,
                    link.category.value,
                    link.source_file,
                    link.source_line,
                    link.status.value,
                    link.last_checked,
                    link.response_time,
                    link.status_code,
                    link.redirect_url,
                    link.title,
                    link.description,
                    link.is_placeholder,
                    link.replacement_url,
                    link.confidence_score,
                    datetime.now()
                ))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"Database save failed: {e}")
    
    def generate_report(self) -> Dict[str, Any]:
        """Generate comprehensive validation report"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Overall statistics
            cursor.execute('SELECT COUNT(*) FROM links')
            total_links = cursor.fetchone()[0]
            
            cursor.execute('SELECT status, COUNT(*) FROM links GROUP BY status')
            status_counts = dict(cursor.fetchall())
            
            cursor.execute('SELECT category, COUNT(*) FROM links GROUP BY category')
            category_counts = dict(cursor.fetchall())
            
            # Broken links
            cursor.execute('''
                SELECT url, source_file, status, replacement_url 
                FROM links 
                WHERE status IN ('broken', 'timeout', 'ssl_error') OR is_placeholder = 1
                ORDER BY category, source_file
            ''')
            broken_links = cursor.fetchall()
            
            # Placeholder links
            cursor.execute('''
                SELECT url, source_file, replacement_url 
                FROM links 
                WHERE is_placeholder = 1
            ''')
            placeholder_links = cursor.fetchall()
            
            conn.close()
            
            return {
                "validation_summary": {
                    "total_links": total_links,
                    "valid_links": status_counts.get('valid', 0),
                    "broken_links": status_counts.get('broken', 0) + status_counts.get('timeout', 0) + status_counts.get('ssl_error', 0),
                    "placeholder_links": len(placeholder_links),
                    "redirect_links": status_counts.get('redirect', 0)
                },
                "status_breakdown": status_counts,
                "category_breakdown": category_counts,
                "broken_links": [
                    {
                        "url": url,
                        "source_file": source_file,
                        "status": status,
                        "suggested_replacement": replacement_url
                    }
                    for url, source_file, status, replacement_url in broken_links
                ],
                "placeholder_links": [
                    {
                        "url": url,
                        "source_file": source_file,
                        "suggested_replacement": replacement_url
                    }
                    for url, source_file, replacement_url in placeholder_links
                ],
                "generated_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Report generation failed: {e}")
            return {"error": str(e)}
    
    async def crawl_saarland_sources(self) -> Dict[str, List[str]]:
        """Crawl official Saarland sources for fresh URLs"""
        sources = {
            "education": [
                "https://www.saarland.de/bildung",
                "https://www.uni-saarland.de"
            ],
            "government": [
                "https://www.saarland.de",
                "https://www.saarbruecken.de"
            ],
            "tourism": [
                "https://www.urlaub.saarland"
            ]
        }
        
        fresh_urls = {}
        
        for category, urls in sources.items():
            fresh_urls[category] = []
            
            for url in urls:
                try:
                    async with self.session.get(url) as response:
                        if response.status == 200:
                            content = await response.text()
                            soup = BeautifulSoup(content, 'html.parser')
                            
                            # Extract links from this page
                            for link in soup.find_all('a', href=True):
                                href = link['href']
                                if href.startswith('http'):
                                    fresh_urls[category].append(href)
                                elif href.startswith('/'):
                                    fresh_urls[category].append(urljoin(url, href))
                                    
                except Exception as e:
                    logger.error(f"Error crawling {url}: {e}")
        
        return fresh_urls

class LinkReplacementEngine:
    """Engine for automatically replacing broken/placeholder links"""
    
    def __init__(self, validator: SaarlandLinkValidator):
        self.validator = validator
        
    def generate_replacement_suggestions(self, broken_links: List[LinkInfo]) -> Dict[str, str]:
        """Generate replacement suggestions for broken links"""
        suggestions = {}
        
        for link in broken_links:
            if link.category in self.validator.authentic_saarland_urls:
                category_urls = self.validator.authentic_saarland_urls[link.category]
                
                # Simple keyword matching for better suggestions
                original_url = link.url.lower()
                
                best_match = None
                best_score = 0
                
                for candidate_url in category_urls:
                    candidate_lower = candidate_url.lower()
                    
                    # Check for keyword overlap
                    score = 0
                    
                    # Domain similarity
                    if 'saarland' in original_url and 'saarland' in candidate_lower:
                        score += 3
                    
                    if 'saarbruecken' in original_url and 'saarbruecken' in candidate_lower:
                        score += 3
                    
                    # Category-specific keywords
                    if link.category == LinkCategory.EDUCATION:
                        if any(keyword in original_url for keyword in ['uni', 'hochschule', 'hfw', 'hfm']):
                            if any(keyword in candidate_lower for keyword in ['uni', 'htwsaar', 'hfm']):
                                score += 2
                    
                    if score > best_score:
                        best_score = score
                        best_match = candidate_url
                
                suggestions[link.url] = best_match or category_urls[0]
        
        return suggestions
    
    def create_replacement_script(self, suggestions: Dict[str, str], base_path: str) -> str:
        """Create a script to automatically replace links in files"""
        script_content = """#!/bin/bash
# Automatic Link Replacement Script for AGENTLAND.SAARLAND
# Generated by Link Validation Service

echo "Starting link replacement..."

"""
        
        for old_url, new_url in suggestions.items():
            # Escape URLs for sed
            old_escaped = old_url.replace('/', '\/')
            new_escaped = new_url.replace('/', '\/')
            
            script_content += f"""
# Replace {old_url} with {new_url}
find {base_path} -type f \\( -name "*.tsx" -o -name "*.ts" -o -name "*.py" -o -name "*.js" \\) -exec sed -i 's/{old_escaped}/{new_escaped}/g' {{}} +
echo "Replaced {old_url}"
"""
        
        script_content += """
echo "Link replacement completed!"
"""
        
        return script_content

async def main():
    """Main function for testing the link validator"""
    
    # Initialize validator
    async with SaarlandLinkValidator() as validator:
        print("🔍 Starting comprehensive link validation for AGENTLAND.SAARLAND...")
        
        # Extract links from codebase
        base_path = Path(
            os.getenv("AGENTLAND_ROOT", Path(__file__).resolve().parents[5])
        )
        print(f"📂 Extracting links from {base_path}...")
        
        links = validator.extract_links_from_codebase(base_path)
        print(f"📊 Found {len(links)} links to validate")
        
        # Validate all links
        print("🔗 Validating links...")
        validated_links = await validator.validate_all_links(links, max_concurrent=5)
        
        # Save results
        print("💾 Saving results to database...")
        validator.save_to_database(validated_links)
        
        # Generate report
        print("📋 Generating validation report...")
        report = validator.generate_report()
        
        # Print summary
        print("\n" + "="*50)
        print("🎯 VALIDATION SUMMARY")
        print("="*50)
        print(f"Total Links: {report['validation_summary']['total_links']}")
        print(f"Valid Links: {report['validation_summary']['valid_links']}")
        print(f"Broken Links: {report['validation_summary']['broken_links']}")
        print(f"Placeholder Links: {report['validation_summary']['placeholder_links']}")
        print(f"Redirect Links: {report['validation_summary']['redirect_links']}")
        
        # Show broken links
        if report['broken_links']:
            print("\n🚫 BROKEN LINKS:")
            for broken in report['broken_links'][:10]:  # Show first 10
                print(f"  - {broken['url']} ({broken['source_file']})")
                if broken['suggested_replacement']:
                    print(f"    → Suggested: {broken['suggested_replacement']}")
        
        # Generate replacement suggestions
        replacement_engine = LinkReplacementEngine(validator)
        broken_link_objects = [link for link in validated_links if isinstance(link, LinkInfo) and 
                              (link.status in [LinkStatus.BROKEN, LinkStatus.TIMEOUT] or link.is_placeholder)]
        
        suggestions = replacement_engine.generate_replacement_suggestions(broken_link_objects)
        
        print(f"\n💡 Generated {len(suggestions)} replacement suggestions")
        
        return report

if __name__ == "__main__":
    asyncio.run(main())