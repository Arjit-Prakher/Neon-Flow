const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// // Signup route
// router.post('/signup', async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         const existingUser = await User.findOne({ email });
//         if (existingUser) return res.status(400).json({ message: "User already exists." });

//         const newUser = new User({ email, password });
//         await newUser.save();

//         res.status(201).json({ message: "User created successfully! Please login." });
//     } catch (error) {
//         res.status(500).json({ message: "Server error during signup" });
//     }
// });

// // Login route
// router.post('/login', async (req, res) => {
//     try {
//         const { email, password } = req.body;
//         const user = await User.findOne({ email });
//         if (!user) return res.status(400).json({ message: "User not found" });

//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

//         const token = jwt.sign(
//             { id: user._id },
//             process.env.JWT_SECRET,
//             { expiresIn: '24h' }
//         );

//         res.json({
//             token,
//             user: { id: user._id, email: user.email }
//         });
//     } catch (error) {
//         res.status(500).json({ message: "Server error during login" });
//     }
// })

// SIGNUP
router.post('/signup', async (req, res) => {
    try {
        const { email, password } = req.body;
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ message: "User already exists" });

        const hash = await bcrypt.hash(password, 10);
        const user = new User({ email, passwordHash: hash });
        await user.save();

        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1d" });

        res.json({ token, user: { id: user._id, email: user.email } });
    } catch (err) {
        res.status(500).json({ message: "Signup failed" });
    }
});

// LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const match = await bcrypt.compare(password, user.passwordHash);
        if (!match) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1d" });

        res.json({ token, user: { id: user._id, email: user.email } });
    } catch (err) {
        res.status(500).json({ message: "Login failed" });
    }
});

module.exports = router;