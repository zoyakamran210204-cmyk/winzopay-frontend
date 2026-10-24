import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import DashboardHeader from '../components/DashboardHeader';
import './ProfilePage.css';

const ProfilePage = () => {
    const { user, logout, login } = useAuth();
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);
    
    // Bank Form States
    const [showBankForm, setShowBankForm] = useState(false);
    const [bankForm, setBankForm] = useState({
        bankCode: '260',
        bankName: 'Nubank',
        accountHolderName: '',
        accountNumber: '',
        agency: '',
        cpfCnpj: '',
        accountType: 'Corrente'
    });
    const [bankLoading, setBankLoading] = useState(false);

    // Reset Password Modal State
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetForm, setResetForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [resetLoading, setResetLoading] = useState(false);

    // ⚠️ NAYA: USDT Wallet State
    const [showWalletForm, setShowWalletForm] = useState(false);
    const [walletForm, setWalletForm] = useState({ network: 'TRC20', walletAddress: '', label: '' });

    // ⚠️ NAYA: FAQ Modal State
    const [showFaqModal, setShowFaqModal] = useState(false);

    const brazilianBanks = [
        { code: '260', name: 'Nubank' }, { code: '341', name: 'Itaú Unibanco' },
        { code: '237', name: 'Bradesco' }, { code: '001', name: 'Banco do Brasil' },
        { code: '104', name: 'Caixa Econômica' }, { code: '033', name: 'Santander' },
        { code: '077', name: 'Banco Inter' }, { code: '380', name: 'PicPay' },
        { code: '323', name: 'Mercado Pago' }, { code: '290', name: 'PagBank' }
    ];

    const handleLogout = () => { logout(); navigate('/'); };

    const copyReferral = () => {
        const code = `WZP-${user?._id?.slice(-6).toUpperCase() || 'XXXXXX'}`;
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Add Bank
    const handleAddBank = async (e) => {
        e.preventDefault();
        setBankLoading(true);
        try {
            const res = await api.post('/bank', bankForm);
            alert('✅ Bank account added successfully!');
            const updatedUser = { ...user, bankAccounts: res.data.bankAccounts };
            login(updatedUser, localStorage.getItem('winzopay_token'));
            setShowBankForm(false);
            setBankForm({ bankCode: '260', bankName: 'Nubank', accountHolderName: '', accountNumber: '', agency: '', cpfCnpj: '', accountType: 'Corrente' });
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to add bank');
        } finally {
            setBankLoading(false);
        }
    };

    // Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (resetForm.newPassword !== resetForm.confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        setResetLoading(true);
        try {
            await api.post('/auth/change-password', {
                oldPassword: resetForm.oldPassword,
                newPassword: resetForm.newPassword
            });
            alert('✅ Password changed successfully!');
            setShowResetModal(false);
            setResetForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            alert(err.response?.data?.message || 'Password change failed');
        } finally {
            setResetLoading(false);
        }
    };

    const maskIP = (ip) => (!ip || ip === 'Unknown') ? 'Unknown' : ip;

    // Services List
    const services = [
        { 
            icon: '💳', 
            title: 'Manage Bank Cards', 
            sub: `${user?.bankAccounts?.length || 0} Added`, 
            tag: null, 
            onClick: () => setShowBankForm(true) 
        },
        { 
            icon: '🔐', 
            title: 'USDT Wallets', 
            sub: '0 Added (Link for Crypto)', 
            tag: 'Crypto',
            onClick: () => setShowWalletForm(true) // ⚠️ Ab form khulega
        },
        { 
            icon: '📒', 
            title: 'Ledger & History', 
            sub: 'View all transactions', 
            tag: null,
            onClick: () => navigate('/ledger')
        },
        { 
            icon: '❓', 
            title: 'Common FAQs', 
            sub: 'Trading & UTR questions', 
            tag: null,
            onClick: () => setShowFaqModal(true) // ⚠️ Ab modal khulega
        },
        { 
            icon: '🔑', 
            title: 'Reset Password', 
            sub: 'Update account security', 
            tag: null,
            onClick: () => setShowResetModal(true)
        }
    ];

    return (
        <div className="pr-page">
            <DashboardHeader activeNav="profile" />
            <div className="pr-container">
                {/* LEFT - Profile Info */}
                <div className="pr-left">
                    <div className="pr-profile-card">
                        <div className="pr-avatar-row">
                            <div className="pr-avatar">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
                            <div>
                                <div className="pr-name-row"><div className="pr-name">{user?.name || 'User'}</div><span className="pr-vip-badge">👑 VIP 1</span></div>
                                <div className="pr-mobile">{user?.mobile || 'N/A'}</div>
                                <div className="pr-uid">UID: WZP-{user?._id?.slice(-6).toUpperCase() || 'XXXXXX'}</div>
                            </div>
                        </div>
                        <div className="pr-vip-tier">
                            <div className="pr-vip-header"><span>👑 VIP Tier Level 1</span><span>0.5% Commission Boost</span></div>
                            <div className="pr-vip-progress"><div className="pr-vip-fill" /></div>
                            <div className="pr-vip-sub">Progress: 50% to next tier</div>
                        </div>
                        <div className="pr-balance-grid">
                            <div className="pr-balance-card"><div className="pr-balance-label">💼 WALLET BALANCE</div><div className="pr-balance-value">R$ {user?.balance?.toFixed(2) || '0.00'}</div></div>
                            <div className="pr-balance-card"><div className="pr-balance-label">💰 COMMISSION</div><div className="pr-balance-value">R$ 0.00</div></div>
                        </div>
                        <div className="pr-ip-card">
                            <div className="pr-ip-label">🌐 LAST LOGIN IP ADDRESS</div>
                            <div className="pr-ip-value">{maskIP(user?.ipAddress)}</div>
                            <div className="pr-ip-note">Visible to Admin for security</div>
                        </div>
                        <div className="pr-referral-box">
                            <div className="pr-referral-title">🎁 Referral ID & Origin</div>
                            <div className="pr-referral-code"><span>WZP-{user?._id?.slice(-6).toUpperCase() || 'XXXXXX'}</span><button className="pr-referral-copy" onClick={copyReferral}>{copied ? '✅ Copied' : '📋 Copy'}</button></div>
                            <div className="pr-referral-source"><span>JOINED VIA</span><span style={{ color: '#0f172a', fontWeight: 700 }}>Direct Signup</span></div>
                        </div>
                        <button className="pr-signout-btn" onClick={handleLogout}>⏻ Sign Out / Switch Account</button>
                    </div>
                </div>

                {/* RIGHT - Services */}
                <div className="pr-right">
                    <div className="pr-section-card">
                        <div className="pr-section-title">Services & Account Settings<span className="pr-section-badge">Quick Access</span></div>
                        <div className="pr-services">
                            {services.map((s, i) => (
                                <button key={i} className="pr-service" onClick={s.onClick}>
                                    <div className="pr-service-icon">{s.icon}</div>
                                    <div className="pr-service-content">
                                        <div className="pr-service-title">{s.title}{s.tag && <span className="tag">{s.tag}</span>}</div>
                                        <div className="pr-service-sub">{s.sub}</div>
                                    </div>
                                    <span className="pr-service-arrow">›</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    {/* ✅ Community Banner Removed */}
                </div>
            </div>

            {/* ⚠️ BANK FORM MODAL */}
            {showBankForm && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
                    <div style={{ background: 'white', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>🏦 Add Bank Account</h3>
                            <button onClick={() => setShowBankForm(false)} style={{ background: 'transparent', fontSize: '20px', cursor: 'pointer' }}>✕</button>
                        </div>
                        <form onSubmit={handleAddBank}>
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', display: 'block', marginBottom: '4px' }}>Bank</label>
                                <select value={bankForm.bankCode} onChange={(e) => {
                                    const bank = brazilianBanks.find(b => b.code === e.target.value);
                                    setBankForm({ ...bankForm, bankCode: e.target.value, bankName: bank.name });
                                }} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }}>
                                    {brazilianBanks.map(bank => (<option key={bank.code} value={bank.code}>{bank.code} - {bank.name}</option>))}
                                </select>
                            </div>
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', display: 'block', marginBottom: '4px' }}>Account Holder Name</label>
                                <input type="text" value={bankForm.accountHolderName} onChange={(e) => setBankForm({ ...bankForm, accountHolderName: e.target.value })} placeholder="e.g. João Silva" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }} required />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                                <div>
                                    <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', display: 'block', marginBottom: '4px' }}>Agency</label>
                                    <input type="text" value={bankForm.agency} onChange={(e) => setBankForm({ ...bankForm, agency: e.target.value })} placeholder="0001" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }} required />
                                </div>
                                <div>
                                    <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', display: 'block', marginBottom: '4px' }}>Account No.</label>
                                    <input type="text" value={bankForm.accountNumber} onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })} placeholder="12345-6" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }} required />
                                </div>
                            </div>
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', display: 'block', marginBottom: '4px' }}>CPF / CNPJ</label>
                                <input type="text" value={bankForm.cpfCnpj} onChange={(e) => setBankForm({ ...bankForm, cpfCnpj: e.target.value })} placeholder="123.456.789-00" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }} required />
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', display: 'block', marginBottom: '4px' }}>Account Type</label>
                                <select value={bankForm.accountType} onChange={(e) => setBankForm({ ...bankForm, accountType: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }}>
                                    <option value="Corrente">Conta Corrente (Checking)</option>
                                    <option value="Poupanca">Conta Poupança (Savings)</option>
                                    <option value="Pagamento">Conta de Pagamento (Payment)</option>
                                </select>
                            </div>
                            <button type="submit" disabled={bankLoading} style={{ width: '100%', padding: '14px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 800, cursor: 'pointer' }}>
                                {bankLoading ? '⏳ Saving...' : '✓ Save Bank Account'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ⚠️ RESET PASSWORD MODAL */}
            {showResetModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
                    <div style={{ background: 'white', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '400px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>🔑 Reset Password</h3>
                            <button onClick={() => setShowResetModal(false)} style={{ background: 'transparent', fontSize: '20px', cursor: 'pointer' }}>✕</button>
                        </div>
                        <form onSubmit={handleResetPassword}>
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', display: 'block', marginBottom: '4px' }}>Old Password</label>
                                <input type="password" value={resetForm.oldPassword} onChange={(e) => setResetForm({ ...resetForm, oldPassword: e.target.value })} placeholder="Enter old password" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }} required />
                            </div>
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', display: 'block', marginBottom: '4px' }}>New Password</label>
                                <input type="password" value={resetForm.newPassword} onChange={(e) => setResetForm({ ...resetForm, newPassword: e.target.value })} placeholder="Enter new password (min 6)" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }} required />
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', display: 'block', marginBottom: '4px' }}>Confirm New Password</label>
                                <input type="password" value={resetForm.confirmPassword} onChange={(e) => setResetForm({ ...resetForm, confirmPassword: e.target.value })} placeholder="Re-enter new password" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }} required />
                            </div>
                            <button type="submit" disabled={resetLoading} style={{ width: '100%', padding: '14px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 800, cursor: 'pointer' }}>
                                {resetLoading ? '⏳ Processing...' : '✓ Change Password'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ⚠️ USDT WALLET MODAL */}
            {showWalletForm && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
                    <div style={{ background: 'white', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '400px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>🔐 Add USDT Wallet</h3>
                            <button onClick={() => setShowWalletForm(false)} style={{ background: 'transparent', fontSize: '20px', cursor: 'pointer' }}>✕</button>
                        </div>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            alert('✅ USDT Wallet saved!');
                            setShowWalletForm(false);
                        }}>
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', display: 'block', marginBottom: '4px' }}>Network</label>
                                <select value={walletForm.network} onChange={(e) => setWalletForm({ ...walletForm, network: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }}>
                                    <option value="TRC20">TRC20 (Tron)</option>
                                    <option value="BEP20">BEP20 (BSC)</option>
                                </select>
                            </div>
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', display: 'block', marginBottom: '4px' }}>Wallet Address</label>
                                <input type="text" value={walletForm.walletAddress} onChange={(e) => setWalletForm({ ...walletForm, walletAddress: e.target.value })} placeholder="e.g. TQn9Y2khEs..." style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }} required />
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', display: 'block', marginBottom: '4px' }}>Label (Optional)</label>
                                <input type="text" value={walletForm.label} onChange={(e) => setWalletForm({ ...walletForm, label: e.target.value })} placeholder="e.g. Binance Wallet" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }} />
                            </div>
                            <button type="submit" style={{ width: '100%', padding: '14px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 800, cursor: 'pointer' }}>
                                ✓ Save Wallet
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ⚠️ FAQ MODAL */}
            {showFaqModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
                    <div style={{ background: 'white', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '480px', maxHeight: '80vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>❓ Frequently Asked Questions</h3>
                            <button onClick={() => setShowFaqModal(false)} style={{ background: 'transparent', fontSize: '20px', cursor: 'pointer' }}>✕</button>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <strong style={{ fontSize: '13px', color: '#0f172a' }}>1. How long does a deposit take?</strong>
                                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Deposits are verified by admin within 5-15 minutes.</p>
                            </div>
                            <div>
                                <strong style={{ fontSize: '13px', color: '#0f172a' }}>2. How do I withdraw my profits?</strong>
                                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Go to Withdraw page, enter amount, and select your bank.</p>
                            </div>
                            <div>
                                <strong style={{ fontSize: '13px', color: '#0f172a' }}>3. What is UTR?</strong>
                                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>UTR is the transaction reference number you get after bank transfer.</p>
                            </div>
                            <div>
                                <strong style={{ fontSize: '13px', color: '#0f172a' }}>4. How to contact support?</strong>
                                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Contact via Help Desk or join Telegram channel.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;