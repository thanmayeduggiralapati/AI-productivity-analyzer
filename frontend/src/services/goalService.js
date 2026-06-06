// services/goalService.js
// All goal API calls

import api from './api';

const goalService = {

  // Create goal
    createGoal: async (data) => {
        const res = await api.post('/goals', data);
        return res.data;
    },

  // Get all goals
    getGoals: async () => {
        const res = await api.get('/goals');
        return res.data;
    },

  // Get single goal
    getGoal: async (id) => {
        const res = await api.get(`/goals/${id}`);
        return res.data;
    },

  // Update goal
    updateGoal: async (id, data) => {
        const res = await api.put(`/goals/${id}`, data);
        return res.data;
    },

  // Delete goal
    deleteGoal: async (id) => {
        const res = await api.delete(`/goals/${id}`);
        return res.data;
    },

  // Complete milestone
    completeMilestone: async (goalId, milestoneId) => {
        const res = await api.put(`/goals/${goalId}/milestone/${milestoneId}`);
        return res.data;
    }

};

export default goalService;