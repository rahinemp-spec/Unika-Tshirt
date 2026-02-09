
import { GoogleGenAI } from "@google/genai";

// Always initialize GoogleGenAI with a named parameter using process.env.API_KEY directly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a T-Shirt design image using the gemini-2.5-flash-image model.
 */
export const generateTShirtDesign = async (prompt: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: `Create a professional t-shirt graphic design for: ${prompt}. The design should be centered, high-contrast, artistic, and suitable for printing on a premium t-shirt.` }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        }
      }
    });

    // Extract the image data by iterating through response parts as per guidelines.
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Design generation failed:", error);
    return null;
  }
};

/**
 * Gets fashion styling advice using the gemini-3-flash-preview model.
 */
export const getStylingAdvice = async (userPrompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userPrompt,
      config: {
        systemInstruction: "You are a professional fashion stylist for UNIKA TSHIRTS. Suggest outfit pairings and t-shirt styles based on the user's occasion or mood. Keep it concise, trendy, and encouraging."
      }
    });
    // Use the .text property directly instead of calling a text() method.
    return response.text || "I'm sorry, I couldn't get any style advice right now. Try wearing something that makes you feel bold!";
  } catch (error) {
    console.error("Chatbot error:", error);
    return "Something went wrong. Stay stylish anyway!";
  }
};
