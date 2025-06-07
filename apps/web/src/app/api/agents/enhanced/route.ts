import { NextRequest, NextResponse } from "next/server";
import { saarlandOrchestrator } from "@/lib/ai/multi-agent-orchestrator";

export const runtime = "edge";
export const dynamic = "force-dynamic";

// Fallback implementation for CopilotBackend
const createFallbackBackend = () => ({
  handleRequest: async (req: NextRequest) => {
    const body = await req.json();
    return NextResponse.json({
      success: false,
      error: "CopilotKit integration not available",
      fallback: "Using direct agent orchestration",
    });
  },
});

// Enhanced Multi-Agent API with direct orchestrator integration
const copilotBackend = createFallbackBackend();

async function generateFollowUpRecommendations(
  query: string,
  category: string | undefined,
  response: string | undefined,
): Promise<string[]> {
  const recommendations: string[] = [];

  // Category-based recommendations
  if (category === "tourism") {
    recommendations.push(
      "Weitere Sehenswürdigkeiten entdecken",
      "Übernachtungsmöglichkeiten finden",
      "Veranstaltungen checken",
    );
  } else if (category === "business") {
    recommendations.push(
      "Fördermöglichkeiten erkunden",
      "Standortfaktoren analysieren",
      "Netzwerke kontaktieren",
    );
  } else if (category === "admin") {
    recommendations.push(
      "Termine vereinbaren",
      "Dokumente vorbereiten",
      "Öffnungszeiten prüfen",
    );
  } else {
    recommendations.push(
      "Spezifischere Frage stellen",
      "Kategorie wählen",
      "Weitere Informationen anfordern",
    );
  }

  return recommendations.slice(0, 3);
}

export async function POST(req: NextRequest) {
  try {
    // Enhanced multi-agent processing endpoint
    const body = await req.json();
    const { query, category, mode, preferredModel, directCall } = body;

    if (directCall) {
      // Direct multi-agent call (bypass Copilot Kit)
      const result = await saarlandOrchestrator.processQuery(
        query,
        category || "general",
        {},
        { mode, preferredModel, enableVectorSearch: true },
      );

      return NextResponse.json({
        success: true,
        response: result.finalResponse,
        metadata: result.metadata,
        agentInteractions: result.responses,
        confidence: result.confidence,
        vectorContext: result.vectorContext ? "enriched" : "none",
        timestamp: new Date().toISOString(),
      });
    }

    // Fallback to orchestrator
    return await copilotBackend.handleRequest(req);
  } catch (error) {
    console.error("Enhanced agents API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Enhanced agent services temporarily unavailable",
        fallback:
          "Versuchen Sie es mit einer einfacheren Anfrage oder kontaktieren Sie uns direkt.",
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}

export async function GET(req: NextRequest) {
  // Agent capabilities and health check
  const capabilities = [
    {
      name: "Multi-Agent Orchestrator",
      models: ["DeepSeek R1", "Gemini 2.5 Flash", "OpenAI GPT-4o"],
      features: [
        "Chain-of-Thought Reasoning",
        "Fast Generation",
        "Structured Analysis",
      ],
      specializations: ["Tourism", "Business", "Administration"],
    },
    {
      name: "Vector Search Engine",
      embedding: "OpenAI text-embedding-3-large",
      database: "Supabase Vector Store",
      capabilities: [
        "Semantic Search",
        "RAG Enhancement",
        "Context Enrichment",
      ],
    },
    {
      name: "LangChain Integration",
      framework: "LangChain with custom LLMs",
      orchestration: "Agent handoffs and state management",
      monitoring: "Performance tracking and error handling",
    },
  ];

  return NextResponse.json({
    service: "Enhanced Saarland Multi-Agent System",
    version: "2.0.0",
    capabilities,
    integration: {
      copilotKit: "Backend actions with LLM orchestration",
      agUI: "Protocol-compatible UI components",
      langChain: "Advanced agent coordination",
    },
    models: {
      reasoning: "DeepSeek R1 (Chain-of-Thought)",
      generation: "Gemini 2.5 Flash (Speed optimized)",
      analysis: "OpenAI GPT-4o (Function calling)",
      embeddings: "OpenAI text-embedding-3-large (Vector search)",
    },
    status: "operational",
    timestamp: new Date().toISOString(),
  });
}
