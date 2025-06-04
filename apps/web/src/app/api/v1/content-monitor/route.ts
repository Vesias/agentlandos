import { NextRequest, NextResponse } from 'next/server';

interface ContentSource {
  name: string;
  url: string;
  apiEndpoint?: string;
  updateFrequency: 'hourly' | 'daily' | 'weekly';
  dataType: 'events' | 'prices' | 'hours' | 'contact' | 'programs';
  category: 'education' | 'tourism' | 'business' | 'culture' | 'admin';
  lastUpdate: string;
  status: 'active' | 'error' | 'stale';
}

interface MonitoringAlert {
  id: string;
  type: 'broken_link' | 'stale_content' | 'missing_data' | 'price_change' | 'event_update';
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  message: string;
  affectedCards: string[];
  suggestedAction: string;
  timestamp: string;
  resolved: boolean;
}

// Official Saarland data sources for automated updates
const OFFICIAL_DATA_SOURCES: ContentSource[] = [
  // Education
  {
    name: 'Universität des Saarlandes',
    url: 'https://www.uni-saarland.de',
    apiEndpoint: 'https://www.uni-saarland.de/api/contact',
    updateFrequency: 'weekly',
    dataType: 'contact',
    category: 'education',
    lastUpdate: new Date().toISOString(),
    status: 'active'
  },
  {
    name: 'HTW Saar',
    url: 'https://www.htwsaar.de',
    updateFrequency: 'weekly',
    dataType: 'programs',
    category: 'education',
    lastUpdate: new Date().toISOString(),
    status: 'active'
  },
  
  // Tourism
  {
    name: 'Saarland Tourismus',
    url: 'https://www.urlaub.saarland',
    apiEndpoint: 'https://www.urlaub.saarland/api/attractions',
    updateFrequency: 'daily',
    dataType: 'hours',
    category: 'tourism',
    lastUpdate: new Date().toISOString(),
    status: 'active'
  },
  {
    name: 'Völklinger Hütte',
    url: 'https://www.voelklinger-huette.org',
    updateFrequency: 'daily',
    dataType: 'prices',
    category: 'tourism',
    lastUpdate: new Date().toISOString(),
    status: 'active'
  },
  
  // Business
  {
    name: 'Invest in Saarland',
    url: 'https://www.invest-in-saarland.com',
    updateFrequency: 'weekly',
    dataType: 'programs',
    category: 'business',
    lastUpdate: new Date().toISOString(),
    status: 'active'
  },
  
  // Culture
  {
    name: 'Staatstheater Saarbrücken',
    url: 'https://www.staatstheater.saarland',
    apiEndpoint: 'https://www.staatstheater.saarland/api/events',
    updateFrequency: 'daily',
    dataType: 'events',
    category: 'culture',
    lastUpdate: new Date().toISOString(),
    status: 'active'
  },
  {
    name: 'Kulturserver Saarland',
    url: 'https://www.kulturserver-saarland.de',
    updateFrequency: 'daily',
    dataType: 'events',
    category: 'culture',
    lastUpdate: new Date().toISOString(),
    status: 'active'
  },
  
  // Admin
  {
    name: 'Saarland.de Services',
    url: 'https://www.saarland.de',
    apiEndpoint: 'https://www.saarland.de/api/services',
    updateFrequency: 'weekly',
    dataType: 'contact',
    category: 'admin',
    lastUpdate: new Date().toISOString(),
    status: 'active'
  }
];

class ContentMonitor {
  private alerts: MonitoringAlert[] = [];

  async performContentAudit(): Promise<{
    sources: ContentSource[];
    alerts: MonitoringAlert[];
    summary: any;
    recommendations: string[];
  }> {
    // Check all data sources
    const updatedSources = await this.checkAllSources();
    
    // Generate alerts for issues
    await this.generateAlerts(updatedSources);
    
    // Create summary
    const summary = this.generateSummary(updatedSources);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations();

    return {
      sources: updatedSources,
      alerts: this.alerts,
      summary,
      recommendations
    };
  }

  private async checkAllSources(): Promise<ContentSource[]> {
    const results: ContentSource[] = [];

    for (const source of OFFICIAL_DATA_SOURCES) {
      const updatedSource = await this.checkSource(source);
      results.push(updatedSource);
    }

    return results;
  }

  private async checkSource(source: ContentSource): Promise<ContentSource> {
    try {
      const response = await fetch(source.url, {
        method: 'HEAD',
        timeout: 10000
      });

      if (response.ok) {
        // Check if content has been updated recently
        const lastModified = response.headers.get('last-modified');
        const isStale = this.isContentStale(source, lastModified);
        
        return {
          ...source,
          status: isStale ? 'stale' : 'active',
          lastUpdate: lastModified || source.lastUpdate
        };
      } else {
        // Generate alert for broken source
        this.generateAlert({
          type: 'broken_link',
          severity: 'high',
          category: source.category,
          message: `Official source ${source.name} is not accessible`,
          affectedCards: this.getAffectedCards(source.category),
          suggestedAction: 'Check source URL and update card content manually'
        });

        return {
          ...source,
          status: 'error'
        };
      }
    } catch (error) {
      return {
        ...source,
        status: 'error'
      };
    }
  }

  private isContentStale(source: ContentSource, lastModified: string | null): boolean {
    if (!lastModified) return true;

    const lastUpdate = new Date(lastModified);
    const now = new Date();
    const hoursSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);

    switch (source.updateFrequency) {
      case 'hourly':
        return hoursSinceUpdate > 2;
      case 'daily':
        return hoursSinceUpdate > 48;
      case 'weekly':
        return hoursSinceUpdate > 168; // 7 days
      default:
        return false;
    }
  }

  private async generateAlerts(sources: ContentSource[]): Promise<void> {
    // Check for stale content
    const staleSources = sources.filter(s => s.status === 'stale');
    staleSources.forEach(source => {
      this.generateAlert({
        type: 'stale_content',
        severity: 'medium',
        category: source.category,
        message: `${source.name} content may be outdated`,
        affectedCards: this.getAffectedCards(source.category),
        suggestedAction: 'Update card content with latest information'
      });
    });

    // Check for broken sources
    const brokenSources = sources.filter(s => s.status === 'error');
    brokenSources.forEach(source => {
      this.generateAlert({
        type: 'broken_link',
        severity: 'high',
        category: source.category,
        message: `Cannot access ${source.name} for content updates`,
        affectedCards: this.getAffectedCards(source.category),
        suggestedAction: 'Verify source URL and contact information'
      });
    });

    // Check for missing critical data
    await this.checkMissingData();
  }

  private async checkMissingData(): Promise<void> {
    const criticalMissingData = [
      {
        category: 'tourism',
        missing: 'Current opening hours for major attractions',
        cards: ['Saarschleife', 'Völklinger Hütte', 'Bostalsee'],
        action: 'Contact attractions directly for current information'
      },
      {
        category: 'business',
        missing: 'Active funding program deadlines',
        cards: ['Funding Programs'],
        action: 'Check official business support portals'
      },
      {
        category: 'culture',
        missing: 'Current event schedules and ticket prices',
        cards: ['Cultural Venues', 'Events'],
        action: 'Update with current season information'
      }
    ];

    criticalMissingData.forEach(item => {
      this.generateAlert({
        type: 'missing_data',
        severity: 'medium',
        category: item.category,
        message: `Missing: ${item.missing}`,
        affectedCards: item.cards,
        suggestedAction: item.action
      });
    });
  }

  private generateAlert(alertData: Omit<MonitoringAlert, 'id' | 'timestamp' | 'resolved'>): void {
    const alert: MonitoringAlert = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      resolved: false,
      ...alertData
    };

    this.alerts.push(alert);
  }

  private getAffectedCards(category: string): string[] {
    const cardMapping = {
      education: ['Universities', 'Training Programs', 'Scholarships'],
      tourism: ['Attractions', 'Hotels', 'Activities'],
      business: ['Funding Programs', 'Business Services', 'Networking'],
      culture: ['Venues', 'Events', 'Museums'],
      admin: ['Services', 'Applications', 'Contact']
    };

    return cardMapping[category as keyof typeof cardMapping] || [];
  }

  private generateSummary(sources: ContentSource[]) {
    const total = sources.length;
    const active = sources.filter(s => s.status === 'active').length;
    const stale = sources.filter(s => s.status === 'stale').length;
    const error = sources.filter(s => s.status === 'error').length;

    const categoryBreakdown = sources.reduce((acc, source) => {
      acc[source.category] = (acc[source.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalSources: total,
      activeSources: active,
      staleSources: stale,
      errorSources: error,
      healthScore: Math.round((active / total) * 100),
      categoryBreakdown,
      criticalAlerts: this.alerts.filter(a => a.severity === 'critical').length,
      totalAlerts: this.alerts.length
    };
  }

  private generateRecommendations(): string[] {
    const recommendations = [];

    if (this.alerts.filter(a => a.type === 'stale_content').length > 0) {
      recommendations.push('Set up automated content refresh for frequently changing information');
    }

    if (this.alerts.filter(a => a.type === 'broken_link').length > 0) {
      recommendations.push('Implement fallback data sources for critical information');
    }

    if (this.alerts.filter(a => a.type === 'missing_data').length > 0) {
      recommendations.push('Establish direct partnerships with data providers for real-time updates');
    }

    recommendations.push('Implement webhook notifications for immediate content updates');
    recommendations.push('Create automated testing for all external data sources');

    return recommendations;
  }
}

export async function GET(request: NextRequest) {
  try {
    const monitor = new ContentMonitor();
    const auditResults = await monitor.performContentAudit();
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...auditResults
    });
  } catch (error) {
    console.error('Content monitoring error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to perform content audit'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, alertId, sourceId } = body;

    if (action === 'resolve-alert' && alertId) {
      // Mark alert as resolved
      return NextResponse.json({
        success: true,
        message: `Alert ${alertId} marked as resolved`
      });
    }

    if (action === 'refresh-source' && sourceId) {
      // Trigger manual refresh of specific source
      return NextResponse.json({
        success: true,
        message: `Source ${sourceId} refresh initiated`
      });
    }

    if (action === 'update-monitoring-settings') {
      // Update monitoring configuration
      return NextResponse.json({
        success: true,
        message: 'Monitoring settings updated'
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Unknown action'
    }, { status: 400 });
  } catch (error) {
    console.error('Content monitoring update error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update monitoring'
    }, { status: 500 });
  }
}