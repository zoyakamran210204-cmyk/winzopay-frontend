import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './DashboardHeader.css';

const DashboardHeader = ({ activeNav = 'home' }) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [showNotifications, setShowNotifications] = useState(false);
    const [showInstallModal, setShowInstallModal] = useState(false);

    // 👈 Fake Notifications for Attraction
    const [notifications, setNotifications] = useState([
        { id: 1, title: '🎉 Welcome to WinzoPay!', text: 'Your account is verified. Start your mining journey today.', time: 'Just now', unread: true, icon: '🎁' },
        { id: 2, title: '💸 Payout Successful', text: 'User João V. withdrew R$ 500.00 to Nubank.', time: '5 mins ago', unread: true, icon: '✅' },
        { id: 3, title: '🔥 Plan B is Trending!', text: 'Join 1,200+ users earning 8% daily returns.', time: '1 hour ago', unread: false, icon: '📈' },
        { id: 4, title: '📢 System Notice', text: 'Instant PIX withdrawals are running smoothly 24x7.', time: '2 hours ago', unread: false, icon: '⚡' },
    ]);

    const markAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, unread: false })));
    };

    const unreadCount = notifications.filter(n => n.unread).length;

    const navItems = [
        { key: 'home', label: t('home'), icon: '🏠', path: '/dashboard' },
        { key: 'deposit', label: t('deposit'), icon: '💳', path: '/deposit' },
        { key: 'buy-rp', label: t('buy_rp'), icon: '💰', path: '/buy-rp' },
        { key: 'mining', label: t('mining'), icon: '⛏️', path: '/mining' },
        { key: 'sell-rp', label: t('sell_rp'), icon: '💱', path: '/sell-rp' },
        { key: 'withdraw', label: t('withdraw'), icon: '📤', path: '/withdraw' },
        { key: 'ledger', label: t('ledger'), icon: '📒', path: '/ledger' },
        { key: 'profile', label: t('profile'), icon: '👤', path: '/profile' },
    ];

    return (
        <header className="db-header">
            {/* Left - Logo (Clickable) */}
            <div className="db-header-left">
                <div 
                    className="db-logo" 
                    onClick={() => navigate('/dashboard')}
                    style={{ cursor: 'pointer' }}
                >
                    <div className="db-logo-icon">WP</div>
                    <div className="db-logo-text">
                        <div className="db-logo-title">WinzoPay</div>
                        <div className="db-logo-sub">Hi, {user?.name?.split(' ')[0] || 'User'}</div>
                    </div>
                </div>

                {/* Navigation (Desktop Only) */}
                <nav className="db-nav">
                    {navItems.map(item => (
                        <button
                            key={item.key}
                            className={`db-nav-item ${activeNav === item.key ? 'active' : ''}`}
                            onClick={() => navigate(item.path)}
                        >
                            <span className="db-nav-icon">{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Right Side */}
            <div className="db-header-right">
                <button className="db-topup-btn" onClick={() => navigate('/deposit')}>
                    💰 {t('top_up')}: <span className="db-topup-amount">R$ {user?.balance?.toFixed(2) || '0.00'}</span>
                </button>

                <div style={{ position: 'relative' }}>
                    <button className="db-icon-btn" onClick={() => setShowNotifications(!showNotifications)}>
                        🔔
                        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                    </button>
                    
                    {/* 👈 Updated Notification Dropdown */}
                    {showNotifications && (
                        <div className="custom-notif-dropdown">
                            <div className="custom-notif-header">
                                <h4>Notifications</h4>
                                <button className="custom-notif-mark" onClick={markAsRead}>Mark all as read</button>
                            </div>
                            <div className="custom-notif-list">
                                {notifications.map(n => (
                                    <div key={n.id} className={`custom-notif-item ${n.unread ? 'unread' : ''}`}>
                                        <div className="custom-notif-icon">{n.icon}</div>
                                        <div className="custom-notif-content">
                                            <div className="custom-notif-title">{n.title}</div>
                                            <div className="custom-notif-text">{n.text}</div>
                                            <div className="custom-notif-time">{n.time}</div>
                                        </div>
                                        {n.unread && <div className="custom-notif-unread"></div>}
                                    </div>
                                ))}
                            </div>
                            <div className="custom-notif-footer">
                                <button onClick={() => { setShowNotifications(false); navigate('/ledger'); }}>View All History</button>
                            </div>
                        </div>
                    )}
                </div>

                <button className="db-share-btn hide-on-mobile" onClick={async () => {
                    const shareData = { title: 'WinzoPay', text: 'Join WinzoPay - Buy & Sell RP Instantly!', url: window.location.origin };
                    try {
                        if (navigator.share) { await navigator.share(shareData); } 
                        else { navigator.clipboard.writeText(window.location.origin); alert('✅ Link copied to clipboard!'); }
                    } catch (err) { console.log('Error sharing:', err); }
                }}>
                    ↗️ <span>{t('share')}</span>
                </button>

                <button className="db-install-btn hide-on-mobile" onClick={() => setShowInstallModal(true)}>
                    📱 <span>{t('install_app')}</span>
                </button>
            </div>

            {/* Install App Modal */}
            {showInstallModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', zIndex: 9999, padding: '20px'
                }} onClick={() => setShowInstallModal(false)}>
                    <div style={{
                        background: 'white', borderRadius: '20px', padding: '30px',
                        maxWidth: '400px', width: '100%', textAlign: 'center',
                        boxShadow: '0 25px 60px rgba(0,0,0,0.3)'
                    }} onClick={(e) => e.stopPropagation()}>
                        
                        <div style={{ fontSize: '48px', marginBottom: '15px' }}>📱</div>
                        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>
                            Install WinzoPay App
                        </h2>
                        <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6, marginBottom: '20px' }}>
                            Our official mobile app is coming soon! <br/><br/>
                            For now, you can add this website to your <strong>Home Screen</strong> for quick access.
                        </p>
                        
                        <div style={{ 
                            background: '#f8fafc', padding: '15px', borderRadius: '12px', 
                            textAlign: 'left', fontSize: '12px', color: '#475569', marginBottom: '20px' 
                        }}>
                            <strong>How to add to home screen:</strong><br/>
                            1. Tap on the <strong>Menu (⋮)</strong> in your browser.<br/>
                            2. Select <strong>"Add to Home Screen"</strong>.<br/>
                            3. Done! Access it like an app.
                        </div>

                        <button 
                            onClick={() => setShowInstallModal(false)}
                            style={{
                                width: '100%', padding: '14px', background: '#0f172a',
                                color: 'white', border: 'none', borderRadius: '10px',
                                fontSize: '14px', fontWeight: 800, cursor: 'pointer'
                            }}
                        >
                            Got it!
                        </button>
                    </div>
                </div>
            )}
        </header>
    );
};

export default DashboardHeader;