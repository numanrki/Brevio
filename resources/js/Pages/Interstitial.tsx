import { Head } from '@inertiajs/react';
import { useState, useEffect, useCallback } from 'react';
import Heartbeat from '@/Components/Heartbeat';

interface Props {
    destination: string;
    title?: string | null;
    timer_duration: number;
    show_button: boolean;
    ad_above?: string | null;
    ad_below?: string | null;
    ad_sidebar?: string | null;
    expiry_date?: string | null;
    noindex?: boolean;
}

export default function Interstitial({ destination, title, timer_duration, show_button, ad_above, ad_below, ad_sidebar, expiry_date, noindex }: Props) {
    const [secondsLeft, setSecondsLeft] = useState(timer_duration);
    const [redirecting, setRedirecting] = useState(false);

    useEffect(() => {
        if (secondsLeft <= 0) {
            if (!show_button) {
                setRedirecting(true);
                window.location.href = destination;
            }
            return;
        }
        const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
        return () => clearTimeout(timer);
    }, [secondsLeft, show_button, destination]);

    const goToDestination = useCallback(() => {
        setRedirecting(true);
        window.location.href = destination;
    }, [destination]);

    const timerDone = secondsLeft <= 0;
    const progress = timer_duration > 0 ? ((timer_duration - secondsLeft) / timer_duration) * 100 : 100;

    const hasSidebar = !!ad_sidebar;

    return (
        <>
            <Heartbeat />
            <Head title={title || 'Redirecting...'}>
                {noindex && <meta name="robots" content="noindex, nofollow" />}
            </Head>
            <div style={{ minHeight: '100vh', background: '#0a0a0f', fontFamily: 'system-ui, sans-serif', color: '#ffffff' }}>
                {/* Top progress bar */}
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '3px', background: '#1f1f2e', zIndex: 50 }}>
                    <div style={{
                        height: '100%', background: 'linear-gradient(90deg, #7c3aed, #ec4899)',
                        width: `${progress}%`, transition: 'width 1s linear',
                    }} />
                </div>

                <div style={{
                    maxWidth: hasSidebar ? '1100px' : '720px', margin: '0 auto', padding: '40px 20px',
                    display: hasSidebar ? 'grid' : 'block',
                    gridTemplateColumns: hasSidebar ? '1fr 300px' : undefined,
                    gap: hasSidebar ? '24px' : undefined,
                }}>
                    {/* Main content */}
                    <div>
                        {/* Ad Above */}
                        {ad_above && (
                            <div style={{ marginBottom: '24px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #1f1f2e' }}
                                dangerouslySetInnerHTML={{ __html: ad_above }}
                            />
                        )}

                        {/* Main Card */}
                        <div style={{
                            background: '#111118', border: '1px solid #1f1f2e', borderRadius: '20px',
                            padding: '40px', textAlign: 'center',
                        }}>
                            {/* Link Info */}
                            {title && (
                                <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff', margin: '0 0 8px' }}>{title}</h1>
                            )}
                            <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 32px', wordBreak: 'break-all' }}>
                                {destination.length > 60 ? destination.substring(0, 60) + '...' : destination}
                            </p>

                            {/* Expiry Countdown */}
                            {expiry_date && <ExpiryBanner expiryDate={expiry_date} />}

                            {/* Timer Circle */}
                            {!timerDone && (
                                <div style={{ marginBottom: '28px' }}>
                                    <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto' }}>
                                        <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
                                            <circle cx="60" cy="60" r="52" fill="none" stroke="#1f1f2e" strokeWidth="6" />
                                            <circle
                                                cx="60" cy="60" r="52" fill="none"
                                                stroke="url(#timerGrad)" strokeWidth="6"
                                                strokeLinecap="round"
                                                strokeDasharray={2 * Math.PI * 52}
                                                strokeDashoffset={2 * Math.PI * 52 * (1 - progress / 100)}
                                                style={{ transition: 'stroke-dashoffset 1s linear' }}
                                            />
                                            <defs>
                                                <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                                    <stop offset="0%" stopColor="#7c3aed" />
                                                    <stop offset="100%" stopColor="#ec4899" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                        <div style={{
                                            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                                            alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <span style={{ fontSize: '32px', fontWeight: 700, color: '#ffffff', fontVariantNumeric: 'tabular-nums' }}>
                                                {secondsLeft}
                                            </span>
                                            <span style={{ fontSize: '11px', color: '#9ca3af' }}>seconds</span>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '13px', color: '#9ca3af', marginTop: '12px' }}>
                                        {show_button ? 'Please wait...' : 'Redirecting automatically...'}
                                    </p>
                                </div>
                            )}

                            {/* Timer Done States */}
                            {timerDone && show_button && !redirecting && (
                                <div style={{ marginBottom: '8px' }}>
                                    <button
                                        onClick={goToDestination}
                                        style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                                            padding: '14px 32px', fontSize: '15px', fontWeight: 600,
                                            background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                                            border: 'none', borderRadius: '14px', color: '#ffffff',
                                            cursor: 'pointer', transition: 'transform 0.2s, opacity 0.2s',
                                            boxShadow: '0 8px 24px rgba(124,58,237,0.3)',
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                                    >
                                        Click Here to Continue
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M5 12h14M12 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            )}

                            {timerDone && !show_button && (
                                <div style={{ marginBottom: '8px' }}>
                                    <div style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                                        padding: '10px 20px', borderRadius: '12px',
                                        background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
                                        color: '#4ade80', fontSize: '14px', fontWeight: 500,
                                    }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                            <polyline points="22 4 12 14.01 9 11.01" />
                                        </svg>
                                        Redirecting...
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Ad Below */}
                        {ad_below && (
                            <div style={{ marginTop: '24px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #1f1f2e' }}
                                dangerouslySetInnerHTML={{ __html: ad_below }}
                            />
                        )}
                    </div>

                    {/* Sidebar Ad */}
                    {hasSidebar && (
                        <div style={{ position: 'sticky', top: '20px' }}>
                            <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #1f1f2e' }}
                                dangerouslySetInnerHTML={{ __html: ad_sidebar! }}
                            />
                        </div>
                    )}
                </div>

                <p style={{ textAlign: 'center', fontSize: '11px', color: '#4b5563', padding: '20px 0 40px' }}>
                    Powered by <span style={{ color: '#6b7280' }}>Brevio</span>
                </p>
            </div>
        </>
    );
}

/* Expiry countdown banner */
function ExpiryBanner({ expiryDate }: { expiryDate: string }) {
    const [tl, setTl] = useState(() => getTimeLeft(expiryDate));

    useEffect(() => {
        const i = setInterval(() => setTl(getTimeLeft(expiryDate)), 1000);
        return () => clearInterval(i);
    }, [expiryDate]);

    if (tl.expired) return null;

    return (
        <div style={{
            padding: '8px 14px', marginBottom: '20px', borderRadius: '10px',
            background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)',
            display: 'inline-flex', alignItems: 'center', gap: '8px',
        }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            <span style={{ fontSize: '12px', color: '#fbbf24', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
                Expires in {tl.days > 0 && `${tl.days}d `}{String(tl.hours).padStart(2, '0')}:{String(tl.minutes).padStart(2, '0')}:{String(tl.seconds).padStart(2, '0')}
            </span>
        </div>
    );
}

function getTimeLeft(d: string) {
    const diff = new Date(d).getTime() - Date.now();
    if (diff <= 0) return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
        expired: false,
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
    };
}
