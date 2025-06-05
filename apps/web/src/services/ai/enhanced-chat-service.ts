import { ChatOpenAI } from "@langchain/openai";

class EnhancedChatService {
  private llm: ChatOpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    this.llm = new ChatOpenAI({
      openAIApiKey: apiKey,
      modelName: "gpt-3.5-turbo",
      temperature: 0.7,
    });
  }

  async generateResponse(message: string) {
    const result = await this.llm.call([{ role: "user", content: message }]);
    return {
      content: result.content ?? result,
      confidence: 0.9,
      followUpQuestions: [],
      relatedServices: [],
      sources: [],
    };
  }
}

export const enhancedChatService = new EnhancedChatService();
