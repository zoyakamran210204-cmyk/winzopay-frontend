import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardHeader from '../components/DashboardHeader';
import api from '../utils/api';
import './WithdrawPage.css';

const WithdrawPage = () => {
    const { user } = useAuth();

    const [amount, setAmount] = useState('');
    const [payoutMethod, setPayoutMethod] = useState('Bank');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [history, setHistory] = useState([]);

    // BANK details
    const [bankCode, setBankCode] = useState('');
    const [bankHolderName, setBankHolderName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [bankCpf, setBankCpf] = useState('');

    // PIX details
    const [pixBankCode, setPixBankCode] = useState('');
    const [pixKeyType, setPixKeyType] = useState('CPF');
    const [pixKey, setPixKey] = useState('');
    const [pixHolderName, setPixHolderName] = useState('');

    // USDT details
    const [usdtNetwork, setUsdtNetwork] = useState('TRC20');
    const [usdtWalletAddress, setUsdtWalletAddress] = useState('');
    const [usdtLabel, setUsdtLabel] = useState('');

    const brazilianBanks = [
        { code: '260', name: 'Nubank' },
        { code: '341', name: 'Itaú Unibanco' },
        { code: '237', name: 'Bradesco' },
        { code: '001', name: 'Banco do Brasil' },
        { code: '104', name: 'Caixa Econômica' },
        { code: '033', name: 'Santander' },
        { code: '077', name: 'Banco Inter' },
        { code: '380', name: 'PicPay' },
        { code: '323', name: 'Mercado Pago' },
        { code: '290', name: 'PagBank' }
    ];

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const res = await api.get('/transaction/my-transactions');
                setHistory(res.data.filter(tx => tx.type === 'Withdraw'));
            } catch (err) {
                console.error('Load failed:', err);
            }
        };
        loadHistory();
    }, []);

    // ================================
    // Handle Withdraw Submit
    // ================================
    const handleWithdraw = async () => {
        setMessage({ type: '', text: '' });
        const amt = Number(amount);

        if (!amt || amt < 100) {
            setMessage({ type: 'error', text: 'Minimum withdrawal is R$ 100' });
            return;
        }

        if (amt > (user?.withdrawableBalance || 0)) {
            setMessage({ type: 'error', text: 'Insufficient withdrawable balance' });
            return;
        }

        // Validation
        if (payoutMethod === 'Bank') {
            if (!bankCode || !bankHolderName || !accountNumber || !bankCpf) {
                setMessage({ type: 'error', text: 'Please fill all bank details' });
                return;
            }
        } else if (payoutMethod === 'PIX') {
            if (!pixKeyType || !pixKey || !pixHolderName) {
                setMessage({ type: 'error', text: 'Please fill all PIX details' });
                return;
            }
        } else if (payoutMethod === 'USDT') {
            if (!usdtNetwork || !usdtWalletAddress) {
                setMessage({ type: 'error', text: 'Please fill all USDT details' });
                return;
            }
        }

        setLoading(true);
        try {
            const payload = {
                amount: amt,
                cryptoType: payoutMethod,
                bankDetails: payoutMethod === 'Bank' ? {
                    bankCode: bankCode,
                    bankName: brazilianBanks.find(b => b.code === bankCode)?.name || '',
                    accountHolderName: bankHolderName,
                    accountNumber: accountNumber,
                    cpfCnpj: bankCpf
                } : null,
                pixDetails: payoutMethod === 'PIX' ? {
                    bankCode: pixBankCode,
                    bankName: brazilianBanks.find(b => b.code === pixBankCode)?.name || '',
                    pixKeyType: pixKeyType,
                    pixKey: pixKey,
                    accountHolderName: pixHolderName
                } : null,
                cryptoDetails: payoutMethod === 'USDT' ? {
                    network: usdtNetwork,
                    walletAddress: usdtWalletAddress,
                    label: usdtLabel
                } : null
            };

            await api.post('/transaction/withdraw', payload);

            setMessage({ type: 'success', text: '✅ Withdraw request submitted! Please wait for admin approval.' });
            
            // Reset
            setAmount('');
            setBankCode('');
            setBankHolderName('');
            setAccountNumber('');
            setBankCpf('');
            setPixBankCode('');
            setPixKey('');
            setPixHolderName('');
            setUsdtWalletAddress('');
            setUsdtLabel('');

            const res = await api.get('/transaction/my-transactions');
            setHistory(res.data.filter(tx => tx.type === 'Withdraw'));

        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Withdraw failed' });
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (d) => {
        return new Date(d).toLocaleString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    // Check if details complete
    const bankComplete = bankCode && bankHolderName && accountNumber && bankCpf;
    const pixComplete = pixKeyType && pixKey && pixHolderName;
    const usdtComplete = usdtNetwork && usdtWalletAddress;

    const canWithdraw = 
        amount && 
        Number(amount) >= 100 && 
        Number(amount) <= (user?.withdrawableBalance || 0) &&
        (
            (payoutMethod === 'Bank' && bankComplete) ||
            (payoutMethod === 'PIX' && pixComplete) ||
            (payoutMethod === 'USDT' && usdtComplete)
        );

    const pendingWithdraws = history.filter(h => h.status === 'Pending').length;
    const approvedWithdraws = history.filter(h => h.status === 'Approved').reduce((s, h) => s + h.amount, 0);

    const inputStyle = {
        width: '100%',
        padding: '14px 16px',
        background: '#f8fafc',
        border: '2px solid #e2e8f0',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: 600,
        color: '#0f172a',
        outline: 'none'
    };

    const labelStyle = {
        display: 'block',
        fontSize: '11px',
        fontWeight: 700,
        color: '#64748b',
        textTransform: 'uppercase',
        marginBottom: '6px',
        letterSpacing: '0.3px'
    };

    return (
        <div className="wd-page">
            <DashboardHeader activeNav="withdraw" />

            <div className="wd-container">

                <div className="wd-header">
                    <div className="wd-header-icon">📤</div>
                    <div>
                        <div className="wd-title">Withdrawal (Bank & Crypto)</div>
                        <div className="wd-subtitle">Step 6: Withdraw available Withdrawable balance</div>
                    </div>
                </div>

                <div className="wd-step-banner">
                    <div className="wd-step-num">6</div>
                    <div className="wd-step-content">
                        <div className="wd-step-title">Submit Withdrawal Request</div>
                        <div className="wd-step-sub">Admin approval required • Deducted from Withdrawable Balance</div>
                    </div>
                </div>

                <div className="wd-balance-card">
                    <div>
                        <div className="wd-balance-label">💼 Withdrawable Balance</div>
                        <div className="wd-balance-value">
                            R$ {user?.withdrawableBalance?.toFixed(2) || '0.00'}
                        </div>
                    </div>
                    <div className="wd-balance-badge">24x7 Fast • 0% Payout Fee</div>
                </div>

                <div className="wd-info-card">
                    <div className="wd-info-icon">💡</div>
                    <div className="wd-info-content">
                        <div className="wd-info-title">How to load money into Withdrawable Balance?</div>
                        <div className="wd-info-text">
                            Deposit → Buy RP Plan → Mine for cycle → Sell RP → Withdraw (You are here)
                        </div>
                    </div>
                </div>

                {message.text && (
                    <div className={`wd-alert ${message.type}`}>{message.text}</div>
                )}

                <div className="wd-status-grid">
                    <div className="wd-status-card">
                        <div className="wd-status-label">✅ APPROVED MONEY</div>
                        <div className="wd-status-value green">
                            R$ {approvedWithdraws.toFixed(2)}
                        </div>
                        <div className="wd-status-sub">Settled to your account</div>
                    </div>
                    <div className="wd-status-card">
                        <div className="wd-status-label">⏳ PENDING MONEY</div>
                        <div className="wd-status-value orange">
                            R$ {history.filter(h => h.status === 'Pending').reduce((s, h) => s + h.amount, 0).toFixed(2)}
                        </div>
                        <div className="wd-status-sub">{pendingWithdraws} Processing payout</div>
                    </div>
                </div>

                {/* Payout Method Tabs */}
                <div className="wd-payout-tabs">
                    <button
                        className={`wd-payout-tab ${payoutMethod === 'Bank' ? 'active' : ''}`}
                        onClick={() => setPayoutMethod('Bank')}
                    >
                        🏦 Bank Transfer
                    </button>
                    <button
                        className={`wd-payout-tab ${payoutMethod === 'PIX' ? 'active' : ''}`}
                        onClick={() => setPayoutMethod('PIX')}
                    >
                        📱 PIX
                    </button>
                    <button
                        className={`wd-payout-tab ${payoutMethod === 'USDT' ? 'active' : ''}`}
                        onClick={() => setPayoutMethod('USDT')}
                    >
                        🪙 USDT (Crypto)
                    </button>
                </div>

                {/* ================================
                    BANK SECTION
                    ================================ */}
                {payoutMethod === 'Bank' && (
                    <div className="wd-section">
                        <div className="wd-section-header">
                            <div className="wd-section-title">🏦 BANK TRANSFER DETAILS</div>
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                            <label style={labelStyle}>Select Brazilian Bank</label>
                            <select
                                className="wd-bank-select"
                                value={bankCode}
                                onChange={(e) => setBankCode(e.target.value)}
                            >
                                <option value="">-- Select Bank --</option>
                                {brazilianBanks.map(bank => (
                                    <option key={bank.code} value={bank.code}>
                                        {bank.code} - {bank.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                            <label style={labelStyle}>Account Holder Full Name</label>
                            <input
                                type="text"
                                style={inputStyle}
                                placeholder="e.g. João Silva Santos"
                                value={bankHolderName}
                                onChange={(e) => setBankHolderName(e.target.value)}
                            />
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                            <label style={labelStyle}>Account Number</label>
                            <input
                                type="text"
                                style={inputStyle}
                                placeholder="e.g. 12345-6"
                                value={accountNumber}
                                onChange={(e) => setAccountNumber(e.target.value)}
                            />
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                            <label style={labelStyle}>CPF / CNPJ</label>
                            <input
                                type="text"
                                style={inputStyle}
                                placeholder="e.g. 123.456.789-00"
                                value={bankCpf}
                                onChange={(e) => setBankCpf(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {/* ================================
                    PIX SECTION
                    ================================ */}
                {payoutMethod === 'PIX' && (
                    <div className="wd-section">
                        <div className="wd-section-header">
                            <div className="wd-section-title">📱 PIX TRANSFER DETAILS</div>
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                            <label style={labelStyle}>Bank (PIX Provider) - Optional</label>
                            <select
                                className="wd-bank-select"
                                value={pixBankCode}
                                onChange={(e) => setPixBankCode(e.target.value)}
                            >
                                <option value="">-- Select Bank (Optional) --</option>
                                {brazilianBanks.map(bank => (
                                    <option key={bank.code} value={bank.code}>
                                        {bank.code} - {bank.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                            <label style={labelStyle}>PIX Key Type</label>
                            <select
                                className="wd-bank-select"
                                value={pixKeyType}
                                onChange={(e) => setPixKeyType(e.target.value)}
                            >
                                <option value="CPF">CPF</option>
                                <option value="CNPJ">CNPJ</option>
                                <option value="Email">Email</option>
                                <option value="Phone">Phone Number</option>
                                <option value="Random">Random Key</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                            <label style={labelStyle}>PIX Key</label>
                            <input
                                type="text"
                                style={inputStyle}
                                placeholder={
                                    pixKeyType === 'CPF' ? 'e.g. 123.456.789-00' :
                                    pixKeyType === 'Email' ? 'e.g. example@email.com' :
                                    pixKeyType === 'Phone' ? 'e.g. +55 11 98765-4321' :
                                    'e.g. Your PIX key'
                                }
                                value={pixKey}
                                onChange={(e) => setPixKey(e.target.value)}
                            />
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                            <label style={labelStyle}>Account Holder Full Name</label>
                            <input
                                type="text"
                                style={inputStyle}
                                placeholder="e.g. João Silva Santos"
                                value={pixHolderName}
                                onChange={(e) => setPixHolderName(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {/* ================================
                    USDT SECTION
                    ================================ */}
                {payoutMethod === 'USDT' && (
                    <div className="wd-section">
                        <div className="wd-section-header">
                            <div className="wd-section-title">🪙 USDT WALLET DETAILS</div>
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                            <label style={labelStyle}>Network / Blockchain</label>
                            <select
                                className="wd-bank-select"
                                value={usdtNetwork}
                                onChange={(e) => setUsdtNetwork(e.target.value)}
                            >
                                <option value="TRC20">TRC20 (Tron - Low Fee)</option>
                                <option value="BEP20">BEP20 (BSC - Binance Smart Chain)</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                            <label style={labelStyle}>USDT Wallet Address</label>
                            <input
                                type="text"
                                style={inputStyle}
                                placeholder={
                                    usdtNetwork === 'TRC20'
                                        ? 'e.g. TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE'
                                        : 'e.g. 0x1234567890abcdef1234567890abcdef12345678'
                                }
                                value={usdtWalletAddress}
                                onChange={(e) => setUsdtWalletAddress(e.target.value)}
                            />
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                            <label style={labelStyle}>Label (Optional)</label>
                            <input
                                type="text"
                                style={inputStyle}
                                placeholder="e.g. My Binance Wallet"
                                value={usdtLabel}
                                onChange={(e) => setUsdtLabel(e.target.value)}
                            />
                        </div>

                        <div style={{
                            padding: '12px 14px',
                            background: '#fef3c7',
                            border: '1px solid #fcd34d',
                            borderRadius: '10px',
                            fontSize: '11px',
                            color: '#92400e',
                            fontWeight: 600
                        }}>
                            ⚠️ Double-check the network and wallet address. Wrong address = lost funds.
                        </div>
                    </div>
                )}

                {/* Amount Section */}
                <div className="wd-section">
                    <div className="wd-amount-label">
                        <div className="wd-amount-title">💵 Withdrawal Amount</div>
                        <div className="wd-amount-limits">
                            Min: R$ 100 | Max: R$ {(user?.withdrawableBalance || 0).toFixed(0)}
                        </div>
                    </div>

                    <div className="wd-amount-input-wrap">
                        <span className="wd-amount-prefix">R$</span>
                        <input
                            type="number"
                            className="wd-amount-input"
                            placeholder="0"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>

                    <div className="wd-quick-amounts">
                        {[25, 50, 75, 100].map(percent => {
                            const amt = Math.floor((user?.withdrawableBalance || 0) * percent / 100);
                            return (
                                <button
                                    key={percent}
                                    className={`wd-quick-btn ${Number(amount) === amt ? 'active' : ''}`}
                                    onClick={() => setAmount(String(amt))}
                                    disabled={amt < 100}
                                >
                                    {percent === 100 ? 'MAX' : `${percent}%`}
                                </button>
                            );
                        })}
                    </div>

                    <div className="wd-summary">
                        <div className="wd-summary-row">
                            <span className="wd-summary-label">Withdrawal Amount:</span>
                            <span className="wd-summary-value">R$ {Number(amount || 0).toLocaleString()}</span>
                        </div>
                        <div className="wd-summary-row">
                            <span className="wd-summary-label">Payout Gateway Fee:</span>
                            <span className="wd-summary-value green">R$ 0 (FREE 0%)</span>
                        </div>
                        <div className="wd-summary-row">
                            <span className="wd-summary-label">Amount Received via {payoutMethod}:</span>
                            <span className="wd-summary-value">R$ {Number(amount || 0).toLocaleString()}</span>
                        </div>
                    </div>

                    <button
                        className="wd-submit-btn"
                        disabled={!canWithdraw || loading}
                        onClick={handleWithdraw}
                    >
                        {loading 
                            ? '⏳ Processing...' 
                            : `📤 Request Withdrawal via ${payoutMethod} (R$ ${Number(amount || 0).toLocaleString()})`}
                    </button>

                    {!canWithdraw && amount && (
                        <div style={{
                            textAlign: 'center',
                            marginTop: '12px',
                            fontSize: '12px',
                            color: '#dc2626',
                            fontWeight: 600
                        }}>
                            {payoutMethod === 'Bank' && !bankComplete
                                ? '⚠️ Please complete all bank details above'
                                : payoutMethod === 'PIX' && !pixComplete
                                    ? '⚠️ Please complete all PIX details above'
                                    : payoutMethod === 'USDT' && !usdtComplete
                                        ? '⚠️ Please complete all USDT details above'
                                        : Number(amount) > (user?.withdrawableBalance || 0)
                                            ? '⚠️ Insufficient withdrawable balance'
                                            : '⚠️ Amount must be at least R$ 100'}
                        </div>
                    )}
                </div>

                {/* History */}
                <div className="wd-section">
                    <div className="wd-section-header">
                        <div className="wd-section-title">📜 Your Withdrawal History</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>
                            {history.length} records
                        </div>
                    </div>

                    {history.length === 0 ? (
                        <div className="wd-bank-empty">
                            <div className="wd-bank-empty-text">
                                No withdrawal history yet. Complete mining cycles and sell RP to withdraw.
                            </div>
                        </div>
                    ) : (
                        history.map(tx => (
                            <div key={tx._id} className="wd-history-item">
                                <div className="wd-history-icon">📤</div>
                                <div className="wd-history-content">
                                    <div className="wd-history-title">
                                        R$ {tx.amount.toLocaleString()} via {tx.cryptoType}
                                    </div>
                                    <div className="wd-history-date">
                                        {formatDate(tx.createdAt)}
                                    </div>
                                </div>
                                <div className={`wd-history-status ${tx.status.toLowerCase()}`}>
                                    {tx.status}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Rules */}
                <div className="wd-rules">
                    <div className="wd-rules-title">ℹ️ Withdrawal Guidelines</div>
                    <ul className="wd-rules-list">
                        <li>Withdrawal requests are processed via automated 24x7 rails.</li>
                        <li>Bank transfer takes 5-15 minutes. PIX is instant. USDT in 10-30 min.</li>
                        <li>Minimum withdrawal amount is R$ 100.00.</li>
                        <li>Complete payment details are required for each method.</li>
                        <li>Admin approval is required for all withdrawals.</li>
                    </ul>
                </div>

            </div>
        </div>
    );
};

export default WithdrawPage;