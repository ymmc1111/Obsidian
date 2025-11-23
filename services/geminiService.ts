import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const askTacticalAssistant = async (
  context: string,
  userPrompt: string
): Promise<string> => {
  try {
    const modelId = "gemini-2.5-flash"; // Fast response for UI interactions
    
    const systemInstruction = `
      You are PocketOps-AI, a specialized tactical assistant for a Defense & Space manufacturing ERP.
      Your tone is professional, concise, and military-grade (e.g., "Affirmative", "Analyzing", "Anomaly Detected").
      You assist with inventory analysis, compliance checking (ITAR/AS9100), and workflow optimization.
      
      Current Context JSON:
      ${context}
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.2, // Low creativity, high precision
      }
    });

    return response.text || "Systems unresponsive. Check comms.";
  } catch (error) {
    console.error("Gemini uplink failed:", error);
    return "uplink_error: Secure connection failed.";
  }
};