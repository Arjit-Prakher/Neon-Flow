const { GoogleGenAI } = require('@google/genai');
const dotenv = require('dotenv');

dotenv.config();

// Initialize the official Google Gen AI SDK using your Environment Variable
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL_NAME = 'gemini-3.5-flash';

/**
 * Handles node context mapping generation 
 */
async function generateResponse(userPrompt, chatHistory = [], options = {}) {
    try {
        // Convert canvas history formats seamlessly into structures Gemini reads natively
        const contents = chatHistory.map(msg => ({
            role: (msg.role === 'model' || msg.role === 'assistant') ? 'model' : 'user',
            parts: [{ text: msg.content || msg.message }]
        }));

        const userContents = [...contents, { role: 'user', parts: [{ text: userPrompt }] }];

        if (options.withTitle) {
            userContents.push({
                role: 'user',
                parts: [{ text: `Please produce the assistant response to the prompt above, and then OUTPUT ONLY a valid JSON object with two keys: "reply" (the full assistant response as a string) and "title" (a very short 3-6 word title for this flow). The JSON must be the only text in your response.` }]
            });
        }

        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: userContents,
            config: {
                thinkingConfig: {
                    thinkingLevel: 'low'
                },
                systemInstruction: `You are the core intelligence of Neon Flow, an infinite canvas spatial mind-mapping platform. Your goal is to help users dissect and structure complex parameters visually. Whenever possible close out your absolute final sentence with exactly 1 or 2 targeted or most probable question that user might ask so that they may explore different cases, explicitly nudging the user to drag out a new branch node to investigate specific variables, alternative architectures, or counterarguments. Provide structured technical answers in clear Markdown when returning the assistant reply.`,
                temperature: 0.7,
            }
        });

        if (options.withTitle) {
            try {
                const parsed = JSON.parse(response.text);
                return { text: parsed.reply, title: parsed.title };
            } catch (parseErr) {
                const fallbackTitle = (response.text || '').split(/[\.\n]/)[0].split(' ').slice(0, 6).join(' ');
                return { text: response.text, title: fallbackTitle };
            }
        }

        return { text: response.text };
    } catch (err) {
        console.error("Gemini Content Generation Failure:", err);
        return {
            text: "⚠️ The workspace engine is currently experiencing high demand. Please wait a moment and click 'Go' again.",
            title: "Service Overloaded"
        };
    }
}

/**
 * Handles map title processing 
 */
async function generateFlowTitle(userPrompt) {
    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: [{
                role: 'user',
                parts: [{ text: `Provide a short 3 to 5 word spatial mind map title identifying this core concept: "${userPrompt}". Reply ONLY with the raw title string text. Do not wrap in quotation marks or provide descriptions.` }]
            }],
            config: {
                thinkingConfig: {
                    thinkingLevel: 'minimal'
                },
                temperature: 0.3
            }
        });

        return response.text.trim();
    } catch (err) {
        console.error("Gemini Title Generation Failure:", err);
        return "New Visual Graph";
    }
}

module.exports = {
    generateResponse,
    generateFlowTitle
};