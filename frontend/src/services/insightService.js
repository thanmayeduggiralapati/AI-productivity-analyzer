// services/insightService.js
// All insights API calls

import api from './api';

const insightService = {

  // Get dashboard insights
    getDashboard: async () => {
        const res = await api.get('/insights/dashboard');
        return res.data;
    },

  // Get weekly insights
    getWeekly: async () => {
        const res = await api.get('/insights/weekly');
        return res.data;
    },

  // Get productivity trends
    getTrends: async () => {
        const res = await api.get('/insights/trends');
        return res.data;
    },

  // Get habit drift
    getHabitDrift: async () => {
        const res = await api.get('/insights/habit-drift');
        return res.data;
    }

};

export default insightService;