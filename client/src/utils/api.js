export async function generateResponse(prompt, history = [], options = {}) {
    try {
        const res = await fetch("http://localhost:4000/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt, history, options }),
        });

        const data = await res.json();
        if (!res.ok) {
            return data.error || "An error occurred while generating a response.";
        }

        if (options && options.withTitle) return data;
        return data.text ?? "No response generated.";
    } catch (error) {
        console.error("Frontend LLM Error:", error);
        return "Sorry, something went wrong connecting to the workspace engine.";
    }
}

export async function generateFlowTitle(query) {
    try {
        const res = await fetch("http://localhost:4000/api/title", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query }),
        });
        const data = await res.json();
        return data.title || "New Visual Graph";
    } catch (error) {
        console.error("Frontend Title Error:", error);
        return "New Visual Graph";
    }
}