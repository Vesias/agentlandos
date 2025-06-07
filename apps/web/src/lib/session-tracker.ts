"use client";

import { supabaseBrowser } from "./supabase";

class SessionTracker {
  private sessionId: string | null = null;
  private userId: string | null = null;
  private isTracking = false;
  private activityTimer: NodeJS.Timeout | null = null;
  private heatmapData: Array<{ x: number; y: number; timestamp: number }> = [];
  private scrollData: Array<{ depth: number; timestamp: number }> = [];
  private clickData: Array<{
    x: number;
    y: number;
    element: string;
    timestamp: number;
  }> = [];
  private performanceData: { [key: string]: number } = {};

  constructor() {
    if (typeof window !== "undefined") {
      this.init();
    }
  }

  private async init() {
    // Generate or retrieve session ID
    this.sessionId = this.getOrCreateSessionId();

    // Get current user if logged in
    const {
      data: { session },
    } = await supabaseBrowser.auth.getSession();
    this.userId = session?.user?.id || null;

    // Start tracking
    await this.startSession();

    // Listen for auth changes
    supabaseBrowser.auth.onAuthStateChange((event, session) => {
      const newUserId = session?.user?.id || null;
      if (newUserId !== this.userId) {
        this.userId = newUserId;
        this.updateSessionUser();
      }
    });

    // Track page visibility changes
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.pauseTracking();
      } else {
        this.resumeTracking();
      }
    });

    // Track when user leaves the page
    window.addEventListener("beforeunload", () => {
      this.endSession();
    });

    // Track advanced user interactions
    this.setupAdvancedTracking();

    // Track page views
    this.trackPageView();
  }

  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem("agentland_session_id");

    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem("agentland_session_id", sessionId);
    }

    return sessionId;
  }

  private async startSession() {
    if (!this.sessionId) return;

    try {
      const sessionData = {
        session_id: this.sessionId,
        user_id: this.userId,
        ip_address: await this.getClientIP(),
        user_agent: navigator.userAgent,
        is_mobile: this.isMobile(),
        utm_source: this.getUTMParam("utm_source"),
        utm_medium: this.getUTMParam("utm_medium"),
        utm_campaign: this.getUTMParam("utm_campaign"),
        referrer: document.referrer || null,
      };

      await fetch("/api/analytics/session/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sessionData),
      });

      this.isTracking = true;
      this.startActivityTimer();
    } catch (error) {
      console.error("Failed to start session tracking:", error);
    }
  }

  private async endSession() {
    if (!this.sessionId || !this.isTracking) return;

    try {
      await fetch("/api/analytics/session/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: this.sessionId }),
      });

      this.isTracking = false;
      if (this.activityTimer) {
        clearInterval(this.activityTimer);
      }
    } catch (error) {
      console.error("Failed to end session tracking:", error);
    }
  }

  private async updateSessionUser() {
    if (!this.sessionId) return;

    try {
      await fetch("/api/analytics/session/update-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: this.sessionId,
          user_id: this.userId,
        }),
      });
    } catch (error) {
      console.error("Failed to update session user:", error);
    }
  }

  private startActivityTimer() {
    // Send activity ping every 30 seconds
    this.activityTimer = setInterval(() => {
      this.trackActivity();
    }, 30000);
  }

  private pauseTracking() {
    if (this.activityTimer) {
      clearInterval(this.activityTimer);
      this.activityTimer = null;
    }
  }

  private resumeTracking() {
    if (this.isTracking && !this.activityTimer) {
      this.startActivityTimer();
      this.trackActivity();
    }
  }

  public async trackPageView(pagePath?: string) {
    if (!this.sessionId) return;

    try {
      await fetch("/api/analytics/page-view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: this.sessionId,
          user_id: this.userId,
          page_path: pagePath || window.location.pathname,
          page_title: document.title,
          referrer: document.referrer || null,
        }),
      });
    } catch (error) {
      console.error("Failed to track page view:", error);
    }
  }

  public async trackEvent(eventName: string, eventData?: any) {
    if (!this.sessionId) return;

    try {
      await fetch("/api/analytics/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: this.sessionId,
          user_id: this.userId,
          event_name: eventName,
          event_data: eventData || {},
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error("Failed to track event:", error);
    }
  }

  private async trackActivity() {
    if (!this.sessionId) return;

    try {
      await fetch("/api/analytics/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: this.sessionId,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error("Failed to track activity:", error);
    }
  }

  private async getClientIP(): Promise<string | null> {
    try {
      // Use a public IP service or extract from headers
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      return data.ip || null;
    } catch {
      return null;
    }
  }

  private isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );
  }

  private getUTMParam(param: string): string | null {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }

  // Public methods for manual tracking
  public getSessionId(): string | null {
    return this.sessionId;
  }

  public getUserId(): string | null {
    return this.userId;
  }

  public isSessionActive(): boolean {
    return this.isTracking;
  }

  // Advanced tracking methods
  private setupAdvancedTracking() {
    // Mouse movement heatmap tracking
    let mouseMoveTimer: NodeJS.Timeout | null = null;
    document.addEventListener("mousemove", (e) => {
      if (mouseMoveTimer) clearTimeout(mouseMoveTimer);
      mouseMoveTimer = setTimeout(() => {
        this.heatmapData.push({
          x: e.clientX,
          y: e.clientY,
          timestamp: Date.now(),
        });
        // Keep only last 100 points
        if (this.heatmapData.length > 100) {
          this.heatmapData = this.heatmapData.slice(-100);
        }
      }, 100);
    });

    // Click tracking with element identification
    document.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      const elementInfo = this.getElementInfo(target);
      this.clickData.push({
        x: e.clientX,
        y: e.clientY,
        element: elementInfo,
        timestamp: Date.now(),
      });

      // Track specific business events
      this.trackClickEvent(elementInfo, e);
    });

    // Scroll depth tracking
    let scrollTimer: NodeJS.Timeout | null = null;
    window.addEventListener("scroll", () => {
      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        const scrollDepth = Math.round(
          (window.scrollY /
            (document.documentElement.scrollHeight - window.innerHeight)) *
            100,
        );
        this.scrollData.push({
          depth: Math.min(100, Math.max(0, scrollDepth)),
          timestamp: Date.now(),
        });
      }, 200);
    });

    // Performance tracking
    this.trackPerformanceMetrics();

    // Send batch data every 60 seconds
    setInterval(() => {
      this.sendBatchedData();
    }, 60000);
  }

  private getElementInfo(element: HTMLElement): string {
    const tag = element.tagName.toLowerCase();
    const id = element.id ? `#${element.id}` : "";
    const classes = element.className
      ? `.${element.className.split(" ").join(".")}`
      : "";
    const text = element.textContent?.slice(0, 50) || "";
    return `${tag}${id}${classes} "${text}"`;
  }

  private async trackClickEvent(elementInfo: string, event: MouseEvent) {
    // Identify business-critical clicks
    const businessEvents = {
      button: "button_click",
      a: "link_click",
      'input[type="submit"]': "form_submit",
      ".cta": "cta_click",
      ".service-card": "service_exploration",
      ".ai-chat": "ai_interaction",
      ".behoerden": "government_service_access",
    };

    for (const [selector, eventName] of Object.entries(businessEvents)) {
      if ((event.target as HTMLElement).matches(selector)) {
        await this.trackEvent(eventName, {
          element_info: elementInfo,
          page_path: window.location.pathname,
          timestamp: new Date().toISOString(),
        });
        break;
      }
    }
  }

  private trackPerformanceMetrics() {
    // Track Core Web Vitals
    if ("web-vital" in window) {
      // FCP - First Contentful Paint
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (entry.name === "first-contentful-paint") {
            this.performanceData.fcp = entry.startTime;
          }
        }
      }).observe({ entryTypes: ["paint"] });

      // LCP - Largest Contentful Paint
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.performanceData.lcp = lastEntry.startTime;
      }).observe({ entryTypes: ["largest-contentful-paint"] });

      // CLS - Cumulative Layout Shift
      let clsValue = 0;
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
            this.performanceData.cls = clsValue;
          }
        }
      }).observe({ entryTypes: ["layout-shift"] });
    }

    // Track API response times
    this.trackAPIResponseTimes();
  }

  private trackAPIResponseTimes() {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        const duration = endTime - startTime;

        const url = args[0] as string;
        if (url.includes("/api/")) {
          await this.trackEvent("api_response_time", {
            endpoint: url,
            duration_ms: Math.round(duration),
            status: response.status,
            timestamp: new Date().toISOString(),
          });
        }

        return response;
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;

        await this.trackEvent("api_error", {
          endpoint: args[0] as string,
          duration_ms: Math.round(duration),
          error: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date().toISOString(),
        });

        throw error;
      }
    };
  }

  private async sendBatchedData() {
    if (!this.sessionId || !this.isTracking) return;

    const batchData = {
      session_id: this.sessionId,
      user_id: this.userId,
      heatmap_data: this.heatmapData.length > 0 ? [...this.heatmapData] : null,
      scroll_data: this.scrollData.length > 0 ? [...this.scrollData] : null,
      click_data: this.clickData.length > 0 ? [...this.clickData] : null,
      performance_data:
        Object.keys(this.performanceData).length > 0
          ? { ...this.performanceData }
          : null,
      timestamp: new Date().toISOString(),
    };

    try {
      await fetch("/api/analytics/session/batch-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(batchData),
      });

      // Clear sent data
      this.heatmapData = [];
      this.scrollData = [];
      this.clickData = [];
      this.performanceData = {};
    } catch (error) {
      console.error("Failed to send batched analytics data:", error);
    }
  }

  // Enhanced business intelligence tracking
  public async trackUserJourney(step: string, data?: any) {
    await this.trackEvent("user_journey", {
      journey_step: step,
      page_path: window.location.pathname,
      user_data: data,
      timestamp: new Date().toISOString(),
    });
  }

  public async trackConversion(conversionType: string, value?: number) {
    await this.trackEvent("conversion", {
      conversion_type: conversionType,
      conversion_value: value,
      page_path: window.location.pathname,
      timestamp: new Date().toISOString(),
    });
  }

  public async trackServiceUsage(serviceType: string, serviceDetails?: any) {
    await this.trackEvent("service_usage", {
      service_type: serviceType,
      service_details: serviceDetails,
      page_path: window.location.pathname,
      timestamp: new Date().toISOString(),
    });
  }

  public getAnalyticsSnapshot() {
    return {
      session_id: this.sessionId,
      user_id: this.userId,
      is_tracking: this.isTracking,
      heatmap_points: this.heatmapData.length,
      scroll_events: this.scrollData.length,
      click_events: this.clickData.length,
      performance_metrics: Object.keys(this.performanceData).length,
    };
  }
}

// Create singleton instance
export const sessionTracker = new SessionTracker();

// Export for components that need direct access
export default sessionTracker;
