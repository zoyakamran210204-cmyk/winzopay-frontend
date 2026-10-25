import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { registerUser, loginUser } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

const AuthPage = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { login } = useAuth();

    const [activeTab, setActiveTab] = useState('login');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [languageOpen, setLanguageOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showForgotModal, setShowForgotModal] = useState(false);

    // Form states
    const [loginForm, setLoginForm] = useState({ mobile: '', password: '' });
    const [registerForm, setRegisterForm] = useState({
        name: '',
        mobile: '',
        password: '',
        confirmPassword: ''
    });

    // Language change function
    const changeLanguage = (lang) => {
        i18n.changeLanguage(lang);
        setLanguageOpen(false);
    };

    // ================================
    // Login Submit (Backend Call)
    // ================================
    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await loginUser({
                email: loginForm.mobile,
                password: loginForm.password
            });

            // Save user data in context
            login(response.user, response.token);

            // Redirect to dashboard
            navigate('/dashboard');

        } catch (err) {
            setError(err.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // ================================
    // Register Submit (Backend Call)
    // ================================
    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validation
        if (registerForm.password !== registerForm.confirmPassword) {
            setError('Passwords do not match!');
            return;
        }

        if (registerForm.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            await registerUser({
                name: registerForm.name,
                email: registerForm.mobile,
                mobile: registerForm.mobile,
                password: registerForm.password
            });

            setSuccess('✅ Registration successful! Please login.');

            // Clear form
            setRegisterForm({ name: '', mobile: '', password: '', confirmPassword: '' });

            // Switch to login tab
            setTimeout(() => {
                setActiveTab('login');
                setSuccess('');
            }, 2000);

        } catch (err) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">

            {/* ================================
                HEADER
                ================================ */}
            <header className="auth-header">
                <div className="auth-logo">
                    <div className="auth-logo-icon">WP</div>
                    <div className="auth-logo-text">
                        <div className="auth-logo-title">
                            WINZOPAY
                            <span className="rp-trading-badge">RP TRADING</span>
                        </div>
                        <div className="auth-logo-tagline">{t('tagline')}</div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>

                    {/* Language Selector */}
                    <div style={{ position: 'relative' }}>
                        <button
                            className="help-desk-btn"
                            onClick={() => setLanguageOpen(!languageOpen)}
                        >
                            🌐 {i18n.language === 'en' ? 'English' : i18n.language === 'pt' ? 'Português' : 'Brasileiro'}
                        </button>

                        {languageOpen && (
                            <div style={{
                                position: 'absolute',
                                top: '50px',
                                right: 0,
                                background: 'white',
                                borderRadius: '12px',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                                padding: '8px',
                                minWidth: '150px',
                                zIndex: 100
                            }}>
                                <button
                                    onClick={() => changeLanguage('en')}
                                    style={{
                                        width: '100%',
                                        padding: '10px 15px',
                                        textAlign: 'left',
                                        background: i18n.language === 'en' ? '#eff6ff' : 'transparent',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        color: '#0f172a',
                                        marginBottom: '4px'
                                    }}
                                >
                                    🇬🇧 English
                                </button>
                                <button
                                    onClick={() => changeLanguage('pt')}
                                    style={{
                                        width: '100%',
                                        padding: '10px 15px',
                                        textAlign: 'left',
                                        background: i18n.language === 'pt' ? '#eff6ff' : 'transparent',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        color: '#0f172a',
                                        marginBottom: '4px'
                                    }}
                                >
                                    🇵🇹 Português
                                </button>
                                <button
                                    onClick={() => changeLanguage('br')}
                                    style={{
                                        width: '100%',
                                        padding: '10px 15px',
                                        textAlign: 'left',
                                        background: i18n.language === 'br' ? '#eff6ff' : 'transparent',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        color: '#0f172a'
                                    }}
                                >
                                    🇧🇷 Brasileiro
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Help Desk */}
                    <button className="help-desk-btn">
                        📞 24x7 Help Desk
                    </button>
                </div>
            </header>

            {/* ================================
                MAIN CONTENT
                ================================ */}
            <main className="auth-main">

                {/* LEFT SIDE - HERO */}
                <div className="auth-hero">

                    <div className="hero-badge">
                        <span className="hero-badge-icon">⚡</span>
                        {t('direct_bank_settlement')}
                    </div>

                    <h1 className="hero-title">
                        {t('buy_sell_rp')}<br />
                        {t('instantly')} <span className="hero-title-blue">{t('zero_commission')}</span>
                    </h1>

                    <p className="hero-description">
                        {t('hero_description')}
                    </p>

                    <div className="hero-cards">
                        <div className="hero-card">
                            <div className="hero-card-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                                </svg>
                            </div>
                            <div className="hero-card-content">
                                <div className="hero-card-title">{t('instant_upi_qr')}</div>
                                <div className="hero-card-desc">{t('instant_upi_desc')}</div>
                            </div>
                        </div>

                        <div className="hero-card">
                            <div className="hero-card-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                                </svg>
                            </div>
                            <div className="hero-card-content">
                                <div className="hero-card-title">{t('imps_payouts')}</div>
                                <div className="hero-card-desc">{t('imps_desc')}</div>
                            </div>
                        </div>
                    </div>

                    <div className="hero-security">
                        <div className="security-item">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                            {t('secure_auth')}
                        </div>
                        <div className="security-item">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                            {t('verified_transfers')}
                        </div>
                    </div>

                </div>

                {/* RIGHT SIDE - AUTH FORM */}
                <div className="auth-form-wrapper">

                    {/* Tabs */}
                    <div className="auth-tabs">
                        <button
                            className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('login'); setError(''); setSuccess(''); }}
                        >
                            {t('login')}
                        </button>
                        <button
                            className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('register'); setError(''); setSuccess(''); }}
                        >
                            {t('register')}
                        </button>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div style={{
                            background: '#fee2e2',
                            color: '#991b1b',
                            padding: '12px',
                            borderRadius: '10px',
                            marginBottom: '15px',
                            fontSize: '14px',
                            fontWeight: 600
                        }}>
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <div style={{
                            background: '#dcfce7',
                            color: '#166534',
                            padding: '12px',
                            borderRadius: '10px',
                            marginBottom: '15px',
                            fontSize: '14px',
                            fontWeight: 600
                        }}>
                            {success}
                        </div>
                    )}

                    {/* ================================
                        LOGIN FORM
                        ================================ */}
                    {activeTab === 'login' && (
                        <form onSubmit={handleLogin}>

                            <h2 className="auth-form-title">{t('welcome_back')}</h2>
                            <p className="auth-form-subtitle">{t('login_subtitle')}</p>

                            <div className="form-group">
                                <label className="form-label">{t('mobile_number')}</label>
                                <div className="form-input-wrapper">
                                    <div className="input-prefix">📱 +55</div>
                                    <input
                                        type="tel"
                                        className="form-input"
                                        placeholder={t('mobile_placeholder')}
                                        value={loginForm.mobile}
                                        onChange={(e) => setLoginForm({ ...loginForm, mobile: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <div className="form-row">
                                    <label className="form-label">{t('password')}</label>
                                    <div>
                                        <button 
                                            type="button" 
                                            className="forgot-link"
                                            onClick={() => setShowForgotModal(true)}
                                        >
                                            {t('forgot_password')}
                                        </button>
                                    </div>
                                </div>
                                <div className="form-input-wrapper">
                                    <div className="input-icon">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                        </svg>
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        className="form-input"
                                        placeholder={t('password_placeholder')}
                                        value={loginForm.password}
                                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? '👁️' : '👁️‍🗨️'}
                                    </button>
                                </div>
                            </div>

                            <button type="submit" className="submit-btn" disabled={loading}>
                                {loading ? '⏳ Please wait...' : `${t('sign_in_dashboard')} →`}
                            </button>

                            <p className="auth-terms">{t('terms_agree')}</p>

                        </form>
                    )}

                    {/* ================================
                        REGISTER FORM
                        ================================ */}
                    {activeTab === 'register' && (
                        <form onSubmit={handleRegister}>

                            <h2 className="auth-form-title">{t('create_account')}</h2>
                            <p className="auth-form-subtitle">{t('register_subtitle')}</p>

                            <div className="form-group">
                                <label className="form-label">{t('full_name')}</label>
                                <div className="form-input-wrapper">
                                    <div className="input-icon">👤</div>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder={t('name_placeholder')}
                                        value={registerForm.name}
                                        onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">{t('mobile_number')}</label>
                                <div className="form-input-wrapper">
                                    <div className="input-prefix">📱 +55</div>
                                    <input
                                        type="tel"
                                        className="form-input"
                                        placeholder={t('mobile_placeholder')}
                                        value={registerForm.mobile}
                                        onChange={(e) => setRegisterForm({ ...registerForm, mobile: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">{t('password')}</label>
                                <div className="form-input-wrapper">
                                    <div className="input-icon">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                        </svg>
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        className="form-input"
                                        placeholder={t('password_placeholder')}
                                        value={registerForm.password}
                                        onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? '👁️' : '👁️‍🗨️'}
                                    </button>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">{t('confirm_password')}</label>
                                <div className="form-input-wrapper">
                                    <div className="input-icon">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                        </svg>
                                    </div>
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        className="form-input"
                                        placeholder={t('confirm_password_placeholder')}
                                        value={registerForm.confirmPassword}
                                        onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                                    </button>
                                </div>
                            </div>

                            <button type="submit" className="submit-btn" disabled={loading}>
                                {loading ? '⏳ Please wait...' : `${t('complete_registration')} →`}
                            </button>

                            <p className="auth-terms">{t('terms_agree')}</p>

                        </form>
                    )}
					
                    {/* ================================
                        FORGOT PASSWORD MODAL - TELEGRAM CONTACT
                        ================================ */}
                    {showForgotModal && (
                        <div 
                            style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'rgba(0, 0, 0, 0.6)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 9999,
                                padding: '20px'
                            }}
                            onClick={() => setShowForgotModal(false)}
                        >
                            <div 
                                style={{
                                    background: 'white',
                                    borderRadius: '20px',
                                    padding: '36px',
                                    maxWidth: '460px',
                                    width: '100%',
                                    boxShadow: '0 25px 60px rgba(0, 0, 0, 0.3)',
                                    position: 'relative',
                                    textAlign: 'center'
                                }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Close button */}
                                <button
                                    onClick={() => setShowForgotModal(false)}
                                    style={{
                                        position: 'absolute',
                                        top: '16px',
                                        right: '16px',
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        background: '#f1f5f9',
                                        border: 'none',
                                        fontSize: '16px',
                                        color: '#64748b',
                                        cursor: 'pointer',
                                        fontWeight: 700
                                    }}
                                >
                                    ✕
                                </button>

                                {/* Telegram Icon */}
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    background: 'linear-gradient(135deg, #0088cc 0%, #006699 100%)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '40px',
                                    margin: '0 auto 20px'
                                }}>
                                    📱
                                </div>

                                {/* Title */}
                                <h2 style={{
                                    fontSize: '24px',
                                    fontWeight: 800,
                                    color: '#0f172a',
                                    marginBottom: '12px',
                                    letterSpacing: '-0.5px'
                                }}>
                                    Password Reset
                                </h2>

                                {/* Description */}
                                <p style={{
                                    fontSize: '15px',
                                    color: '#475569',
                                    lineHeight: 1.7,
                                    marginBottom: '24px'
                                }}>
                                    To reset your password, please contact the Admin via <strong style={{color: '#0088cc'}}>Telegram</strong> using this username:
                                </p>

                                {/* Telegram Username Box */}
                                <div style={{
                                    background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
                                    border: '2px solid #0088cc',
                                    borderRadius: '14px',
                                    padding: '20px',
                                    marginBottom: '20px'
                                }}>
                                    <div style={{
                                        fontSize: '11px',
                                        fontWeight: 800,
                                        color: '#0369a1',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px',
                                        marginBottom: '10px'
                                    }}>
                                        📱 Telegram Username
                                    </div>
                                    <div style={{
                                        fontSize: '22px',
                                        fontWeight: 800,
                                        color: '#0c4a6e',
                                        fontFamily: 'monospace',
                                        letterSpacing: '0.5px',
                                        wordBreak: 'break-all'
                                    }}>
                                        @Camila_Camila00
                                    </div>
                                </div>

                                {/* Open Telegram Button */}
                                <a
                                    href="https://t.me/Camila_Camila00"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '10px',
                                        width: '100%',
                                        padding: '16px',
                                        background: 'linear-gradient(135deg, #0088cc 0%, #006699 100%)',
                                        color: 'white',
                                        borderRadius: '12px',
                                        fontSize: '15px',
                                        fontWeight: 800,
                                        textDecoration: 'none',
                                        marginBottom: '14px',
                                        transition: 'all 0.2s',
                                        boxShadow: '0 8px 20px rgba(0, 136, 204, 0.3)'
                                    }}
                                >
                                    💬 Open Telegram Chat
                                </a>

                                {/* Message Template */}
                                <div style={{
                                    background: '#f8fafc',
                                    border: '1px dashed #cbd5e1',
                                    borderRadius: '12px',
                                    padding: '14px 16px',
                                    marginBottom: '16px',
                                    textAlign: 'left'
                                }}>
                                    <div style={{
                                        fontSize: '11px',
                                        fontWeight: 800,
                                        color: '#64748b',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                        marginBottom: '8px'
                                    }}>
                                        📝 Send this message:
                                    </div>
                                    <div style={{
                                        fontSize: '13px',
                                        color: '#0f172a',
                                        fontFamily: 'monospace',
                                        lineHeight: 1.6,
                                        background: 'white',
                                        padding: '10px 12px',
                                        borderRadius: '8px',
                                        border: '1px solid #e2e8f0'
                                    }}>
                                        "Hi Admin, I forgot my password. My registered mobile is: [your number]"
                                    </div>
                                </div>

                                {/* Info */}
                                <div style={{
                                    fontSize: '12px',
                                    color: '#94a3b8',
                                    fontWeight: 500,
                                    lineHeight: 1.5
                                }}>
                                    ⏱️ Admin will respond and provide a new password within 5-15 minutes.
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
};

export default AuthPage;