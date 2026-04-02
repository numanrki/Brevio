import { Head, router } from '@inertiajs/react';
import { FormEvent, useState, useEffect } from 'react';
import { url } from '@/utils';

interface Props {
    alias: string;
    error?: string;
    expiry_date?: string | null;
    noindex?: boolean;
}

export default function PasswordProtect({ alias, error, expiry_date, noindex }: Props) {
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        router.post(url(`/${alias}/verify-password`), { password }, {
            onFinish: () => setSubmitting(false),
        });
    };

    return (
        <>
            <Head title="Password Required">
                {noindex && <meta name="robots" content="noindex, nofollow" />}
            </Head>
            <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', padding: '20px' }}>
                <div style={{ width: '100%', maxWidth: '400px' }}>
                    {/* Lock Icon */}
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <div style={{
                            width: '72px', height: '72px', borderRadius: '50%', margin: '0 auto 16px',
                            background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(236,72,153,0.2))',
                            border: '1px solid rgba(124,58,237,0.3)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                        </div>
                        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#ffffff', margin: '0 0 6px' }}>Password Protected</h1>
                        <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>This link requires a password to access.</p>
                    </div>

                    {/* Countdown if expiry */}
                    {expiry_date && <CountdownBanner expiryDate={expiry_date} />}

                    {/* Form */}
                    <form onSubmit={submit} style={{ background: '#111118', border: '1px solid #1f1f2e', borderRadius: '16px', padding: '24px' }}>
                        {error && (
                            <div style={{
                                padding: '10px 14px', marginBottom: '16px', borderRadius: '10px',
                                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                                color: '#f87171', fontSize: '13px',
                            }}>
                                {error}
                            </div>
                        )}

                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#d1d5db', marginBottom: '6px' }}>
                            Enter Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            autoFocus
                            required
                            style={{
                                width: '100%', padding: '12px 16px', fontSize: '14px',
                                background: '#0a0a0f', border: '1px solid #2d2d3f', borderRadius: '12px',
                                color: '#ffffff', outline: 'none', boxSizing: 'border-box',
                            }}
                        />

                        <button
                            type="submit"
                            disabled={submitting || !password}
                            style={{
                                width: '100%', marginTop: '16px', padding: '12px',
                                background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                                border: 'none', borderRadius: '12px', color: '#ffffff',
                                fontSize: '14px', fontWeight: 600, cursor: submitting ? 'wait' : 'pointer',
                                opacity: submitting || !password ? 0.5 : 1,
                                transition: 'opacity 0.2s',
                            }}
                        >
                            {submitting ? 'Verifying...' : 'Unlock Link'}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', fontSize: '11px', color: '#4b5563', marginTop: '24px' }}>
                        Powered by <span style={{ color: '#6b7280' }}>Brevio</span>
                    </p>
                </div>
            </div>
        </>
    );
}

function CountdownBanner({ expiryDate }: { expiryDate: string }) {
    const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(expiryDate));

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(getTimeLeft(expiryDate));
        }, 1000);
        return () => clearInterval(interval);
    }, [expiryDate]);

    if (timeLeft.expired) return null;

    return (
        <div style={{
            padding: '10px 14px', marginBottom: '16px', borderRadius: '12px',
            background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)',
            textAlign: 'center',
        }}>
            <p style={{ fontSize: '11px', color: '#fbbf24', margin: '0 0 4px', fontWeight: 500 }}>Link expires in</p>
            <p style={{ fontSize: '18px', fontWeight: 700, color: '#fbbf24', margin: 0, fontVariantNumeric: 'tabular-nums' }}>
                {timeLeft.days > 0 && `${timeLeft.days}d `}{String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
            </p>
        </div>
    );
}

function getTimeLeft(expiryDate: string) {
    const diff = new Date(expiryDate).getTime() - Date.now();
    if (diff <= 0) return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
        expired: false,
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
    };
}
