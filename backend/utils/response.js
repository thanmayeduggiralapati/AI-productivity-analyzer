// utils/response.js
// This makes all API responses look the same format

// When something works fine
const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data
    });
};

// When something goes wrong
const sendError = (res, message = 'Something went wrong', statusCode = 400) => {
    return res.status(statusCode).json({
        success: false,
        message,
        data: null
    });
};

module.exports = { sendSuccess, sendError };