import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCryptoRates, getMe } from '../utils/api';
import DashboardHeader from '../components/DashboardHeader';
import './DashboardPage.css';

const DashboardPage = () => {
    const { t } = useTranslation();
    const { user, login } = useAuth();
    const navigate = useNavigate();

    const [cryptoRates, setCryptoRates] = useState(null);
    const [ratesLoading, setRatesLoading] = useState(true);

    // ⚠️ Instant Refresh
    useEffect(() => {
        const refreshUser = async () => {
            try {
                const freshUser = await getMe();
                login(freshUser, localStorage.getItem('winzopay_token'));
            } catch (err) {
                console.error('Refresh failed:', err);
            }
        };
        const interval = setInterval(refreshUser, 2000);
        return () => clearInterval(interval);
    }, [login]);

    useEffect(() => {
        const fetchRates = async () => {
            try {
                const rates = await getCryptoRates();
                setCryptoRates(rates);
            } catch (err) {
                console.error('Crypto rates fetch failed:', err);
            } finally {
                setRatesLoading(false);
            }
        };
        fetchRates();
        const interval = setInterval(fetchRates, 60000);
        return () => clearInterval(interval);
    }, []);

    const cryptoOptions = [
        { key: 'BTC', symbol: 'BTC', label: 'BTC', color: 'btc' },
        { key: 'BTC(r)', symbol: 'BTC(r)', label: 'BTC(r)', color: 'btcr' },
        { key: 'USDT', symbol: 'USDT', label: 'USDT', color: 'usdt' },
        { key: 'ETH', symbol: 'ETH', label: 'ETH', color: 'eth' }
    ];

    const formatBRL = (value) => {
        if (!value) return '—';
        return `R$ ${value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}`;
    };

    const handleDepositClick = (plan) => {
        navigate(`/deposit?plan=${plan.id}&amount=${plan.quickAmounts[0]}`);
    };

    const plans = [
        {
            id: 'A', name: t('plan_a_name') || 'Starter RP Miner', returnValue: '5%', returnLabel: 'RETURN', depositMin: 100, depositMax: 500, cycle: '120s Fast Mining', hashrate: '25.4 MH/s',
            benefits: [t('plan_a_benefit_1') || '5% Guaranteed Mining Yield', t('plan_a_benefit_2') || 'Quick 120-Second Mining Period', t('plan_a_benefit_3') || 'Instant Auto-Completion', t('plan_a_benefit_4') || 'Direct Seller Marketplace Liquidity'], popular: false,
            quickAmounts: [100, 200, 300, 500]
        },
        {
            id: 'B', name: t('plan_b_name') || 'Silver Growth Rig', returnValue: '8%', returnLabel: 'RETURN', depositMin: 501, depositMax: 1000, cycle: '300s Mining Cycle', hashrate: '64.8 MH/s',
            benefits: [t('plan_b_benefit_1') || '8% Return on Total Investment', t('plan_b_benefit_2') || 'Dual-Cluster GPU Hash Processing', t('plan_b_benefit_3') || 'Priority Seller Settlement Lane', t('plan_b_benefit_4') || 'Zero Transaction Deductions'], popular: true,
            quickAmounts: [501, 700, 800, 1000]
        },
        {
            id: 'C', name: t('plan_c_name') || 'Gold Pro Mining Farm', returnValue: '10%', returnLabel: 'RETURN', depositMin: 1001, depositMax: 10000, cycle: '300s High Yield', hashrate: '142.5 MH/s',
            benefits: [t('plan_c_benefit_1') || '10% High Commission Profit', t('plan_c_benefit_2') || 'Dedicated ASIC Mining Rig Allocation', t('plan_c_benefit_3') || 'VIP Verified Buyer Matching', t('plan_c_benefit_4') || 'Instant Return to Top-Up Balance'], popular: false,
            quickAmounts: [1001, 2000, 5000, 10000]
        },
        {
            id: 'D', name: t('plan_d_name') || 'Diamond Quantum Miner', returnValue: '12%', returnLabel: 'RETURN', depositMin: 10001, depositMax: 100000, cycle: '500s VIP Master Cycle', hashrate: '380.0 MH/s',
            benefits: [t('plan_d_benefit_1') || '12% Maximum Top-Tier Mining Return', t('plan_d_benefit_2') || 'Highest Mining Power & Speed', t('plan_d_benefit_3') || 'Direct 1-Click Instant Sale to Official Desk', t('plan_d_benefit_4') || 'Instant Auto-Refund of Capital + Profit'], popular: false,
            quickAmounts: [10001, 20000, 50000, 100000]
        }
    ];

    return (
        <div className="db-page">
            <DashboardHeader activeNav="home" />
            <main className="db-main">
                <div className="db-left">
                    <div className="balance-card">
                        <div className="balance-header">
                            <div className="balance-label">💰 {t('top_up_balance')} ⓘ</div>
                            <div className="currency-toggle"><button className="currency-btn active">R$ BRL</button></div>
                        </div>
                        <div className="balance-value">R$ {user?.balance?.toFixed(2) || '0.00'}</div>
                        <div className="balance-sub">{t('balance_step_1')}</div>
                        <div className="balance-mini-cards">
                            <div className="mini-card">
                                <div className="mini-card-label">💵 {t('withdrawable')}</div>
                                <div className="mini-card-value">R$ {user?.withdrawableBalance?.toFixed(2) || '0.00'}</div>
                            </div>
                            <div className="mini-card">
                                <div className="mini-card-label">⛏️ {t('mining_capital')}</div>
                                <div className="mini-card-value">R$ {user?.miningCapital?.toFixed(2) || '0.00'}</div>
                            </div>
                            <div className="mini-card">
                                <div className="mini-card-label">💎 {t('rp_balance')}</div>
                                <div className="mini-card-value">R$ {user?.rpBalance?.toFixed(2) || '0.00'}</div>
                            </div>
                        </div>
                    </div>

                    <div className="quick-actions">
                        <div className="action-card" onClick={() => navigate('/deposit')} style={{ cursor: 'pointer' }}>
                            <div className="action-icon blue">⬇️</div>
                            <div className="action-content"><div className="action-title">{t('deposit')}</div><div className="action-sub">{t('top_up_balance_label')}</div></div>
                            <div className="action-step">Step 1</div>
                        </div>
                        <div className="action-card" onClick={() => navigate('/buy-rp')} style={{ cursor: 'pointer' }}>
                            <div className="action-icon dark">💰</div>
                            <div className="action-content"><div className="action-title">{t('buy_rp')}</div><div className="action-sub">{t('rp_mining_plan')}</div></div>
                            <div className="action-step">Step 2</div>
                        </div>
                        <div className="action-card" onClick={() => navigate('/sell-rp')} style={{ cursor: 'pointer' }}>
                            <div className="action-icon orange">💱</div>
                            <div className="action-content"><div className="action-title">{t('sell_rp')}</div><div className="action-sub">{t('sell_to_seller')}</div></div>
                            <div className="action-step">Step 5</div>
                        </div>
                        <div className="action-card" onClick={() => navigate('/withdraw')} style={{ cursor: 'pointer' }}>
                            <div className="action-icon green">⬆️</div>
                            <div className="action-content"><div className="action-title">{t('withdraw')}</div><div className="action-sub">{t('withdrawable_bal')}</div></div>
                            <div className="action-step">Step 6</div>
                        </div>
                    </div>

                    <div className="transaction-records">
                        <div className="section-title">{t('transaction_records')}</div>
                        <div className="transaction-grid">
                            <div className="transaction-item" onClick={() => navigate('/ledger')} style={{ cursor: 'pointer' }}><div className="transaction-icon">⬇️</div><div className="transaction-label">{t('deposits')}</div></div>
                            <div className="transaction-item" onClick={() => navigate('/ledger')} style={{ cursor: 'pointer' }}><div className="transaction-icon">💰</div><div className="transaction-label">{t('plan_purchases')}</div></div>
                            <div className="transaction-item" onClick={() => navigate('/ledger')} style={{ cursor: 'pointer' }}><div className="transaction-icon">💱</div><div className="transaction-label">{t('rp_sales')}</div></div>
                            <div className="transaction-item" onClick={() => navigate('/ledger')} style={{ cursor: 'pointer' }}><div className="transaction-icon">⬆️</div><div className="transaction-label">{t('withdrawals')}</div></div>
                        </div>
                    </div>

                    <div className="bank-account-section">
                        <div className="bank-header">
                            <div className="bank-title">🏦 {t('linked_bank')}</div>
                            <button className="bank-manage" onClick={() => navigate('/profile')}>{t('manage')} (0)</button>
                        </div>
                        <div className="bank-empty">
                            <p>{t('bank_empty_msg')}</p>
                            <button className="bank-link-btn" onClick={() => navigate('/profile')}>{t('link_bank')}</button>
                        </div>
                    </div>
                </div>

                <div className="db-right">
                    <div className="crypto-rates-bar">
                        <div className="crypto-rates-label">🔴 LIVE RATES (BRL)</div>
                        {ratesLoading ? (<div className="crypto-loading"><span className="spin">⏳</span> Loading rates...</div>) : (
                            cryptoOptions.map(crypto => (
                                <div key={crypto.key} className="crypto-rate-item">
                                    <div className={`crypto-icon ${crypto.color}`}>{crypto.symbol.charAt(0)}</div>
                                    <div className="crypto-info"><div className="crypto-symbol">{crypto.symbol}</div><div className="crypto-value">{formatBRL(cryptoRates?.[crypto.key])}</div></div>
                                </div>
                            ))
                        )}
                        <div className="crypto-live-dot"></div>
                    </div>

                    <div className="plans-header">
                        <div>
                            <div className="plans-badge">⚡ {t('rp_trading_plans')}</div>
                            <h2 className="plans-title">{t('plans_title')}</h2>
                            <p className="plans-subtitle">{t('plans_subtitle')}</p>
                        </div>
                        <div className="plans-platform-badge">
                            <div className="platform-badge-title">{t('platform_fee')}</div>
                            <div className="platform-badge-sub">{t('direct_bank_payout')}</div>
                        </div>
                    </div>

                    <div className="plans-grid">
                        {plans.map(plan => (
                            <div key={plan.id} className={`plan-card ${plan.popular ? 'popular' : ''}`}>
                                {plan.popular && <div className="popular-badge">{t('most_popular')}</div>}
                                <div className="plan-header">
                                    <div className="plan-info"><div className="plan-name">{plan.name}</div></div>
                                    <div className="plan-return">
                                        <div className="plan-return-value">{plan.returnValue}</div>
                                        <div className="plan-return-label">{plan.returnLabel}</div>
                                    </div>
                                </div>
                                <div className="plan-details">
                                    <div className="plan-detail">⏱️ {t('cycle')}: <strong>{plan.cycle}</strong></div>
                                    <div className="plan-detail">⚡ {t('hashrate')}: <strong>{plan.hashrate}</strong></div>
                                </div>
                                <div className="plan-deposit-range">
                                    {t('deposit_range')}: <strong>R$ {plan.depositMin.toLocaleString()} to R$ {plan.depositMax.toLocaleString()}</strong>
                                </div>
                                <div className="plan-benefits">
                                    {plan.benefits.map((benefit, idx) => (
                                        <div key={idx} className="plan-benefit">{benefit}</div>
                                    ))}
                                </div>
                                {/* ⚠️ UPDATED: Quick Amount Show karega */}
                                <button className="plan-deposit-btn" onClick={() => handleDepositClick(plan)}>
                                    {t('deposit')} R$ {plan.quickAmounts[0].toLocaleString()} →
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardPage;