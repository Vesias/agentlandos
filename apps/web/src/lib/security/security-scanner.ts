// Advanced Security Scanner for Enterprise-Grade Protection
import { supabase } from "@/lib/supabase";

interface SecurityThreat {
  id: string;
  type:
    | "sql_injection"
    | "xss"
    | "csrf"
    | "rate_limit"
    | "suspicious_activity"
    | "malformed_input";
  severity: "low" | "medium" | "high" | "critical";
  source: string;
  userAgent?: string;
  ip: string;
  timestamp: string;
  details: Record<string, any>;
  blocked: boolean;
}

interface SecurityRule {
  id: string;
  name: string;
  pattern: RegExp;
  type: SecurityThreat["type"];
  severity: SecurityThreat["severity"];
  action: "log" | "block" | "alert";
  enabled: boolean;
}

interface SecurityReport {
  totalThreats: number;
  blockedThreats: number;
  threatsByType: Record<string, number>;
  threatsBySeverity: Record<string, number>;
  topAttackerIPs: Array<{ ip: string; count: number }>;
  riskScore: number;
  recommendations: string[];
}

export class AdvancedSecurityScanner {
  private static readonly securityRules: SecurityRule[] = [
    // SQL Injection Detection
    {
      id: "sql_1",
      name: "SQL Injection - Union Based",
      pattern: /(\bunion\b.*\bselect\b)|(\bselect\b.*\bunion\b)/i,
      type: "sql_injection",
      severity: "critical",
      action: "block",
      enabled: true,
    },
    {
      id: "sql_2",
      name: "SQL Injection - Boolean Based",
      pattern: /(\bor\b\s+\d+\s*=\s*\d+)|(\band\b\s+\d+\s*=\s*\d+)/i,
      type: "sql_injection",
      severity: "high",
      action: "block",
      enabled: true,
    },
    {
      id: "sql_3",
      name: "SQL Injection - Comment Based",
      pattern: /(--|\#|\/\*|\*\/)/,
      type: "sql_injection",
      severity: "medium",
      action: "log",
      enabled: true,
    },

    // XSS Detection
    {
      id: "xss_1",
      name: "XSS - Script Tags",
      pattern: /<script[^>]*>.*?<\/script>/i,
      type: "xss",
      severity: "critical",
      action: "block",
      enabled: true,
    },
    {
      id: "xss_2",
      name: "XSS - Event Handlers",
      pattern: /on\w+\s*=\s*["\'].*?["\']|javascript:/i,
      type: "xss",
      severity: "high",
      action: "block",
      enabled: true,
    },
    {
      id: "xss_3",
      name: "XSS - Data URLs",
      pattern: /data:text\/html|data:application\/javascript/i,
      type: "xss",
      severity: "medium",
      action: "alert",
      enabled: true,
    },

    // CSRF Detection
    {
      id: "csrf_1",
      name: "CSRF - Missing Token",
      pattern: /^(?!.*csrf_token)/i,
      type: "csrf",
      severity: "medium",
      action: "log",
      enabled: false, // Would need context-aware checking
    },

    // Suspicious Activity
    {
      id: "suspicious_1",
      name: "Directory Traversal",
      pattern: /\.\.\/|\.\.\\|\.\.\%2f|\.\.\%5c/i,
      type: "suspicious_activity",
      severity: "high",
      action: "block",
      enabled: true,
    },
    {
      id: "suspicious_2",
      name: "Command Injection",
      pattern: /[\|;&`\$\(\)]/,
      type: "suspicious_activity",
      severity: "high",
      action: "block",
      enabled: true,
    },
    {
      id: "suspicious_3",
      name: "File Upload Bypass",
      pattern: /\.(php|asp|jsp|exe|sh|bat|cmd)$/i,
      type: "suspicious_activity",
      severity: "critical",
      action: "block",
      enabled: true,
    },
  ];

  private static readonly suspiciousUserAgents = [
    /sqlmap/i,
    /nikto/i,
    /nessus/i,
    /burp/i,
    /zap/i,
    /acunetix/i,
    /netsparker/i,
    /wpscan/i,
  ];

  private static readonly rateLimitWindow = 60000; // 1 minute
  private static readonly maxRequestsPerWindow = 100;
  private static readonly requestCounts = new Map<string, Array<number>>();

  /**
   * Scan incoming request for security threats
   */
  static async scanRequest(
    url: string,
    method: string,
    headers: Record<string, string>,
    body?: any,
    ip?: string,
  ): Promise<{ safe: boolean; threats: SecurityThreat[]; blocked: boolean }> {
    const threats: SecurityThreat[] = [];
    let blocked = false;

    try {
      // Rate limiting check
      const rateLimitThreat = this.checkRateLimit(ip || "unknown");
      if (rateLimitThreat) {
        threats.push(rateLimitThreat);
        if (rateLimitThreat.blocked) blocked = true;
      }

      // User agent analysis
      const userAgent = headers["user-agent"] || "";
      const uaThreat = this.analyzeUserAgent(userAgent, ip || "unknown");
      if (uaThreat) {
        threats.push(uaThreat);
        if (uaThreat.blocked) blocked = true;
      }

      // URL parameter scanning
      const urlParams = new URL(url, "https://example.com").searchParams;
      for (const [key, value] of urlParams) {
        const paramThreats = this.scanContent(
          `${key}=${value}`,
          ip || "unknown",
          "url_param",
        );
        threats.push(...paramThreats);
        if (paramThreats.some((t) => t.blocked)) blocked = true;
      }

      // Body content scanning
      if (body) {
        const bodyContent =
          typeof body === "string" ? body : JSON.stringify(body);
        const bodyThreats = this.scanContent(
          bodyContent,
          ip || "unknown",
          "request_body",
        );
        threats.push(...bodyThreats);
        if (bodyThreats.some((t) => t.blocked)) blocked = true;
      }

      // Header scanning
      for (const [headerName, headerValue] of Object.entries(headers)) {
        if (["authorization", "cookie"].includes(headerName.toLowerCase()))
          continue;
        const headerThreats = this.scanContent(
          `${headerName}: ${headerValue}`,
          ip || "unknown",
          "header",
        );
        threats.push(...headerThreats);
        if (headerThreats.some((t) => t.blocked)) blocked = true;
      }

      // Log threats to database
      if (threats.length > 0) {
        await this.logThreats(threats);
      }

      return {
        safe: threats.length === 0,
        threats,
        blocked,
      };
    } catch (error) {
      console.error("Security scanner error:", error);
      return { safe: false, threats: [], blocked: false };
    }
  }

  /**
   * Scan content against security rules
   */
  private static scanContent(
    content: string,
    ip: string,
    source: string,
  ): SecurityThreat[] {
    const threats: SecurityThreat[] = [];

    for (const rule of this.securityRules) {
      if (!rule.enabled) continue;

      if (rule.pattern.test(content)) {
        const threat: SecurityThreat = {
          id: `threat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: rule.type,
          severity: rule.severity,
          source,
          ip,
          timestamp: new Date().toISOString(),
          details: {
            rule: rule.name,
            ruleId: rule.id,
            matchedContent: content.substring(0, 200), // Limit for privacy
            action: rule.action,
          },
          blocked: rule.action === "block",
        };

        threats.push(threat);
      }
    }

    return threats;
  }

  /**
   * Check rate limiting
   */
  private static checkRateLimit(ip: string): SecurityThreat | null {
    const now = Date.now();
    const windowStart = now - this.rateLimitWindow;

    // Get or create request history for this IP
    let requests = this.requestCounts.get(ip) || [];

    // Remove old requests outside the window
    requests = requests.filter((timestamp) => timestamp > windowStart);

    // Add current request
    requests.push(now);
    this.requestCounts.set(ip, requests);

    // Check if rate limit exceeded
    if (requests.length > this.maxRequestsPerWindow) {
      return {
        id: `ratelimit_${now}_${Math.random().toString(36).substr(2, 9)}`,
        type: "rate_limit",
        severity: "medium",
        source: "rate_limiter",
        ip,
        timestamp: new Date().toISOString(),
        details: {
          requestCount: requests.length,
          windowMinutes: this.rateLimitWindow / 60000,
          maxAllowed: this.maxRequestsPerWindow,
        },
        blocked: true,
      };
    }

    return null;
  }

  /**
   * Analyze user agent for suspicious patterns
   */
  private static analyzeUserAgent(
    userAgent: string,
    ip: string,
  ): SecurityThreat | null {
    for (const pattern of this.suspiciousUserAgents) {
      if (pattern.test(userAgent)) {
        return {
          id: `useragent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: "suspicious_activity",
          severity: "high",
          source: "user_agent",
          userAgent,
          ip,
          timestamp: new Date().toISOString(),
          details: {
            suspiciousPattern: pattern.source,
            fullUserAgent: userAgent,
          },
          blocked: true,
        };
      }
    }

    return null;
  }

  /**
   * Log threats to database
   */
  private static async logThreats(threats: SecurityThreat[]): Promise<void> {
    try {
      for (const threat of threats) {
        await supabase.from("security_threats").insert({
          threat_id: threat.id,
          type: threat.type,
          severity: threat.severity,
          source: threat.source,
          user_agent: threat.userAgent,
          ip_address: threat.ip,
          details: threat.details,
          blocked: threat.blocked,
          created_at: threat.timestamp,
        });
      }
    } catch (error) {
      console.error("Failed to log security threats:", error);
    }
  }

  /**
   * Get security report for dashboard
   */
  static async getSecurityReport(
    timeRange: "24h" | "7d" | "30d" = "24h",
  ): Promise<SecurityReport> {
    try {
      const hours = timeRange === "24h" ? 24 : timeRange === "7d" ? 168 : 720;
      const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

      const { data: threats, error } = await supabase
        .from("security_threats")
        .select("*")
        .gte("created_at", since);

      if (error) throw error;

      const totalThreats = threats.length;
      const blockedThreats = threats.filter((t) => t.blocked).length;

      // Group by type
      const threatsByType = threats.reduce(
        (acc, threat) => {
          acc[threat.type] = (acc[threat.type] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      // Group by severity
      const threatsBySeverity = threats.reduce(
        (acc, threat) => {
          acc[threat.severity] = (acc[threat.severity] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      // Top attacker IPs
      const ipCounts = threats.reduce(
        (acc, threat) => {
          acc[threat.ip_address] = (acc[threat.ip_address] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      const topAttackerIPs = Object.entries(ipCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([ip, count]) => ({ ip, count }));

      // Calculate risk score (0-100)
      const criticalThreats = threatsBySeverity.critical || 0;
      const highThreats = threatsBySeverity.high || 0;
      const riskScore = Math.min(
        100,
        criticalThreats * 20 + highThreats * 10 + totalThreats * 2,
      );

      // Generate recommendations
      const recommendations = this.generateRecommendations(
        threatsByType,
        threatsBySeverity,
        riskScore,
      );

      return {
        totalThreats,
        blockedThreats,
        threatsByType,
        threatsBySeverity,
        topAttackerIPs,
        riskScore,
        recommendations,
      };
    } catch (error) {
      console.error("Failed to generate security report:", error);
      return {
        totalThreats: 0,
        blockedThreats: 0,
        threatsByType: {},
        threatsBySeverity: {},
        topAttackerIPs: [],
        riskScore: 0,
        recommendations: ["Security monitoring temporarily unavailable"],
      };
    }
  }

  /**
   * Generate security recommendations
   */
  private static generateRecommendations(
    threatsByType: Record<string, number>,
    threatsBySeverity: Record<string, number>,
    riskScore: number,
  ): string[] {
    const recommendations: string[] = [];

    if (riskScore > 70) {
      recommendations.push(
        "🚨 Kritisches Risiko: Sofortige Sicherheitsmaßnahmen erforderlich",
      );
    } else if (riskScore > 40) {
      recommendations.push(
        "⚠️ Erhöhtes Risiko: Sicherheitsrichtlinien überprüfen",
      );
    }

    if (threatsByType.sql_injection > 10) {
      recommendations.push(
        "SQL-Injection-Angriffe erkannt: Parameter-Validierung verstärken",
      );
    }

    if (threatsByType.xss > 5) {
      recommendations.push(
        "XSS-Angriffe erkannt: Input-Sanitization implementieren",
      );
    }

    if (threatsByType.rate_limit > 20) {
      recommendations.push(
        "Rate-Limiting-Verletzungen: DDoS-Schutz aktivieren",
      );
    }

    if (threatsBySeverity.critical > 0) {
      recommendations.push(
        "Kritische Bedrohungen: Sofortige Incident-Response einleiten",
      );
    }

    if (recommendations.length === 0) {
      recommendations.push(
        "✅ Sicherheitslage stabil - kontinuierliche Überwachung fortsetzen",
      );
    }

    return recommendations;
  }

  /**
   * Block IP address
   */
  static async blockIP(
    ip: string,
    reason: string,
    duration?: number,
  ): Promise<void> {
    try {
      const expiresAt = duration
        ? new Date(Date.now() + duration * 1000)
        : null;

      await supabase.from("blocked_ips").insert({
        ip_address: ip,
        reason,
        blocked_at: new Date().toISOString(),
        expires_at: expiresAt?.toISOString(),
        active: true,
      });
    } catch (error) {
      console.error("Failed to block IP:", error);
    }
  }

  /**
   * Check if IP is blocked
   */
  static async isIPBlocked(ip: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from("blocked_ips")
        .select("*")
        .eq("ip_address", ip)
        .eq("active", true)
        .single();

      if (error || !data) return false;

      // Check if block has expired
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        // Deactivate expired block
        await supabase
          .from("blocked_ips")
          .update({ active: false })
          .eq("id", data.id);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Failed to check IP block status:", error);
      return false;
    }
  }
}

export default AdvancedSecurityScanner;
