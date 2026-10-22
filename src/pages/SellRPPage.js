import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardHeader from '../components/DashboardHeader';
import api from '../utils/api';
import './SellRPPage.css';

const SellRPPage = () => {
    const { user, login } = useAuth();
    const navigate = useNavigate();

    const [data, setData] = useState({ readyToSell: [] });
    const [selectedPlanId, setSelectedPlanId] = useState('');
    const [selectedBuyer, setSelectedBuyer] = useState('winzopay-official');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Verified buyers
    const buyers = [
        { 
            id: 'winzopay-official', 
            name: 'WinzoPay Official Market Desk #1', 
            tag: 'INSTANT AUTO-CREDIT', 
            tagClass: 'blue',
            rating: 4.99, 
            trades: 18420, 
            fill: 99.9 
        },
        { 
            id: 'apex-p2p', 
            name: 'Apex P2P Liquidity Merchant', 
            tag: 'ZERO FEE 0%', 
            tagClass: 'green',
            rating: 4.97, 
            trades: 12150, 
            fill: 99.8 
        },
        { 
            id: 'swift-capital', 
            name: 'SwiftCapital Exchange Node', 
            tag: 'HIGH VOLUME', 
            tagClass: 'orange',
            rating: 4.95, 
            trades: 9840, 
            fill: 99.6 
        }
    ];

    // Load ready plans
    const loadReadyPlans = async () => {
        try {
            const res = await api.get('/transaction/my-mining');
            setData(res.data);
            if (res.data.readyToSell.length > 0 && !selectedPlanId) {
                setSelectedPlanId(res.data.readyToSell[0]._id);
            }
        } catch (err) {
            console.error('Load failed:', err);
        }
    };

    useEffect(() => {
        loadReadyPlans();
        const interval = setInterval(loadReadyPlans, 10000);
        return () => clearInterval(interval);
    }, []);

    const selectedPlan = data.readyToSell.find(p => p._id === selectedPlanId);

    // Handle Sell
    const handleSell = async () => {
        setMessage({ type: '', text: '' });

        if (!selectedPlanId) {
            setMessage({ type: 'error', text: 'Please select a plan to sell' });
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/transaction/sell-rp', { miningPlanId: selectedPlanId });
            
            const updatedUser = { ...user, ...res.data.user };
            login(updatedUser, localStorage.getItem('winzopay_token'));

            setMessage({ type: 'success', text: `✅ ${res.data.message}` });
            setSelectedPlanId('');
            loadReadyPlans();

            setTimeout(() => navigate('/withdraw'), 2500);

        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Sell failed' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="sellrp-page">
            <DashboardHeader activeNav="sell-rp" />

            <div className="sellrp-container">

                <div className="sellrp-header">
                    <div className="sellrp-header-icon">💱</div>
                    <div>
                        <div className="sellrp-title">Sell RP to Seller</div>
                        <div className="sellrp-subtitle">Step 5: Sell mined RP • Add capital + profit to Withdrawable Balance</div>
                    </div>
                </div>

                {/* Step Banner */}
                <div className="sellrp-step-banner">
                    <div className="sellrp-step-num">5</div>
                    <div className="sellrp-step-content">
                        <div className="sellrp-step-title">Sell RP to Designated Buyer</div>
                        <div className="sellrp-step-sub">RP Balance deducted • Added to Withdrawable Balance</div>
                    </div>
                    <div className="sellrp-section-badge">Step 5</div>
                </div>

                {/* Balance Grid */}
                <div className="sellrp-balance-grid">
                    <div className="sellrp-balance-card green">
                        <div className="sellrp-balance-label">💵 WITHDRAWABLE BALANCE</div>
                        <div className="sellrp-balance-value">
                            R$ {user?.withdrawableBalance?.toFixed(2) || '0.00'}
                        </div>
                    </div>
                    <div className="sellrp-balance-card">
                        <div className="sellrp-balance-label">💼 TOP-UP BALANCE</div>
                        <div className="sellrp-balance-value">
                            R$ {user?.balance?.toFixed(2) || '0.00'}
                        </div>
                    </div>
                </div>

                {message.text && (
                    <div className={`sellrp-alert ${message.type}`}>{message.text}</div>
                )}

                {/* Step 1: Select Plan */}
                <div className="sellrp-section">
                    <div className="sellrp-section-header">
                        <div className="sellrp-section-title">1. Select Mined RP Package to Sell</div>
                        <div className="sellrp-section-badge">
                            {data.readyToSell.length} Ready to Sell
                        </div>
                    </div>

                    {data.readyToSell.length === 0 ? (
                        <div className="sellrp-empty">
                            You do not have any completed RP mining plans yet.
                            <br /><br />
                            <button
                                onClick={() => navigate('/buy-rp')}
                                style={{
                                    padding: '10px 20px',
                                    background: '#0f172a',
                                    color: 'white',
                                    borderRadius: '10px',
                                    fontSize: '13px',
                                    fontWeight: 700,
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                Buy an RP Plan First →
                            </button>
                        </div>
                    ) : (
                        <div className="sellrp-plan-list">
                            {data.readyToSell.map(plan => (
                                <div
                                    key={plan._id}
                                    className={`sellrp-plan-item ${selectedPlanId === plan._id ? 'selected' : ''}`}
                                    onClick={() => setSelectedPlanId(plan._id)}
                                >
                                    <div className="sellrp-plan-badge">{plan.planName}</div>
                                    <div className="sellrp-plan-info">
                                        <div className="sellrp-plan-name">
                                            Plan {plan.planName} — {plan.profitPercent}% ROI
                                        </div>
                                        <div className="sellrp-plan-meta">
                                            Investment: R$ {plan.investmentAmount.toLocaleString()} • Profit: R$ {plan.expectedProfit.toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="sellrp-plan-value">
                                        R$ {plan.totalReturn.toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Step 2: Select Buyer */}
                <div className="sellrp-section">
                    <div className="sellrp-section-header">
                        <div className="sellrp-section-title">2. Select Designated Verified Buyer</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>
                            Instant Liquidity Desk
                        </div>
                    </div>

                    <div className="sellrp-buyer-list">
                        {buyers.map(buyer => (
                            <div
                                key={buyer.id}
                                className={`sellrp-buyer-item ${selectedBuyer === buyer.id ? 'selected' : ''}`}
                                onClick={() => setSelectedBuyer(buyer.id)}
                            >
                                <div className="sellrp-buyer-radio" />
                                <div className="sellrp-buyer-info">
                                    <div className="sellrp-buyer-name">
                                        {buyer.name}
                                        <span className={`sellrp-buyer-tag ${buyer.tagClass}`}>
                                            {buyer.tag}
                                        </span>
                                    </div>
                                    <div className="sellrp-buyer-rating">
                                        ⭐ {buyer.rating} • {buyer.trades.toLocaleString()} trades • {buyer.fill}% Fill
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Summary */}
                {selectedPlan && (
                    <div className="sellrp-section">
                        <div className="sellrp-section-title" style={{ marginBottom: '12px' }}>
                            3. Sell Summary
                        </div>
                        <div className="sellrp-summary">
                            <div className="sellrp-summary-row">
                                <span className="sellrp-summary-label">Investment Return:</span>
                                <span className="sellrp-summary-value">
                                    R$ {selectedPlan.investmentAmount.toLocaleString()}
                                </span>
                            </div>
                            <div className="sellrp-summary-row">
                                <span className="sellrp-summary-label">Profit ({selectedPlan.profitPercent}%):</span>
                                <span className="sellrp-summary-value green">
                                    + R$ {selectedPlan.expectedProfit.toLocaleString()}
                                </span>
                            </div>
                            <div className="sellrp-summary-row">
                                <span className="sellrp-summary-label">Total to Add to Withdrawable:</span>
                                <span className="sellrp-summary-value">
                                    R$ {selectedPlan.totalReturn.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        <button
                            className="sellrp-submit-btn"
                            disabled={loading}
                            onClick={handleSell}
                        >
                            {loading ? '⏳ Processing...' : `💰 Confirm Sell to ${buyers.find(b => b.id === selectedBuyer)?.name.split(' ')[0]} →`}
                        </button>
                    </div>
                )}

                {/* Rules */}
                <div className="sellrp-rules">
                    <div className="sellrp-rules-title">ℹ️ RP Selling & Settlement Rules</div>
                    <ul className="sellrp-rules-list">
                        <li>RP can only be sold after the mining cycle is 100% completed.</li>
                        <li>Settlement is processed instantly after confirmed sell.</li>
                        <li>Total Return (Capital + Profit) is added directly to your Withdrawable Balance.</li>
                        <li>You can then proceed to Step 6: Withdraw your funds.</li>
                    </ul>
                </div>

            </div>
        </div>
    );
};

export default SellRPPage;