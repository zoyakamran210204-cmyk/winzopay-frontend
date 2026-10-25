import React, { createContext, useState, useContext, useEffect } from 'react';

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
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
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

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout }}>
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