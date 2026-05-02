const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const Groq = require('groq-sdk');


const authRoutes = require("./routes/auth");
const flowRoutes = require("./routes/flows");


dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
app.use(express.json());

// --- 1. UPDATED CORS ---
// We must allow the "Authorization" header so the frontend can send the JWT token
app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"] 
}));

// --- 2. MONGODB CONNECTION ---
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch((err) => console.error("❌ MongoDB Connection Error:", err));

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// --- 3. ROUTE REGISTRATION ---
app.use("/api/auth", authRoutes);
app.use("/api/flows", flowRoutes);

// --- 4. GROQ AI ENDPOINT ---
app.post("/api/generate", async (req, res) => {
    const { prompt, history } = req.body;

    try {
        // Formats history for Groq (Llama-3)
        const formattedHistory = (history || []).map(msg => ({
            role: (msg.role === 'model' || msg.role === 'assistant') ? 'assistant' : 'user',
            content: msg.content,
        }));
        
        const messages = [
            ...formattedHistory,
            { role: "user", content: prompt }
        ];

        const chatCompletion = await groq.chat.completions.create({
            messages: messages,
            model: "llama-3.3-70b-versatile",
        });

        const text = chatCompletion.choices[0]?.message?.content || "";
        res.json({ text });
        
    } catch (error) {
        console.error("Groq Error:", error);
        res.status(500).json({ error: "Failed to generate response from Groq." });
    }
});

app.listen(4000, () => {
    console.log("Backend listening on http://localhost:4000");
});