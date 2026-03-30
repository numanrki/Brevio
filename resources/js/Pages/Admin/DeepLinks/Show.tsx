import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';
import { DeepLink, TimeSeriesPoint, QrCodeFull } from '@/types';
import { url } from '@/utils';
import { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface Props {
    deepLink: DeepLink;
    clicks_stats: TimeSeriesPoint[];
}

const deviceLabels: Record<string, string> = {
    android: 'Android', ios: 'iOS', windows: 'Windows', macos: 'macOS',
    linux: 'Linux', mobile: 'Mobile', tablet: 'Tablet', desktop: 'Desktop',
};

export default function Show({ deepLink, clicks_stats }: Props) {
    const base = window.location.origin;
    const shortUrl = `${base}/${deepLink.alias}`;
    const maxCount = Math.max(...clicks_stats.map((c) => c.count), 1);
    const [qrData, setQrData] = useState<QrCodeFull | null>(deepLink.qr_codes?.[0] || null);
    const [qrLoading, setQrLoading] = useState(false);
    const [showQr, setShowQr] = useState(false);

    const generateQr = async () => {
        if (qrData) { setShowQr(true); return; }
        setQrLoading(true);
        try {
            const res = await fetch(url(`/admin/deep-links/${deepLink.id}/generate-qr`), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    Accept: 'application/json',
                },
            });
            const data = await res.json();
            if (data.qrCode) { setQrData(data.qrCode); setShowQr(true); }
        } finally { setQrLoading(false); }
    };

    return (
        <AdminLayout header={deepLink.name}>
            <Head title={deepLink.name} />

            <div className="max-w-4xl">
                <div className="flex items-center justify-between mb-6">
                    <Link href={url('/admin/deep-links')} className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        Back to Deep Links
                    </Link>
                    <div className="flex items-center gap-2">
                        <button onClick={generateQr} disabled={qrLoading} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                            {qrLoading ? 'Generating…' : 'QR Code'}
                        </button>
                        <Link href={url(`/admin/deep-links/${deepLink.id}/analytics`)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                            Analytics
                        </Link>
                        <Link href={url(`/admin/deep-links/${deepLink.id}/edit`)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-white bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            Edit
                        </Link>
                    </div>
                </div>

                {/* QR Code Modal */}
                {showQr && qrData && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowQr(false)}>
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold text-white">QR Code</h3>
                                <button onClick={() => setShowQr(false)} className="text-gray-500 hover:text-white"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                            </div>
                            <div className="flex justify-center p-4 bg-white rounded-xl mb-4">
                                <QRCodeSVG value={qrData.data?.content || shortUrl} size={200} fgColor={qrData.style?.foreground || '#000000'} bgColor={qrData.style?.background || '#ffffff'} />
                            </div>
                            <p className="text-xs text-gray-500 text-center break-all">{qrData.data?.content || shortUrl}</p>
                        </div>
                    </div>
                )}

                {/* Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Clicks</p>
                        <p className="text-2xl font-bold text-white">{deepLink.total_clicks.toLocaleString()}</p>
                    </div>
                    <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Rules</p>
                        <p className="text-2xl font-bold text-white">{deepLink.rules?.length ?? 0}</p>
                    </div>
                    <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Status</p>
                        <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${deepLink.is_active ? 'text-emerald-400' : 'text-red-400'}`}>
                            <span className={`w-2 h-2 rounded-full ${deepLink.is_active ? 'bg-emerald-400' : 'bg-red-400'}`} />
                            {deepLink.is_active ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>

                {/* Access Restrictions */}
                {deepLink.allowed_devices && deepLink.allowed_devices.length > 0 && (
                    <div className="rounded-xl bg-amber-500/5 border border-amber-500/20 p-4 mb-6 flex items-start gap-3">
                        <svg className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                        <div>
                            <p className="text-sm font-medium text-amber-300">Restricted Access</p>
                            <p className="text-xs text-gray-400 mt-1">
                                Only accessible on: {deepLink.allowed_devices.map((d) => deviceLabels[d] || d).join(', ')}
                            </p>
                        </div>
                    </div>
                )}

                {/* Details */}
                <div className="rounded-xl bg-gray-900 border border-gray-800 p-6 mb-6 space-y-4">
                    <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-gray-500 mb-0.5">Short URL</p>
                            <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 break-all">{shortUrl}</a>
                        </div>
                        <div>
                            <p className="text-gray-500 mb-0.5">Fallback URL</p>
                            <a href={deepLink.fallback_url} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white break-all">{deepLink.fallback_url}</a>
                        </div>
                        {deepLink.expiry_date && (
                            <div>
                                <p className="text-gray-500 mb-0.5">Expires</p>
                                <p className="text-gray-300">{new Date(deepLink.expiry_date).toLocaleString()}</p>
                            </div>
                        )}
                        {(deepLink.utm_source || deepLink.utm_medium || deepLink.utm_campaign) && (
                            <div>
                                <p className="text-gray-500 mb-0.5">UTM</p>
                                <p className="text-gray-300">
                                    {[deepLink.utm_source, deepLink.utm_medium, deepLink.utm_campaign].filter(Boolean).join(' / ')}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Routing Rules */}
                {deepLink.rules && deepLink.rules.length > 0 && (
                    <div className="rounded-xl bg-gray-900 border border-gray-800 p-6 mb-6">
                        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Routing Rules</h3>
                        <div className="space-y-2">
                            {deepLink.rules.map((rule) => (
                                <div key={rule.id} className="flex items-center gap-3 p-3 bg-gray-950 rounded-lg border border-gray-800 text-sm">
                                    <span className="px-2 py-0.5 bg-violet-500/10 text-violet-400 rounded text-xs font-medium uppercase">{rule.type}</span>
                                    <span className="text-gray-300">{rule.value}</span>
                                    <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                    <span className="text-gray-400 truncate">{rule.destination_url}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Attached Pixels */}
                {deepLink.pixels && deepLink.pixels.length > 0 && (
                    <div className="rounded-xl bg-gray-900 border border-gray-800 p-6 mb-6">
                        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Attached Pixels</h3>
                        <div className="flex flex-wrap gap-2">
                            {deepLink.pixels.map((px) => (
                                <span key={px.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-sm text-gray-300">
                                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                                    {px.name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* 30-day chart */}
                <div className="rounded-xl bg-gray-900 border border-gray-800 p-6">
                    <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Clicks (Last 30 Days)</h3>
                    {clicks_stats.length === 0 ? (
                        <p className="text-sm text-gray-500">No click data yet.</p>
                    ) : (
                        <div className="flex items-end gap-1 h-32">
                            {clicks_stats.map((point) => (
                                <div key={point.date} className="flex-1 flex flex-col items-center gap-1" title={`${point.date}: ${point.count}`}>
                                    <div
                                        className="w-full bg-violet-500/30 rounded-t-sm min-h-[2px]"
                                        style={{ height: `${(point.count / maxCount) * 100}%` }}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
