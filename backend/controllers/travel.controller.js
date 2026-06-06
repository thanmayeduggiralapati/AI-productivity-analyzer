// controllers/travel.controller.js
// Handles travel task extraction and departure time calculation

const { sendSuccess, sendError } = require('../utils/response');
const Task = require('../models/Task');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.5-flash',
    generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
    }
});

// ─── GET TRAVEL TASKS ─────────────────────────
// GET /api/travel
const getTravelTasks = async (req, res) => {
    try {
        const { date } = req.query;
        const today = date || new Date().toISOString().split('T')[0];
        const travelTasks = await Task.find({
            user: req.userId,
            scheduledDate: today,
            category: 'travel'
        }).sort({ departureTime: 1 });
        return sendSuccess(res, { travelTasks }, 'Travel tasks fetched');
    } catch (error) {
        return sendError(res, error.message, 500);
    }
};

// ─── CALCULATE DEPARTURE TIME ─────────────────
// POST /api/travel/departure
const calculateDepartureTime = async (req, res) => {
    try {
        const {
            destination,
            arrivalTime,
            travelMode
        } = req.body;
        if (!destination || !arrivalTime) {
            return sendError(res, 'Destination and arrival time are required', 400);
        }
        const prompt = 
    `Calculate realistic departure time for this travel task.
    Destination: "${destination}"
    Required Arrival Time: "${arrivalTime}"
    Travel Mode: "${travelMode || 'driving'}"
    Return ONLY a valid JSON object like this:
    {
        "departureTime": "08:30",
        "estimatedDuration": 30,
        "tips": "Leave early to avoid traffic"
    }
    Rules:
    - departureTime should be in HH:MM format
    - estimatedDuration is in minutes
    - Give practical travel tips
    - Return ONLY the JSON object, no extra text`;

        const result = await model.generateContent(prompt);
        const response = result.response.text();

        let cleaned = response
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .replace(/[\x00-\x1F\x7F]/g, '')
        .trim();

        const startIndex = cleaned.indexOf('{');
        const endIndex = cleaned.lastIndexOf('}');
        cleaned = cleaned.substring(startIndex, endIndex + 1);
        const data = JSON.parse(cleaned);

        return sendSuccess(res, data, 'Departure time calculated');
    } catch (error) {
        return sendError(res, error.message, 500);
    }
};

// ─── EXTRACT TRAVEL FROM JOURNAL ──────────────
// POST /api/travel/extract
const extractTravelFromJournal = async (req, res) => {
    try {
        const { journalText, date } = req.body;
        if (!journalText) {
            return sendError(res, 'Journal text is required', 400);
        }

        const prompt = `
    Extract travel tasks from this journal entry.

    Journal: "${journalText}"
    Date: "${date}"

    Return ONLY a valid JSON array like this:
    [
        {
            "title": "Travel to college",
            "location": "College",
            "arrivalTime": "09:00",
            "travelMode": "driving",
            "departureTime": "08:30"
        }
    ]

    Rules:
    - Only extract tasks that involve going somewhere
    - If no travel tasks found return empty array []
    - Return ONLY the JSON array, no extra text
    `;

        const result = await model.generateContent(prompt);
        const response = result.response.text();

    // Log raw response for debugging
        console.log('AI Raw Response:', response);

    // Clean response
        let cleaned = response
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .replace(/[\x00-\x1F\x7F]/g, '')
        .trim();

    // Extract JSON array
        const startIndex = cleaned.indexOf('[');
        const endIndex = cleaned.lastIndexOf(']');

        if (startIndex === -1 || endIndex === -1) {
            return sendSuccess(res, { travelTasks: [] }, 'No travel tasks found');
        }

        cleaned = cleaned.substring(startIndex, endIndex + 1);

    // Parse JSON safely
        let travelTasks = [];
        try {
            travelTasks = JSON.parse(cleaned);
        } catch (parseError) {
            console.error('Parse error:', parseError.message);
            return sendSuccess(res, { travelTasks: [] }, 'No travel tasks found');
        }

    // Save extracted travel tasks to database
        if (travelTasks.length > 0) {
            const taskDocs = travelTasks.map(task => ({
                user: req.userId,
                title: task.title,
                category: 'travel',
                scheduledDate: date,
                location: task.location,
                travelMode: task.travelMode,
                departureTime: task.departureTime,
                extractedFromJournal: true,
                priority: 'medium'
            }));
            await Task.insertMany(taskDocs);
        }
        return sendSuccess(res, { travelTasks }, 'Travel tasks extracted');
    } catch (error) {
        return sendError(res, error.message, 500);
    }
};

module.exports = {
    getTravelTasks,
    calculateDepartureTime,
    extractTravelFromJournal
};