import { GoogleGenAI, SchemaType } from "@google/genai";
import { CardData } from "../types";

const SYSTEM_INSTRUCTION = `
You are a creative assistant for a social card game targeted at university students, teenagers, and young adults.
The context for this game is: Dates, Pre-drinks, Ice breakers, and Late-night talks.

Your goal is to generate questions that are cool, modern, slightly spicy (but safe for general social media), and deep.
Avoid overly formal language. Use slang where appropriate but keep it understandable.

There are three levels:
Level 1: The Vibe Check (Fun, Impressions, Surface level, "Who is most likely to", Party starters)
Level 2: Real Talk (Personal stories, Relationships, Fears, Dreams, "Have you ever")
Level 3: Deep Dive (Vulnerability, Core memories, Bonding, Future)

Generate questions that fit these themes.
The output text should be uppercase.
`;

export const generateCards = async (level: number = 1): Promise<CardData[]> => {
    try {
        const apiKey = process.env.EXPO_PUBLIC_API_KEY;
        if (!apiKey) {
            console.warn("No API Key found");
            return [];
        }

        const ai = new GoogleGenAI({ apiKey });

        // Adjust level names for the prompt
        const levelName = level === 1 ? "The Vibe Check" : level === 2 ? "Real Talk" : "Deep Dive";
        const prompt = `Generate 5 unique Level ${level} (${levelName}) questions for the card game.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                responseMimeType: "application/json",
                responseSchema: {
                    type: SchemaType.ARRAY,
                    items: {
                        type: SchemaType.OBJECT,
                        properties: {
                            text: { type: SchemaType.STRING, description: "The question text in uppercase." },
                            level: { type: SchemaType.INTEGER, description: "The level of the card (1, 2, or 3)." },
                            footerText: { type: SchemaType.STRING, description: "The footer text, e.g., 'VIBE CHECK'" },
                        },
                        required: ["text", "level", "footerText"],
                    },
                },
            },
        });

        const text = response.text;
        if (!text) return [];

        const rawCards = JSON.parse(text);

        return rawCards.map((c: any, index: number) => ({
            ...c,
            id: `gen-${Date.now()}-${index}`,
        }));

    } catch (error) {
        console.error("Failed to generate cards:", error);
        return [];
    }
};
