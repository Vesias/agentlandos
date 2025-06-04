import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

interface LinkValidationResult {
  url: string;
  status: 'valid' | 'broken' | 'placeholder' | 'redirect';
  statusCode?: number;
  responseTime?: number;
  saarlandRelevant: boolean;
  category: 'education' | 'tourism' | 'business' | 'culture' | 'admin' | 'external';
  sourceFile: string;
  suggestedReplacement?: string;
  lastChecked: string;
}

interface CardValidationResult {
  cardType: string;
  sourceFile: string;
  issues: string[];
  placeholderContent: string[];
  missingData: string[];
  brokenLinks: string[];
  healthScore: number;
}

// Saarland-specific URL patterns and official sources
const SAARLAND_OFFICIAL_URLS = {
  government: 'https://www.saarland.de',
  tourism: 'https://www.urlaub.saarland',
  transport: 'https://www.saarvv.de',
  education: {
    university: 'https://www.uni-saarland.de',
    htw: 'https://www.htwsaar.de',
    hfm: 'https://www.hfmsaar.de',
    hbk: 'https://www.hbksaar.de'
  },
  business: 'https://www.invest-in-saarland.com',
  culture: 'https://www.kulturserver-saarland.de',
  statistics: 'https://www.statistik.saarland.de',
  weather: 'https://www.dwd.de/DE/wetter/wetterundklima_vorort/saarland',
  events: 'https://www.saarbruecken.de/veranstaltungen'
};

const PLACEHOLDER_PATTERNS = [
  'example.com',
  'placeholder',
  'dummy',
  'test.com',
  'localhost',
  'api/placeholder',
  'javascript:void(0)',
  '#',
  'coming-soon',
  'under-construction'
];

class CardValidator {
  private results: LinkValidationResult[] = [];
  private cardResults: CardValidationResult[] = [];

  async validateAllCards(): Promise<{
    links: LinkValidationResult[];
    cards: CardValidationResult[];
    summary: any;
  }> {
    const webDir = path.join(process.cwd(), 'apps/web/src');
    
    // Scan all TSX files for cards and links
    await this.scanDirectory(webDir);
    
    // Generate summary statistics
    const summary = this.generateSummary();
    
    return {
      links: this.results,
      cards: this.cardResults,
      summary
    };
  }

  private async scanDirectory(dir: string): Promise<void> {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory() && !entry.name.includes('node_modules')) {
        await this.scanDirectory(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
        await this.scanFile(fullPath);
      }
    }
  }

  private async scanFile(filePath: string): Promise<void> {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const relativePath = path.relative(process.cwd(), filePath);
      
      // Extract URLs from the file
      const urls = this.extractUrls(content);
      
      // Validate each URL
      for (const url of urls) {
        const result = await this.validateUrl(url, relativePath);
        this.results.push(result);
      }

      // Validate card components if this is a service page
      if (filePath.includes('/app/services/') && filePath.endsWith('page.tsx')) {
        const cardValidation = await this.validateCardContent(content, relativePath);
        this.cardResults.push(cardValidation);
      }
    } catch (error) {
      console.error(`Error scanning file ${filePath}:`, error);
    }
  }

  private extractUrls(content: string): string[] {
    const urlRegex = /https?:\/\/[^\s'"<>)]+/gi;
    const hrefRegex = /href=['"]([^'"]+)['"]/gi;
    
    const urls = new Set<string>();
    
    // Extract direct URLs
    const directUrls = content.match(urlRegex) || [];
    directUrls.forEach(url => urls.add(url));
    
    // Extract href URLs
    let match;
    while ((match = hrefRegex.exec(content)) !== null) {
      const url = match[1];
      if (url.startsWith('http')) {
        urls.add(url);
      }
    }
    
    return Array.from(urls);
  }

  private async validateUrl(url: string, sourceFile: string): Promise<LinkValidationResult> {
    const result: LinkValidationResult = {
      url,
      status: 'valid',
      saarlandRelevant: this.isSaarlandRelevant(url),
      category: this.categorizeUrl(url),
      sourceFile,
      lastChecked: new Date().toISOString()
    };

    // Check for placeholder patterns
    if (this.isPlaceholder(url)) {
      result.status = 'placeholder';
      result.suggestedReplacement = this.suggestSaarlandUrl(url, result.category);
      return result;
    }

    // Validate actual URL
    try {
      const startTime = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'User-Agent': 'AGENTLAND-SAARLAND-Validator/1.0'
        }
      });
      
      clearTimeout(timeoutId);
      
      result.responseTime = Date.now() - startTime;
      result.statusCode = response.status;
      
      if (response.status >= 200 && response.status < 300) {
        result.status = 'valid';
      } else if (response.status >= 300 && response.status < 400) {
        result.status = 'redirect';
      } else {
        result.status = 'broken';
        result.suggestedReplacement = this.suggestSaarlandUrl(url, result.category);
      }
    } catch (error) {
      result.status = 'broken';
      result.suggestedReplacement = this.suggestSaarlandUrl(url, result.category);
    }

    return result;
  }

  private async validateCardContent(content: string, sourceFile: string): Promise<CardValidationResult> {
    const cardType = this.determineCardType(sourceFile);
    const issues: string[] = [];
    const placeholderContent: string[] = [];
    const missingData: string[] = [];
    const brokenLinks: string[] = [];

    // Check for placeholder content
    const placeholderPatterns = [
      'Lorem ipsum',
      'placeholder',
      'dummy data',
      'example',
      'coming soon',
      'unter construction',
      'test data'
    ];

    placeholderPatterns.forEach(pattern => {
      if (content.toLowerCase().includes(pattern.toLowerCase())) {
        placeholderContent.push(pattern);
        issues.push(`Contains placeholder content: ${pattern}`);
      }
    });

    // Check for missing Saarland-specific data
    const saarlandKeywords = ['saarland', 'saarbrücken', 'völklingen', 'neunkirchen', 'homburg'];
    const hasSaarlandContent = saarlandKeywords.some(keyword => 
      content.toLowerCase().includes(keyword)
    );

    if (!hasSaarlandContent) {
      missingData.push('Saarland-specific content');
      issues.push('Missing Saarland-specific geographical references');
    }

    // Check for authentic contact information
    if (cardType === 'business' || cardType === 'education') {
      if (!content.includes('@') && !content.includes('tel:') && !content.includes('phone')) {
        missingData.push('Contact information');
        issues.push('Missing authentic contact information');
      }
    }

    // Check for call-to-action buttons
    if (!content.includes('Button') && !content.includes('button')) {
      missingData.push('Call-to-action buttons');
      issues.push('Missing call-to-action buttons');
    }

    // Calculate health score
    let healthScore = 100;
    healthScore -= issues.length * 10;
    healthScore -= placeholderContent.length * 15;
    healthScore -= missingData.length * 20;
    healthScore = Math.max(0, Math.min(100, healthScore));

    return {
      cardType,
      sourceFile,
      issues,
      placeholderContent,
      missingData,
      brokenLinks,
      healthScore
    };
  }

  private isPlaceholder(url: string): boolean {
    return PLACEHOLDER_PATTERNS.some(pattern => 
      url.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  private isSaarlandRelevant(url: string): boolean {
    const saarlandDomains = [
      'saarland.de',
      'saarbruecken.de',
      'urlaub.saarland',
      'uni-saarland.de',
      'htwsaar.de',
      'saarvv.de',
      'invest-in-saarland.com'
    ];

    return saarlandDomains.some(domain => url.includes(domain));
  }

  private categorizeUrl(url: string): LinkValidationResult['category'] {
    if (url.includes('uni-') || url.includes('htwsaar') || url.includes('bildung')) {
      return 'education';
    }
    if (url.includes('urlaub') || url.includes('tourism') || url.includes('visit')) {
      return 'tourism';
    }
    if (url.includes('invest') || url.includes('business') || url.includes('wirtschaft')) {
      return 'business';
    }
    if (url.includes('kultur') || url.includes('theater') || url.includes('museum')) {
      return 'culture';
    }
    if (url.includes('saarland.de') || url.includes('verwaltung') || url.includes('gov')) {
      return 'admin';
    }
    return 'external';
  }

  private suggestSaarlandUrl(url: string, category: string): string {
    switch (category) {
      case 'education':
        return SAARLAND_OFFICIAL_URLS.education.university;
      case 'tourism':
        return SAARLAND_OFFICIAL_URLS.tourism;
      case 'business':
        return SAARLAND_OFFICIAL_URLS.business;
      case 'culture':
        return SAARLAND_OFFICIAL_URLS.culture;
      case 'admin':
        return SAARLAND_OFFICIAL_URLS.government;
      default:
        return SAARLAND_OFFICIAL_URLS.government;
    }
  }

  private determineCardType(filePath: string): string {
    if (filePath.includes('/education/')) return 'education';
    if (filePath.includes('/tourism/')) return 'tourism';
    if (filePath.includes('/business/')) return 'business';
    if (filePath.includes('/culture/')) return 'culture';
    if (filePath.includes('/admin/')) return 'admin';
    return 'general';
  }

  private generateSummary() {
    const totalLinks = this.results.length;
    const validLinks = this.results.filter(r => r.status === 'valid').length;
    const brokenLinks = this.results.filter(r => r.status === 'broken').length;
    const placeholderLinks = this.results.filter(r => r.status === 'placeholder').length;
    const redirectLinks = this.results.filter(r => r.status === 'redirect').length;
    const saarlandRelevant = this.results.filter(r => r.saarlandRelevant).length;

    const avgHealthScore = this.cardResults.length > 0 
      ? this.cardResults.reduce((sum, card) => sum + card.healthScore, 0) / this.cardResults.length
      : 100;

    return {
      totalLinks,
      validLinks,
      brokenLinks,
      placeholderLinks,
      redirectLinks,
      saarlandRelevant,
      overallHealthScore: Math.round(avgHealthScore),
      recommendations: this.generateRecommendations()
    };
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    
    const placeholderCount = this.results.filter(r => r.status === 'placeholder').length;
    if (placeholderCount > 0) {
      recommendations.push(`Replace ${placeholderCount} placeholder links with authentic Saarland URLs`);
    }

    const brokenCount = this.results.filter(r => r.status === 'broken').length;
    if (brokenCount > 0) {
      recommendations.push(`Fix ${brokenCount} broken links to improve user experience`);
    }

    const lowHealthCards = this.cardResults.filter(c => c.healthScore < 80).length;
    if (lowHealthCards > 0) {
      recommendations.push(`Improve content quality for ${lowHealthCards} cards with low health scores`);
    }

    const nonSaarlandLinks = this.results.filter(r => !r.saarlandRelevant).length;
    if (nonSaarlandLinks > this.results.length * 0.3) {
      recommendations.push('Consider replacing external links with Saarland-focused alternatives');
    }

    return recommendations;
  }
}

export async function GET(request: NextRequest) {
  try {
    const validator = new CardValidator();
    const results = await validator.validateAllCards();
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...results
    });
  } catch (error) {
    console.error('Card validation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to validate cards and links'
    }, { status: 500 });
  }
}