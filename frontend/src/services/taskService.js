// services/taskService.js
// All task API calls

import api from './api';

const taskService = {

  // Create task
    createTask: async (taskData) => {
        const res = await api.post('/tasks', taskData);
        return res.data;
    },

  // Get all tasks
    getTasks: async (date, status, category) => {
        const params = {};
        if (date) params.date = date;
        if (status) params.status = status;
        if (category) params.category = category;
        const res = await api.get('/tasks', { params });
        return res.data;
    },

  // Get single task
    getTask: async (id) => {
        const res = await api.get(`/tasks/${id}`);
        return res.data;
    },

  // Update task
    updateTask: async (id, data) => {
        const res = await api.put(`/tasks/${id}`, data);
        return res.data;
    },

  // Delete task
    deleteTask: async (id) => {
        const res = await api.delete(`/tasks/${id}`);
        return res.data;
    },

  // Mark task complete
    markDone: async (id) => {
        const res = await api.put(`/tasks/${id}/done`);
        return res.data;
    },

  // Carry forward task
    carryForward: async (id, newDate) => {
        const res = await api.put(`/tasks/${id}/carry`, { newDate });
        return res.data;
    },

  // Skip task
    skipTask: async (id) => {
        const res = await api.put(`/tasks/${id}/skip`);
        return res.data;
    },

  // Get task history
    getHistory: async () => {
        const res = await api.get('/tasks/history');
        return res.data;
    }

};

export default taskService;