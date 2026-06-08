import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL_NAME = 'gemini-3-flash-preview';

export const generateResponse = async (userPrompt, chatHistory = [], options = {}) => {
    try {
        // 1. Convert Neon Flow canvas message formatting into the structure Gemini naturally digests
        const contents = chatHistory.map(msg => ({
            role: (msg.role === 'model' || msg.role === 'assistant') ? 'model' : 'user',
            parts: [{ text: msg.content || msg.message }]
        }));

        // 2. Instruct the model using System Instructions to guide spatial engine flow
        // Build the contents to send to the model: existing history + the current user prompt
        const userContents = [...contents, { role: 'user', parts: [{ text: userPrompt }] }];

        if (options.withTitle) {
            // Ask the model to output JSON only with fields `reply` and `title`
            userContents.push({ role: 'user', parts: [{ text: `Please produce the assistant response to the prompt above, and then OUTPUT ONLY a valid JSON object with two keys: "reply" (the full assistant response as a string) and "title" (a very short 3-6 word title for this flow). The JSON must be the only text in your response.` }] });
        }

        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: userContents,
            config: {
                systemInstruction: `You are the core intelligence of Neon Flow, an infinite canvas spatial mind-mapping platform. Your goal is to help users dissect and structure complex parameters visually. Whenever possible close out your absolute final sentence with exactly 1 or 2 targeted, highly tactical open-ended follow-up questions. These ending questions must explicitly nudge the user to drag out a new branch node to investigate specific variables, alternative architectures, or counterarguments. Provide structured technical answers in clear Markdown when returning the assistant reply.`,
                temperature: 0.7,
            }
        });

        if (options.withTitle) {
            // Try to parse JSON from the model output
            try {
                const parsed = JSON.parse(response.text);
                return { text: parsed.reply, title: parsed.title };
            } catch (parseErr) {
                // Fallback: attempt to heuristically extract a short title from the response
                const fallbackTitle = (response.text || '').split(/[\.\n]/)[0].split(' ').slice(0, 6).join(' ');
                return { text: response.text, title: fallbackTitle };
            }
        }

        return { text: response.text };
    } catch (err) {
        console.error("Gemini Content Generation Failure:", err);
        throw new Error("Failed to communicate with Gemini 3 Engine.");
    }
};

/**
 * Generates a tight 3-5 word mind map identifier.
 */
export const generateFlowTitle = async (userPrompt) => {
    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: [{
                role: 'user',
                parts: [{ text: `Provide a short 3 to 5 word spatial mind map title identifying this core concept: "${userPrompt}". Reply ONLY with the raw title string text. Do not wrap in quotation marks or provide descriptions.` }]
            }],
            config: { temperature: 0.3 }
        });

        return response.text.trim();
    } catch (err) {
        console.error("Gemini Title Generation Failure:", err);
        return "New Visual Graph";
    }
};