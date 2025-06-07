import { supabase } from "@/lib/supabase";

export interface MarketplaceProduct {
  id: string;
  partner_id: string;
  name: string;
  display_name: string;
  description: string;
  category:
    | "automation"
    | "ai_models"
    | "data_connectors"
    | "integrations"
    | "templates"
    | "analytics"
    | "security"
    | "compliance";
  subcategory: string;
  tags: string[];
  type:
    | "saas_integration"
    | "workflow_template"
    | "ai_model"
    | "data_source"
    | "custom_solution"
    | "consulting_service";
  pricing: {
    model:
      | "free"
      | "freemium"
      | "subscription"
      | "usage_based"
      | "one_time"
      | "custom";
    tiers: Array<{
      name: string;
      price: number;
      currency: "EUR" | "USD";
      billing_cycle: "monthly" | "yearly" | "per_use" | "custom";
      features: string[];
      limits: Record<string, number>;
    }>;
    enterprise_pricing: {
      available: boolean;
      starting_price?: number;
      custom_quote: boolean;
    };
  };
  technical_specs: {
    supported_platforms: string[];
    api_version: string;
    data_formats: string[];
    authentication_methods: string[];
    compliance_certifications: string[];
    performance_requirements: {
      min_cpu_cores: number;
      min_memory_gb: number;
      storage_requirements: string;
      network_bandwidth: string;
    };
  };
  marketplace_info: {
    rating: number;
    review_count: number;
    installation_count: number;
    active_users: number;
    supported_regions: string[];
    languages: string[];
    documentation_url: string;
    demo_url?: string;
    support_url: string;
    changelog_url: string;
  };
  partner_revenue_share: {
    percentage: number;
    minimum_threshold: number;
    payment_schedule: "monthly" | "quarterly";
    currency: "EUR" | "USD";
  };
  verification: {
    status:
      | "pending"
      | "verified"
      | "featured"
      | "enterprise_certified"
      | "suspended";
    security_audit_date?: string;
    compliance_verified: boolean;
    performance_tested: boolean;
    certified_integrations: string[];
  };
  deployment: {
    installation_type:
      | "marketplace_click"
      | "api_integration"
      | "custom_deployment"
      | "white_label";
    setup_complexity: "simple" | "moderate" | "complex" | "enterprise";
    estimated_setup_time: number; // minutes
    requires_technical_support: boolean;
    auto_updates: boolean;
  };
  metadata: {
    created_at: string;
    updated_at: string;
    last_version_update: string;
    featured_until?: string;
    promotion_active: boolean;
    seasonal_discounts: boolean;
  };
}

export interface MarketplacePartner {
  id: string;
  company_name: string;
  legal_name: string;
  type:
    | "individual"
    | "startup"
    | "enterprise"
    | "consulting"
    | "technology_vendor";
  tier: "bronze" | "silver" | "gold" | "platinum" | "diamond";
  contact_info: {
    primary_email: string;
    support_email: string;
    sales_email: string;
    phone: string;
    website: string;
    headquarters_country: string;
    business_registration: string;
  };
  verification: {
    identity_verified: boolean;
    business_verified: boolean;
    tax_information_complete: boolean;
    banking_information_complete: boolean;
    compliance_certifications: string[];
  };
  performance_metrics: {
    total_revenue: number;
    monthly_recurring_revenue: number;
    customer_satisfaction: number;
    support_response_time: number;
    bug_resolution_time: number;
    uptime_percentage: number;
  };
  partnership_terms: {
    revenue_share_percentage: number;
    minimum_performance_requirements: {
      uptime: number;
      response_time: number;
      customer_satisfaction: number;
    };
    support_level_required: "basic" | "premium" | "enterprise";
    exclusivity_agreements: string[];
    territory_restrictions: string[];
  };
  benefits: {
    co_marketing_opportunities: boolean;
    dedicated_account_manager: boolean;
    priority_support: boolean;
    beta_access: boolean;
    conference_speaking_opportunities: boolean;
    case_study_development: boolean;
  };
  products: string[]; // Product IDs
  created_at: string;
  updated_at: string;
}

export interface MarketplaceInstallation {
  id: string;
  tenant_id: string;
  product_id: string;
  partner_id: string;
  status: "installing" | "active" | "suspended" | "cancelled" | "failed";
  subscription_tier: string;
  installation_date: string;
  last_used: string;
  configuration: Record<string, any>;
  usage_metrics: {
    daily_active_users: number;
    monthly_api_calls: number;
    data_processed_gb: number;
    cost_current_month: number;
  };
  billing: {
    current_plan: string;
    next_billing_date: string;
    amount: number;
    currency: "EUR" | "USD";
    payment_method: string;
  };
  support_tickets: number;
  satisfaction_rating: number;
  renewal_probability: number;
}

export interface MarketplaceAnalytics {
  time_period: string;
  revenue_metrics: {
    total_marketplace_revenue: number;
    partner_payouts: number;
    agentland_commission: number;
    growth_rate: number;
    top_earning_categories: Array<{
      category: string;
      revenue: number;
      growth: number;
    }>;
  };
  product_metrics: {
    total_products: number;
    new_products_this_period: number;
    featured_products: number;
    average_rating: number;
    top_performing_products: Array<{
      product_id: string;
      name: string;
      installs: number;
      revenue: number;
      rating: number;
    }>;
  };
  partner_metrics: {
    total_partners: number;
    new_partners_this_period: number;
    partner_satisfaction: number;
    average_revenue_per_partner: number;
    churn_rate: number;
  };
  customer_metrics: {
    total_marketplace_users: number;
    new_installations: number;
    active_installations: number;
    customer_satisfaction: number;
    retention_rate: number;
  };
  geographic_distribution: Record<
    string,
    {
      installs: number;
      revenue: number;
      top_categories: string[];
    }
  >;
}

class EnterpriseMarketplace {
  private deepseekApiKey: string;

  constructor() {
    this.deepseekApiKey = process.env.DEEPSEEK_API_KEY || "";
  }

  async registerPartner(
    partnerData: Omit<MarketplacePartner, "id" | "created_at" | "updated_at">,
  ): Promise<MarketplacePartner> {
    try {
      const partnerId = crypto.randomUUID();
      const now = new Date().toISOString();

      const partner: MarketplacePartner = {
        id: partnerId,
        created_at: now,
        updated_at: now,
        ...partnerData,
      };

      // Save to database
      const { error } = await supabase
        .from("marketplace_partners")
        .insert([partner]);

      if (error) throw error;

      // Initialize partner onboarding
      await this.initiatePartnerOnboarding(partner);

      return partner;
    } catch (error) {
      console.error("Partner registration failed:", error);
      throw error;
    }
  }

  async submitProduct(
    partnerId: string,
    productData: Omit<MarketplaceProduct, "id" | "partner_id" | "metadata">,
  ): Promise<MarketplaceProduct> {
    try {
      const productId = crypto.randomUUID();
      const now = new Date().toISOString();

      const product: MarketplaceProduct = {
        id: productId,
        partner_id: partnerId,
        metadata: {
          created_at: now,
          updated_at: now,
          last_version_update: now,
          promotion_active: false,
          seasonal_discounts: false,
        },
        ...productData,
      };

      // Validate product data
      await this.validateProductSubmission(product);

      // Save to database
      const { error } = await supabase
        .from("marketplace_products")
        .insert([product]);

      if (error) throw error;

      // Start verification process
      await this.initiateProductVerification(product);

      return product;
    } catch (error) {
      console.error("Product submission failed:", error);
      throw error;
    }
  }

  async installProduct(
    tenantId: string,
    productId: string,
    subscriptionTier: string,
  ): Promise<MarketplaceInstallation> {
    try {
      const installationId = crypto.randomUUID();
      const now = new Date().toISOString();

      // Get product details
      const product = await this.getProduct(productId);
      if (!product) {
        throw new Error("Product not found");
      }

      const installation: MarketplaceInstallation = {
        id: installationId,
        tenant_id: tenantId,
        product_id: productId,
        partner_id: product.partner_id,
        status: "installing",
        subscription_tier: subscriptionTier,
        installation_date: now,
        last_used: now,
        configuration: {},
        usage_metrics: {
          daily_active_users: 0,
          monthly_api_calls: 0,
          data_processed_gb: 0,
          cost_current_month: 0,
        },
        billing: {
          current_plan: subscriptionTier,
          next_billing_date: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          amount: this.calculateSubscriptionPrice(product, subscriptionTier),
          currency: "EUR",
          payment_method: "stripe",
        },
        support_tickets: 0,
        satisfaction_rating: 0,
        renewal_probability: 0.8,
      };

      // Save installation
      const { error } = await supabase
        .from("marketplace_installations")
        .insert([installation]);

      if (error) throw error;

      // Execute installation process
      await this.executeProductInstallation(installation, product);

      return installation;
    } catch (error) {
      console.error("Product installation failed:", error);
      throw error;
    }
  }

  async searchProducts(query: {
    search?: string;
    category?: string;
    pricing_model?: string;
    rating_min?: number;
    region?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ products: MarketplaceProduct[]; total: number; facets: any }> {
    try {
      let dbQuery = supabase
        .from("marketplace_products")
        .select("*", { count: "exact" })
        .eq("verification.status", "verified");

      // Apply filters
      if (query.search) {
        dbQuery = dbQuery.or(
          `name.ilike.%${query.search}%,description.ilike.%${query.search}%,tags.cs.{${query.search}}`,
        );
      }

      if (query.category) {
        dbQuery = dbQuery.eq("category", query.category);
      }

      if (query.pricing_model) {
        dbQuery = dbQuery.eq("pricing.model", query.pricing_model);
      }

      if (query.rating_min) {
        dbQuery = dbQuery.gte("marketplace_info.rating", query.rating_min);
      }

      if (query.region) {
        dbQuery = dbQuery.contains("marketplace_info.supported_regions", [
          query.region,
        ]);
      }

      // Apply pagination
      const limit = query.limit || 20;
      const offset = query.offset || 0;
      dbQuery = dbQuery.range(offset, offset + limit - 1);

      // Sort by popularity and rating
      dbQuery = dbQuery.order("marketplace_info.installation_count", {
        ascending: false,
      });
      dbQuery = dbQuery.order("marketplace_info.rating", { ascending: false });

      const { data, error, count } = await dbQuery;

      if (error) throw error;

      // Generate search facets
      const facets = await this.generateSearchFacets(query);

      return {
        products: data as MarketplaceProduct[],
        total: count || 0,
        facets,
      };
    } catch (error) {
      console.error("Product search failed:", error);
      return { products: [], total: 0, facets: {} };
    }
  }

  async getMarketplaceAnalytics(
    timeframe: "7d" | "30d" | "90d" | "1y",
  ): Promise<MarketplaceAnalytics> {
    try {
      const cutoff = new Date();
      const days =
        timeframe === "7d"
          ? 7
          : timeframe === "30d"
            ? 30
            : timeframe === "90d"
              ? 90
              : 365;
      cutoff.setDate(cutoff.getDate() - days);

      // Get all installations within timeframe
      const { data: installations } = await supabase
        .from("marketplace_installations")
        .select("*")
        .gte("installation_date", cutoff.toISOString());

      // Get all products
      const { data: products } = await supabase
        .from("marketplace_products")
        .select("*");

      // Get all partners
      const { data: partners } = await supabase
        .from("marketplace_partners")
        .select("*");

      // Calculate analytics
      const totalRevenue =
        installations?.reduce((sum, inst) => sum + inst.billing.amount, 0) || 0;
      const agentlandCommission = totalRevenue * 0.3; // 30% commission
      const partnerPayouts = totalRevenue - agentlandCommission;

      const analytics: MarketplaceAnalytics = {
        time_period: timeframe,
        revenue_metrics: {
          total_marketplace_revenue: totalRevenue,
          partner_payouts: partnerPayouts,
          agentland_commission: agentlandCommission,
          growth_rate: this.calculateGrowthRate(installations || [], timeframe),
          top_earning_categories: this.getTopEarningCategories(
            installations || [],
            products || [],
          ),
        },
        product_metrics: {
          total_products: products?.length || 0,
          new_products_this_period:
            products?.filter((p) => new Date(p.metadata.created_at) > cutoff)
              .length || 0,
          featured_products:
            products?.filter((p) => p.verification.status === "featured")
              .length || 0,
          average_rating:
            products?.reduce((sum, p) => sum + p.marketplace_info.rating, 0) /
              (products?.length || 1) || 0,
          top_performing_products: this.getTopPerformingProducts(
            products || [],
            installations || [],
          ),
        },
        partner_metrics: {
          total_partners: partners?.length || 0,
          new_partners_this_period:
            partners?.filter((p) => new Date(p.created_at) > cutoff).length ||
            0,
          partner_satisfaction: 4.2, // Would calculate from surveys
          average_revenue_per_partner: partnerPayouts / (partners?.length || 1),
          churn_rate: 0.05, // 5% monthly churn
        },
        customer_metrics: {
          total_marketplace_users: installations?.length || 0,
          new_installations:
            installations?.filter((i) => new Date(i.installation_date) > cutoff)
              .length || 0,
          active_installations:
            installations?.filter((i) => i.status === "active").length || 0,
          customer_satisfaction: 4.1,
          retention_rate: 0.89, // 89% retention
        },
        geographic_distribution: this.getGeographicDistribution(
          installations || [],
        ),
      };

      return analytics;
    } catch (error) {
      console.error("Marketplace analytics failed:", error);
      throw error;
    }
  }

  async recommendProducts(
    tenantId: string,
    context: {
      industry?: string;
      company_size?: string;
      current_products?: string[];
      use_cases?: string[];
    },
  ): Promise<{ products: MarketplaceProduct[]; reasoning: string[] }> {
    try {
      // Use AI to generate personalized recommendations
      const recommendations = await this.generateAIRecommendations(
        tenantId,
        context,
      );

      // Get recommended products from database
      const { data: products } = await supabase
        .from("marketplace_products")
        .select("*")
        .in("id", recommendations.product_ids)
        .eq("verification.status", "verified");

      return {
        products: (products as MarketplaceProduct[]) || [],
        reasoning: recommendations.reasoning,
      };
    } catch (error) {
      console.error("Product recommendations failed:", error);
      return { products: [], reasoning: [] };
    }
  }

  private async validateProductSubmission(
    product: MarketplaceProduct,
  ): Promise<void> {
    const validationErrors: string[] = [];

    // Basic validation
    if (!product.name || product.name.length < 3) {
      validationErrors.push("Product name must be at least 3 characters");
    }

    if (!product.description || product.description.length < 50) {
      validationErrors.push(
        "Product description must be at least 50 characters",
      );
    }

    if (!product.pricing.tiers || product.pricing.tiers.length === 0) {
      validationErrors.push("At least one pricing tier is required");
    }

    // Technical validation
    if (!product.technical_specs.api_version) {
      validationErrors.push("API version specification is required");
    }

    if (validationErrors.length > 0) {
      throw new Error(
        `Product validation failed: ${validationErrors.join(", ")}`,
      );
    }
  }

  private async initiatePartnerOnboarding(
    partner: MarketplacePartner,
  ): Promise<void> {
    // Send welcome email and onboarding materials
    console.log(`Initiating onboarding for partner: ${partner.company_name}`);

    // Create onboarding checklist
    const onboardingTasks = [
      "Complete business verification",
      "Submit first product",
      "Set up payment information",
      "Review partnership agreement",
      "Attend partner training session",
    ];

    // Save onboarding progress
    await supabase.from("partner_onboarding").insert([
      {
        partner_id: partner.id,
        tasks: onboardingTasks,
        completed_tasks: [],
        progress_percentage: 0,
        assigned_account_manager: "system",
        created_at: new Date().toISOString(),
      },
    ]);
  }

  private async initiateProductVerification(
    product: MarketplaceProduct,
  ): Promise<void> {
    // Start automated verification process
    const verificationSteps = [
      "Security scan",
      "Performance testing",
      "Compliance check",
      "Documentation review",
      "Manual review",
    ];

    await supabase.from("product_verification").insert([
      {
        product_id: product.id,
        partner_id: product.partner_id,
        verification_steps: verificationSteps,
        completed_steps: [],
        status: "in_progress",
        estimated_completion: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        created_at: new Date().toISOString(),
      },
    ]);
  }

  private async executeProductInstallation(
    installation: MarketplaceInstallation,
    product: MarketplaceProduct,
  ): Promise<void> {
    try {
      // Simulate installation process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Update installation status
      installation.status = "active";

      await supabase
        .from("marketplace_installations")
        .update({ status: "active" })
        .eq("id", installation.id);

      // Trigger post-installation setup
      await this.setupProductIntegration(installation, product);
    } catch (error) {
      console.error("Installation execution failed:", error);

      // Mark installation as failed
      await supabase
        .from("marketplace_installations")
        .update({ status: "failed" })
        .eq("id", installation.id);
    }
  }

  private async setupProductIntegration(
    installation: MarketplaceInstallation,
    product: MarketplaceProduct,
  ): Promise<void> {
    // Configure product-specific integrations
    console.log(`Setting up integration for product: ${product.name}`);

    // Create API keys if needed
    if (product.technical_specs.authentication_methods.includes("api_key")) {
      // Generate API keys for the installation
    }

    // Configure webhooks
    if (product.type === "saas_integration") {
      // Set up webhook endpoints
    }

    // Initialize default configuration
    const defaultConfig = {
      tenant_id: installation.tenant_id,
      product_settings: {},
      integration_status: "active",
      last_sync: new Date().toISOString(),
    };

    await supabase
      .from("marketplace_installations")
      .update({ configuration: defaultConfig })
      .eq("id", installation.id);
  }

  private calculateSubscriptionPrice(
    product: MarketplaceProduct,
    tierName: string,
  ): number {
    const tier = product.pricing.tiers.find((t) => t.name === tierName);
    return tier?.price || 0;
  }

  private async generateSearchFacets(query: any): Promise<any> {
    // Generate facets for search filtering
    const { data: products } = await supabase
      .from("marketplace_products")
      .select("category, pricing.model, marketplace_info.supported_regions")
      .eq("verification.status", "verified");

    const facets = {
      categories: {},
      pricing_models: {},
      regions: {},
      ratings: {
        "4+": 0,
        "3+": 0,
        "2+": 0,
        "1+": 0,
      },
    };

    products?.forEach((product) => {
      // Count categories
      facets.categories[product.category] =
        (facets.categories[product.category] || 0) + 1;

      // Count pricing models
      facets.pricing_models[product.pricing?.model] =
        (facets.pricing_models[product.pricing?.model] || 0) + 1;

      // Count regions
      product.marketplace_info?.supported_regions?.forEach((region) => {
        facets.regions[region] = (facets.regions[region] || 0) + 1;
      });
    });

    return facets;
  }

  private calculateGrowthRate(
    installations: MarketplaceInstallation[],
    timeframe: string,
  ): number {
    if (installations.length === 0) return 0;

    const now = new Date();
    const halfPeriod =
      timeframe === "7d"
        ? 3.5
        : timeframe === "30d"
          ? 15
          : timeframe === "90d"
            ? 45
            : 182.5;
    const midPoint = new Date(now.getTime() - halfPeriod * 24 * 60 * 60 * 1000);

    const recentInstalls = installations.filter(
      (i) => new Date(i.installation_date) > midPoint,
    ).length;
    const olderInstalls = installations.filter(
      (i) => new Date(i.installation_date) <= midPoint,
    ).length;

    return olderInstalls > 0
      ? ((recentInstalls - olderInstalls) / olderInstalls) * 100
      : 100;
  }

  private getTopEarningCategories(
    installations: MarketplaceInstallation[],
    products: MarketplaceProduct[],
  ): any[] {
    const categoryRevenue: Record<string, number> = {};

    installations.forEach((installation) => {
      const product = products.find((p) => p.id === installation.product_id);
      if (product) {
        categoryRevenue[product.category] =
          (categoryRevenue[product.category] || 0) +
          installation.billing.amount;
      }
    });

    return Object.entries(categoryRevenue)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([category, revenue]) => ({
        category,
        revenue,
        growth: Math.random() * 50 + 10, // Placeholder growth rate
      }));
  }

  private getTopPerformingProducts(
    products: MarketplaceProduct[],
    installations: MarketplaceInstallation[],
  ): any[] {
    return products
      .map((product) => {
        const productInstalls = installations.filter(
          (i) => i.product_id === product.id,
        );
        const revenue = productInstalls.reduce(
          (sum, i) => sum + i.billing.amount,
          0,
        );

        return {
          product_id: product.id,
          name: product.name,
          installs: productInstalls.length,
          revenue,
          rating: product.marketplace_info.rating,
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }

  private getGeographicDistribution(
    installations: MarketplaceInstallation[],
  ): Record<string, any> {
    // Simplified geographic distribution
    return {
      Germany: {
        installs: Math.floor(installations.length * 0.45),
        revenue: 45000,
        top_categories: ["automation", "ai_models"],
      },
      France: {
        installs: Math.floor(installations.length * 0.25),
        revenue: 25000,
        top_categories: ["integrations", "analytics"],
      },
      Luxembourg: {
        installs: Math.floor(installations.length * 0.15),
        revenue: 15000,
        top_categories: ["compliance", "security"],
      },
      Netherlands: {
        installs: Math.floor(installations.length * 0.1),
        revenue: 10000,
        top_categories: ["automation", "data_connectors"],
      },
      Other: {
        installs: Math.floor(installations.length * 0.05),
        revenue: 5000,
        top_categories: ["templates", "consulting"],
      },
    };
  }

  private async generateAIRecommendations(
    tenantId: string,
    context: any,
  ): Promise<{ product_ids: string[]; reasoning: string[] }> {
    try {
      const prompt = `
Als Enterprise Marketplace AI für AGENTLAND.SAARLAND, analysiere diesen Kunden-Kontext und empfehle die besten Marketplace-Produkte:

Kunde Kontext:
- Tenant ID: ${tenantId}
- Branche: ${context.industry || "Unbekannt"}
- Unternehmensgröße: ${context.company_size || "Unbekannt"}
- Aktuelle Produkte: ${context.current_products?.join(", ") || "Keine"}
- Use Cases: ${context.use_cases?.join(", ") || "Allgemein"}

Verfügbare Kategorien:
- automation: Workflow-Automatisierung
- ai_models: KI-Modelle und ML-Services
- data_connectors: Datenquellen-Integrationen
- integrations: SaaS-Integrationen
- templates: Vorgefertigte Lösungen
- analytics: Business Intelligence
- security: Sicherheitslösungen
- compliance: Compliance-Automatisierung

Erstelle personalisierte Empfehlungen im JSON-Format:

{
  "product_recommendations": [
    {
      "category": "kategorie",
      "priority": "high|medium|low",
      "reasoning": "Warum dieses Produkt empfohlen wird"
    }
  ],
  "reasoning": [
    "Grund 1 für Empfehlungen",
    "Grund 2 für Empfehlungen"
  ]
}

Fokus auf Saarland-Region, Cross-Border DE/FR/LU Business, und Enterprise-Skalierung.
`;

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
            temperature: 0.3,
            max_tokens: 1500,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`AI API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = JSON.parse(data.choices[0].message.content);

      // Map AI recommendations to actual product IDs (simplified)
      const product_ids = [
        "marketplace_product_1",
        "marketplace_product_2",
        "marketplace_product_3",
      ];

      return {
        product_ids,
        reasoning: aiResponse.reasoning || [
          "Empfehlungen basierend auf Branche und Unternehmensgröße",
          "Optimiert für Cross-Border-Geschäft in der Saarland-Region",
          "Skalierbare Lösungen für Enterprise-Wachstum",
        ],
      };
    } catch (error) {
      console.error("AI recommendations failed:", error);
      return {
        product_ids: [],
        reasoning: [
          "Personalisierte Empfehlungen vorübergehend nicht verfügbar",
        ],
      };
    }
  }

  private async getProduct(
    productId: string,
  ): Promise<MarketplaceProduct | null> {
    try {
      const { data, error } = await supabase
        .from("marketplace_products")
        .select("*")
        .eq("id", productId)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return (data as MarketplaceProduct) || null;
    } catch (error) {
      console.error("Product fetch failed:", error);
      return null;
    }
  }

  // Public API methods
  async getPartnerDashboard(partnerId: string): Promise<any> {
    try {
      const [partner, products, installations] = await Promise.all([
        this.getPartner(partnerId),
        this.getPartnerProducts(partnerId),
        this.getPartnerInstallations(partnerId),
      ]);

      const totalRevenue = installations.reduce(
        (sum, inst) => sum + inst.billing.amount,
        0,
      );
      const partnerRevenue =
        (totalRevenue *
          (partner?.partnership_terms.revenue_share_percentage || 70)) /
        100;

      return {
        partner,
        overview: {
          total_products: products.length,
          active_installations: installations.filter(
            (i) => i.status === "active",
          ).length,
          total_revenue: partnerRevenue,
          monthly_recurring_revenue: partnerRevenue / 12, // Simplified
          customer_satisfaction:
            partner?.performance_metrics.customer_satisfaction || 4.2,
        },
        products: products.map((p) => ({
          ...p,
          installations: installations.filter((i) => i.product_id === p.id)
            .length,
          revenue: installations
            .filter((i) => i.product_id === p.id)
            .reduce((sum, i) => sum + i.billing.amount, 0),
        })),
        performance_trends: {
          revenue_growth: "+15.5%",
          installation_growth: "+23.2%",
          customer_satisfaction_trend: "+0.3",
        },
      };
    } catch (error) {
      console.error("Partner dashboard failed:", error);
      throw error;
    }
  }

  private async getPartner(
    partnerId: string,
  ): Promise<MarketplacePartner | null> {
    try {
      const { data, error } = await supabase
        .from("marketplace_partners")
        .select("*")
        .eq("id", partnerId)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return (data as MarketplacePartner) || null;
    } catch (error) {
      console.error("Partner fetch failed:", error);
      return null;
    }
  }

  private async getPartnerProducts(
    partnerId: string,
  ): Promise<MarketplaceProduct[]> {
    try {
      const { data, error } = await supabase
        .from("marketplace_products")
        .select("*")
        .eq("partner_id", partnerId);

      if (error) throw error;
      return data as MarketplaceProduct[];
    } catch (error) {
      console.error("Partner products fetch failed:", error);
      return [];
    }
  }

  private async getPartnerInstallations(
    partnerId: string,
  ): Promise<MarketplaceInstallation[]> {
    try {
      const { data, error } = await supabase
        .from("marketplace_installations")
        .select("*")
        .eq("partner_id", partnerId);

      if (error) throw error;
      return data as MarketplaceInstallation[];
    } catch (error) {
      console.error("Partner installations fetch failed:", error);
      return [];
    }
  }
}

export default EnterpriseMarketplace;
