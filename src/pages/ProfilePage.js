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

    const handleAddBank = async (e) => {
        e.preventDefault();
        setBankLoading(true);
        try {
            const res = await api.post('/bank', bankForm);
            alert('✅ Bank account added successfully!');
            
            // Update user context
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

    const maskIP = (ip) => (!ip || ip === 'Unknown') ? 'Unknown' : ip;

    const services = [
        { icon: '👥', title: 'My Referral Team', sub: '0 Members Joined', tag: null },
        { icon: '💳', title: 'Manage Bank Cards', sub: `${user?.bankAccounts?.length || 0} Added`, tag: null, onClick: () => setShowBankForm(true) },
        { icon: '🔐', title: 'USDT Wallets', sub: '0 Added (Link for Crypto)', tag: 'Crypto' },
        { icon: '📒', title: 'Ledger & History', sub: 'View all transactions', tag: null },
        { icon: '🎧', title: 'Online 24/7 Service', sub: '• Live Desk', tag: null },
        { icon: '❓', title: 'Common FAQs', sub: 'Trading & UTR questions', tag: null },
        { icon: '🔑', title: 'Reset Password', sub: 'Update account security', tag: null }
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
                    <div className="pr-section-card">
                        <div className="pr-community">
                            <div className="pr-community-icon">💬</div>
                            <div className="pr-community-content"><div className="pr-community-title">Join Official Community Channel</div><div className="pr-community-sub">Daily trade signals & updates on Telegram</div></div>
                            <button className="pr-community-btn">Join ↗</button>
                        </div>
                    </div>
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
        </div>
    );
};

export default ProfilePage;