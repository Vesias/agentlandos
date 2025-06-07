import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { deepseek } from "@ai-sdk/deepseek";
import { generateText } from "ai";

export const runtime = "nodejs";
export const maxDuration = 60;

// Initialize AI clients
const googleAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

interface MultimodalRequest {
  text?: string;
  imageUrl?: string;
  audioUrl?: string;
  mode: "analyze" | "chat" | "transcribe" | "describe";
  language?: "de" | "fr" | "en" | "lb";
  context?: string;
}

export async function POST(request: NextRequest) {
  try {
    const {
      text,
      imageUrl,
      audioUrl,
      mode,
      language = "de",
      context,
    }: MultimodalRequest = await request.json();

    // Validate inputs
    if (!text && !imageUrl && !audioUrl) {
      return NextResponse.json(
        { success: false, error: "Text, Bild oder Audio erforderlich" },
        { status: 400 },
      );
    }

    let result;

    switch (mode) {
      case "analyze":
        result = await analyzeMultimodal({
          text,
          imageUrl,
          audioUrl,
          language,
          context,
        });
        break;
      case "chat":
        result = await chatWithMultimodal({
          text,
          imageUrl,
          audioUrl,
          language,
          context,
        });
        break;
      case "transcribe":
        result = await transcribeAudio({ audioUrl, language });
        break;
      case "describe":
        result = await describeImage({ imageUrl, language, context });
        break;
      default:
        return NextResponse.json(
          { success: false, error: "Unbekannter Modus" },
          { status: 400 },
        );
    }

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Multimodal AI error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Fehler bei der KI-Verarbeitung",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * Analyze multimodal input (text + image + audio)
 */
async function analyzeMultimodal({
  text,
  imageUrl,
  audioUrl,
  language,
  context,
}: {
  text?: string;
  imageUrl?: string;
  audioUrl?: string;
  language: string;
  context?: string;
}) {
  try {
    // Use Gemini for multimodal analysis
    const model = googleAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
    });

    const parts: any[] = [];

    // Add text context
    if (context) {
      parts.push({ text: `Kontext: ${context}` });
    }

    // Add text input
    if (text) {
      parts.push({ text: `Text-Eingabe: ${text}` });
    }

    // Add image
    if (imageUrl) {
      try {
        const imageResponse = await fetch(imageUrl);
        const imageBuffer = await imageResponse.arrayBuffer();
        const imageBase64 = Buffer.from(imageBuffer).toString("base64");

        parts.push({
          inlineData: {
            mimeType: imageResponse.headers.get("content-type") || "image/jpeg",
            data: imageBase64,
          },
        });
      } catch (error) {
        console.error("Error fetching image:", error);
      }
    }

    // Add analysis prompt based on language
    const prompts = {
      de: `Analysiere alle bereitgestellten Eingaben (Text, Bild, Audio) und erstelle eine umfassende Analyse für das Saarland. 
           Berücksichtige lokale Bezüge, praktische Anwendungen und kulturelle Aspekte. 
           Antworte auf Deutsch mit strukturierten Informationen.`,
      fr: `Analysez toutes les entrées fournies (texte, image, audio) et créez une analyse complète pour la Sarre. 
           Tenez compte des références locales, des applications pratiques et des aspects culturels. 
           Répondez en français avec des informations structurées.`,
      en: `Analyze all provided inputs (text, image, audio) and create a comprehensive analysis for Saarland. 
           Consider local references, practical applications, and cultural aspects. 
           Respond in English with structured information.`,
      lb: `Analyséiert all déi bereetgestallt Eingaben (Text, Bild, Audio) a maacht eng ëmfassend Analyse fir d'Saarland. 
           Berücksichtegt lokal Bezéi, praktesch Uwendungen a kulturell Aspekter. 
           Äntwert op Lëtzebuergesch mat strukturéierten Informatiounen.`,
    };

    parts.push({
      text: prompts[language as keyof typeof prompts] || prompts.de,
    });

    const result = await model.generateContent(parts);
    const response = await result.response;

    return {
      analysis: response.text(),
      type: "multimodal_analysis",
      inputs: {
        hasText: !!text,
        hasImage: !!imageUrl,
        hasAudio: !!audioUrl,
      },
    };
  } catch (error) {
    console.error("Multimodal analysis error:", error);
    throw new Error("Fehler bei der multimodalen Analyse");
  }
}

/**
 * Chat with multimodal AI
 */
async function chatWithMultimodal({
  text,
  imageUrl,
  audioUrl,
  language,
  context,
}: {
  text?: string;
  imageUrl?: string;
  audioUrl?: string;
  language: string;
  context?: string;
}) {
  try {
    // First, analyze any media content
    let mediaDescription = "";

    if (imageUrl) {
      const imageAnalysis = await describeImage({ imageUrl, language });
      mediaDescription += `Bild: ${imageAnalysis.description}\n`;
    }

    if (audioUrl) {
      const audioTranscription = await transcribeAudio({ audioUrl, language });
      mediaDescription += `Audio: ${audioTranscription.text}\n`;
    }

    // Create comprehensive prompt
    const systemPrompts = {
      de: `Du bist ein KI-Assistent für das Saarland. Du hilfst bei allen Fragen zu Tourismus, Verwaltung, Wirtschaft und Bildung in der Region.
           ${context ? `Kontext: ${context}` : ""}
           ${mediaDescription ? `Medien-Inhalt: ${mediaDescription}` : ""}
           
           Antworte hilfreich, präzise und mit lokalem Bezug zum Saarland.`,
      fr: `Tu es un assistant IA pour la Sarre. Tu aides avec toutes les questions sur le tourisme, l'administration, l'économie et l'éducation dans la région.
           ${context ? `Contexte: ${context}` : ""}
           ${mediaDescription ? `Contenu médias: ${mediaDescription}` : ""}
           
           Réponds de manière utile, précise et avec des références locales à la Sarre.`,
      en: `You are an AI assistant for Saarland. You help with all questions about tourism, administration, economy and education in the region.
           ${context ? `Context: ${context}` : ""}
           ${mediaDescription ? `Media content: ${mediaDescription}` : ""}
           
           Respond helpfully, precisely and with local reference to Saarland.`,
      lb: `Du bass en KI-Assistent fir d'Saarland. Du hëllefs mat allen Froen iwwer Tourismus, Verwaltung, Wirtschaft an Bildung an der Regioun.
           ${context ? `Kontext: ${context}` : ""}
           ${mediaDescription ? `Medien-Inhalt: ${mediaDescription}` : ""}
           
           Äntwert hëllefräich, präzis a mat lokalem Bezéi zum Saarland.`,
    };

    // Use DeepSeek for reasoning-based chat
    const { text: response } = await generateText({
      model: deepseek("deepseek-reasoner"),
      system:
        systemPrompts[language as keyof typeof systemPrompts] ||
        systemPrompts.de,
      prompt: text || "Beschreibe den bereitgestellten Inhalt.",
      maxTokens: 1000,
      temperature: 0.7,
    });

    return {
      response,
      type: "multimodal_chat",
      hasMedia: !!(imageUrl || audioUrl),
    };
  } catch (error) {
    console.error("Multimodal chat error:", error);
    throw new Error("Fehler beim multimodalen Chat");
  }
}

/**
 * Transcribe audio using Gemini
 */
async function transcribeAudio({
  audioUrl,
  language,
}: {
  audioUrl?: string;
  language: string;
}) {
  if (!audioUrl) {
    throw new Error("Audio URL ist erforderlich");
  }

  try {
    const model = googleAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
    });

    // Fetch audio file
    const audioResponse = await fetch(audioUrl);
    const audioBuffer = await audioResponse.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString("base64");

    const prompts = {
      de: "Transkribiere dieses Audio auf Deutsch. Gib nur den gesprochenen Text zurück.",
      fr: "Transcrivez cet audio en français. Ne retournez que le texte parlé.",
      en: "Transcribe this audio in English. Return only the spoken text.",
      lb: "Transkribéiert dëst Audio op Lëtzebuergesch. Gitt just den gesprachenen Text zréck.",
    };

    const result = await model.generateContent([
      { text: prompts[language as keyof typeof prompts] || prompts.de },
      {
        inlineData: {
          mimeType: audioResponse.headers.get("content-type") || "audio/webm",
          data: audioBase64,
        },
      },
    ]);

    const response = await result.response;

    return {
      text: response.text().trim(),
      type: "audio_transcription",
      language,
    };
  } catch (error) {
    console.error("Audio transcription error:", error);
    throw new Error("Fehler bei der Audio-Transkription");
  }
}

/**
 * Describe image using Gemini
 */
async function describeImage({
  imageUrl,
  language,
  context,
}: {
  imageUrl?: string;
  language: string;
  context?: string;
}) {
  if (!imageUrl) {
    throw new Error("Bild URL ist erforderlich");
  }

  try {
    const model = googleAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
    });

    // Fetch image
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString("base64");

    const prompts = {
      de: `Beschreibe dieses Bild detailliert auf Deutsch. ${context ? `Kontext: ${context}` : ""} 
           Konzentriere dich auf wichtige Details, Personen, Objekte, Text und den Gesamtkontext.`,
      fr: `Décrivez cette image en détail en français. ${context ? `Contexte: ${context}` : ""} 
           Concentrez-vous sur les détails importants, les personnes, les objets, le texte et le contexte général.`,
      en: `Describe this image in detail in English. ${context ? `Context: ${context}` : ""} 
           Focus on important details, people, objects, text, and overall context.`,
      lb: `Beschreiwt dëst Bild detailléiert op Lëtzebuergesch. ${context ? `Kontext: ${context}` : ""} 
           Konzentréiert iech op wichteg Detailer, Leit, Objeten, Text an de Gesamtkontext.`,
    };

    const result = await model.generateContent([
      { text: prompts[language as keyof typeof prompts] || prompts.de },
      {
        inlineData: {
          mimeType: imageResponse.headers.get("content-type") || "image/jpeg",
          data: imageBase64,
        },
      },
    ]);

    const response = await result.response;

    return {
      description: response.text(),
      type: "image_description",
      language,
    };
  } catch (error) {
    console.error("Image description error:", error);
    throw new Error("Fehler bei der Bildbeschreibung");
  }
}
