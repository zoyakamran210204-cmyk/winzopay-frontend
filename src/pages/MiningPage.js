import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardHeader from '../components/DashboardHeader';
import api from '../utils/api';
import './MiningPage.css';

const MiningPage = () => {
    const { t } = useTranslation();
    const { user, login } = useAuth();
    const navigate = useNavigate();

    const [data, setData] = useState({ active: [], readyToSell: [], all: [], stats: {} });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('active');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [now, setNow] = useState(new Date()); // Live tick

    // Load mining plans
    const loadPlans = async () => {
        try {
            const res = await api.get('/transaction/my-mining');
            setData(res.data);
        } catch (err) {
            console.error('Load failed:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPlans();
        // Refresh every 5 seconds
        const interval = setInterval(loadPlans, 5000);
        return () => clearInterval(interval);
    }, []);

    // Live tick for countdown
    useEffect(() => {
        const tick = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(tick);
    }, []);

    // Sell a completed plan
    const handleSell = async (miningPlanId) => {
        setMessage({ type: '', text: '' });
        try {
            const res = await api.post('/transaction/sell-rp', { miningPlanId });

            // Update user context
            const updatedUser = { ...user, ...res.data.user };
            login(updatedUser, localStorage.getItem('winzopay_token'));

            setMessage({ type: 'success', text: `✅ ${res.data.message}` });
            loadPlans();

        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Sell failed' });
        }
    };

    // Format countdown
    const getCountdown = (endTime) => {
        const total = new Date(endTime) - now;
        if (total <= 0) return '00:00:00';
        const s = Math.floor(total / 1000);
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    };

    // Get progress percentage
    const getProgress = (plan) => {
        const start = new Date(plan.startTime).getTime();
        const end = new Date(plan.endTime).getTime();
        const total = end - start;
        const elapsed = now.getTime() - start;
        const percent = Math.min(100, Math.max(0, (elapsed / total) * 100));
        return percent;
    };

    const formatDate = (d) => {
        return new Date(d).toLocaleString('pt-BR', {
            day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
        });
    };

    const renderCard = (plan) => {
        const progress = getProgress(plan);
        const countdown = getCountdown(plan.endTime);
        const isCompleted = plan.status === 'Completed' || new Date(plan.endTime) <= now;

        return (
            <div key={plan._id} className={`mining-card ${isCompleted ? 'completed' : ''} ${plan.status === 'Sold' ? 'sold' : ''}`}>
                <div className="mining-card-header">
                    <div className="mining-card-title">
                        <div className="mining-plan-badge">{plan.planName}</div>
                        <div>
                            <div className="mining-card-name">
                                Plan {plan.planName} — {plan.profitPercent}% ROI
                            </div>
                            <div className="mining-card-date">
                                Started: {formatDate(plan.startTime)}
                            </div>
                        </div>
                    </div>
                    <div className={`mining-status-badge ${plan.status.toLowerCase()}`}>
                        {plan.status}
                    </div>
                </div>

                {/* Progress Bar */}
                {plan.status === 'Active' && (
                    <div className="mining-progress-section">
                        <div className="mining-progress-labels">
                            <span>⛏️ Mining in progress...</span>
                            <span>{progress.toFixed(1)}%</span>
                        </div>
                        <div className="mining-progress-bar">
                            <div className="mining-progress-fill" style={{ width: `${progress}%` }} />
                        </div>
                    </div>
                )}

                {/* Countdown */}
                {plan.status === 'Active' && (
                    <div className="mining-countdown">
                        <span className="mining-countdown-icon">⏱️</span>
                        <span className="mining-countdown-label">Completes in:</span>
                        <span className="mining-countdown-time">{countdown}</span>
                    </div>
                )}

                {/* Details */}
                <div className="mining-details">
                    <div className="mining-detail-item">
                        <div className="mining-detail-label">Investment</div>
                        <div className="mining-detail-value">R$ {plan.investmentAmount.toLocaleString()}</div>
                    </div>
                    <div className="mining-detail-item">
                        <div className="mining-detail-label">Expected Profit</div>
                        <div className="mining-detail-value green">+ R$ {plan.expectedProfit.toLocaleString()}</div>
                    </div>
                    <div className="mining-detail-item">
                        <div className="mining-detail-label">Total Return</div>
                        <div className="mining-detail-value">R$ {plan.totalReturn.toLocaleString()}</div>
                    </div>
                </div>

                {/* Action */}
                {plan.status === 'Active' && (
                    <button className="mining-action-btn" disabled>
                        ⏳ Mining in Progress ({countdown})
                    </button>
                )}

                {isCompleted && plan.status !== 'Sold' && (
                    <button
                        className="mining-action-btn sell"
                        onClick={() => handleSell(plan._id)}
                    >
                        💰 Sell RP for R$ {plan.totalReturn.toLocaleString()} →
                    </button>
                )}

                {plan.status === 'Sold' && (
                    <button className="mining-action-btn" disabled>
                        ✅ Sold
                    </button>
                )}
            </div>
        );
    };

    const currentList = activeTab === 'active' ? data.active
                     : activeTab === 'ready' ? data.readyToSell
                     : data.all;

    return (
        <div className="mining-page">
            <DashboardHeader activeNav="mining" />

            <div className="mining-container">

                {/* Header */}
                <div className="mining-header">
                    <div className="mining-header-icon">⛏️</div>
                    <div>
                        <div className="mining-title">RP Mining Center</div>
                        <div className="mining-subtitle">Step 4 & 5: Live mining rigs & yield progress</div>
                    </div>
                </div>

                {/* Stats */}
                <div className="mining-stats">
                    <div className="mining-stat-card">
                        <div className="mining-stat-label">⛏️ ACTIVE MINING CAPITAL</div>
                        <div className="mining-stat-value">
                            R$ {data.stats.totalMiningCapital?.toFixed(2) || '0.00'}
                        </div>
                        <div className="mining-stat-sub">
                            {data.stats.activeCount || 0} Rigs Active
                        </div>
                    </div>
                    <div className="mining-stat-card">
                        <div className="mining-stat-label">💰 TOTAL MINING PROFITS</div>
                        <div className="mining-stat-value green">
                            + R$ {data.stats.totalMiningProfits?.toFixed(2) || '0.00'}
                        </div>
                        <div className="mining-stat-sub">
                            {data.stats.readyToSellCount || 0} Ready to Sell
                        </div>
                    </div>
                </div>

                {/* Alert */}
                {message.text && (
                    <div className={`mining-alert ${message.type}`}>
                        {message.text}
                    </div>
                )}

                {/* Tabs */}
                <div className="mining-tabs">
                    <button
                        className={`mining-tab ${activeTab === 'active' ? 'active' : ''}`}
                        onClick={() => setActiveTab('active')}
                    >
                        Active Mining ({data.active.length})
                    </button>
                    <button
                        className={`mining-tab ${activeTab === 'ready' ? 'active' : ''}`}
                        onClick={() => setActiveTab('ready')}
                    >
                        Ready to Sell ({data.readyToSell.length})
                    </button>
                    <button
                        className={`mining-tab ${activeTab === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveTab('all')}
                    >
                        All Plans ({data.all.length})
                    </button>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="mining-empty">
                        <div className="mining-empty-icon">⏳</div>
                        <div className="mining-empty-title">Loading...</div>
                    </div>
                ) : currentList.length === 0 ? (
                    <div className="mining-empty">
                        <div className="mining-empty-icon">⛏️</div>
                        <div className="mining-empty-title">No {activeTab === 'active' ? 'active mining plans' : activeTab === 'ready' ? 'completed plans to sell' : 'mining plans yet'}</div>
                        <div className="mining-empty-text">
                            {activeTab === 'active'
                                ? 'Purchase an RP Mining Plan using your Top-Up balance to start earning daily mining profits.'
                                : 'Complete a mining cycle to sell your RP and receive capital + profit.'}
                        </div>
                        {activeTab !== 'all' && (
                            <button className="mining-empty-btn" onClick={() => navigate('/buy-rp')}>
                                💰 Buy RP Mining Plan
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="mining-grid">
                        {currentList.map(renderCard)}
                    </div>
                )}

            </div>
        </div>
    );
};

export default MiningPage;