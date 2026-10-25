import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import DepositPage from './pages/DepositPage';
import BuyRPPage from './pages/BuyRPPage';
import MiningPage from './pages/MiningPage';
import SellRPPage from './pages/SellRPPage';
import WithdrawPage from './pages/WithdrawPage';
import LedgerPage from './pages/LedgerPage';
import ProfilePage from './pages/ProfilePage';
import { useAuth } from './context/AuthContext'; // 👈 AuthContext import kiya

import BottomNav from './components/BottomNav'; 
import LiveSupport from './components/LiveSupport';

// 🔥 Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    
    if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;
    if (!user) return <Navigate to="/" />;
    
    return children;
};

function AppLayout() {
    const location = useLocation();
    const { user } = useAuth(); // 👈 Check if logged in
    
    const isAuthPage = location.pathname === '/';

    // Agar user login hai aur login page par aaya hai, toh seedha dashboard bhej do
    if (user && isAuthPage) {
        return <Navigate to="/dashboard" />;
    }

    return (
        <div>
            <Routes>
                <Route path="/" element={<AuthPage />} />
                
                {/* 🔥 Protected Routes */}
                <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/deposit" element={<ProtectedRoute><DepositPage /></ProtectedRoute>} />
                <Route path="/buy-rp" element={<ProtectedRoute><BuyRPPage /></ProtectedRoute>} />
                <Route path="/mining" element={<ProtectedRoute><MiningPage /></ProtectedRoute>} />
                <Route path="/sell-rp" element={<ProtectedRoute><SellRPPage /></ProtectedRoute>} />
                <Route path="/withdraw" element={<ProtectedRoute><WithdrawPage /></ProtectedRoute>} />
                <Route path="/ledger" element={<ProtectedRoute><LedgerPage /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
               
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>

            {/* 👈 Live Support Add kiya */}
            {!isAuthPage && (
                <>
                    <BottomNav />
                    <LiveSupport />
                </>
            )}
        </div>
    );
}

function App() {
    return (
        <Router>
            <AppLayout />
        </Router>
    );
}

export default App;