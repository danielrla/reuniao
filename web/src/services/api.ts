import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8081/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Mock interceptor for now. Later this will integrate directly with Firebase getIdToken()
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token') || 'MOCK_TOKEN';
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
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
