import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import DashboardHeader from '../components/DashboardHeader';
import api from '../utils/api';
import './DepositPage.css';

const DepositPage = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const planParam = searchParams.get('plan');
    const amountParam = searchParams.get('amount');

    const [settings, setSettings] = useState(null);
    const [amount, setAmount] = useState(amountParam || '');
    const [cryptoType, setCryptoType] = useState('USDT');
    const [loading, setLoading] = useState(false);
    const [settingsLoading, setSettingsLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [history, setHistory] = useState([]);
    const [copied, setCopied] = useState('');
    const [transactionId, setTransactionId] = useState('');
    const [paymentProof, setPaymentProof] = useState('');
    const [paymentImage, setPaymentImage] = useState(null);

    // ⚠️ NAYA: Plan ke hisaab se quick amounts
    const planQuickAmounts = {
        'A': [100, 200, 300, 500],
        'B': [501, 700, 800, 1000],
        'C': [1001, 2000, 5000, 10000],
        'D': [10001, 20000, 50000, 100000]
    };

    const quickAmounts = planParam 
        ? planQuickAmounts[planParam] || [100, 500, 1000, 2500, 5000, 10000]
        : [100, 500, 1000, 2500, 5000, 10000];

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const res = await api.get('/payment');
                setSettings(res.data);
            } catch (err) {
                console.error('Settings load failed:', err);
            } finally {
                setSettingsLoading(false);
            }
        };
        loadSettings();
    }, []);

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const res = await api.get('/transaction/my-transactions');
                setHistory(res.data.filter(tx => tx.type === 'Deposit'));
            } catch (err) {
                console.error(err);
            }
        };
        loadHistory();
    }, []);

    const paymentMethods = [
        { key: 'BTC', label: 'BTC', color: 'btc' },
        { key: 'BTC(r)', label: 'BTC(r)', color: 'btcr' },
        { key: 'USDT', label: 'USDT', color: 'usdt' },
        { key: 'ETH', label: 'ETH', color: 'eth' },
        { key: 'Bank', label: 'BANK', color: 'bank' }
    ];

    const handleProceed = async () => {
        setError('');
        setSuccess('');
        const amt = Number(amount);

        if (!amt || amt < 100) {
            setError('Minimum deposit is R$ 100');
            return;
        }
        if (amt > 100000) {
            setError('Maximum deposit is R$ 100,000');
            return;
        }

        if (cryptoType === 'Bank' && (!transactionId || transactionId.trim().length < 3)) {
            setError('Please enter the transaction ID / UTR for bank transfer');
            return;
        }

        setLoading(true);
        try {
            await api.post('/transaction/deposit', {
                amount: amt,
                cryptoType,
                planName: planParam || null,
                transactionId: cryptoType === 'Bank' ? transactionId.trim() : null,
                paymentProof: paymentProof || (paymentImage ? paymentImage.name : null)
            });

            setSuccess('✅ Deposit request submitted! Admin will verify your payment.');
            
            setTransactionId('');
            setPaymentProof('');
            setPaymentImage(null);
            setAmount('');
            
            const res = await api.get('/transaction/my-transactions');
            setHistory(res.data.filter(tx => tx.type === 'Deposit'));

        } catch (err) {
            setError(err.response?.data?.message || 'Deposit failed');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text, type) => {
        navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(''), 2000);
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const canProceed = 
        Number(amount) >= 100 && 
        Number(amount) <= 100000 && 
        (cryptoType !== 'Bank' || transactionId.trim().length >= 3);

    const getCurrentDetails = () => {
        if (!settings) return null;
        if (cryptoType === 'Bank') {
            return {
                type: 'bank',
                companyName: settings.bank.companyName,
                bankName: settings.bank.bankName,
                cnpj: settings.bank.cnpj,
                evpKey: settings.bank.evpKey,
                randomKey: settings.bank.randomKey
            };
        }
        return {
            type: 'crypto',
            network: cryptoType,
            address: settings.wallets[cryptoType]
        };
    };

    const currentDetails = getCurrentDetails();

    return (
        <div className="dep-page">
            <DashboardHeader activeNav="deposit" />

            <div className="dep-container">
                <div className="dep-breadcrumb">
                    <span>←</span>
                    <div>
                        <div className="dep-breadcrumb-title">
                            {planParam ? `Pay for Plan ${planParam}` : 'Top-Up Balance (Deposit)'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                            {planParam 
                                ? `Amount to deposit: R$ ${Number(amountParam || 0).toLocaleString()}`
                                : 'Step 1: Deposit funds to purchase RP Plans'}
                        </div>
                    </div>
                </div>

                {planParam && (
                    <div style={{
                        padding: '14px 18px',
                        background: '#fef3c7',
                        border: '1px solid #fcd34d',
                        borderRadius: 12,
                        fontSize: 13,
                        fontWeight: 600,
                        color: '#92400e',
                        marginBottom: 20
                    }}>
                        ⚠️ You are depositing for <strong>Plan {planParam}</strong>. After admin approval, your plan will activate automatically.
                    </div>
                )}

                {error && <div className="dep-alert error">⚠️ {error}</div>}
                {success && <div className="dep-alert success">{success}</div>}

                <div className="dep-card">
                    <div className="dep-amount-label">
                        <div className="dep-amount-title">💵 Enter Deposit Amount</div>
                        <div className="dep-amount-limits">Min: R$ 100 | Max: R$ 100,000</div>
                    </div>

                    <div className="dep-amount-input-wrap">
                        <span className="dep-amount-prefix">R$</span>
                        <input
                            type="number"
                            className="dep-amount-input"
                            placeholder="0"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>

                    {/* ⚠️ Plan specific quick amounts */}
                    <div className="dep-quick-amounts">
                        {quickAmounts.map(amt => (
                            <button
                                key={amt}
                                type="button"
                                className={`dep-quick-btn ${Number(amount) === amt ? 'active' : ''}`}
                                onClick={() => setAmount(String(amt))}
                            >
                                R$ {amt >= 1000 ? `${amt / 1000}K` : amt}
                            </button>
                        ))}
                    </div>

                    <div className="dep-payment-title">💳 Select Payment Method</div>
                    <div className="dep-payment-grid">
                        {paymentMethods.map(method => (
                            <button
                                key={method.key}
                                type="button"
                                className={`dep-payment-btn ${cryptoType === method.key ? 'active' : ''}`}
                                onClick={() => setCryptoType(method.key)}
                            >
                                <div className={`dep-payment-icon ${method.color}`}>
                                    {method.label.charAt(0)}
                                </div>
                                <span className="dep-payment-name">{method.label}</span>
                            </button>
                        ))}
                    </div>

                    {settingsLoading ? (
                        <div style={{ textAlign: 'center', padding: 20, color: '#94a3b8' }}>
                            ⏳ Loading payment details...
                        </div>
                    ) : currentDetails && (
                        <div style={{
                            background: currentDetails.type === 'crypto' ? '#eff6ff' : '#f0fdf4',
                            border: `2px solid ${currentDetails.type === 'crypto' ? '#bfdbfe' : '#86efac'}`,
                            borderRadius: 14,
                            padding: 20,
                            marginBottom: 20
                        }}>
                            {currentDetails.type === 'crypto' ? (
                                <>
                                    <div style={{ fontSize: 11, fontWeight: 800, color: '#1e40af', textTransform: 'uppercase', marginBottom: 10 }}>
                                        💰 {currentDetails.network} Deposit Address
                                    </div>
                                    <div style={{
                                        background: 'white', padding: '14px 16px', borderRadius: 10,
                                        border: '1px solid #bfdbfe', fontFamily: 'monospace',
                                        fontSize: 14, fontWeight: 700, color: '#0f172a',
                                        wordBreak: 'break-all', marginBottom: 10
                                    }}>
                                        {currentDetails.address}
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(currentDetails.address, 'address')}
                                        style={{
                                            padding: '8px 16px', background: '#1e40af', color: 'white',
                                            border: 'none', borderRadius: 8, fontSize: 12,
                                            fontWeight: 700, cursor: 'pointer'
                                        }}
                                    >
                                        {copied === 'address' ? '✅ Copied!' : '📋 Copy Address'}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div style={{ fontSize: 11, fontWeight: 800, color: '#166534', textTransform: 'uppercase', marginBottom: 12 }}>
                                        🏦 Bank Transfer Details
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                            <span style={{ color: '#64748b', fontWeight: 600 }}>Company:</span>
                                            <span style={{ fontWeight: 800, color: '#0f172a' }}>{currentDetails.companyName}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                            <span style={{ color: '#64748b', fontWeight: 600 }}>Bank:</span>
                                            <span style={{ fontWeight: 800, color: '#0f172a' }}>{currentDetails.bankName}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                            <span style={{ color: '#64748b', fontWeight: 600 }}>CNPJ:</span>
                                            <span style={{ fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>{currentDetails.cnpj}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                            <span style={{ color: '#64748b', fontWeight: 600 }}>EVP/PIX:</span>
                                            <span style={{ fontWeight: 800, color: '#0f172a', fontFamily: 'monospace', fontSize: 11 }}>{currentDetails.evpKey}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                            <span style={{ color: '#64748b', fontWeight: 600 }}>Random Key:</span>
                                            <span style={{ fontWeight: 800, color: '#0f172a', fontFamily: 'monospace', fontSize: 10 }}>{currentDetails.randomKey}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(currentDetails.evpKey, 'pix')}
                                        style={{
                                            marginTop: 12, padding: '8px 16px', background: '#16a34a',
                                            color: 'white', border: 'none', borderRadius: 8,
                                            fontSize: 12, fontWeight: 700, cursor: 'pointer'
                                        }}
                                    >
                                        {copied === 'pix' ? '✅ Copied!' : '📋 Copy PIX Key'}
                                    </button>
                                </>
                            )}
                        </div>
                    )}

                    {cryptoType === 'Bank' && (
                        <div style={{
                            background: '#fef3c7',
                            border: '2px solid #fcd34d',
                            borderRadius: 12,
                            padding: 16,
                            marginBottom: 20
                        }}>
                            <label style={{
                                display: 'block',
                                fontSize: 11,
                                fontWeight: 800,
                                color: '#92400e',
                                textTransform: 'uppercase',
                                marginBottom: 8,
                                letterSpacing: '0.3px'
                            }}>
                                🔑 Payment Transaction ID / UTR (Required for Bank)
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. 1234567890 or PIX E2E ID"
                                value={transactionId}
                                onChange={(e) => setTransactionId(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px 14px',
                                    background: 'white',
                                    border: '2px solid #fcd34d',
                                    borderRadius: 10,
                                    fontSize: 14,
                                    fontWeight: 600,
                                    color: '#0f172a',
                                    outline: 'none',
                                    fontFamily: 'monospace'
                                }}
                            />
                        </div>
                    )}

                    <div style={{ marginBottom: 20 }}>
                        <label style={{
                            display: 'block',
                            fontSize: 11,
                            fontWeight: 800,
                            color: '#64748b',
                            textTransform: 'uppercase',
                            marginBottom: 8,
                            letterSpacing: '0.3px'
                        }}>
                            📝 Payment Proof (Optional)
                        </label>
                        
                        <div style={{ marginBottom: 10 }}>
                            <input 
                                type="file" 
                                accept="image/*"
                                onChange={(e) => setPaymentImage(e.target.files[0])}
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    background: '#f8fafc',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: 10,
                                    fontSize: 12
                                }}
                            />
                            {paymentImage && (
                                <div style={{ fontSize: 11, color: '#16a34a', marginTop: 4, fontWeight: 600 }}>
                                    ✅ File selected: {paymentImage.name}
                                </div>
                            )}
                        </div>

                        <textarea
                            placeholder="Additional notes..."
                            value={paymentProof}
                            onChange={(e) => setPaymentProof(e.target.value)}
                            rows={2}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                background: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                borderRadius: 10,
                                fontSize: 13,
                                fontWeight: 500,
                                color: '#0f172a',
                                outline: 'none',
                                resize: 'vertical'
                            }}
                        />
                    </div>

                    <div className="dep-summary">
                        <div className="dep-summary-row">
                            <span className="dep-summary-label">Deposit Amount:</span>
                            <span className="dep-summary-value">R$ {Number(amount || 0).toLocaleString()}</span>
                        </div>
                        <div className="dep-summary-row">
                            <span className="dep-summary-label">Gateway Fee:</span>
                            <span className="dep-summary-value green">R$ 0 (FREE 0%)</span>
                        </div>
                        <div className="dep-summary-row">
                            <span className="dep-summary-label">Credited to Balance:</span>
                            <span className="dep-summary-value">R$ {Number(amount || 0).toLocaleString()}</span>
                        </div>
                    </div>

                    <button
                        className="dep-proceed-btn"
                        disabled={!canProceed || loading}
                        onClick={handleProceed}
                    >
                        {loading 
                            ? '⏳ Submitting...' 
                            : (cryptoType === 'Bank' && !transactionId.trim())
                                ? '🔑 Enter Transaction ID First'
                                : `✅ Submit Deposit for Approval`}
                    </button>

                    {!canProceed && amount && (
                        <div style={{ textAlign: 'center', marginTop: 12, fontSize: 12, color: '#dc2626', fontWeight: 600 }}>
                            {Number(amount) < 100 
                                ? '⚠️ Minimum deposit is R$ 100'
                                : Number(amount) > 100000
                                    ? '⚠️ Maximum deposit is R$ 100,000'
                                    : (cryptoType === 'Bank' && !transactionId.trim())
                                        ? '⚠️ Please enter your transaction ID / UTR'
                                        : ''}
                        </div>
                    )}
                </div>

                <div className="dep-card">
                    <div className="dep-card-title">📜 Your Deposit History</div>
                    <div className="dep-card-sub">{history.length} records</div>

                    {history.length === 0 ? (
                        <div className="dep-empty">No deposit history yet</div>
                    ) : (
                        history.map(tx => (
                            <div key={tx._id} className="dep-history-item">
                                <div className="dep-history-icon">⬇️</div>
                                <div className="dep-history-content">
                                    <div className="dep-history-title">
                                        R$ {tx.amount.toLocaleString()} via {tx.cryptoType}
                                    </div>
                                    {tx.transactionId && (
                                        <div style={{ fontSize: 11, color: '#1e40af', fontFamily: 'monospace', fontWeight: 700, marginTop: 2 }}>
                                            ID: {tx.transactionId}
                                        </div>
                                    )}
                                    <div className="dep-history-date">{formatDate(tx.createdAt)}</div>
                                </div>
                                <div className={`dep-history-status ${tx.status.toLowerCase()}`}>
                                    {tx.status}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default DepositPage;