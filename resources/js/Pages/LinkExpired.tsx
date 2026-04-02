import { Head } from '@inertiajs/react';

interface Props {
    alias: string;
    expired_at?: string | null;
    noindex?: boolean;
}

export default function LinkExpired({ alias, expired_at, noindex }: Props) {
    return (
        <>
            <Head title="Link Expired">
                {noindex && <meta name="robots" content="noindex, nofollow" />}
            </Head>
            <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', padding: '20px' }}>
                <div style={{ textAlign: 'center', maxWidth: '400px' }}>
                    {/* Expired Icon */}
                    <div style={{
                        width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 20px',
                        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                    </div>

                    <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#ffffff', margin: '0 0 8px' }}>Link Expired</h1>
                    <p style={{ fontSize: '15px', color: '#9ca3af', margin: '0 0 12px', lineHeight: 1.6 }}>
                        This short link has expired and is no longer available.
                    </p>

                    {expired_at && (
                        <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 24px' }}>
                            Expired on {new Date(expired_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                    )}

                    <div style={{
                        display: 'inline-block', padding: '10px 16px', borderRadius: '12px',
                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                        color: '#6b7280', fontSize: '13px',
                    }}>
                        /{alias}
                    </div>

                    <p style={{ textAlign: 'center', fontSize: '11px', color: '#4b5563', marginTop: '40px' }}>
                        Powered by <span style={{ color: '#6b7280' }}>Brevio</span>
                    </p>
                </div>
            </div>
        </>
    );
}
