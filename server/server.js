// PROJECT: Neon Flow
// AUTHOR: Arjit Prakher
// MCA ROLL NO: AJU/241367
// INSTITUTION: Arka Jain University
// DATE: 06/10/2026

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });
const { generateResponse, generateFlowTitle } = require('./utils/openRouterLLM');


const app = express();

const authRoutes = require("./routes/auth");
const flowRoutes = require("./routes/flows");

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use(cors({
    // origin: "http://localhost:5173",
    origin: "https://neon-flow-phi.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch((err) => console.error("❌ MongoDB Connection Error:", err));

app.use("/api/auth", authRoutes);
app.use("/api/flows", flowRoutes);

app.post("/api/generate", async (req, res) => {
    const { prompt, history, options } = req.body;
    const attachments = options?.attachments || [];
    try {
        const aiData = await generateResponse(prompt, history, attachments);
        res.json(aiData);
    } catch (error) {
        console.error("Server /api/generate Error:", error);
        res.status(500).json({ error: "Failed to generate response." });
    }
});

app.post("/api/title", async (req, res) => {
    const { query } = req.body;
    try {
        const titleText = await generateFlowTitle(query);
        res.json({ title: titleText });
    } catch (error) {
        console.error("Server /api/title Error:", error);
        res.status(500).json({ title: "New Visual Graph" });
    }
});

app.listen(4000, () => {
    console.log("🚀 Neon Flow Engine listening on https://neon-flow.onrender.com");
});