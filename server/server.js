// ```
// PROJECT: Neon Flow
// AUTHOR: Arjit Prakher
// MCA ROLL NO: AJU/241367
// INSTITUTION: Arka Jain University
// DATE: 06/05/2026
// DISCLAIMER: This code is the intellectual property of the author.
// ```

// const express = require('express');
// const dotenv = require('dotenv');
// const cors = require('cors');
// const mongoose = require('mongoose');
// const path = require('path');
// const Groq = require('groq-sdk');

// dotenv.config({ path: path.join(__dirname, '..', '.env') });

// const app = express();

// const authRoutes = require("./routes/auth");
// const flowRoutes = require("./routes/flows");
// // const paymentRoutes = require("./routes/payment"); 

// app.use(express.json());


// app.use(cors({
//     origin: "http://localhost:5173",
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     allowedHeaders: ["Content-Type", "Authorization"] 
// }));


// mongoose.connect(process.env.MONGODB_URI)
//     .then(() => console.log("✅ Connected to MongoDB"))
//     .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });


// app.use("/api/auth", authRoutes);
// app.use("/api/flows", flowRoutes);
// // app.use("/api/payment", paymentRoutes);

// app.post("/api/generate", async (req, res) => {
//     const { prompt, history } = req.body;
//     try {
//         const formattedHistory = (history || []).map(msg => ({
//             role: (msg.role === 'model' || msg.role === 'assistant') ? 'assistant' : 'user',
//             content: msg.content,
//         }));
        
//         const messages = [...formattedHistory, { role: "user", content: prompt }];
//         const chatCompletion = await groq.chat.completions.create({
//             messages: messages,
//             model: "llama-3.3-70b-versatile",
//         });

//         res.json({ text: chatCompletion.choices[0]?.message?.content || "" });
//     } catch (error) {
//         console.error("Groq Error:", error);
//         res.status(500).json({ error: "Failed to generate response." });
//     }
// });

// app.listen(4000, () => {
//     console.log("🚀 Backend listening on http://localhost:4000");
// });

// PROJECT: Neon Flow
// AUTHOR: Arjit Prakher
// MCA ROLL NO: AJU/241367
// INSTITUTION: Arka Jain University
// DATE: 06/08/2026

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

// Pull Gemini execution helpers from our utility library
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { generateResponse } = require('./utils/llm');


const app = express();

const authRoutes = require("./routes/auth");
const flowRoutes = require("./routes/flows");

app.use(express.json());

app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"] 
}));

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch((err) => console.error("❌ MongoDB Connection Error:", err));

app.use("/api/auth", authRoutes);
app.use("/api/flows", flowRoutes);

// Streamlined generation route utilizing our fine-tuned Gemini utilities
app.post("/api/generate", async (req, res) => {
    const { prompt, history, options } = req.body;
    try {
        // Execute the conversational prompt generation tracking canvas history
        const result = await generateResponse(prompt, history, options || {});
        // result is { text, title? }
        res.json(result);
    } catch (error) {
        console.error("Generation Controller Route Error:", error);
        res.status(500).json({ error: "Failed to generate context from Gemini Engine." });
    }
});

app.listen(4000, () => {
    console.log("🚀 Backend listening on http://localhost:4000");
});