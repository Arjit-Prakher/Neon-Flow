export async function generateResponse(prompt, history = [], options = {}) { // 1. Accept history
    try {
        const res = await fetch("http://localhost:4000/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            // 2. Send both to the server
            body: JSON.stringify({ prompt, history, options }),
        });
        const data = await res.json();
        // Backwards compatibility: return plain text when caller didn't request a title
        if (options && options.withTitle) return data; 
        return data.text ?? data;
    } catch (error) {
        console.error("Frontend LLM Error:", error);
        return { text: "Sorry, something went wrong.", title: undefined };
    }
}


export async function generateFlowTitle(query) {
    // Request a title-only generation to keep compatibility with callers.
    const result = await generateResponse(query, [], { withTitle: true });
    return result.title || "New Visual Graph";
}
