const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // 1. Get token from the 'Authorization' header
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) return res.status(401).json({ message: "No token, authorization denied" });

    try {
        // 2. Verify if the wristband is real
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 3. Attach the User ID to the request so the next function knows who is asking
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: "Token is not valid" });
    }
};

module.exports = authMiddleware;