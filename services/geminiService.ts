import { GoogleGenAI } from "@google/genai";

const apiKey = (import.meta.env.VITE_GEMINI_API_KEY as string) || '';
let ai: any;

try {
  ai = new GoogleGenAI({ apiKey });
} catch (error) {
  console.error('GoogleGenAI initialization error:', error);
}

export const generateJobDescription = async (title: string, company: string, location: string): Promise<string> => {
  if (!apiKey || !ai) {
    console.warn("Gemini API not configured");
    return "AI generation unavailable. Please write description manually.";
  }

  try {
    const prompt = `
      Write a compelling and professional job description for a "${title}" position at "${company}" located in "${location}".
      Structure it with an Introduction, Key Responsibilities, and Requirements.
      Keep it concise (approx 150-200 words) but engaging.
      Format it in Markdown.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Could not generate description.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating content. Please try again.";
  }
};
