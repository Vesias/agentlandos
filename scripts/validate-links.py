#!/usr/bin/env python3
"""
AGENTLAND.SAARLAND Link Validation CLI Tool
Comprehensive link validation and replacement system
"""

import asyncio
import argparse
import json
import sys
from pathlib import Path
from datetime import datetime
import os

# Add the project root to Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root / "apps" / "api"))

from app.services.real_data.link_validation_service import (
    SaarlandLinkValidator,
    LinkReplacementEngine,
    LinkStatus,
    LinkCategory
)

class LinkValidationCLI:
    """Command line interface for link validation"""
    
    def __init__(self):
        self.validator = None
        
    async def scan_and_validate(self, base_path: str, output_file: str = None):
        """Scan codebase and validate all links"""
        print("🔍 AGENTLAND.SAARLAND Link Validation")
        print("=" * 50)
        
        async with SaarlandLinkValidator() as validator:
            self.validator = validator
            
            # Extract links
            print(f"📂 Scanning codebase: {base_path}")
            links = validator.extract_links_from_codebase(base_path)
            print(f"📊 Found {len(links)} unique links")
            
            # Show categories
            categories = {}
            for link in links:
                cat = link.category.value
                categories[cat] = categories.get(cat, 0) + 1
            
            print("\n📋 Link Categories:")
            for category, count in categories.items():
                print(f"  • {category.title()}: {count}")
            
            # Validate links
            print(f"\n🔗 Validating links...")
            validated_links = await validator.validate_all_links(links, max_concurrent=10)
            
            # Filter out exceptions
            valid_results = [link for link in validated_links if not isinstance(link, Exception)]
            
            # Save to database
            print("💾 Saving results...")
            validator.save_to_database(valid_results)
            
            # Generate report
            report = validator.generate_report()
            
            # Display results
            self._display_results(report)
            
            # Save report if requested
            if output_file:
                self._save_report(report, output_file)
                print(f"📄 Report saved to: {output_file}")
            
            return report
    
    def _display_results(self, report):
        """Display validation results in console"""
        print("\n" + "=" * 50)
        print("🎯 VALIDATION RESULTS")
        print("=" * 50)
        
        summary = report.get('validation_summary', {})
        
        print(f"Total Links:      {summary.get('total_links', 0)}")
        print(f"✅ Valid:         {summary.get('valid_links', 0)}")
        print(f"❌ Broken:        {summary.get('broken_links', 0)}")
        print(f"⚠️  Placeholders:  {summary.get('placeholder_links', 0)}")
        print(f"🔄 Redirects:     {summary.get('redirect_links', 0)}")
        
        # Health score
        total = summary.get('total_links', 1)
        valid = summary.get('valid_links', 0)
        health_score = (valid / total) * 100 if total > 0 else 0
        
        health_emoji = "🟢" if health_score >= 95 else "🟡" if health_score >= 80 else "🔴"
        print(f"\n{health_emoji} Health Score: {health_score:.1f}%")
        
        # Show broken links
        broken_links = report.get('broken_links', [])
        if broken_links:
            print("\n🚫 BROKEN LINKS:")
            for i, broken in enumerate(broken_links[:10], 1):
                print(f"  {i}. {broken['url']}")
                print(f"     📁 {broken['source_file']}")
                if broken.get('suggested_replacement'):
                    print(f"     💡 Suggestion: {broken['suggested_replacement']}")
                print()
        
        # Show placeholder links
        placeholder_links = report.get('placeholder_links', [])
        if placeholder_links:
            print("🔗 PLACEHOLDER LINKS:")
            for i, placeholder in enumerate(placeholder_links[:10], 1):
                print(f"  {i}. {placeholder['url']}")
                print(f"     📁 {placeholder['source_file']}")
                if placeholder.get('suggested_replacement'):
                    print(f"     💡 Authentic URL: {placeholder['suggested_replacement']}")
                print()
    
    def _save_report(self, report, output_file):
        """Save report to file"""
        try:
            with open(output_file, 'w') as f:
                json.dump(report, f, indent=2, default=str)
        except Exception as e:
            print(f"❌ Failed to save report: {e}")
    
    async def validate_single_url(self, url: str):
        """Validate a single URL"""
        print(f"🔗 Validating: {url}")
        
        async with SaarlandLinkValidator() as validator:
            from app.services.real_data.link_validation_service import LinkInfo
            
            link_info = LinkInfo(
                url=url,
                category=validator._categorize_url(url),
                source_file="cli_input",
                is_placeholder=validator._is_placeholder_url(url)
            )
            
            validated = await validator.validate_link(link_info)
            
            print(f"\n📊 Results for {url}:")
            print(f"  Status: {validated.status.value}")
            print(f"  Response Time: {validated.response_time:.2f}s" if validated.response_time else "  Response Time: N/A")
            print(f"  Status Code: {validated.status_code}" if validated.status_code else "  Status Code: N/A")
            print(f"  Category: {validated.category.value}")
            print(f"  Is Placeholder: {validated.is_placeholder}")
            
            if validated.title:
                print(f"  Title: {validated.title}")
            
            if validated.redirect_url:
                print(f"  Redirects to: {validated.redirect_url}")
            
            if validated.replacement_url:
                print(f"  💡 Suggested replacement: {validated.replacement_url}")
    
    async def generate_replacement_script(self, base_path: str, output_script: str):
        """Generate replacement script for broken links"""
        print("🔧 Generating link replacement script...")
        
        async with SaarlandLinkValidator() as validator:
            # Load existing data from database
            report = validator.generate_report()
            
            if not report.get('broken_links') and not report.get('placeholder_links'):
                print("✅ No broken or placeholder links found!")
                return
            
            # Create replacement engine
            replacement_engine = LinkReplacementEngine(validator)
            
            # Get broken links as LinkInfo objects
            broken_link_objects = []
            for broken in report.get('broken_links', []):
                from app.services.real_data.link_validation_service import LinkInfo
                link_info = LinkInfo(
                    url=broken['url'],
                    category=LinkCategory.OTHER,
                    source_file=broken['source_file'],
                    status=LinkStatus.BROKEN
                )
                broken_link_objects.append(link_info)
            
            # Generate suggestions
            suggestions = replacement_engine.generate_replacement_suggestions(broken_link_objects)
            
            # Create script
            script_content = replacement_engine.create_replacement_script(suggestions, base_path)
            
            # Save script
            with open(output_script, 'w') as f:
                f.write(script_content)
            
            # Make executable
            os.chmod(output_script, 0o755)
            
            print(f"📝 Replacement script saved: {output_script}")
            print(f"🔧 Found {len(suggestions)} replacements")
            print(f"⚠️  Review the script before running!")
    
    async def monitor_critical_links(self, duration: int = 300):
        """Monitor critical Saarland links"""
        print(f"👁️  Starting {duration}s monitoring of critical links...")
        
        critical_links = [
            "https://www.saarland.de",
            "https://www.urlaub.saarland",
            "https://www.saarvv.de",
            "https://www.uni-saarland.de",
            "https://www.saarbruecken.de"
        ]
        
        start_time = datetime.now()
        
        async with SaarlandLinkValidator() as validator:
            while (datetime.now() - start_time).seconds < duration:
                print(f"\n🔍 Checking at {datetime.now().strftime('%H:%M:%S')}")
                
                for url in critical_links:
                    from app.services.real_data.link_validation_service import LinkInfo
                    
                    link_info = LinkInfo(
                        url=url,
                        category=validator._categorize_url(url),
                        source_file="monitor"
                    )
                    
                    validated = await validator.validate_link(link_info)
                    
                    status_emoji = {
                        LinkStatus.VALID: "✅",
                        LinkStatus.BROKEN: "❌",
                        LinkStatus.TIMEOUT: "⏱️",
                        LinkStatus.SSL_ERROR: "🔒",
                        LinkStatus.REDIRECT: "🔄"
                    }.get(validated.status, "❓")
                    
                    response_time = f"({validated.response_time:.2f}s)" if validated.response_time else ""
                    print(f"  {status_emoji} {url} {response_time}")
                
                # Wait 30 seconds before next check
                await asyncio.sleep(30)
        
        print("\n✅ Monitoring completed")

def main():
    parser = argparse.ArgumentParser(description="AGENTLAND.SAARLAND Link Validation Tool")
    parser.add_argument("--base-path", default="/Users/deepsleeping/agentlandos", 
                       help="Base path to scan for links")
    parser.add_argument("--output", help="Output file for validation report (JSON)")
    parser.add_argument("--url", help="Validate a single URL")
    parser.add_argument("--generate-script", help="Generate replacement script file")
    parser.add_argument("--monitor", type=int, help="Monitor critical links for N seconds")
    parser.add_argument("--scan", action="store_true", help="Scan and validate all links")
    
    args = parser.parse_args()
    
    cli = LinkValidationCLI()
    
    try:
        if args.url:
            asyncio.run(cli.validate_single_url(args.url))
        elif args.generate_script:
            asyncio.run(cli.generate_replacement_script(args.base_path, args.generate_script))
        elif args.monitor:
            asyncio.run(cli.monitor_critical_links(args.monitor))
        elif args.scan:
            asyncio.run(cli.scan_and_validate(args.base_path, args.output))
        else:
            # Default: full scan
            asyncio.run(cli.scan_and_validate(args.base_path, args.output))
            
    except KeyboardInterrupt:
        print("\n⏹️  Operation cancelled by user")
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()