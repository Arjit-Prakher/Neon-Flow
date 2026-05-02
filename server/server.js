const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const Groq = require('groq-sdk');

// 1. CRITICAL: Load environment variables FIRST
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// 2. Initialize the app
const app = express();

// 3. Import routes AFTER dotenv has loaded the secrets[cite: 1]
const authRoutes = require("./routes/auth");
const flowRoutes = require("./routes/flows");
const paymentRoutes = require("./routes/payment"); 

app.use(express.json());

// --- 1. UPDATED CORS ---
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
app.use("/api/payment", paymentRoutes); // Now 'app' is defined and keys are ready[cite: 1]

// --- 4. GROQ AI ENDPOINT ---
app.post("/api/generate", async (req, res) => {
    const { prompt, history } = req.body;
    try {
        const formattedHistory = (history || []).map(msg => ({
            role: (msg.role === 'model' || msg.role === 'assistant') ? 'assistant' : 'user',
            content: msg.content,
        }));
        
        const messages = [...formattedHistory, { role: "user", content: prompt }];
        const chatCompletion = await groq.chat.completions.create({
            messages: messages,
            model: "llama-3.3-70b-versatile",
        });

        res.json({ text: chatCompletion.choices[0]?.message?.content || "" });
    } catch (error) {
        console.error("Groq Error:", error);
        res.status(500).json({ error: "Failed to generate response." });
    }
});

app.listen(4000, () => {
    console.log("🚀 Backend listening on http://localhost:4000");
});