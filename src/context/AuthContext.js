import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../utils/api';

// Admin Panel URL
const ADMIN_PANEL_URL = process.env.REACT_APP_ADMIN_PANEL_URL || 'https://winzopay-admin.vercel.app';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedToken = localStorage.getItem('winzopay_token');
        const savedUser = localStorage.getItem('winzopay_user');

        if (savedToken && savedUser) {
            try {
                setToken(savedToken);
                setUser(JSON.parse(savedUser));
            } catch (err) {
                localStorage.removeItem('winzopay_token');
                localStorage.removeItem('winzopay_user');
            }
        }
        setLoading(false);
    }, []);

    const login = (userData, userToken) => {
        setUser(userData);
        setToken(userToken);
        localStorage.setItem('winzopay_token', userToken);
        localStorage.setItem('winzopay_user', JSON.stringify(userData));
    };

    // 🔥 FIXED LOGOUT
    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('winzopay_token');
        localStorage.removeItem('winzopay_user');
        window.location.href = '/'; // Force redirect to login page
    };

    // 🔥 Polling function
    const refreshUser = useCallback(async () => {
        const storedToken = localStorage.getItem('winzopay_token');
        if (!storedToken) return;

        try {
            const res = await api.get('/auth/me');
            const freshUser = res.data.user;

            // Instant redirect if promoted to Admin
            if (freshUser.role === 'Admin') {
                logout();
                window.location.href = `${ADMIN_PANEL_URL}/`; 
                return;
            }

            if (freshUser.status === 'Frozen' || freshUser.status === 'Deactivated') {
                logout();
                window.location.href = '/';
                return;
            }

            setUser(freshUser);
            localStorage.setItem('winzopay_user', JSON.stringify(freshUser));
        } catch (err) {
            if (err.response?.status === 401 || err.response?.status === 403) {
                logout();
            }
        }
    }, []);

    // 🔥 Polling har 3 second mein
    useEffect(() => {
        if (!token) return;
        refreshUser();
        const interval = setInterval(refreshUser, 3000); 
        return () => clearInterval(interval);
    }, [token, refreshUser]);

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

export default AuthContext;