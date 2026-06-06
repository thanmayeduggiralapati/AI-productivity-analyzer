// middleware/auth.js
// This protects routes that need login
// It checks if the user has a valid JWT token

const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/response');

const protect = async (req, res, next) => {
    try {
    // Step 1 - Check if token exists in request header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return sendError(res, 'Not authorized. Please login.', 401);
        }

    // Step 2 - Extract token from "Bearer tokenvalue"
        const token = authHeader.split(' ')[1];

    // Step 3 - Verify token is valid and not expired
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Step 4 - Attach user id to request so routes can use it
        req.userId = decoded.id;

    // Step 5 - Move to next function
        next();
    } catch (error) {
        return sendError(res, 'Not authorized. Invalid token.', 401);
    }
};

module.exports = { protect };
