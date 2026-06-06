// services/aiService.js
// All Gemini AI API calls

import api from './api';

const aiService = {

  // Extract tasks from journal text
    extractTasks: async (journalText, userGoal, date) => {
        const res = await api.post('/ai/extract-tasks', {
            journalText,
            userGoal,
            date
        });
        return res.data;
    },

  // Generate goal roadmap
    generateRoadmap: async (goal, duration, field) => {
        const res = await api.post('/ai/goal-roadmap', {
            goal,
            duration,
            field
        });
        return res.data;
    },

  // Chat with AI assistant
    chat: async (message, history, userContext) => {
        const res = await api.post('/ai/chat', {
            message,
            history,
            userContext
        });
        return res.data;
    },

  // Generate mock test
    generateMockTest: async (topic, difficulty, numberOfQuestions, source) => {
        const res = await api.post('/ai/mock-test', {
            topic,
            difficulty,
            numberOfQuestions,
            source
        });
        return res.data;
    },

  // Extract key points
    extractKeyPoints: async (text, topic) => {
        const res = await api.post('/ai/key-points', {
            text,
            topic
        });
        return res.data;
    },

  // Solve doubt
    solveDoubt: async (question, subject, context) => {
        const res = await api.post('/ai/solve-doubt', {
            question,
            subject,
            context
        });
        return res.data;
    }
};

export default aiService;