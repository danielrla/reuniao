import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8081/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

import { auth } from '../lib/firebase';

// Intercept requests to dynamically attach the latest Firebase JWT
api.interceptors.request.use(
    async (config) => {
        if (auth.currentUser) {
            const token = await auth.currentUser.getIdToken();
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            // Fallback for extreme cases or local dev bypasses if strictly needed
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.data?.message || error.message);
        return Promise.reject(error);
    }
);

export default api;
