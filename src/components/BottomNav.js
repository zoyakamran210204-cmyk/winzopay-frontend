import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './BottomNav.css';

const BottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();

    const items = [
        { key: 'home', icon: '🏠', label: t('home') || 'Home', path: '/dashboard' },
        { key: 'deposit', icon: '💳', label: t('deposit') || 'Deposit', path: '/deposit' },
        { key: 'buy-rp', icon: '💰', label: t('buy_rp') || 'Buy RP', path: '/buy-rp' },
        { key: 'mining', icon: '⛏️', label: t('mining') || 'Mining', path: '/mining' },
        { key: 'withdraw', icon: '📤', label: t('withdraw') || 'Withdraw', path: '/withdraw' },
        { key: 'profile', icon: '👤', label: t('profile') || 'Profile', path: '/profile' }
    ];

    return (
        <nav className="bottom-nav">
            {items.map(item => {
                const isActive = location.pathname === item.path;
                return (
                    <button
                        key={item.key}
                        className={`bottom-nav-item ${isActive ? 'active' : ''}`}
                        onClick={() => navigate(item.path)}
                    >
                        <span className="bottom-nav-icon">{item.icon}</span>
                        <span className="bottom-nav-label">{item.label}</span>
                    </button>
                );
            })}
        </nav>
    );
};

export default BottomNav;