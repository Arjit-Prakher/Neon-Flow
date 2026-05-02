const mongoose = require('mongoose');

// const FlowSchema = new mongoose.Schema({
//     userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//     title: { type: String, default: "New Flow" },
//     nodes: { type: Array, required: true }, // Stores position, data, and type
//     edges: { type: Array, required: true }, // Stores connections
//     messages: { type: Array, default: [] }, // Stores the global chat history[cite: 3]
//     updatedAt: { type: Date, default: Date.now }
// });

const FlowSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, default: "New Flow" },
    nodes: { type: Array, required: true },
    edges: { type: Array, required: true },
    messages: { type: Array, default: [] }
}, { timestamps: true });

module.exports = mongoose.model('Flow', FlowSchema);