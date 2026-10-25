import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const LiveSupport = () => {
    const [telegramUser, setTelegramUser] = useState('vickypp');
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.get('/payment');
                if (res.data.telegramSupport) {
                    setTelegramUser(res.data.telegramSupport);
                }
            } catch (err) {
                console.error('Failed to load support settings', err);
            }
        };
        fetchSettings();
    }, []);

    return (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999 }}>
            {/* Chat Box */}
            {isOpen && (
                <div style={{
                    position: 'absolute', bottom: '70px', right: '0', width: '300px',
                    background: 'white', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                    border: '1px solid #e2e8f0', overflow: 'hidden', animation: 'slideUp 0.3s ease-out'
                }}>
                    <div style={{ background: '#0088cc', padding: '16px', color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>💬</div>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: '15px' }}>Live Support</div>
                            <div style={{ fontSize: '11px', opacity: 0.8 }}>Online 24x7</div>
                        </div>
                    </div>
                    <div style={{ padding: '20px' }}>
                        <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, marginBottom: '15px' }}>
                            Need help? Our support team is available on Telegram to assist you with any issues.
                        </p>
                        <a 
                            href={`https://t.me/${telegramUser}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                background: '#0088cc', color: 'white', padding: '12px', borderRadius: '10px',
                                textDecoration: 'none', fontWeight: 800, fontSize: '14px'
                            }}
                        >
                            📱 Contact us on Telegram: @{telegramUser}
                        </a>
                    </div>
                </div>
            )}

            {/* Floating Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '60px', height: '60px', borderRadius: '50%',
                    background: '#0088cc', color: 'white', border: 'none',
                    fontSize: '24px', cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 15px rgba(0, 136, 204, 0.4)',
                    transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
                {isOpen ? '✕' : '💬'}
            </button>
        </div>
    );
};

export default LiveSupport;