import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardHeader from '../components/DashboardHeader';
import api from '../utils/api';
import './WithdrawPage.css';

const WithdrawPage = () => {
    const { user } = useAuth();

    const [amount, setAmount] = useState('');
    const [payoutMethod, setPayoutMethod] = useState('Bank');
    const [selectedBank, setSelectedBank] = useState('');
    const [agency, setAgency] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [cpfCnpj, setCpfCnpj] = useState('');
    const [accountType, setAccountType] = useState('Corrente');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [history, setHistory] = useState([]);

    const brazilianBanks = [
        { code: '260', name: 'Nubank' }, { code: '341', name: 'Itaú Unibanco' },
        { code: '237', name: 'Bradesco' }, { code: '001', name: 'Banco do Brasil' },
        { code: '104', name: 'Caixa Econômica' }, { code: '033', name: 'Santander' },
        { code: '077', name: 'Banco Inter' }, { code: '380', name: 'PicPay' },
        { code: '323', name: 'Mercado Pago' }, { code: '290', name: 'PagBank' }
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

        if (payoutMethod === 'Bank' || payoutMethod === 'PIX') {
            if (!selectedBank) {
                setMessage({ type: 'error', text: 'Please select a Brazilian bank' });
                return;
            }
            if (!agency) {
                setMessage({ type: 'error', text: 'Please enter bank agency' });
                return;
            }
            if (!accountNumber) {
                setMessage({ type: 'error', text: 'Please enter account number' });
                return;
            }
            if (!cpfCnpj) {
                setMessage({ type: 'error', text: 'Please enter CPF/CNPJ' });
                return;
            }
        }

        setLoading(true);
        try {
            const selectedBankObj = brazilianBanks.find(b => b.code === selectedBank);

            await api.post('/transaction/withdraw', {
                amount: amt,
                cryptoType: payoutMethod,
                bankAccount: selectedBank || null,
                bankDetails: (payoutMethod === 'Bank' || payoutMethod === 'PIX') ? {
                    bankCode: selectedBank,
                    bankName: selectedBankObj?.name || '',
                    agency: agency,
                    accountNumber: accountNumber,
                    accountType: accountType,
                    cpfCnpj: cpfCnpj
                } : null
            });

            setMessage({ type: 'success', text: '✅ Withdraw request submitted! Please wait for admin approval.' });
            setAmount('');
            setSelectedBank('');
            setAgency('');
            setAccountNumber('');
            setCpfCnpj('');
            setAccountType('Corrente');

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

    const bankDetailsComplete = selectedBank && agency && accountNumber && cpfCnpj;

    const canWithdraw =
        amount &&
        Number(amount) >= 100 &&
        Number(amount) <= (user?.withdrawableBalance || 0) &&
        (payoutMethod !== 'Bank' || bankDetailsComplete) &&
        (payoutMethod !== 'PIX' || bankDetailsComplete);

    const pendingWithdraws = history.filter(h => h.status === 'Pending').length;
    const approvedWithdraws = history.filter(h => h.status === 'Approved').reduce((s, h) => s + h.amount, 0);

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
                    <div className="wd-balance-badge">24x7 IMPS Fast • 0% Payout Fee</div>
                </div>

                <div className="wd-info-card">
                    <div className="wd-info-icon">💡</div>
                    <div className="wd-info-content">
                        <div className="wd-info-title">How to load money into Withdrawable Balance?</div>
                        <div className="wd-info-text">
                            Deposit funds to Top-Up (Step 1) → Buy RP plan (Step 2) → Mine for cycle (Steps 3 & 4) → Sell RP (Step 5) → Withdraw to Bank (Step 6)
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
                        <div className="wd-status-sub">Settled to your bank/account</div>
                    </div>
                    <div className="wd-status-card">
                        <div className="wd-status-label">⏳ PENDING MONEY</div>
                        <div className="wd-status-value orange">
                            R$ {history.filter(h => h.status === 'Pending').reduce((s, h) => s + h.amount, 0).toFixed(2)}
                        </div>
                        <div className="wd-status-sub">{pendingWithdraws} Processing payout</div>
                    </div>
                </div>

                <div className="wd-payout-tabs">
                    <button
                        className={`wd-payout-tab ${payoutMethod === 'Bank' ? 'active' : ''}`}
                        onClick={() => setPayoutMethod('Bank')}
                    >
                        🏦 Bank
                    </button>
                    <button
                        className={`wd-payout-tab ${payoutMethod === 'PIX' ? 'active' : ''}`}
                        onClick={() => setPayoutMethod('PIX')}
                    >
                        📱 PIX / QR
                    </button>
                    <button
                        className={`wd-payout-tab ${payoutMethod === 'USDT' ? 'active' : ''}`}
                        onClick={() => setPayoutMethod('USDT')}
                    >
                        🪙 USDT Crypto
                    </button>
                </div>

                {payoutMethod === 'Bank' && (
                    <div className="wd-section">
                        <div className="wd-section-header">
                            <div className="wd-section-title">🏦 RECEIVING BANK ACCOUNT</div>
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                            <label style={{
                                display: 'block', fontSize: '11px', fontWeight: 700,
                                color: '#64748b', textTransform: 'uppercase', marginBottom: '6px'
                            }}>
                                Select Brazilian Bank
                            </label>
                            <select
                                className="wd-bank-select"
                                value={selectedBank}
                                onChange={(e) => setSelectedBank(e.target.value)}
                            >
                                <option value="">-- Select Brazilian Bank --</option>
                                {brazilianBanks.map(bank => (
                                    <option key={bank.code} value={bank.code}>
                                        {bank.code} - {bank.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                            <div>
                                <label style={{
                                    display: 'block', fontSize: '11px', fontWeight: 700,
                                    color: '#64748b', textTransform: 'uppercase', marginBottom: '6px'
                                }}>
                                    Agency
                                </label>
                                <input
                                    type="text"
                                    className="wd-bank-select"
                                    placeholder="e.g. 0001"
                                    value={agency}
                                    onChange={(e) => setAgency(e.target.value)}
                                    style={{ backgroundImage: 'none', paddingRight: '14px' }}
                                />
                            </div>
                            <div>
                                <label style={{
                                    display: 'block', fontSize: '11px', fontWeight: 700,
                                    color: '#64748b', textTransform: 'uppercase', marginBottom: '6px'
                                }}>
                                    Account Number
                                </label>
                                <input
                                    type="text"
                                    className="wd-bank-select"
                                    placeholder="e.g. 12345-6"
                                    value={accountNumber}
                                    onChange={(e) => setAccountNumber(e.target.value)}
                                    style={{ backgroundImage: 'none', paddingRight: '14px' }}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                            <label style={{
                                display: 'block', fontSize: '11px', fontWeight: 700,
                                color: '#64748b', textTransform: 'uppercase', marginBottom: '6px'
                            }}>
                                Account Type
                            </label>
                            <select
                                className="wd-bank-select"
                                value={accountType}
                                onChange={(e) => setAccountType(e.target.value)}
                            >
                                <option value="Corrente">Conta Corrente (Checking)</option>
                                <option value="Poupanca">Conta Poupança (Savings)</option>
                                <option value="Pagamento">Conta de Pagamento (Payment)</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                            <label style={{
                                display: 'block', fontSize: '11px', fontWeight: 700,
                                color: '#64748b', textTransform: 'uppercase', marginBottom: '6px'
                            }}>
                                CPF / CNPJ
                            </label>
                            <input
                                type="text"
                                className="wd-bank-select"
                                placeholder="e.g. 123.456.789-00"
                                value={cpfCnpj}
                                onChange={(e) => setCpfCnpj(e.target.value)}
                                style={{ backgroundImage: 'none', paddingRight: '14px' }}
                            />
                        </div>
                    </div>
                )}

                {payoutMethod === 'PIX' && (
                    <div className="wd-section">
                        <div className="wd-section-header">
                            <div className="wd-section-title">📱 RECEIVING PIX ACCOUNT</div>
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                            <label style={{
                                display: 'block', fontSize: '11px', fontWeight: 700,
                                color: '#64748b', textTransform: 'uppercase', marginBottom: '6px'
                            }}>
                                Select Brazilian Bank (PIX-linked)
                            </label>
                            <select
                                className="wd-bank-select"
                                value={selectedBank}
                                onChange={(e) => setSelectedBank(e.target.value)}
                            >
                                <option value="">-- Select Bank for PIX --</option>
                                {brazilianBanks.map(bank => (
                                    <option key={bank.code} value={bank.code}>
                                        {bank.code} - {bank.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                            <div>
                                <label style={{
                                    display: 'block', fontSize: '11px', fontWeight: 700,
                                    color: '#64748b', textTransform: 'uppercase', marginBottom: '6px'
                                }}>
                                    Agency
                                </label>
                                <input
                                    type="text"
                                    className="wd-bank-select"
                                    placeholder="e.g. 0001"
                                    value={agency}
                                    onChange={(e) => setAgency(e.target.value)}
                                    style={{ backgroundImage: 'none', paddingRight: '14px' }}
                                />
                            </div>
                            <div>
                                <label style={{
                                    display: 'block', fontSize: '11px', fontWeight: 700,
                                    color: '#64748b', textTransform: 'uppercase', marginBottom: '6px'
                                }}>
                                    Account Number
                                </label>
                                <input
                                    type="text"
                                    className="wd-bank-select"
                                    placeholder="e.g. 12345-6"
                                    value={accountNumber}
                                    onChange={(e) => setAccountNumber(e.target.value)}
                                    style={{ backgroundImage: 'none', paddingRight: '14px' }}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                            <label style={{
                                display: 'block', fontSize: '11px', fontWeight: 700,
                                color: '#64748b', textTransform: 'uppercase', marginBottom: '6px'
                            }}>
                                CPF / CNPJ (PIX Key Holder)
                            </label>
                            <input
                                type="text"
                                className="wd-bank-select"
                                placeholder="e.g. 123.456.789-00"
                                value={cpfCnpj}
                                onChange={(e) => setCpfCnpj(e.target.value)}
                                style={{ backgroundImage: 'none', paddingRight: '14px' }}
                            />
                        </div>
                    </div>
                )}

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

                    {/* ✅ FIXED: Quick Amount Buttons */}
                    <div className="wd-quick-amounts">
                        {[25, 50, 75, 100].map(percent => {
                            const balance = user?.withdrawableBalance || 0;
                            let amt = Math.floor(balance * percent / 100);

                            // MAX button poora balance use kare
                            if (percent === 100) {
                                amt = Number(balance.toFixed(2));
                            }

                            const isDisabled = amt < 100;
                            const isActive = Number(amount) === amt;

                            return (
                                <button
                                    key={percent}
                                    type="button"
                                    className={`wd-quick-btn ${isActive ? 'active' : ''}`}
                                    onClick={() => {
                                        if (!isDisabled) setAmount(String(amt));
                                    }}
                                    disabled={isDisabled}
                                    style={{
                                        opacity: isDisabled ? 0.4 : 1,
                                        cursor: isDisabled ? 'not-allowed' : 'pointer'
                                    }}
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
                            <span className="wd-summary-label">Amount Received in {payoutMethod}:</span>
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
                            : (payoutMethod === 'Bank' || payoutMethod === 'PIX') && !bankDetailsComplete
                                ? '🏦 Complete Bank Details First'
                                : `📤 Request Withdrawal (R$ ${Number(amount || 0).toLocaleString()})`}
                    </button>

                    {!canWithdraw && amount && (
                        <div style={{
                            textAlign: 'center',
                            marginTop: '12px',
                            fontSize: '12px',
                            color: '#dc2626',
                            fontWeight: 600
                        }}>
                            {(payoutMethod === 'Bank' || payoutMethod === 'PIX') && !selectedBank
                                ? '⚠️ Please select a Brazilian bank'
                                : (payoutMethod === 'Bank' || payoutMethod === 'PIX') && !agency
                                    ? '⚠️ Please enter bank agency'
                                    : (payoutMethod === 'Bank' || payoutMethod === 'PIX') && !accountNumber
                                        ? '⚠️ Please enter account number'
                                        : (payoutMethod === 'Bank' || payoutMethod === 'PIX') && !cpfCnpj
                                            ? '⚠️ Please enter CPF/CNPJ'
                                            : Number(amount) > (user?.withdrawableBalance || 0)
                                                ? '⚠️ Insufficient withdrawable balance'
                                                : '⚠️ Amount must be at least R$ 100'}
                        </div>
                    )}
                </div>

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

                <div className="wd-rules">
                    <div className="wd-rules-title">ℹ️ Withdrawal Guidelines</div>
                    <ul className="wd-rules-list">
                        <li>Withdrawal requests are processed via automated 24x7 IMPS banking rails.</li>
                        <li>Prorated settlement takes between 5 to 15 minutes.</li>
                        <li>Minimum withdrawal amount is R$ 100.00.</li>
                        <li>Bank selection is required for Bank and PIX withdrawals.</li>
                        <li>Admin approval is required for all withdrawals.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default WithdrawPage;