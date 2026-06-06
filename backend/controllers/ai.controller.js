// controllers/ai.controller.js
// Handles all Gemini AI features
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { sendSuccess, sendError } = require('../utils/response');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.5-flash',
    generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096,
    }
});

// ─── EXTRACT TASKS FROM JOURNAL ───────────────
// POST /api/ai/extract-tasks
const extractTasksFromJournal = async (req, res) => {
    try {
        const { journalText, userGoal, date } = req.body;
        if (!journalText) {
            return sendError(res, 'Journal text is required', 400);
        }
        const prompt = `
You are an AI productivity assistant. Extract actionable tasks from this journal entry.

Journal Entry:
"${journalText}"

User's Long Term Goal: "${userGoal || 'Not specified'}"

Extract all tasks and return ONLY a valid JSON array like this:
[
    {
    "title": "Task title here",
    "priority": "high/medium/low/urgent",
    "category": "study/work/personal/health/travel/other",
    "goalAligned": true/false,
    "location": "location if travel task, else empty string",
    "estimatedDuration": 30
    }
]

Rules:
- Extract only clear actionable tasks
- Mark goalAligned as true if task helps with the long term goal
- estimatedDuration is in minutes
- Return ONLY the JSON array, no extra text
`;

        const result = await model.generateContent(prompt);
        const response = result.response.text();
        console.log('RAW AI:', response);

    // Clean response and parse JSON
        let cleaned = response
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .replace(/[\x00-\x1F\x7F]/g, '')
        .trim();

        const startIndex = cleaned.indexOf('[');
        const endIndex = cleaned.lastIndexOf(']');
        if (startIndex === -1 || endIndex === -1) {
            return sendSuccess(res, { tasks: [] }, 'No tasks found');
        }
        cleaned = cleaned.substring(startIndex, endIndex + 1);
        let tasks = [];
        try {
            tasks = JSON.parse(cleaned);
        } catch (parseError) {
            console.error('Parse error:', parseError.message);
            return sendSuccess(res, { tasks: [] }, 'Could not parse tasks');
        }
        return sendSuccess(res, { tasks }, 'Tasks extracted');
    } catch (error) {
        console.error('Full ERROR:',error)
        return sendError(res, error.message, 500);
    }
};

// ─── GENERATE GOAL ROADMAP ────────────────────
// POST /api/ai/goal-roadmap
const generateGoalRoadmap = async (req, res) => {
    try {
        const { goal, duration, field } = req.body;
        if (!goal || !duration) {
            return sendError(res, 'Goal and duration are required', 400);
        }
        const prompt = `
        Create a roadmap for this goal. Return ONLY valid JSON, nothing else.
        Goal: "${goal}"
        Duration: "${duration}"
        Field: "${field || 'General'}"
        Return this exact JSON structure:
        {
        "title": "goal title",
        "description": "brief description",
        "phases": [
        {
        "title": "Phase 1 title",
        "description": "phase description",
        "order": 1,
        "milestones": [
        {
        "title": "milestone title",
        "description": "what to achieve",
        "order": 1,
        "dueDate": ""
        }
    ]
}
]
}

Rules:
- Maximum 3 phases
- Maximum 3 milestones per phase
- Keep descriptions short
- Return ONLY the JSON object
`;

        const result = await model.generateContent(prompt);
        const response = result.response.text();
        console.log('ROADMAP RAW:', response);

        let cleaned = response
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .replace(/[\x00-\x1F\x7F]/g, '')
        .trim();

        const startIndex = cleaned.indexOf('{');
        const endIndex = cleaned.lastIndexOf('}');
        cleaned = cleaned.substring(startIndex, endIndex + 1);
        let roadmap;
        try {
            roadmap = JSON.parse(cleaned);
        } catch (parseError) {
            console.error('Parse error:', parseError.message);
            return sendError(res, 'Could not parse roadmap', 500);
        }

        return sendSuccess(res, { roadmap }, 'Roadmap generated');
    } catch (error) {
        return sendError(res, error.message, 500);
    }
};

// ─── AI CHAT ASSISTANT ────────────────────────
// POST /api/ai/chat
const chat = async (req, res) => {
    try {
        const { message, history, userContext } = req.body;
        if (!message) {
            return sendError(res, 'Message is required', 400);
        }
        const systemContext = `
You are an intelligent productivity and study assistant.
User Context: ${userContext || 'Student'}
Be helpful, concise, and encouraging.
Format responses with markdown when helpful.
`;

    // Build conversation history
        const conversationHistory = history || [];
        const fullPrompt = `
${systemContext}

Previous conversation:
${conversationHistory.map(h => `${h.role}: ${h.content}`).join('\n')}

User: ${message}
`;

        const result = await model.generateContent(fullPrompt);
        const response = result.response.text();

        return sendSuccess(res, { response }, 'Response generated');
    } catch (error) {
        return sendError(res, error.message, 500);
    }
};

// ─── GENERATE MOCK TEST ───────────────────────
// POST /api/ai/mock-test
const generateMockTest = async (req, res) => {
    try {
        const { topic, difficulty, numberOfQuestions, source } = req.body;
        console.log('Mock test request:', { topic, difficulty, numberOfQuestions });
        if (!topic) {
            return sendError(res, 'Topic is required', 400);
        }
        const prompt = `
    Generate a mock test on "${topic}".
    Difficulty: ${difficulty || 'medium'}
    Number of questions: ${numberOfQuestions || 5}
    Return ONLY a valid JSON array like this:
    [
        {
        "question": "Question text here?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": "Option A",
        "explanation": "Explanation why this is correct"
        }
    ]

Rules:
- Make questions clear and educational
- Always provide 4 options
- Explanation should be helpful
- Return ONLY the JSON array, no extra text
`;

    console.log('Calling Gemini API...');
    const aiResult = await model.generateContent(prompt);
    console.log('Gemini response received');
    const response = aiResult.response.text();
    console.log('RAW MOCK:', response.substring(0, 200));

    let cleaned = response
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .replace(/[\x00-\x1F\x7F]/g, '')
        .trim();

    const startIndex = cleaned.indexOf('[');
    const endIndex = cleaned.lastIndexOf(']');

    if (startIndex === -1 || endIndex === -1) {
        return sendError(res, 'Could not generate questions', 500);
    }

    cleaned = cleaned.substring(startIndex, endIndex + 1);

    let questions = [];
    try {
        questions = JSON.parse(cleaned);
    } catch (parseError) {
        console.error('Parse error:', parseError.message);
        return sendError(res, 'Could not parse questions', 500);
    }

    return sendSuccess(res, { questions, topic }, 'Mock test generated');
} catch (error) {
    console.error('Mock test error:', error.message);
    return sendError(res, error.message, 500);
}
};
// ─── EXTRACT KEY POINTS ───────────────────────
// POST /api/ai/key-points
const extractKeyPoints = async (req, res) => {
    try {
        const { text, topic } = req.body;
        if (!text && !topic) {
            return sendError(res, 'Text or topic is required', 400);
        }

        const prompt = `
Extract the most important key points from this content.

${topic ? `Topic: "${topic}"` : ''}
${text ? `Content: "${text}"` : ''}

Return ONLY a valid JSON array of strings like this:
[
    "Key point 1",
    "Key point 2",
    "Key point 3"
]

Rules:
- Extract 5-10 most important points
- Each point should be clear and concise
- Return ONLY the JSON array, no extra text
`;

        const result = await model.generateContent(prompt);
        const response = result.response.text();

        let cleaned = response
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .replace(/[\x00-\x1F\x7F]/g, '')
        .trim();

        const startIndex = cleaned.indexOf('[');
        const endIndex = cleaned.lastIndexOf(']');
        if (startIndex === -1 || endIndex === -1) {
            return sendError(res, 'Could not extract key points', 500);
        }
        cleaned = cleaned.substring(startIndex, endIndex + 1);
        let keyPoints = [];
        try {
            keyPoints = JSON.parse(cleaned);
        } catch (parseError) {
            console.error('Parse error:', parseError.message);
            return sendError(res, 'Could not parse key points', 500);
        }

        return sendSuccess(res, { keyPoints }, 'Key points extracted');
    } catch (error) {
        return sendError(res, error.message, 500);
    }
};

// ─── SOLVE DOUBT ──────────────────────────────
// POST /api/ai/solve-doubt
const solveDoubt = async (req, res) => {
    try {
        const { question, subject, context } = req.body;
        console.log('Solving doubt:', question);
        
        if (!question) {
            return sendError(res, 'Question is required', 400);
        }
        const prompt = `
        You are a helpful study assistant. Answer this doubt clearly.
        Subject: ${subject || 'General'}
        Question: "${question}"
        ${context ? `Context: "${context}"` : ''}
        
        Provide a clear, educational answer with examples if needed.
        Use markdown formatting for better readability.
        `;
        const result = await model.generateContent(prompt);
        console.log('Got response from Gemini');
        const response = result.response.text();
        
        return sendSuccess(res, { answer: response }, 'Doubt solved');
    } catch (error) {
        console.error('Solve doubt error:', error.message);
        return sendError(res, error.message, 500);
    }
};
module.exports = {
    extractTasksFromJournal,
    generateGoalRoadmap,
    chat,
    generateMockTest,
    extractKeyPoints,
    solveDoubt
};