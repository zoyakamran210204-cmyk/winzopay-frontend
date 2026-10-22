import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardHeader from '../components/DashboardHeader';
import api from '../utils/api';
import './LedgerPage.css';

const LedgerPage = () => {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [activeFilter, setActiveFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    const filters = [
        { key: 'all', label: 'All Records' },
        { key: 'Deposit', label: 'Deposits' },
        { key: 'PlanPurchase', label: 'Plans' },
        { key: 'PlanSell', label: 'RP Sales' },
        { key: 'Withdraw', label: 'Withdrawals' }
    ];

    useEffect(() => {
        const load = async () => {
            try {
                const res = await api.get('/transaction/my-transactions');
                setTransactions(res.data);
                setFiltered(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    useEffect(() => {
        let list = transactions;
        if (activeFilter !== 'all') {
            list = list.filter(tx => tx.type === activeFilter);
        }
        if (searchTerm) {
            const s = searchTerm.toLowerCase();
            list = list.filter(tx =>
                tx.type.toLowerCase().includes(s) ||
                (tx.planName && tx.planName.toLowerCase().includes(s)) ||
                (tx.cryptoType && tx.cryptoType.toLowerCase().includes(s)) ||
                String(tx.amount).includes(s)
            );
        }
        setFiltered(list);
    }, [activeFilter, searchTerm, transactions]);

    const getFilterCount = (key) => {
        if (key === 'all') return transactions.length;
        return transactions.filter(t => t.type === key).length;
    };

    const getTxInfo = (tx) => {
        const map = {
            'Deposit': { icon: '⬇️', label: 'Deposit', cls: 'deposit', sign: '+' },
            'Withdraw': { icon: '⬆️', label: 'Withdrawal', cls: 'withdraw', sign: '-' },
            'PlanPurchase': { icon: '💰', label: 'RP Plan Purchase', cls: 'buy', sign: '-' },
            'PlanSell': { icon: '💱', label: 'RP Sale', cls: 'sell', sign: '+' }
        };
        return map[tx.type] || { icon: '📋', label: tx.type, cls: 'deposit', sign: '' };
    };

    const totalDeposits = transactions.filter(t => t.type === 'Deposit' && t.status === 'Approved').reduce((s, t) => s + t.amount, 0);
    const totalWithdraws = transactions.filter(t => t.type === 'Withdraw' && t.status === 'Approved').reduce((s, t) => s + t.amount, 0);
    const totalProfit = transactions.filter(t => t.type === 'PlanSell').reduce((s, t) => s + t.amount, 0);
    const totalPlans = transactions.filter(t => t.type === 'PlanPurchase').reduce((s, t) => s + t.amount, 0);

    const formatDate = (d) => {
        return new Date(d).toLocaleString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="lg-page">
            <DashboardHeader activeNav="ledger" />

            <div className="lg-container">

                <div className="lg-header">
                    <div>
                        <div className="lg-title">Transaction Ledger</div>
                        <div className="lg-subtitle">
                            <span className="lg-live-dot"></span>
                            Personal Activity • {transactions.length} Records Synced
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="lg-stats">
                    <div className="lg-stat-card">
                        <div className="lg-stat-label">⬇️ Deposited</div>
                        <div className="lg-stat-value">R$ {totalDeposits.toFixed(2)}</div>
                    </div>
                    <div className="lg-stat-card">
                        <div className="lg-stat-label">💰 Plans Bought</div>
                        <div className="lg-stat-value">R$ {totalPlans.toFixed(2)}</div>
                    </div>
                    <div className="lg-stat-card">
                        <div className="lg-stat-label">💱 Profits</div>
                        <div className="lg-stat-value green">+ R$ {totalProfit.toFixed(2)}</div>
                    </div>
                    <div className="lg-stat-card">
                        <div className="lg-stat-label">⬆️ Withdrawn</div>
                        <div className="lg-stat-value">R$ {totalWithdraws.toFixed(2)}</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="lg-filters">
                    {filters.map(f => (
                        <button
                            key={f.key}
                            className={`lg-filter ${activeFilter === f.key ? 'active' : ''}`}
                            onClick={() => setActiveFilter(f.key)}
                        >
                            {f.label}
                            <span className="lg-filter-count">{getFilterCount(f.key)}</span>
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="lg-search">
                    <span className="lg-search-icon">🔍</span>
                    <input
                        type="text"
                        className="lg-search-input"
                        placeholder="Search by type, plan, crypto, amount..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* List */}
                <div className="lg-list">
                    {loading ? (
                        <div className="lg-empty">
                            <div className="lg-empty-icon">⏳</div>
                            <div className="lg-empty-title">Loading transactions...</div>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="lg-empty">
                            <div className="lg-empty-icon">📋</div>
                            <div className="lg-empty-title">No transactions found</div>
                            <div className="lg-empty-text">
                                {searchTerm ? 'Try a different search term' : 'Your transaction history will appear here'}
                            </div>
                        </div>
                    ) : (
                        filtered.map(tx => {
                            const info = getTxInfo(tx);
                            return (
                                <div key={tx._id} className="lg-item">
                                    <div className={`lg-item-icon ${info.cls}`}>
                                        {info.icon}
                                    </div>
                                    <div className="lg-item-info">
                                        <div className="lg-item-title">
                                            {info.label} {tx.planName ? `- Plan ${tx.planName}` : ''}
                                        </div>
                                        <div className="lg-item-meta">
                                            <span>{formatDate(tx.createdAt)}</span>
                                            {tx.cryptoType && (
                                                <>
                                                    <span>•</span>
                                                    <span>{tx.cryptoType}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className={`lg-item-amount ${info.sign === '+' ? 'positive' : 'negative'}`}>
                                        {info.sign} R$ {tx.amount.toLocaleString()}
                                    </div>
                                    <div className={`lg-item-status ${tx.status.toLowerCase()}`}>
                                        {tx.status}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

            </div>
        </div>
    );
};

export default LedgerPage;