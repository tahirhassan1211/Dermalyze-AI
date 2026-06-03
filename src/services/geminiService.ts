/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";
import { AnalysisInput } from "../types";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || '' 
});

export const analyzeSkinCondition = async (input: AnalysisInput) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing. Please configure it in the Secrets panel.");
  }

  const parts: any[] = [];

  // Add Image Part
  if (input.image) {
    parts.push({
      inlineData: {
        mimeType: input.image.mimeType,
        data: input.image.data,
      },
    });
  }

  // Add Voice Part
  if (input.voice) {
    parts.push({
      inlineData: {
        mimeType: input.voice.mimeType,
        data: input.voice.data,
      },
    });
  }

  // Add Text Part
  const textPrompt = `
    Analyze the provided inputs which may include an image of a skin condition, a voice recording (audio), and a text description.
    
    User Text Description: ${input.text || "None provided"}
    
    As an AI assistant specialized in dermatology support:
    1. Identify the potential skin condition(s) shown or described.
    2. Provide a brief explanation of what the condition is.
    3. Suggest immediate over-the-counter treatment options or home care (if applicable).
    4. Provide preventative measures to avoid recurrence or worsening.
    5. VERY IMPORTANT: Begin your response with a clear, bold medical disclaimer stating that you are an AI, not a doctor, and this information is for educational purposes only. Advise the user to seek professional medical help for a final diagnosis.
    
    Structure your response clearly with headings for Diagnosis, Treatment, and Prevention. Use professional but accessible language.
  `;

  parts.push({ text: textPrompt });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts },
    });

    return response.text || "No analysis could be generated.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze skin condition. Please try again.");
  }
};
