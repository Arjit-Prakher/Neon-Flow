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
        console.log(userContents);

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
                systemInstruction: `You are the core intelligence of Neon Flow, an infinite canvas spatial mind-mapping platform. If the user prompt is too generic like a greeting, then greet them back and ask their plan for today. Your goal is to help users dissect and structure complex topic with suitable analogies. Close your answer that encourages the user to ask 1 or 2 follow up questions from your answer or make them open to ask any relevant question from the topic they have started. Provide structured technical answers in clear Markdown when returning the assistant reply`,
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
                }
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