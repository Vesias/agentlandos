import { supabase } from "@/lib/supabase";

interface ContentItem {
  id: string;
  type: "article" | "service" | "announcement" | "faq" | "guide";
  title: string;
  content: string;
  summary: string;
  keywords: string[];
  category: string;
  author: string;
  status: "draft" | "published" | "archived";
  language: "de" | "fr" | "en";
  seo_score: number;
  engagement_metrics: {
    views: number;
    shares: number;
    time_on_page: number;
    bounce_rate: number;
  };
  ai_insights: {
    sentiment: "positive" | "neutral" | "negative";
    readability_score: number;
    target_audience: string[];
    suggested_improvements: string[];
  };
  created_at: string;
  updated_at: string;
  scheduled_publish?: string;
}

interface ContentGenerationRequest {
  topic: string;
  type: ContentItem["type"];
  target_audience: string;
  language: ContentItem["language"];
  keywords: string[];
  tone: "formal" | "casual" | "professional" | "friendly";
  length: "short" | "medium" | "long";
}

interface SEOAnalysis {
  title_optimization: {
    score: number;
    suggestions: string[];
  };
  meta_description: {
    score: number;
    suggestions: string[];
  };
  keyword_density: {
    primary_keyword: number;
    secondary_keywords: number[];
  };
  readability: {
    score: number;
    grade_level: string;
    suggestions: string[];
  };
  structure: {
    headings_score: number;
    paragraph_length: number;
    bullet_points: boolean;
  };
  overall_score: number;
}

class AIContentManager {
  private deepseekApiKey: string;

  constructor() {
    this.deepseekApiKey = process.env.DEEPSEEK_API_KEY || "";
  }

  async generateContent(
    request: ContentGenerationRequest,
  ): Promise<ContentItem> {
    try {
      const prompt = this.buildContentPrompt(request);
      const generatedContent = await this.callDeepSeekAPI(prompt);

      const contentItem: ContentItem = {
        id: `content_${Date.now()}`,
        type: request.type,
        title: generatedContent.title,
        content: generatedContent.content,
        summary: generatedContent.summary,
        keywords: request.keywords,
        category: this.categorizeContent(request.topic),
        author: "AI Content Generator",
        status: "draft",
        language: request.language,
        seo_score: 0, // Will be calculated
        engagement_metrics: {
          views: 0,
          shares: 0,
          time_on_page: 0,
          bounce_rate: 0,
        },
        ai_insights: {
          sentiment: "neutral",
          readability_score: 0,
          target_audience: [request.target_audience],
          suggested_improvements: [],
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Analyze SEO and readability
      const seoAnalysis = await this.analyzeSEO(contentItem);
      contentItem.seo_score = seoAnalysis.overall_score;
      contentItem.ai_insights.readability_score = seoAnalysis.readability.score;

      // Save to database
      await this.saveContent(contentItem);
      return contentItem;
    } catch (error) {
      console.error("Content generation failed:", error);
      throw new Error("Failed to generate content");
    }
  }

  private buildContentPrompt(request: ContentGenerationRequest): string {
    const languageInstructions = {
      de: "Schreibe auf Deutsch für die Saarland-Region",
      fr: "Écrivez en français pour la région frontalière",
      en: "Write in English for international audience",
    };

    const lengthGuide = {
      short: "300-500 Wörter",
      medium: "800-1200 Wörter",
      long: "1500-2500 Wörter",
    };

    return `
Du bist ein Experte für Content-Erstellung für AGENTLAND.SAARLAND.

Erstelle einen hochwertigen ${request.type} zum Thema: "${request.topic}"

Anforderungen:
- Sprache: ${languageInstructions[request.language]}
- Zielgruppe: ${request.target_audience}
- Ton: ${request.tone}
- Länge: ${lengthGuide[request.length]}
- Keywords einbauen: ${request.keywords.join(", ")}

Format:
{
  "title": "SEO-optimierter Titel (max 60 Zeichen)",
  "content": "Vollständiger Artikel mit HTML-Formatierung",
  "summary": "Kurze Zusammenfassung (150-160 Zeichen für Meta-Description)"
}

Berücksichtige:
- Saarland-spezifische Inhalte
- Grenzregion Deutschland/Frankreich/Luxemburg
- Lokale Behörden und Services
- WCAG 2.1 AA Barrierefreiheit
- Mobile-First Design
- SEO-Optimierung
`;
  }

  private async callDeepSeekAPI(prompt: string): Promise<any> {
    try {
      const response = await fetch(
        "https://api.deepseek.com/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.deepseekApiKey}`,
          },
          body: JSON.stringify({
            model: "deepseek-reasoner-r1-0528",
            messages: [
              {
                role: "user",
                content: prompt,
              },
            ],
            temperature: 0.7,
            max_tokens: 4000,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      const data = await response.json();
      return JSON.parse(data.choices[0].message.content);
    } catch (error) {
      console.error("DeepSeek API call failed:", error);
      throw error;
    }
  }

  async analyzeSEO(content: ContentItem): Promise<SEOAnalysis> {
    const analysis: SEOAnalysis = {
      title_optimization: {
        score: this.analyzeTitleSEO(content.title, content.keywords),
        suggestions: this.getTitleSuggestions(content.title, content.keywords),
      },
      meta_description: {
        score: this.analyzeMetaDescription(content.summary),
        suggestions: this.getMetaDescriptionSuggestions(content.summary),
      },
      keyword_density: {
        primary_keyword: this.calculateKeywordDensity(
          content.content,
          content.keywords[0],
        ),
        secondary_keywords: content.keywords
          .slice(1)
          .map((kw) => this.calculateKeywordDensity(content.content, kw)),
      },
      readability: {
        score: this.calculateReadabilityScore(content.content),
        grade_level: this.getGradeLevel(content.content),
        suggestions: this.getReadabilitySuggestions(content.content),
      },
      structure: {
        headings_score: this.analyzeHeadingStructure(content.content),
        paragraph_length: this.getAverageParagraphLength(content.content),
        bullet_points:
          content.content.includes("<ul>") || content.content.includes("<ol>"),
      },
      overall_score: 0,
    };

    // Calculate overall SEO score
    analysis.overall_score = this.calculateOverallSEOScore(analysis);
    return analysis;
  }

  private analyzeTitleSEO(title: string, keywords: string[]): number {
    let score = 0;

    // Length check (optimal 50-60 characters)
    if (title.length >= 50 && title.length <= 60) score += 30;
    else if (title.length >= 40 && title.length <= 70) score += 20;
    else score += 10;

    // Primary keyword in title
    if (
      keywords[0] &&
      title.toLowerCase().includes(keywords[0].toLowerCase())
    ) {
      score += 40;
    }

    // Title structure
    if (title.includes("|") || title.includes("-")) score += 15;
    if (title.match(/^\d+/)) score += 10; // Numbers at start
    if (title.includes("Saarland")) score += 15; // Local relevance

    return Math.min(score, 100);
  }

  private getTitleSuggestions(title: string, keywords: string[]): string[] {
    const suggestions = [];

    if (title.length > 60) {
      suggestions.push("Titel kürzen (max. 60 Zeichen)");
    }
    if (
      keywords[0] &&
      !title.toLowerCase().includes(keywords[0].toLowerCase())
    ) {
      suggestions.push(`Haupt-Keyword "${keywords[0]}" in Titel einbauen`);
    }
    if (!title.includes("Saarland")) {
      suggestions.push('Lokalen Bezug "Saarland" hinzufügen');
    }

    return suggestions;
  }

  private analyzeMetaDescription(summary: string): number {
    let score = 0;

    if (summary.length >= 150 && summary.length <= 160) score += 50;
    else if (summary.length >= 140 && summary.length <= 170) score += 30;
    else score += 10;

    if (summary.includes("Saarland")) score += 25;
    if (summary.match(/[.!?]$/)) score += 15; // Proper ending
    if (summary.includes("kostenlos") || summary.includes("gratis"))
      score += 10;

    return Math.min(score, 100);
  }

  private getMetaDescriptionSuggestions(summary: string): string[] {
    const suggestions = [];

    if (summary.length > 160) {
      suggestions.push("Meta-Description kürzen (max. 160 Zeichen)");
    }
    if (summary.length < 150) {
      suggestions.push("Meta-Description verlängern (min. 150 Zeichen)");
    }
    if (!summary.includes("Saarland")) {
      suggestions.push("Lokalen Bezug hinzufügen");
    }

    return suggestions;
  }

  private calculateKeywordDensity(content: string, keyword: string): number {
    const text = content.replace(/<[^>]*>/g, "").toLowerCase();
    const words = text.split(/\s+/);
    const keywordOccurrences = text.split(keyword.toLowerCase()).length - 1;

    return (keywordOccurrences / words.length) * 100;
  }

  private calculateReadabilityScore(content: string): number {
    const text = content.replace(/<[^>]*>/g, "");
    const sentences = text.split(/[.!?]+/).length - 1;
    const words = text.split(/\s+/).length;
    const syllables = this.countSyllables(text);

    // Flesch Reading Ease (adapted for German)
    const flesch =
      206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
    return Math.max(0, Math.min(100, flesch));
  }

  private countSyllables(text: string): number {
    // Simplified syllable counting for German
    const vowels = text.match(/[aeiouäöü]/gi);
    return vowels ? vowels.length : 0;
  }

  private getGradeLevel(content: string): string {
    const score = this.calculateReadabilityScore(content);

    if (score >= 90) return "Sehr leicht (5. Klasse)";
    if (score >= 80) return "Leicht (6. Klasse)";
    if (score >= 70) return "Einigermaßen leicht (7. Klasse)";
    if (score >= 60) return "Standard (8.-9. Klasse)";
    if (score >= 50) return "Einigermaßen schwer (10.-12. Klasse)";
    if (score >= 30) return "Schwer (Universität)";
    return "Sehr schwer (Universitäts-Abschluss)";
  }

  private getReadabilitySuggestions(content: string): string[] {
    const suggestions = [];
    const score = this.calculateReadabilityScore(content);

    if (score < 50) {
      suggestions.push("Kürzere Sätze verwenden");
      suggestions.push("Einfachere Wörter wählen");
      suggestions.push("Mehr Absätze erstellen");
    }

    if (!content.includes("<ul>") && !content.includes("<ol>")) {
      suggestions.push("Aufzählungen für bessere Struktur hinzufügen");
    }

    return suggestions;
  }

  private analyzeHeadingStructure(content: string): number {
    let score = 0;

    if (content.includes("<h1>")) score += 25;
    if (content.includes("<h2>")) score += 30;
    if (content.includes("<h3>")) score += 20;

    const h2Count = (content.match(/<h2>/g) || []).length;
    if (h2Count >= 2 && h2Count <= 6) score += 25;

    return Math.min(score, 100);
  }

  private getAverageParagraphLength(content: string): number {
    const paragraphs = content.split(/<\/p>/).filter((p) => p.includes("<p>"));
    const totalWords = paragraphs.reduce((sum, p) => {
      const text = p.replace(/<[^>]*>/g, "");
      return sum + text.split(/\s+/).length;
    }, 0);

    return paragraphs.length > 0 ? totalWords / paragraphs.length : 0;
  }

  private calculateOverallSEOScore(analysis: SEOAnalysis): number {
    const weights = {
      title: 0.25,
      meta: 0.2,
      keywords: 0.2,
      readability: 0.2,
      structure: 0.15,
    };

    const keywordScore =
      analysis.keyword_density.primary_keyword >= 1 &&
      analysis.keyword_density.primary_keyword <= 3
        ? 100
        : 50;

    const structureScore =
      (analysis.structure.headings_score +
        (analysis.structure.bullet_points ? 25 : 0) +
        (analysis.structure.paragraph_length <= 25 ? 25 : 0)) /
      1.5;

    return Math.round(
      analysis.title_optimization.score * weights.title +
        analysis.meta_description.score * weights.meta +
        keywordScore * weights.keywords +
        analysis.readability.score * weights.readability +
        structureScore * weights.structure,
    );
  }

  private categorizeContent(topic: string): string {
    const categories = {
      behörden: "Verwaltung",
      business: "Wirtschaft",
      tourism: "Tourismus",
      education: "Bildung",
      grenzpendler: "Cross-Border",
      saar: "Regional",
      digital: "Digitalisierung",
    };

    for (const [keyword, category] of Object.entries(categories)) {
      if (topic.toLowerCase().includes(keyword)) {
        return category;
      }
    }

    return "Allgemein";
  }

  async saveContent(content: ContentItem): Promise<void> {
    try {
      const { error } = await supabase.from("ai_content").insert([content]);

      if (error) {
        console.error("Failed to save content:", error);
        throw error;
      }
    } catch (error) {
      console.error("Database save failed:", error);
      throw error;
    }
  }

  async updateContent(
    id: string,
    updates: Partial<ContentItem>,
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from("ai_content")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) {
        console.error("Failed to update content:", error);
        throw error;
      }
    } catch (error) {
      console.error("Database update failed:", error);
      throw error;
    }
  }

  async publishContent(id: string, scheduledDate?: string): Promise<void> {
    const updates: Partial<ContentItem> = {
      status: "published",
    };

    if (scheduledDate) {
      updates.scheduled_publish = scheduledDate;
    }

    await this.updateContent(id, updates);
  }

  async getContentAnalytics(timeframe: "7d" | "30d" | "90d"): Promise<any> {
    try {
      const { data, error } = await supabase
        .from("ai_content")
        .select("*")
        .gte("created_at", this.getTimeframeCutoff(timeframe));

      if (error) throw error;

      return {
        total_content: data.length,
        by_type: this.groupBy(data, "type"),
        by_category: this.groupBy(data, "category"),
        by_status: this.groupBy(data, "status"),
        average_seo_score:
          data.reduce((sum, item) => sum + item.seo_score, 0) / data.length,
        top_performing: data
          .sort(
            (a, b) =>
              (b.engagement_metrics?.views || 0) -
              (a.engagement_metrics?.views || 0),
          )
          .slice(0, 5),
        improvement_suggestions: this.generateContentStrategy(data),
      };
    } catch (error) {
      console.error("Analytics fetch failed:", error);
      throw error;
    }
  }

  private getTimeframeCutoff(timeframe: string): string {
    const now = new Date();
    const days = timeframe === "7d" ? 7 : timeframe === "30d" ? 30 : 90;
    now.setDate(now.getDate() - days);
    return now.toISOString();
  }

  private groupBy(array: any[], key: string): Record<string, number> {
    return array.reduce((acc, item) => {
      const value = item[key] || "unknown";
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});
  }

  private generateContentStrategy(content: ContentItem[]): string[] {
    const suggestions = [];

    // Content type analysis
    const typeDistribution = this.groupBy(content, "type");
    if ((typeDistribution.guide || 0) < 3) {
      suggestions.push(
        "Mehr How-to Guides für bessere User Experience erstellen",
      );
    }

    // SEO analysis
    const lowSeoContent = content.filter((item) => item.seo_score < 70).length;
    if (lowSeoContent > content.length * 0.3) {
      suggestions.push("SEO-Optimierung für bestehende Inhalte verbessern");
    }

    // Language distribution
    const languageDistribution = this.groupBy(content, "language");
    if ((languageDistribution.fr || 0) < (languageDistribution.de || 0) * 0.2) {
      suggestions.push(
        "Französische Inhalte für Cross-Border Services ausbauen",
      );
    }

    return suggestions;
  }
}

export default AIContentManager;
