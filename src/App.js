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
import MyTeamPage from './pages/MyTeamPage';
import BottomNav from './components/BottomNav'; // Bottom Nav Import

// Yeh component check karega ke user Login page par hai ya nahi
function AppLayout() {
    const location = useLocation();
    
    // Agar user Login page (/) par hai, to BottomNav na dikhao
    const isAuthPage = location.pathname === '/';

    return (
        <div>
            <Routes>
                <Route path="/" element={<AuthPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/deposit" element={<DepositPage />} />
                <Route path="/buy-rp" element={<BuyRPPage />} />
                <Route path="/mining" element={<MiningPage />} />
                <Route path="/sell-rp" element={<SellRPPage />} />
                <Route path="/withdraw" element={<WithdrawPage />} />
                <Route path="/ledger" element={<LedgerPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/my-team" element={<MyTeamPage />} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>

            {/* Bottom Navigation sirf tab dikhe jab user Login page par na ho */}
            {!isAuthPage && <BottomNav />}
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