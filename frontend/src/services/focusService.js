// services/focusService.js
// All focus session API calls

import api from './api';

const focusService = {

  // Start focus session
    startSession: async (duration, subject, musicPlayed) => {
        const res = await api.post('/focus/start', {
            duration,
            subject,
            musicPlayed
        });
        return res.data;
    },

  // Get active session
    getActiveSession: async () => {
        const res = await api.get('/focus/active');
        return res.data;
    },

  // Update timer state
    updateTimer: async (id, timeRemaining, isRunning) => {
        const res = await api.put(`/focus/${id}/timer`, {
            timeRemaining,
            isRunning
        });
        return res.data;
    },

  // Complete session
    completeSession: async (id, actualDuration, sessionNotes, distractionsCount) => {
        const res = await api.put(`/focus/${id}/complete`, {
            actualDuration,
            sessionNotes,
            distractionsCount
        });
        return res.data;
    },

  // Abandon session
    abandonSession: async (id) => {
        const res = await api.put(`/focus/${id}/abandon`);
        return res.data;
    },

  // Get session history
    getHistory: async () => {
        const res = await api.get('/focus/history');
        return res.data;
    },

  // Add doubt
    addDoubt: async (id, question, answer) => {
        const res = await api.post(`/focus/${id}/doubt`, {
            question,
            answer
        });
        return res.data;
    
    }

};

export default focusService;