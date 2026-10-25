import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../utils/api';

// ================================
// Admin Panel URL (env variable se)
// ================================
const ADMIN_PANEL_URL = process.env.REACT_APP_ADMIN_PANEL_URL || 'http://localhost:3001';

// ================================
// Create Auth Context
// ================================
const AuthContext = createContext();

// ================================
// Auth Provider (Wrapper)
// ================================
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // Page load par localStorage se user load karo
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

    // Login function
    const login = (userData, userToken) => {
        setUser(userData);
        setToken(userToken);
        localStorage.setItem('winzopay_token', userToken);
        localStorage.setItem('winzopay_user', JSON.stringify(userData));
    };

    // Logout function
    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('winzopay_token');
        localStorage.removeItem('winzopay_user');
    };

    // ================================
    // 🔥 refreshUser — polls /auth/me
    // Reflects role/status change immediately
    // ================================
    const refreshUser = useCallback(async () => {
        const storedToken = localStorage.getItem('winzopay_token');
        if (!storedToken) return;

        try {
            const res = await api.get('/auth/me');
            const freshUser = res.data.user;

            // 🔥 User became Admin → kick out from user panel
            if (freshUser.role === 'Admin') {
                logout();
                // Redirect to Admin Panel (full URL, works on Vercel)
                window.location.href = `${ADMIN_PANEL_URL}/login`;
                return;
            }

            // 🔥 Frozen / Deactivated → logout
            if (freshUser.status === 'Frozen' || freshUser.status === 'Deactivated') {
                logout();
                window.location.href = '/login';
                return;
            }

            // Normal sync (balance, name, etc. update ho jayenge)
            setUser(freshUser);
            localStorage.setItem('winzopay_user', JSON.stringify(freshUser));

        } catch (err) {
            if (err.response?.status === 401 || err.response?.status === 403) {
                logout();
            }
        }
    }, []);

    // Poll /auth/me every 20 seconds
    useEffect(() => {
        if (!token) return;

        refreshUser();
        const interval = setInterval(refreshUser, 20000);
        return () => clearInterval(interval);
    }, [token, refreshUser]);

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

// ================================
// Custom Hook: useAuth
// ================================
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export default AuthContext;