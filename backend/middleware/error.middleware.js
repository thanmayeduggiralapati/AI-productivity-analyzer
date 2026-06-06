// middleware/error.middleware.js
// This catches ALL errors in the app automatically
// Instead of writing error handling in every route, 
// we handle it all in one place here

const errorHandler = (err, req, res, next) => {
    console.error('Error:', err.message);
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    
    res.status(statusCode).json({
        success: false,
        message,
        // Only show detailed error in development, not in production
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

// Custom error class
// Use this when you want to throw an error with a specific status code
// Example: throw new AppError('User not found', 404)
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

module.exports = { errorHandler, AppError };

