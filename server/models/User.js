const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    flows: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Flow' }]
}, { timestamps: true }); 

// This work belongs to Arjit Prakher

module.exports = mongoose.model('User', UserSchema);