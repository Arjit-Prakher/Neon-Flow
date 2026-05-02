const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true }, // store hashed password
    isPro: { type: Boolean, default: false },
    razorpay_order_id: { type: String },
    razorpay_payment_id: { type: String },
    flows: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Flow' }]
}, { timestamps: true }); // adds createdAt and updatedAt automatically

module.exports = mongoose.model('User', UserSchema);