// services/noteService.js
// All notes API calls

import api from './api';

const noteService = {

  // Create note
    createNote: async (data) => {
        const res = await api.post('/notes', data);
        return res.data;
    },

  // Get all notes
    getNotes: async (category, subject) => {
        const params = {};
        if (category) params.category = category;
        if (subject) params.subject = subject;
        const res = await api.get('/notes', { params });
        return res.data;
    },

  // Get single note
    getNote: async (id) => {
        const res = await api.get(`/notes/${id}`);
        return res.data;
    },

  // Update note
    updateNote: async (id, data) => {
        const res = await api.put(`/notes/${id}`, data);
        return res.data;
    },

  // Delete note
    deleteNote: async (id) => {
        const res = await api.delete(`/notes/${id}`);
        return res.data;
    },

  // Save AI key points
    saveKeyPoints: async (id, keyPoints) => {
        const res = await api.put(`/notes/${id}/keypoints`, { keyPoints });
        return res.data;
    },

  // Toggle pin
    togglePin: async (id) => {
        const res = await api.put(`/notes/${id}/pin`);
        return res.data;
    }

};

export default noteService;