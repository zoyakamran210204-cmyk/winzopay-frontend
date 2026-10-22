import axios from 'axios';

// ================================
// Backend URL (localhost)
// ================================
const API_URL = 'http://localhost:5000/api';

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
        const token = localStorage.getItem('winzopay_token');
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

// Register user
export const registerUser = async (userData) => {
    try {
        const response = await api.post('/auth/register', userData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Network error' };
    }
};

// Login user
export const loginUser = async (credentials) => {
    try {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Network error' };
    }
};

// Get crypto rates (BRL)
export const getCryptoRates = async () => {
    try {
        const response = await api.get('/auth/crypto-rates');
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Network error' };
    }
};

export default api;