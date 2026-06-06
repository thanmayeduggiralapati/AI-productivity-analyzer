// services/authService.js
// All authentication API calls

import api from './api';

const authService = {

  // Register new user
    register: async (name, email, password) => {
        const res = await api.post('/auth/register', { name, email, password });
        return res.data;
    },

  // Login user
    login: async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        return res.data;
    },

  // Get profile
    getProfile: async () => {
        const res = await api.get('/auth/profile');
        return res.data;
    },

  // Update profile
    updateProfile: async (data) => {
        const res = await api.put('/auth/profile', data);
        return res.data;
    },

  // Complete onboarding
    completeOnboarding: async (data) => {
        const res = await api.post('/auth/onboarding', data);
        return res.data;
    }

};

export default authService;