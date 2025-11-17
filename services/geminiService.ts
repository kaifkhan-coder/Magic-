
import { GoogleGenAI, Type } from "@google/genai";
import type { FileAttachment, Suggestion } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToGenerativePart = (file: FileAttachment) => {
  return {
    inlineData: {
      data: file.base64,
      mimeType: file.type,
    },
  };
};

export const generateInitialContent = async (prompt: string, files: FileAttachment[]): Promise<string> => {
    try {
        const fileParts = files.map(fileToGenerativePart);
        const fullPrompt = [ { text: prompt }, ...fileParts ];
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: { parts: fullPrompt },
            config: {
                systemInstruction: "You are an expert writer and creative partner. Write a compelling piece based on the user's prompt and provided files. The output should be well-structured, engaging, and ready for a user to start editing. Respond only with the generated text, without any preamble or explanation."
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error generating initial content:", error);
        return "There was an error generating the content. Please try again.";
    }
};

export const iterateOnSelection = async (text: string, instruction: string): Promise<string> => {
    try {
        const prompt = `Based on the instruction "${instruction}", rewrite the following text:\n\n---\n${text}\n---`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: "You are a writing assistant. Your task is to rewrite the provided text based on the user's instruction. Respond ONLY with the rewritten text, without any additional comments, formatting, or explanations."
            }
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error iterating on selection:", error);
        return text; // Return original text on error
    }
};

export const getProactiveSuggestions = async (fullText: string): Promise<Omit<Suggestion, 'id'>[]> => {
    if (fullText.trim().split(/\s+/).length < 20) {
        return []; // Don't run on very short texts
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analyze the following text and provide suggestions for improvement. Focus on clarity, conciseness, and impact. \n\nTEXT:\n${fullText}`,
            config: {
                systemInstruction: "You are an expert editor. Your task is to analyze the user's writing and provide helpful, non-intrusive suggestions. Only suggest changes that significantly improve the text. For each suggestion, provide the exact text to be replaced, the new text, and a brief, one-sentence reason for the change.",
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            find: {
                                type: Type.STRING,
                                description: "The exact, verbatim phrase or sentence from the original text to be replaced.",
                            },
                            replaceWith: {
                                type: Type.STRING,
                                description: "The suggested new phrase or sentence.",
                            },
                            reason: {
                                type: Type.STRING,
                                description: "A brief, one-sentence explanation for why this change is an improvement.",
                            }
                        },
                        required: ["find", "replaceWith", "reason"],
                    },
                },
            }
        });

        const jsonString = response.text;
        const suggestions = JSON.parse(jsonString);
        return suggestions as Omit<Suggestion, 'id'>[];
    } catch (error) {
        console.error("Error getting proactive suggestions:", error);
        return [];
    }
};
