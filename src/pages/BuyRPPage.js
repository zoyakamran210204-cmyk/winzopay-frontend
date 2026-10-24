import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api'; 
import DashboardHeader from '../components/DashboardHeader';
import './BuyRPPage.css';

const BuyRPPage = () => {
    const { t } = useTranslation();
    const { user, login } = useAuth(); 
    const navigate = useNavigate();

    const [selectedPlan, setSelectedPlan] = useState('A');
    const [amount, setAmount] = useState('');
    const [selectedCrypto, setSelectedCrypto] = useState('BTC');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(''); 
    const [loading, setLoading] = useState(false); 

    // ⚠️ Cycle 15 min set kar diya
    const plans = [
        { 
            id: 'A', name: 'Starter RP Miner', roi: '5%', min: 100, max: 500, cycle: '15 min', hashrate: '25.4 MH/s',
            quickAmounts: [100, 200, 300, 500]
        },
        { 
            id: 'B', name: 'Silver Growth Rig', roi: '8%', min: 501, max: 1000, cycle: '15 min', hashrate: '64.8 MH/s',
            quickAmounts: [501, 700, 800, 1000]
        },
        { 
            id: 'C', name: 'Gold Pro Mining Farm', roi: '10%', min: 1001, max: 5000, cycle: '15 min', hashrate: '142.5 MH/s',
            quickAmounts: [1001, 2000, 5000]
        },
        { 
            id: 'D', name: 'Diamond Quantum Miner', roi: '12%', min: 10000, max: 100000, cycle: '15 min', hashrate: '380.0 MH/s',
            quickAmounts: [10001, 20000, 50000, 100000]
        }
    ];

    const cryptoOptions = [
        { key: 'BTC', label: 'BTC', color: 'btc', icon: '₿' },
        { key: 'BTC(r)', label: 'BTC(r)', color: 'btcr', icon: '₿' },
        { key: 'USDT', label: 'USDT', color: 'usdt', icon: '₮' },
        { key: 'ETH', label: 'ETH', color: 'eth', icon: 'Ξ' }
    ];

    const currentPlan = plans.find(p => p.id === selectedPlan);

    const handleBuy = async () => {
        setError('');
        setSuccess('');

        const amt = Number(amount);
        if (!amt) {
            setError('Please enter amount');
            return;
        }

        if (amt < currentPlan.min || amt > currentPlan.max) {
            setError(`Plan ${selectedPlan} range is R$ ${currentPlan.min} to R$ ${currentPlan.max}`);
            return;
        }

        if (amt > (user?.balance || 0)) {
            setError(`Insufficient balance. You have R$ ${user?.balance?.toFixed(2) || '0.00'}, need R$ ${amt.toFixed(2)}`);
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/transaction/buy-rp', {
                planName: selectedPlan,
                amount: amt
            });

            const updatedUser = { ...user, ...res.data.user };
            login(updatedUser, localStorage.getItem('winzopay_token'));

            setSuccess(`✅ ${res.data.message} Redirecting to Mining...`);
            setAmount('');

            setTimeout(() => navigate('/mining'), 2000);

        } catch (err) {
            setError(err.response?.data?.message || 'Purchase failed');
        } finally {
            setLoading(false);
        }
    };

    const expectedProfit = amount ? (Number(amount) * parseInt(currentPlan.roi) / 100) : 0;
    const totalReturn = amount ? (Number(amount) + expectedProfit) : 0;
    const canBuy = amount && Number(amount) >= currentPlan.min && Number(amount) <= currentPlan.max && Number(amount) <= (user?.balance || 0);

    return (
        <div className="buyrp-page">
            <DashboardHeader activeNav="buy-rp" />

            <div className="buyrp-container">
                <div className="buyrp-header">
                    <div className="buyrp-header-icon">💰</div>
                    <div>
                        <div className="buyrp-title">{t('buy_rp')} Mining Plan</div>
                        <div className="buyrp-subtitle">Step 2: Choose plan & start mining</div>
                    </div>
                </div>

                <div className="buyrp-steps">
                    <div className="buyrp-step active">
                        <div className="buyrp-step-num">2</div>
                        <div>
                            <div className="buyrp-step-title">RP Mining Plan Purchase</div>
                            <div className="buyrp-step-sub">Select plan and amount → start mining instantly</div>
                        </div>
                    </div>
                </div>

                <div className="buyrp-balance-card">
                    <div>
                        <div className="buyrp-balance-label">💼 Available Top-Up Balance</div>
                        <div className="buyrp-balance-value">R$ {user?.balance?.toFixed(2) || '0.00'}</div>
                    </div>
                    <button className="buyrp-topup-btn" onClick={() => navigate('/deposit')}>
                        + Top-Up More
                    </button>
                </div>

                {error && <div className="buyrp-alert error">⚠️ {error}</div>}
                {success && <div className="buyrp-alert success">{success}</div>}

                <div className="buyrp-section-title">📋 Select RP Mining Plan</div>
                <div className="buyrp-plan-grid">
                    {plans.map(plan => (
                        <div
                            key={plan.id}
                            className={`buyrp-plan-card ${selectedPlan === plan.id ? 'selected' : ''}`}
                            onClick={() => { setSelectedPlan(plan.id); setAmount(''); }}
                        >
                            <div className="buyrp-plan-header">
                                <div className="buyrp-plan-name">{plan.name}</div>
                                <div className="buyrp-plan-roi">{plan.roi} ROI</div>
                            </div>
                            <div className="buyrp-plan-detail">⏱️ Cycle: <strong>{plan.cycle}</strong></div>
                            <div className="buyrp-plan-detail">⚡ Hashrate: <strong>{plan.hashrate}</strong></div>
                            <div className="buyrp-plan-range">
                                Range: <strong>R$ {plan.min.toLocaleString()} - R$ {plan.max.toLocaleString()}</strong>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="buyrp-input-card">
                    <div className="buyrp-amount-label">
                        <div className="buyrp-amount-title">💵 Investment Amount for {currentPlan.name}</div>
                        <div className="buyrp-amount-limits">
                            Min: R$ {currentPlan.min.toLocaleString()} | Max: R$ {currentPlan.max.toLocaleString()}
                        </div>
                    </div>

                    <div className="buyrp-amount-input-wrap">
                        <span className="buyrp-amount-prefix">R$</span>
                        <input
                            type="number"
                            className="buyrp-amount-input"
                            placeholder="0"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>

                    <div className="buyrp-quick-amounts">
                        {currentPlan.quickAmounts.map((amt, idx) => (
                            <button
                                key={idx}
                                type="button"
                                className={`buyrp-quick-btn ${Number(amount) === amt ? 'active' : ''}`}
                                onClick={() => setAmount(String(amt))}
                            >
                                {amt >= 1000 ? `R$ ${(amt / 1000).toFixed(0)}K` : `R$ ${amt}`}
                            </button>
                        ))}
                    </div>

                    <div style={{ marginTop: '20px', marginBottom: '15px' }}>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>
                            🪙 Select Crypto Method
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                            {cryptoOptions.map(crypto => (
                                <button
                                    key={crypto.key}
                                    type="button"
                                    onClick={() => setSelectedCrypto(crypto.key)}
                                    style={{
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                                        padding: '12px 8px',
                                        background: selectedCrypto === crypto.key ? '#eff6ff' : '#f8fafc',
                                        border: selectedCrypto === crypto.key ? '2px solid #1e40af' : '1px solid #e2e8f0',
                                        borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{
                                        width: '32px', height: '32px', borderRadius: '50%',
                                        background: crypto.key === 'BTC' ? '#f7931a' : crypto.key === 'BTC(r)' ? '#16a34a' : crypto.key === 'USDT' ? '#26a17b' : '#627eea',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'white', fontWeight: 800, fontSize: '14px'
                                    }}>
                                        {crypto.icon}
                                    </div>
                                    <span style={{
                                        fontSize: '11px', fontWeight: 700,
                                        color: selectedCrypto === crypto.key ? '#1e40af' : '#475569'
                                    }}>
                                        {crypto.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="buyrp-summary">
                        <div className="buyrp-summary-row">
                            <span className="buyrp-summary-label">Plan Purchase Amount:</span>
                            <span className="buyrp-summary-value red">- R$ {Number(amount || 0).toLocaleString()}</span>
                        </div>
                        <div className="buyrp-summary-row">
                            <span className="buyrp-summary-label">Selected Crypto:</span>
                            <span className="buyrp-summary-value">{selectedCrypto}</span>
                        </div>
                        <div className="buyrp-summary-row">
                            <span className="buyrp-summary-label">Mining Cycle:</span>
                            <span className="buyrp-summary-value">{currentPlan.cycle}</span>
                        </div>
                        <div className="buyrp-summary-row">
                            <span className="buyrp-summary-label">Expected Profit ({currentPlan.roi}):</span>
                            <span className="buyrp-summary-value green">+ R$ {expectedProfit.toLocaleString()}</span>
                        </div>
                        <div className="buyrp-summary-row">
                            <span className="buyrp-summary-label">Total Return (Upon Sale):</span>
                            <span className="buyrp-summary-value">R$ {totalReturn.toLocaleString()}</span>
                        </div>
                    </div>

                    <button
                        className="buyrp-buy-btn"
                        disabled={!canBuy || loading}
                        onClick={handleBuy}
                    >
                        {loading ? '⏳ Processing...' : `▶ Start Mining via ${selectedCrypto} (R$ ${Number(amount || 0).toLocaleString()})`}
                    </button>

                    {!canBuy && amount && (
                        <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '12px', color: '#dc2626', fontWeight: 600 }}>
                            {Number(amount) > (user?.balance || 0)
                                ? '⚠️ Insufficient balance. Please Top-Up first.'
                                : `⚠️ Amount must be within R$ ${currentPlan.min.toLocaleString()} - R$ ${currentPlan.max.toLocaleString()}`}
                        </div>
                    )}
                </div>

                <div className="buyrp-rules">
                    <div className="buyrp-rules-title">ℹ️ RP Mining Plan Rules</div>
                    <ul className="buyrp-rules-list">
                        <li>Plan is purchased directly from your Top-Up balance.</li>
                        <li>Mining starts instantly (no admin approval needed).</li>
                        <li>Your investment enters an automated mining period of 15 minutes.</li>
                        <li>RP cannot be sold until mining duration completes.</li>
                        <li>Once completed, proceed to Step 5: Sell RP to receive Capital + Profit.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default BuyRPPage;