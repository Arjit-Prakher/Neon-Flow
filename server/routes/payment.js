const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User'); // Removed .js extension to match require style
const auth = require('../middleware/auth');

const router = express.Router();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 1. Create an Order
router.post('/create-order', auth, async (req, res) => {
    const options = {
        amount: 50000, // Amount in paise (₹500)
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
    };
    try {
        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (err) {
        console.error("Razorpay Order Error:", err);
        res.status(500).send(err);
    }
});

// 2. Verify Payment Signature
router.post('/verify', auth, async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(sign.toString())
        .digest("hex");

    if (razorpay_signature === expectedSign) {
        try {
            // Upgrade user to PRO in MongoDB
            await User.findByIdAndUpdate(req.user.id, { 
                isPro: true, 
                razorpay_order_id, 
                razorpay_payment_id 
            });
            return res.json({ message: "Payment verified successfully! You are now a Pro user." });
        } catch (dbErr) {
            return res.status(500).json({ message: "Payment verified, but failed to update user profile." });
        }
    } else {
        return res.status(400).json({ message: "Invalid signature!" });
    }
});

module.exports = router; // Match the require style