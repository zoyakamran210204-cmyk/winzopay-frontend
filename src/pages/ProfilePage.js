import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardHeader from '../components/DashboardHeader';
import './ProfilePage.css';

const ProfilePage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const copyReferral = () => {
        const code = `WZP-${user?._id?.slice(-6).toUpperCase() || 'XXXXXX'}`;
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const services = [
        { icon: '👥', title: 'My Referral Team', sub: '0 Members Joined', tag: null },
        { icon: '💳', title: 'Manage Bank Cards', sub: '0 Added', tag: null },
        { icon: '🔐', title: 'USDT Wallets', sub: '0 Added (Link for Crypto)', tag: 'Crypto' },
        { icon: '📒', title: 'Ledger & History', sub: 'View all transactions', tag: null },
        { icon: '🎧', title: 'Online 24/7 Service', sub: '• Live Desk', tag: null },
        { icon: '❓', title: 'Common FAQs', sub: 'Trading & UTR questions', tag: null },
        { icon: '🔑', title: 'Reset Password', sub: 'Update account security', tag: null }
    ];

    const maskIP = (ip) => {
        if (!ip || ip === 'Unknown') return 'Unknown';
        // Simple show, maybe partially mask
        return ip;
    };

    return (
        <div className="pr-page">
            <DashboardHeader activeNav="profile" />

            <div className="pr-container">

                {/* ================================
                    LEFT - Profile Info
                    ================================ */}
                <div className="pr-left">

                    <div className="pr-profile-card">
                        <div className="pr-avatar-row">
                            <div className="pr-avatar">
                                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div>
                                <div className="pr-name-row">
                                    <div className="pr-name">
                                        {user?.name || 'User'}
                                    </div>
                                    <span className="pr-vip-badge">👑 VIP 1</span>
                                </div>
                                <div className="pr-mobile">{user?.mobile || 'N/A'}</div>
                                <div className="pr-uid">
                                    UID: WZP-{user?._id?.slice(-6).toUpperCase() || 'XXXXXX'}
                                </div>
                            </div>
                        </div>

                        {/* VIP Tier */}
                        <div className="pr-vip-tier">
                            <div className="pr-vip-header">
                                <span>👑 VIP Tier Level 1</span>
                                <span>0.5% Commission Boost</span>
                            </div>
                            <div className="pr-vip-progress">
                                <div className="pr-vip-fill" />
                            </div>
                            <div className="pr-vip-sub">
                                Progress: 50% to next tier
                            </div>
                        </div>

                        {/* Balance Grid */}
                        <div className="pr-balance-grid">
                            <div className="pr-balance-card">
                                <div className="pr-balance-label">💼 WALLET BALANCE</div>
                                <div className="pr-balance-value">
                                    R$ {user?.balance?.toFixed(2) || '0.00'}
                                </div>
                            </div>
                            <div className="pr-balance-card">
                                <div className="pr-balance-label">💰 COMMISSION</div>
                                <div className="pr-balance-value">
                                    R$ 0.00
                                </div>
                            </div>
                        </div>

                        {/* IP Address (Admin visibility) */}
                        <div className="pr-ip-card">
                            <div className="pr-ip-label">
                                🌐 LAST LOGIN IP ADDRESS
                            </div>
                            <div className="pr-ip-value">
                                {maskIP(user?.ipAddress)}
                            </div>
                            <div className="pr-ip-note">
                                Visible to Admin for security
                            </div>
                        </div>

                        {/* Referral */}
                        <div className="pr-referral-box">
                            <div className="pr-referral-title">🎁 Referral ID & Origin</div>
                            <div className="pr-referral-code">
                                <span>WZP-{user?._id?.slice(-6).toUpperCase() || 'XXXXXX'}</span>
                                <button className="pr-referral-copy" onClick={copyReferral}>
                                    {copied ? '✅ Copied' : '📋 Copy'}
                                </button>
                            </div>
                            <div className="pr-referral-source">
                                <span>JOINED VIA</span>
                                <span style={{ color: '#0f172a', fontWeight: 700 }}>Direct Signup</span>
                            </div>
                        </div>

                        {/* Logout */}
                        <button className="pr-signout-btn" onClick={handleLogout}>
                            ⏻ Sign Out / Switch Account
                        </button>
                    </div>

                </div>

                {/* ================================
                    RIGHT - Services
                    ================================ */}
                <div className="pr-right">

                    <div className="pr-section-card">
                        <div className="pr-section-title">
                            Services & Account Settings
                            <span className="pr-section-badge">Quick Access</span>
                        </div>

                        <div className="pr-services">
                            {services.map((s, i) => (
                                <button key={i} className="pr-service">
                                    <div className="pr-service-icon">{s.icon}</div>
                                    <div className="pr-service-content">
                                        <div className="pr-service-title">
                                            {s.title}
                                            {s.tag && <span className="tag">{s.tag}</span>}
                                        </div>
                                        <div className="pr-service-sub">{s.sub}</div>
                                    </div>
                                    <span className="pr-service-arrow">›</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Community Card */}
                    <div className="pr-section-card">
                        <div className="pr-community">
                            <div className="pr-community-icon">💬</div>
                            <div className="pr-community-content">
                                <div className="pr-community-title">Join Official Community Channel</div>
                                <div className="pr-community-sub">Daily trade signals & updates on Telegram</div>
                            </div>
                            <button className="pr-community-btn">Join ↗</button>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default ProfilePage;