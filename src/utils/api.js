import axios from 'axios';

// ================================
// Permanent Backend URL
// ================================
const API_URL = 'https://winzopay-backend.vercel.app/api';

// Axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// ================================
// Auto attach JWT token (agar login hai)
// ================================
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('winzopay_token'); // Admin panel mein 'admin_token' hoga
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ================================
// API Functions
// ================================

export const registerUser = async (userData) => {
    try {
        const response = await api.post('/auth/register', userData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Network error' };
    }
};

export const loginUser = async (credentials) => {
    try {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Network error' };
    }
};

export const getCryptoRates = async () => {
    try {
        const response = await api.get('/auth/crypto-rates');
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Network error' };
    }
};

export const getMe = async () => {
    try {
        const response = await api.get('/auth/me');
        return response.data.user;
    } catch (error) {
        throw error.response?.data || { message: 'Network error' };
    }
};

export default api;