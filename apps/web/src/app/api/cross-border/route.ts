import { NextRequest, NextResponse } from "next/server";
import CrossBorderServiceManager from "@/lib/api/cross-border-services";

export const runtime = "edge";

interface CrossBorderQuery {
  action:
    | "services"
    | "tax-info"
    | "recommendations"
    | "submit"
    | "enhanced-services"
    | "real-time-rates"
    | "document-validation"
    | "expert-consultation";
  sourceCountry?: "DE" | "FR" | "LU";
  targetCountry?: "DE" | "FR" | "LU";
  category?: string;
  purpose?:
    | "work"
    | "business"
    | "residence"
    | "study"
    | "healthcare"
    | "education"
    | "retirement";
  income?: number;
  workDays?: number;
  residencyType?: "temporary" | "permanent" | "student" | "seasonal";
  employmentStatus?:
    | "employee"
    | "self-employed"
    | "business-owner"
    | "freelancer";
  familySize?: number;
  languagePreference?: "de" | "fr" | "en" | "lb";
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get("action") as CrossBorderQuery["action"];
    const sourceCountry = url.searchParams.get("sourceCountry") as
      | "DE"
      | "FR"
      | "LU";
    const targetCountry = url.searchParams.get("targetCountry") as
      | "DE"
      | "FR"
      | "LU";
    const category = url.searchParams.get("category");
    const purpose = url.searchParams.get("purpose") as
      | "work"
      | "business"
      | "residence"
      | "study";
    const income = url.searchParams.get("income")
      ? parseInt(url.searchParams.get("income")!)
      : undefined;
    const workDays = url.searchParams.get("workDays")
      ? parseInt(url.searchParams.get("workDays")!)
      : undefined;

    switch (action) {
      case "services":
        const services = CrossBorderServiceManager.findServices(
          targetCountry,
          category,
        );
        return NextResponse.json({
          success: true,
          data: services,
          meta: {
            totalServices: services.length,
            targetCountry,
            category,
            digitalServicesAvailable: services.filter((s) => s.digitalAvailable)
              .length,
          },
          timestamp: new Date().toISOString(),
        });

      case "recommendations":
        if (!sourceCountry || !targetCountry || !purpose) {
          return NextResponse.json(
            {
              error:
                "sourceCountry, targetCountry, and purpose parameters required",
            },
            { status: 400 },
          );
        }

        const recommendations =
          CrossBorderServiceManager.getRecommendedServices(
            sourceCountry,
            targetCountry,
            purpose,
          );

        return NextResponse.json({
          success: true,
          data: {
            recommendations,
            crossBorderInfo: {
              sourceCountry,
              targetCountry,
              purpose,
              totalRecommendations: recommendations.length,
              estimatedTimeframe: getEstimatedTimeframe(recommendations),
              estimatedCosts: getEstimatedCosts(recommendations),
            },
          },
          timestamp: new Date().toISOString(),
        });

      case "tax-info":
        if (!sourceCountry || !targetCountry) {
          return NextResponse.json(
            { error: "sourceCountry and targetCountry parameters required" },
            { status: 400 },
          );
        }

        const taxCompliance = CrossBorderServiceManager.getTaxCompliance(
          sourceCountry,
          targetCountry,
        );

        if (!taxCompliance) {
          return NextResponse.json(
            {
              error:
                "Tax information not available for this country combination",
            },
            { status: 404 },
          );
        }

        let taxCalculation = null;
        if (income && workDays) {
          taxCalculation = CrossBorderServiceManager.calculateTaxObligation(
            sourceCountry,
            targetCountry,
            income,
            workDays,
          );
        }

        return NextResponse.json({
          success: true,
          data: {
            taxCompliance,
            calculation: taxCalculation,
            recommendations: getTaxRecommendations(
              sourceCountry,
              targetCountry,
              income,
            ),
          },
          timestamp: new Date().toISOString(),
        });

      case "enhanced-services":
        const enhancedServices = getEnhancedCrossBorderServices(
          sourceCountry,
          targetCountry,
          purpose,
        );
        return NextResponse.json({
          success: true,
          data: enhancedServices,
          metadata: {
            service_count:
              enhancedServices.digital_services.length +
              enhancedServices.physical_services.length,
            automation_level: "high",
            ai_assisted: true,
          },
          timestamp: new Date().toISOString(),
        });

      case "real-time-rates":
        const realTimeRates = await getRealTimeExchangeRates();
        return NextResponse.json({
          success: true,
          data: {
            exchange_rates: realTimeRates,
            tax_rates: getCurrentTaxRates(sourceCountry, targetCountry),
            social_security_rates: getSocialSecurityRates(
              sourceCountry,
              targetCountry,
            ),
            cost_of_living: getCostOfLivingComparison(
              sourceCountry,
              targetCountry,
            ),
            last_updated: new Date().toISOString(),
          },
          timestamp: new Date().toISOString(),
        });

      case "document-validation":
        const requiredDocs = getRequiredDocuments(
          sourceCountry,
          targetCountry,
          purpose,
        );
        return NextResponse.json({
          success: true,
          data: {
            required_documents: requiredDocs,
            validation_service: {
              available: true,
              api_endpoint: "/api/cross-border/validate-documents",
              supported_formats: ["PDF", "JPG", "PNG"],
              processing_time: "5-10 minutes",
              ai_powered: true,
            },
            apostille_requirements: getApostilleRequirements(
              sourceCountry,
              targetCountry,
            ),
            translation_services: getTranslationServices(
              sourceCountry,
              targetCountry,
            ),
          },
          timestamp: new Date().toISOString(),
        });

      case "expert-consultation":
        const consultationOptions = getExpertConsultationOptions(
          sourceCountry,
          targetCountry,
          purpose,
        );
        return NextResponse.json({
          success: true,
          data: consultationOptions,
          booking: {
            available_slots: getAvailableConsultationSlots(),
            languages: ["de", "fr", "en", "lb"],
            consultation_types: ["video", "phone", "in-person"],
            pricing: getConsultationPricing(purpose),
          },
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json({
          success: true,
          service: "Enhanced Cross-Border Services API",
          version: "3.0.0",
          availableActions: [
            "services",
            "recommendations",
            "tax-info",
            "submit",
            "enhanced-services",
            "real-time-rates",
            "document-validation",
            "expert-consultation",
          ],
          supportedCountries: ["DE", "FR", "LU"],
          categories: [
            "business",
            "residence",
            "tax",
            "social",
            "transport",
            "healthcare",
            "education",
            "retirement",
          ],
          new_features: [
            "AI-powered document validation",
            "Real-time exchange rates and tax rates",
            "Expert consultation booking",
            "Multilingual support (DE/FR/EN/LB)",
            "Automated compliance checking",
            "Cross-border workflow automation",
          ],
          timestamp: new Date().toISOString(),
        });
    }
  } catch (error) {
    console.error("Cross-border API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Cross-border service temporarily unavailable",
        fallback: "Please contact relevant authorities directly",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, serviceId, userData, documents } = body;

    if (action === "submit") {
      if (!serviceId || !userData) {
        return NextResponse.json(
          { error: "serviceId and userData are required" },
          { status: 400 },
        );
      }

      const result = await CrossBorderServiceManager.submitRequest({
        serviceId,
        sourceCountry: userData.sourceCountry,
        targetCountry: userData.targetCountry,
        userData,
        documents,
      });

      return NextResponse.json({
        success: result.success,
        data: result.success ? result : undefined,
        error: result.success ? undefined : result.error,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Cross-border POST error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process cross-border request",
      },
      { status: 500 },
    );
  }
}

// Helper functions
function getEstimatedTimeframe(services: any[]): string {
  if (services.length === 0) return "Unknown";

  // Extract weeks from processing times and find maximum
  const weeks = services.map((service) => {
    const match = service.processingTime.match(
      /(\d+)-?(\d+)?\s*(semaine|Woche|week)/i,
    );
    if (match) {
      return parseInt(match[2] || match[1]);
    }
    return 4; // Default to 4 weeks
  });

  const maxWeeks = Math.max(...weeks);
  return `${maxWeeks} Wochen`;
}

function getEstimatedCosts(services: any[]): string {
  const costs = services.map((service) => {
    if (
      service.cost.includes("Gratuit") ||
      service.cost.includes("Kostenlos")
    ) {
      return 0;
    }

    const match = service.cost.match(/(\d+(?:,\d+)?)/g);
    if (match) {
      return parseFloat(match[0].replace(",", "."));
    }
    return 50; // Default estimate
  });

  const totalCost = costs.reduce((sum, cost) => sum + cost, 0);
  return `€${totalCost.toFixed(2)}`;
}

function getTaxRecommendations(
  sourceCountry: "DE" | "FR" | "LU",
  targetCountry: "DE" | "FR" | "LU",
  income?: number,
): string[] {
  const recommendations = [
    "Konsultieren Sie einen Steuerberater für grenzüberschreitende Beratung",
    "Prüfen Sie die Anwendbarkeit von Doppelbesteuerungsabkommen",
    "Dokumentieren Sie Ihre Arbeitstage im Zielland genau",
  ];

  // Add specific recommendations based on countries
  const countryKey = `${sourceCountry}-${targetCountry}`;
  const specificRecommendations = {
    "DE-FR": [
      "Beachten Sie die 183-Tage-Regel für deutsche Steuerpflicht",
      "Nutzen Sie die Grenzpendlerregelung bei täglichem Pendelverkehr",
    ],
    "DE-LU": [
      "Luxemburg besteuert an der Quelle - deutsche Freistellung beantragen",
      "Homeoffice-Regelung: Max. 25% der Arbeitszeit in Deutschland",
    ],
    "FR-DE": [
      "Deutsche Lohnsteuer bei Beschäftigung in Deutschland",
      "Französische Sozialversicherung bleibt bestehen",
    ],
    "FR-LU": [
      "Steuerliche Ansässigkeit in Luxemburg kann vorteilhaft sein",
      "Prüfen Sie Familienleistungen in beiden Ländern",
    ],
    "LU-DE": [
      "Hohe luxemburgische Steuersätze beachten",
      "Deutsche Steuerfreistellung für Luxemburg-Einkommen",
    ],
    "LU-FR": [
      "Komplexe Regelungen - professionelle Beratung empfohlen",
      "Sozialversicherungsabkommen beachten",
    ],
  };

  const specific =
    specificRecommendations[
      countryKey as keyof typeof specificRecommendations
    ] || [];

  // Add income-based recommendations
  if (income) {
    if (income > 100000) {
      recommendations.push(
        "Bei hohen Einkommen: Steueroptimierung durch Ansässigkeitswechsel prüfen",
      );
    }
    if (income < 30000) {
      recommendations.push(
        "Prüfen Sie Anspruch auf grenzüberschreitende Sozialleistungen",
      );
    }
  }

  return [...recommendations, ...specific];
}

// Enhanced helper functions for new features
function getEnhancedCrossBorderServices(
  sourceCountry?: string,
  targetCountry?: string,
  purpose?: string,
) {
  return {
    digital_services: [
      {
        id: "online_tax_calculator",
        name: "Grenzüberschreitender Steuerrechner",
        description: "AI-powered tax calculation for cross-border workers",
        countries: ["DE", "FR", "LU"],
        features: [
          "Real-time calculation",
          "Document generation",
          "Expert review",
        ],
        processing_time: "Immediate",
        cost: "Free basic / €29 premium",
      },
      {
        id: "digital_residence_registration",
        name: "Digitale Anmeldung",
        description: "Online residence registration across borders",
        countries: ["DE", "FR", "LU"],
        features: ["Document upload", "Status tracking", "Appointment booking"],
        processing_time: "5-10 business days",
        cost: "Standard government fees",
      },
      {
        id: "ai_document_validator",
        name: "KI-Dokumentenprüfung",
        description: "Automated document validation and translation",
        countries: ["DE", "FR", "LU"],
        features: ["AI validation", "Instant translation", "Compliance check"],
        processing_time: "5-10 minutes",
        cost: "€5 per document",
      },
    ],
    physical_services: [
      {
        id: "mobile_consultation",
        name: "Mobile Beratung",
        description: "Expert comes to your location",
        countries: ["DE", "FR", "LU"],
        features: [
          "On-site consultation",
          "Document assistance",
          "Translation",
        ],
        processing_time: "Same week appointment",
        cost: "€150-250 per session",
      },
      {
        id: "express_processing",
        name: "Express-Bearbeitung",
        description: "Priority processing for urgent cases",
        countries: ["DE", "FR", "LU"],
        features: [
          "Fast-track processing",
          "Dedicated support",
          "Status updates",
        ],
        processing_time: "1-3 business days",
        cost: "200% of standard fees",
      },
    ],
    integration_services: [
      {
        id: "ai_workflow",
        name: "KI-gesteuerte Workflows",
        description: "Automated cross-border process management",
        features: [
          "Process automation",
          "Intelligent routing",
          "Progress tracking",
        ],
        automation_level: "High",
      },
    ],
  };
}

async function getRealTimeExchangeRates() {
  // In production, integrate with real exchange rate APIs
  return {
    EUR_USD: 1.0742,
    EUR_GBP: 0.8456,
    EUR_CHF: 0.9423,
    last_updated: new Date().toISOString(),
    source: "European Central Bank",
    next_update: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours
  };
}

function getCurrentTaxRates(sourceCountry?: string, targetCountry?: string) {
  const taxRates = {
    DE: {
      income_tax: "14-45%",
      corporate_tax: "29.8-33%",
      vat: "19% (reduced: 7%)",
      social_security_employee: "19.825%",
      social_security_employer: "19.825%",
    },
    FR: {
      income_tax: "0-45%",
      corporate_tax: "25%",
      vat: "20% (reduced: 5.5%, 10%)",
      social_security_employee: "22%",
      social_security_employer: "42%",
    },
    LU: {
      income_tax: "0-42%",
      corporate_tax: "24.94%",
      vat: "17% (reduced: 3%, 8%)",
      social_security_employee: "12.35%",
      social_security_employer: "12.35%",
    },
  };

  return {
    source_country: sourceCountry
      ? taxRates[sourceCountry as keyof typeof taxRates]
      : null,
    target_country: targetCountry
      ? taxRates[targetCountry as keyof typeof taxRates]
      : null,
    cross_border_considerations: [
      "Double taxation treaties apply",
      "Social security coordination EU rules",
      "Residence vs. source taxation",
    ],
  };
}

function getSocialSecurityRates(
  sourceCountry?: string,
  targetCountry?: string,
) {
  return {
    coordination_rules: "EU Regulation 883/2004",
    applicable_legislation: "Determined by work location and residence",
    bilateral_agreements: [
      "DE-FR: Comprehensive social security agreement",
      "DE-LU: Enhanced coordination for cross-border workers",
      "FR-LU: Special provisions for frontier workers",
    ],
    contribution_rates: getCurrentTaxRates(sourceCountry, targetCountry),
  };
}

function getCostOfLivingComparison(
  sourceCountry?: string,
  targetCountry?: string,
) {
  const costIndices = {
    DE: { housing: 100, food: 100, transport: 100, overall: 100 },
    FR: { housing: 105, food: 98, transport: 95, overall: 102 },
    LU: { housing: 145, food: 115, transport: 110, overall: 135 },
  };

  return {
    comparison: {
      source: sourceCountry
        ? costIndices[sourceCountry as keyof typeof costIndices]
        : null,
      target: targetCountry
        ? costIndices[targetCountry as keyof typeof costIndices]
        : null,
    },
    purchasing_power_adjustment: "±15-30% depending on location",
    salary_expectations: "Luxembourg typically 20-40% higher gross salaries",
  };
}

function getRequiredDocuments(
  sourceCountry?: string,
  targetCountry?: string,
  purpose?: string,
) {
  const baseDocuments = [
    "Valid passport or EU ID card",
    "Birth certificate (apostilled)",
    "Marriage certificate (if applicable)",
    "Criminal background check",
    "Health insurance certificate",
  ];

  const purposeSpecific = {
    work: [
      "Employment contract",
      "Educational certificates",
      "Professional qualifications",
      "Work permit (if non-EU)",
    ],
    business: [
      "Business registration documents",
      "Tax registration",
      "Commercial insurance",
      "Business plan",
    ],
    residence: [
      "Proof of accommodation",
      "Financial statements",
      "Local registration form",
      "Integration course certificate",
    ],
    study: [
      "University acceptance letter",
      "Academic transcripts",
      "Language proficiency certificate",
      "Financial guarantee",
    ],
  };

  return {
    base_documents: baseDocuments,
    purpose_specific: purpose
      ? purposeSpecific[purpose as keyof typeof purposeSpecific] || []
      : [],
    digital_submission: "Available for most documents",
    processing_tips: [
      "Ensure all documents are less than 6 months old",
      "Apostille required for non-EU documents",
      "Certified translations needed",
    ],
  };
}

function getApostilleRequirements(
  sourceCountry?: string,
  targetCountry?: string,
) {
  return {
    required: false, // Within EU/Schengen area
    alternatives: [
      "Certified copy by notary",
      "Official translation by certified translator",
      "Embassy/consulate authentication",
    ],
    cost: "€25-50 per document",
    processing_time: "2-5 business days",
  };
}

function getTranslationServices(
  sourceCountry?: string,
  targetCountry?: string,
) {
  return {
    certified_translators: [
      {
        name: "Saarland Translation Service",
        languages: ["DE", "FR", "EN"],
        specialties: ["Legal documents", "Official certificates"],
        cost: "€35-50 per page",
        turnaround: "2-3 business days",
      },
    ],
    ai_translation: {
      available: true,
      accuracy: "95% for standard documents",
      cost: "€5 per document",
      instant_delivery: true,
      disclaimer: "Not legally certified",
    },
  };
}

function getExpertConsultationOptions(
  sourceCountry?: string,
  targetCountry?: string,
  purpose?: string,
) {
  return {
    available_experts: [
      {
        type: "tax_advisor",
        name: "Cross-Border Tax Specialist",
        qualifications: ["Certified Tax Advisor", "International Tax Law"],
        languages: ["DE", "FR", "EN"],
        hourly_rate: "€150-200",
        specialties: ["Double taxation", "Social security coordination"],
      },
      {
        type: "legal_advisor",
        name: "Immigration Law Expert",
        qualifications: ["EU Law Specialist", "Immigration Attorney"],
        languages: ["DE", "FR", "EN"],
        hourly_rate: "€200-300",
        specialties: ["Work permits", "Residence law", "Business registration"],
      },
    ],
    consultation_formats: [
      "Video call (30/60 minutes)",
      "Phone consultation",
      "In-person meeting",
      "Document review",
      "Written legal opinion",
    ],
  };
}

function getAvailableConsultationSlots() {
  // Generate mock available slots for next 14 days
  const slots = [];
  for (let i = 1; i <= 14; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);

    if (date.getDay() !== 0 && date.getDay() !== 6) {
      // Weekdays only
      slots.push({
        date: date.toISOString().split("T")[0],
        times: ["09:00", "11:00", "14:00", "16:00"],
        expert_type: ["tax_advisor", "legal_advisor"],
        booking_url: "/api/cross-border/book-consultation",
      });
    }
  }
  return slots.slice(0, 10); // Return first 10 available dates
}

function getConsultationPricing(purpose?: string) {
  const basePricing = {
    video_30min: "€75",
    video_60min: "€150",
    phone_30min: "€60",
    phone_60min: "€120",
    document_review: "€100",
    written_opinion: "€200-400",
  };

  const purposeDiscounts = {
    study: "20% student discount",
    work: "10% employee discount",
  };

  return {
    standard_rates: basePricing,
    discounts: purpose
      ? purposeDiscounts[purpose as keyof typeof purposeDiscounts]
      : null,
    package_deals: [
      "Complete relocation package: €500 (3 consultations + document review)",
      "Business setup package: €800 (legal + tax + business consultation)",
    ],
  };
}
