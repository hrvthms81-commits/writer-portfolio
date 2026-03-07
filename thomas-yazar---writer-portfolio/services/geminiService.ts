import { GoogleGenAI } from "@google/genai";
import { Work } from "../types";

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key not found in environment variables");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateWorkSummary = async (title: string, category: string, contentSnippet: string): Promise<string> => {
  const ai = getAIClient();
  if (!ai) return "AI services unavailable (Missing API Key).";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an editor for a creative writer. Please write a compelling, one-sentence tagline or short summary (max 30 words) for a ${category} titled "${title}". Here is a snippet of the content/idea: "${contentSnippet}". Make it intriguing.`,
    });
    return response.text || "Could not generate summary.";
  } catch (error) {
    console.error("Gemini Summary Error:", error);
    return "Error generating summary.";
  }
};

export const chatWithPortfolio = async (
  history: { role: 'user' | 'model', text: string }[],
  works: Work[],
  newMessage: string
): Promise<string> => {
  const ai = getAIClient();
  if (!ai) return "I can't access my brain right now (Missing API Key).";

  // Construct a context string based on available works
  const portfolioContext = works.map(w =>
    `- Title: ${w.title} (${w.category})
     - Description: ${w.description}
     - Created: ${new Date(w.dateCreated).toLocaleDateString()}
     - Status: ${w.isLocked ? "Requires Login" : "Public"}
    `
  ).join('\n');

  const systemInstruction = `You are the "Digital Assistant" for a writer's portfolio website.
  Your goal is to engage visitors, answer questions about the author's work based on the list below, and encourage them to read.
  
  The Author's Portfolio contains these works:
  ${portfolioContext}

  If a user asks about a specific story, provide details from the description.
  If they ask for a recommendation, pick one based on their mood (infer from their text).
  Keep your tone creative, slightly mysterious, but helpful.
  Do not make up facts about the stories that aren't in the descriptions, but you can be playfully vague if you don't know.
  `;

  try {
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction,
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      }))
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result.text || "I'm lost for words.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "Something went wrong in the ether.";
  }
};
