import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCryptoRates } from '../utils/api';
import DashboardHeader from '../components/DashboardHeader';
import './DashboardPage.css';

const DashboardPage = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const navigate = useNavigate();

    // Crypto rates state
    const [cryptoRates, setCryptoRates] = useState(null);
    const [ratesLoading, setRatesLoading] = useState(true);

    // Selected crypto per plan (default: BTC)
    const [selectedCrypto, setSelectedCrypto] = useState({
        A: 'BTC',
        B: 'BTC',
        C: 'BTC',
        D: 'BTC'
    });

    // Selected bank per plan (default: empty)
    const [selectedBank, setSelectedBank] = useState({
        A: '',
        B: '',
        C: '',
        D: ''
    });

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
        { code: '290', name: 'PagBank' },
        { code: '336', name: 'C6 Bank' },
        { code: '212', name: 'Banco Original' },
        { code: '655', name: 'Votorantim' },
        { code: '422', name: 'Banco Safra' },
        { code: '389', name: 'Banco Mercantil' },
        { code: '070', name: 'BRB' },
        { code: '004', name: 'Banco do Nordeste' },
        { code: '041', name: 'Banrisul' },
        { code: '748', name: 'Sicredi' },
        { code: '756', name: 'Sicoob' }
    ];

    const formatBRL = (value) => {
        if (!value) return '—';
        return `R$ ${value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}`;
    };

    const handleCryptoSelect = (planId, crypto) => {
        setSelectedCrypto(prev => ({ ...prev, [planId]: crypto }));
        setSelectedBank(prev => ({ ...prev, [planId]: '' }));
    };

    const handleBankSelect = (planId, bankCode) => {
        setSelectedBank(prev => ({ ...prev, [planId]: bankCode }));
        setSelectedCrypto(prev => ({ ...prev, [planId]: '' }));
    };

    const handleDepositClick = (plan) => {
        const paymentMethod = selectedBank[plan.id] ? 'Bank' : selectedCrypto[plan.id];
        navigate(`/deposit?plan=${plan.id}&amount=${plan.depositMin}&method=${paymentMethod}`);
    };

    const plans = [
        {
            id: 'A',
            name: t('plan_a_name'),
            returnValue: '5%',
            returnLabel: t('return'),
            depositMin: 100,
            depositMax: 500,
            cycle: '120s Fast Mining',
            hashrate: '25.4 MH/s',
            benefits: [
                t('plan_a_benefit_1'),
                t('plan_a_benefit_2'),
                t('plan_a_benefit_3'),
                t('plan_a_benefit_4')
            ],
            popular: false
        },
        {
            id: 'B',
            name: t('plan_b_name'),
            returnValue: '8%',
            returnLabel: t('return'),
            depositMin: 501,
            depositMax: 1000,
            cycle: '300s Mining Cycle',
            hashrate: '64.8 MH/s',
            benefits: [
                t('plan_b_benefit_1'),
                t('plan_b_benefit_2'),
                t('plan_b_benefit_3'),
                t('plan_b_benefit_4')
            ],
            popular: true
        },
        {
            id: 'C',
            name: t('plan_c_name'),
            returnValue: '10%',
            returnLabel: t('return'),
            depositMin: 1001,
            depositMax: 1500,
            cycle: '300s High Yield',
            hashrate: '142.5 MH/s',
            benefits: [
                t('plan_c_benefit_1'),
                t('plan_c_benefit_2'),
                t('plan_c_benefit_3'),
                t('plan_c_benefit_4')
            ],
            popular: false
        },
        {
            id: 'D',
            name: t('plan_d_name'),
            returnValue: '12%',
            returnLabel: t('return'),
            depositMin: 10000,
            depositMax: 100000,
            cycle: '500s VIP Master Cycle',
            hashrate: '380.0 MH/s',
            benefits: [
                t('plan_d_benefit_1'),
                t('plan_d_benefit_2'),
                t('plan_d_benefit_3'),
                t('plan_d_benefit_4')
            ],
            popular: false
        }
    ];

    return (
        <div className="db-page">
            <DashboardHeader activeNav="home" />

            <main className="db-main">
                {/* LEFT COLUMN */}
                <div className="db-left">
                    <div className="balance-card">
                        <div className="balance-header">
                            <div className="balance-label">
                                💰 {t('top_up_balance')} ⓘ
                            </div>
                            <div className="currency-toggle">
                                <button className="currency-btn active">R$ BRL</button>
                            </div>
                        </div>

                        <div className="balance-value">
                            R$ {user?.balance?.toFixed(2) || '0.00'}
                        </div>
                        <div className="balance-sub">
                            {t('balance_step_1')}
                        </div>

                        <div className="balance-mini-cards">
                            <div className="mini-card">
                                <div className="mini-card-label">💵 {t('withdrawable')}</div>
                                <div className="mini-card-value">
                                    R$ {user?.withdrawableBalance?.toFixed(2) || '0.00'}
                                </div>
                                <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>
                                    {t('withdrawable_step')}
                                </div>
                            </div>
                            <div className="mini-card">
                                <div className="mini-card-label">⛏️ {t('mining_capital')}</div>
                                <div className="mini-card-value">
                                    R$ {user?.miningCapital?.toFixed(2) || '0.00'}
                                </div>
                                <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>
                                    {t('mining_step')}
                                </div>
                            </div>
                            <div className="mini-card">
                                <div className="mini-card-label">💎 {t('rp_balance')}</div>
                                <div className="mini-card-value">
                                    R$ {user?.rpBalance?.toFixed(2) || '0.00'}
                                </div>
                                <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>
                                    {t('rp_step')}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* App Banner Removed */}

                    <div className="quick-actions">
                        <div className="action-card" onClick={() => navigate('/deposit')} style={{ cursor: 'pointer' }}>
                            <div className="action-icon blue">⬇️</div>
                            <div className="action-content">
                                <div className="action-title">{t('deposit')}</div>
                                <div className="action-sub">{t('top_up_balance_label')}</div>
                            </div>
                            <div className="action-step">Step 1</div>
                        </div>

                        <div className="action-card" onClick={() => navigate('/buy-rp')} style={{ cursor: 'pointer' }}>
                            <div className="action-icon dark">💰</div>
                            <div className="action-content">
                                <div className="action-title">{t('buy_rp')}</div>
                                <div className="action-sub">{t('rp_mining_plan')}</div>
                            </div>
                            <div className="action-step">Step 2</div>
                        </div>

                        <div className="action-card" onClick={() => navigate('/sell-rp')} style={{ cursor: 'pointer' }}>
                            <div className="action-icon orange">💱</div>
                            <div className="action-content">
                                <div className="action-title">{t('sell_rp')}</div>
                                <div className="action-sub">{t('sell_to_seller')}</div>
                            </div>
                            <div className="action-step">Step 5</div>
                        </div>

                        <div className="action-card" onClick={() => navigate('/withdraw')} style={{ cursor: 'pointer' }}>
                            <div className="action-icon green">⬆️</div>
                            <div className="action-content">
                                <div className="action-title">{t('withdraw')}</div>
                                <div className="action-sub">{t('withdrawable_bal')}</div>
                            </div>
                            <div className="action-step">Step 6</div>
                        </div>
                    </div>

                    <div className="transaction-records">
                        <div className="section-title">{t('transaction_records')}</div>
                        <div className="transaction-grid">
                            <div className="transaction-item">
                                <div className="transaction-icon">⬇️</div>
                                <div className="transaction-label">{t('deposits')}</div>
                            </div>
                            <div className="transaction-item">
                                <div className="transaction-icon">💰</div>
                                <div className="transaction-label">{t('plan_purchases')}</div>
                            </div>
                            <div className="transaction-item">
                                <div className="transaction-icon">💱</div>
                                <div className="transaction-label">{t('rp_sales')}</div>
                            </div>
                            <div className="transaction-item">
                                <div className="transaction-icon">⬆️</div>
                                <div className="transaction-label">{t('withdrawals')}</div>
                            </div>
                        </div>
                    </div>

                    <div className="bank-account-section">
                        <div className="bank-header">
                            <div className="bank-title">🏦 {t('linked_bank')}</div>
                            <button className="bank-manage">{t('manage')} (0)</button>
                        </div>
                        <div className="bank-empty">
                            <p>{t('bank_empty_msg')}</p>
                            <button className="bank-link-btn">{t('link_bank')}</button>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN - PLANS */}
                <div className="db-right">
                    <div className="crypto-rates-bar">
                        <div className="crypto-rates-label">
                            🔴 LIVE RATES (BRL)
                        </div>

                        {ratesLoading ? (
                            <div className="crypto-loading">
                                <span className="spin">⏳</span> Loading rates...
                            </div>
                        ) : (
                            cryptoOptions.map(crypto => (
                                <div key={crypto.key} className="crypto-rate-item">
                                    <div className={`crypto-icon ${crypto.color}`}>
                                        {crypto.symbol.charAt(0)}
                                    </div>
                                    <div className="crypto-info">
                                        <div className="crypto-symbol">{crypto.symbol}</div>
                                        <div className="crypto-value">
                                            {formatBRL(cryptoRates?.[crypto.key])}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}

                        <div className="crypto-live-dot"></div>
                    </div>

                    <div className="plans-header">
                        <div>
                            <div className="plans-badge">
                                ⚡ {t('rp_trading_plans')}
                            </div>
                            <h2 className="plans-title">{t('plans_title')}</h2>
                            <p className="plans-subtitle">
                                {t('plans_subtitle')}
                            </p>
                        </div>
                        <div className="plans-platform-badge">
                            <div className="platform-badge-title">{t('platform_fee')}</div>
                            <div className="platform-badge-sub">{t('direct_bank_payout')}</div>
                        </div>
                    </div>

                    <div className="plans-grid">
                        {plans.map(plan => (
                            <div
                                key={plan.id}
                                className={`plan-card ${plan.popular ? 'popular' : ''}`}
                            >
                                {plan.popular && (
                                    <div className="popular-badge">{t('most_popular')}</div>
                                )}

                                <div className="plan-header">
                                    <div className="plan-info">
                                        <div className="plan-name">{plan.name}</div>
                                    </div>
                                    <div className="plan-return">
                                        <div className="plan-return-value">{plan.returnValue}</div>
                                        <div className="plan-return-label">{plan.returnLabel}</div>
                                    </div>
                                </div>

                                <div className="plan-details">
                                    <div className="plan-detail">
                                        ⏱️ {t('cycle')}: <strong>{plan.cycle}</strong>
                                    </div>
                                    <div className="plan-detail">
                                        ⚡ {t('hashrate')}: <strong>{plan.hashrate}</strong>
                                    </div>
                                </div>

                                <div className="plan-deposit-range">
                                    {t('deposit_range')}: <strong>R$ {plan.depositMin.toLocaleString()} to R$ {plan.depositMax.toLocaleString()}</strong>
                                </div>

                                <div className="payment-section">
                                    <div className="payment-section-title">
                                        💳 {t('payment_method')}
                                    </div>

                                    <div className="payment-section-title" style={{ marginTop: '4px', color: '#1e40af' }}>
                                        🪙 {t('crypto_payment')}
                                    </div>
                                    <div className="plan-crypto-options">
                                        {cryptoOptions.map(crypto => (
                                            <button
                                                key={crypto.key}
                                                className={`plan-crypto-btn ${selectedCrypto[plan.id] === crypto.key ? 'active' : ''}`}
                                                onClick={() => handleCryptoSelect(plan.id, crypto.key)}
                                                type="button"
                                            >
                                                <div className={`crypto-icon ${crypto.color}`}>
                                                    {crypto.symbol.charAt(0)}
                                                </div>
                                                <span className="crypto-name">{crypto.label}</span>
                                            </button>
                                        ))}
                                    </div>

                                    <div className="payment-section-title" style={{ marginTop: '8px', color: '#16a34a' }}>
                                        🏦 {t('bank_payment')}
                                    </div>
                                    <select
                                        className={`plan-bank-select ${selectedBank[plan.id] ? 'active' : ''}`}
                                        value={selectedBank[plan.id]}
                                        onChange={(e) => handleBankSelect(plan.id, e.target.value)}
                                    >
                                        <option value="">{t('bank_placeholder')}</option>
                                        {brazilianBanks.map(bank => (
                                            <option key={bank.code} value={bank.code}>
                                                {bank.code} - {bank.name}
                                            </option>
                                        ))}
                                    </select>

                                    {selectedBank[plan.id] && (
                                        <div className="bank-selected-badge">
                                            ✅ {t('selected')}: {brazilianBanks.find(b => b.code === selectedBank[plan.id])?.name}
                                        </div>
                                    )}
                                </div>

                                <div className="plan-benefits">
                                    {plan.benefits.map((benefit, idx) => (
                                        <div key={idx} className="plan-benefit">{benefit}</div>
                                    ))}
                                </div>

                                <button 
                                    className="plan-deposit-btn"
                                    onClick={() => handleDepositClick(plan)}
                                >
                                    {t('deposit')}{' '}
                                    {selectedBank[plan.id]
                                        ? brazilianBanks.find(b => b.code === selectedBank[plan.id])?.name
                                        : selectedCrypto[plan.id]
                                    } →
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