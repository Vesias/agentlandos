import { ChatOpenAI } from "@langchain/openai";

class EnhancedAIService {
  private llm: ChatOpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    this.llm = new ChatOpenAI({
      openAIApiKey: apiKey,
      modelName: "gpt-3.5-turbo",
      temperature: 0.7,
    });
  }

  async processQuery(
    prompt: string,
    mode: "chat" | "artifact",
    category: string,
    context?: any,
  ) {
    const systemPrompt = `Du bist ein hilfreicher KI-Assistent für das Saarland. Kategorie: ${category}.`;
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ];
    const result = await this.llm.call(messages);
    return { response: result.content ?? result };
  }

  async *streamResponse(prompt: string, category: string) {
    const systemPrompt = `Du bist ein hilfreicher KI-Assistent für das Saarland. Kategorie: ${category}.`;
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ];
    const stream = await this.llm.stream(messages);
    for await (const chunk of stream) {
      yield chunk;
    }
  }

  async ragQuery(prompt: string, options: { category: string }) {
    return this.processQuery(prompt, "chat", options.category);
  }
}

export const enhancedAI = new EnhancedAIService();
