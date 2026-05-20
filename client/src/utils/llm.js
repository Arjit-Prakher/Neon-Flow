export async function generateResponse(prompt, history = []) { // 1. Accept history
    try {
        const res = await fetch("http://localhost:4000/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            // 2. Send both to the server
            body: JSON.stringify({ prompt, history }),
        });
        const data = await res.json();
        return data.text;
    } catch (error) {
        console.error("Frontend LLM Error:", error);
        return "Sorry, something went wrong.";
    }
}


export async function generateFlowTitle(query) {
    const titlePrompt = `Generate a concise 3-6 word title for this query: "${query}"`;
    return await generateResponse(titlePrompt);
}
