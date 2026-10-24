import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardHeader from '../components/DashboardHeader';
import './BuyRPPage.css';

const BuyRPPage = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [selectedPlan, setSelectedPlan] = useState('A');
    const [amount, setAmount] = useState('');
    const [selectedCrypto, setSelectedCrypto] = useState('BTC'); // ⚠️ Naya State
    const [error, setError] = useState('');

    const plans = [
        { id: 'A', name: 'Starter RP Miner', roi: '5%', min: 100, max: 500, cycle: '120s', hashrate: '25.4 MH/s' },
        { id: 'B', name: 'Silver Growth Rig', roi: '8%', min: 501, max: 1000, cycle: '300s', hashrate: '64.8 MH/s' },
        { id: 'C', name: 'Gold Pro Mining Farm', roi: '10%', min: 1001, max: 1500, cycle: '300s', hashrate: '142.5 MH/s' },
        { id: 'D', name: 'Diamond Quantum Miner', roi: '12%', min: 10000, max: 100000, cycle: '500s', hashrate: '380.0 MH/s' }
    ];

    // ⚠️ Crypto Options
    const cryptoOptions = [
        { key: 'BTC', label: 'BTC', color: 'btc', icon: '₿' },
        { key: 'BTC(r)', label: 'BTC(r)', color: 'btcr', icon: '₿' },
        { key: 'USDT', label: 'USDT', color: 'usdt', icon: '₮' },
        { key: 'ETH', label: 'ETH', color: 'eth', icon: 'Ξ' }
    ];

    const currentPlan = plans.find(p => p.id === selectedPlan);

    const quickAmounts = [
        currentPlan.min,
        Math.round(currentPlan.min * 2),
        Math.round(currentPlan.min * 5),
        currentPlan.max
    ];

    const handleBuy = () => {
        setError('');

        const amt = Number(amount);
        if (!amt) {
            setError('Please enter amount');
            return;
        }

        if (amt < currentPlan.min || amt > currentPlan.max) {
            setError(`Plan ${selectedPlan} range is R$ ${currentPlan.min} to R$ ${currentPlan.max}`);
            return;
        }

        // Deposit page par redirect with plan, amount, aur crypto
        navigate(`/deposit?plan=${selectedPlan}&amount=${amt}&method=${selectedCrypto}`);
    };

    const expectedProfit = amount ? (Number(amount) * parseInt(currentPlan.roi) / 100) : 0;
    const totalReturn = amount ? (Number(amount) + expectedProfit) : 0;
    const canBuy = amount && Number(amount) >= currentPlan.min && Number(amount) <= currentPlan.max;

    return (
        <div className="buyrp-page">
            <DashboardHeader activeNav="buy-rp" />

            <div className="buyrp-container">
                <div className="buyrp-header">
                    <div className="buyrp-header-icon">💰</div>
                    <div>
                        <div className="buyrp-title">{t('buy_rp')} Mining Plan</div>
                        <div className="buyrp-subtitle">Step 2: Choose plan & proceed to payment</div>
                    </div>
                </div>

                <div className="buyrp-steps">
                    <div className="buyrp-step active">
                        <div className="buyrp-step-num">2</div>
                        <div>
                            <div className="buyrp-step-title">RP Mining Plan Purchase</div>
                            <div className="buyrp-step-sub">Select plan and amount → proceed to payment</div>
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
                        {quickAmounts.map((amt, idx) => (
                            <button
                                key={idx}
                                type="button"
                                className={`buyrp-quick-btn ${Number(amount) === amt ? 'active' : ''}`}
                                onClick={() => setAmount(String(amt))}
                            >
                                R$ {amt >= 1000 ? `${(amt / 1000).toFixed(0)}K` : amt}
                            </button>
                        ))}
                    </div>

                    {/* ⚠️ NAYA: Crypto Selection */}
                    <div style={{ marginTop: '20px', marginBottom: '15px' }}>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>
                            🪙 Select Crypto Method
                        </div>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, 1fr)',
                            gap: '8px'
                        }}>
                            {cryptoOptions.map(crypto => (
                                <button
                                    key={crypto.key}
                                    type="button"
                                    onClick={() => setSelectedCrypto(crypto.key)}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '12px 8px',
                                        background: selectedCrypto === crypto.key ? '#eff6ff' : '#f8fafc',
                                        border: selectedCrypto === crypto.key ? '2px solid #1e40af' : '1px solid #e2e8f0',
                                        borderRadius: '10px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        background: crypto.key === 'BTC' ? '#f7931a' : crypto.key === 'BTC(r)' ? '#16a34a' : crypto.key === 'USDT' ? '#26a17b' : '#627eea',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontWeight: 800,
                                        fontSize: '14px'
                                    }}>
                                        {crypto.icon}
                                    </div>
                                    <span style={{
                                        fontSize: '11px',
                                        fontWeight: 700,
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
                        disabled={!canBuy}
                        onClick={handleBuy}
                    >
                        ▶ Proceed to Payment via {selectedCrypto} (R$ {Number(amount || 0).toLocaleString()})
                    </button>

                    {!canBuy && amount && (
                        <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '12px', color: '#dc2626', fontWeight: 600 }}>
                            ⚠️ Amount must be within R$ {currentPlan.min.toLocaleString()} - R$ {currentPlan.max.toLocaleString()}
                        </div>
                    )}
                </div>

                <div className="buyrp-rules">
                    <div className="buyrp-rules-title">ℹ️ RP Mining Plan Rules</div>
                    <ul className="buyrp-rules-list">
                        <li>After payment, admin will verify and activate your plan within 5-15 minutes.</li>
                        <li>Your investment enters an automated mining period with live hashrate calculation.</li>
                        <li>RP cannot be sold until mining duration completes.</li>
                        <li>Once completed, proceed to Step 5: Sell RP to Seller to receive Capital + Profit.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default BuyRPPage;