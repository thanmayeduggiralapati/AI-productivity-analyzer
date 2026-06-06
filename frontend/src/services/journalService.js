// services/journalService.js
// All journal API calls

import api from './api';

const journalService = {

  // Create or update journal
    saveJournal: async (data) => {
        const res = await api.post('/journal', data);
        return res.data;
    },

  // Get today's journal
    getTodayJournal: async () => {
        const res = await api.get('/journal/today');
        return res.data;
    },

  // Get journal history
    getHistory: async () => {
        const res = await api.get('/journal/history');
        return res.data;
    },

  // Get journal by date
    getByDate: async (date) => {
        const res = await api.get(`/journal/${date}`);
        return res.data;
    },

  // Save AI extracted tasks
    saveExtractedTasks: async (date, tasks) => {
        const res = await api.post('/journal/save-tasks', { date, tasks });
        return res.data;
    },

  // Get streak
    getStreak: async () => {
        const res = await api.get('/journal/streak');
        return res.data;
    }

};

export default journalService;