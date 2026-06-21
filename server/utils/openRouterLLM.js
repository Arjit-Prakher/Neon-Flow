const dotenv = require('dotenv');
dotenv.config();

const OPENROUTER_API_KEY = process.env.OPEN_ROUTER;

const MODEL_NAME = "google/gemma-4-31b-it:free";


async function generateResponse(userPrompt, chatHistory = [], attachments = []) {
    try {
        if (!OPENROUTER_API_KEY) {
            throw new Error("Missing OPENROUTER_API_KEY in your environment configuration.");
        }

        // 1. Initialize messages array with your custom System Instruction
        const messages = [
            {
                role: "system",
                content: `You are the core intelligence of Neon Flow, an infinite canvas spatial mind-mapping platform. Your goal is to help users dissect and structure complex topic with suitable analogies. Close your answer that encourages the user to ask 1 or 2 follow up questions from your answer or make them open to ask any relevant question from the topic they have started. Provide structured technical answers in clear Markdown when returning the assistant reply.

CRITICAL JSON OUTPUT RULES:
At the absolute end of your response, you must append a single valid JSON block containing your output layout. Do not wrap this final JSON block inside markdown code blocks (\`\`\`).
Format the JSON exactly like this: {"reply": "Your markdown response text here", "title": "A short concise 3-5 word thought flow title"}`
            }
        ];

        // 2. Map and append any existing conversation context from the canvas
        if (Array.isArray(chatHistory)) {
            chatHistory.forEach(msg => {
                messages.push({
                    role: (msg.role === 'model' || msg.role === 'assistant') ? 'assistant' : 'user',
                    content: msg.content || msg.message || ""
                });
            });
        }
        let fileTextContextBlock = "";
        // 3. Assemble current user prompt + text instructions + attachments
        const userContentArray = [
            {
                type: "text",
                text: `${userPrompt}\n\n[System Instruction reminder: Make sure to end your output with the valid JSON block containing the 'reply' and 'title' keys.]`
            }
        ];

        // Process files (Images/PDFs) natively
        if (Array.isArray(attachments) && attachments.length > 0) {
            attachments.forEach((file) => {
                if (!file.data || !file.mimeType) return;

                if (file.mimeType.startsWith('image/')) {
                    userContentArray.push({
                        type: "image_url",
                        image_url: { url: `data:${file.mimeType};base64,${file.data}` }
                    });
                } else if (file.mimeType === 'application/pdf' || file.mimeType.includes('pdf')) {
                    userContentArray.push({
                        type: "file",
                        file: {
                            filename: file.name || "document.pdf",
                            file_data: `data:${file.mimeType};base64,${file.data}`
                        }
                    });

                    try {
                        const extractedText = Buffer.from(file.data, 'base64').toString('utf-8');
                        if (extractedText && !extractedText.startsWith('%PDF')) {
                            fileTextContextBlock += `\n[File Data Extraction - ${file.name || 'Document'}]:\n${extractedText}\n`;
                        }
                    } catch (e) {
                        console.warn("Could not append fallback string transcription to text history block", e);
                    }
                } else {
                    const plainTextContent = Buffer.from(file.data, 'base64').toString('utf-8');
                    userContentArray.push({
                        type: "text",
                        text: `\n[Attached Reference Material: ${file.name || 'Data Matrix'}]\n${plainTextContent}`
                    });
                }
            });
        }

        // Push current turn to the messages stack
        messages.push({
            role: "user",
            content: userContentArray
        });

        // 4. Dispatch payload to OpenRouter Gateway
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:5173",
                "X-Title": "Neon Flow Spatial Engine",
            },
            body: JSON.stringify({
                model: MODEL_NAME,
                messages: messages,
                temperature: 0.3
            })
        });

        if (!response.ok) {
            const errorDetails = await response.text();
            throw new Error(`OpenRouter gateway returned status ${response.status}: ${errorDetails}`);
        }

        const data = await response.json();
        const rawText = data.choices?.[0]?.message?.content || "";

        // 5. Locate and extract the structural JSON payload from the raw text stream
        try {
            const jsonStartIndex = rawText.lastIndexOf('{"reply":');
            if (jsonStartIndex !== -1) {
                const jsonString = rawText.substring(jsonStartIndex);
                const parsed = JSON.parse(jsonString.trim());
                return {
                    text: parsed.reply,
                    title: parsed.title || "Calculated Thought Space"
                };
            }
        } catch (parseErr) {
            console.warn("⚠️ Text fallback mapping engaged. JSON capture missed structured token boundaries.");
        }

        // Fallback string parser if JSON parsing boundaries fail
        const fallbackTitle = userPrompt.split(/[.\n]/)[0].split(' ').slice(0, 5).join(' ') || "Spatial Parameter";
        return {
            text: rawText,
            title: fallbackTitle
        };

    } catch (err) {
        console.error("❌ Core Spatial Processing Matrix Fault:", err);
        return {
            text: "⚠️ The processing engine encountered an operational timeout. Please check your system configuration parameters and try again.",
            title: "Pipeline Halt"
        };
    }
}
/**
 * Handles standard layout map viewport single titles if invoked independently
 */
async function generateFlowTitle(userPrompt) {
    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: MODEL_NAME,
                messages: [{
                    role: "user",
                    content: `Provide a short 3 to 5 word visual mind map title identifying this core topic: "${userPrompt}". Reply ONLY with the direct title string text.`
                }],
                temperature: 0.3
            })
        });

        const data = await response.json();
        return data.choices?.[0]?.message?.content?.trim() || "New Thought Flow";
    } catch (err) {
        console.error("❌ Section Title Generation Fault:", err);
        return "New Thought Flow";
    }
}

module.exports = {
    generateResponse,
    generateFlowTitle
};