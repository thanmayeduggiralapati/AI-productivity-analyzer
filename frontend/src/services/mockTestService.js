// services/mockTestService.js
// All mock test API calls

import api from './api';

const mockTestService = {

  // Create mock test
    createMockTest: async (data) => {
        const res = await api.post('/mocktests', data);
        return res.data;
    },

  // Get all mock tests
    getMockTests: async () => {
        const res = await api.get('/mocktests');
        return res.data;
    },

  // Get single mock test
    getMockTest: async (id) => {
        const res = await api.get(`/mocktests/${id}`);
        return res.data;
    },

  // Submit mock test
    submitMockTest: async (id, answers, timeTaken) => {
        const res = await api.put(`/mocktests/${id}/submit`, {
            answers,
            timeTaken
        });
        return res.data;
    },

  // Get mistakes
    getMistakes: async () => {
        const res = await api.get('/mocktests/mistakes');
        return res.data;
    },

  // Delete mock test
    deleteMockTest: async (id) => {
        const res = await api.delete(`/mocktests/${id}`);
        return res.data;
    }

};

export default mockTestService;