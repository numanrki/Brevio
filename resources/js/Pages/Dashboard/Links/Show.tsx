import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import { Url } from '@/types';
import { url as urlHelper } from '@/utils';
import { useState, useRef, useCallback } from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';

interface Props {
    url: Url & {
        domain?: { id: number; domain: string };
        campaign?: { id: number; name: string };
        unique_clicks?: number;
        password?: string | null;
        description?: string | null;
        custom_alias?: string | null;
        domain_id?: number | null;
        campaign_id?: number | null;
    };
    clicks_stats: { date: string; count: number }[];
}

export default function Show({ url, clicks_stats }: Props) {
    const [copied, setCopied] = useState(false);
    const [showQr, setShowQr] = useState(false);
    const qrSvgRef = useRef<HTMLDivElement>(null);
    const qrCanvasRef = useRef<HTMLDivElement>(null);

    const shortUrl = `${window.location.origin}${urlHelper('/' + url.alias)}`;
    const maxClicks = Math.max(...clicks_stats.map((s) => s.count), 1);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shortUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const getStatusBadge = () => {
        if (url.is_archived) {
            return <span className="inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-700/50 text-gray-400 border border-gray-700">ARCHIVED</span>;
        }
        if (url.expiry_date && new Date(url.expiry_date) < new Date()) {
            return <span className="inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">EXPIRED</span>;
        }
        if (!url.is_active) {
            return <span className="inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">DISABLED</span>;
        }
        return <span className="inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">ACTIVE</span>;
    };

    const downloadQr = useCallback((format: 'svg' | 'png' | 'png-t' | 'jpg') => {
        const filename = url.alias;
        if (format === 'svg') {
            const svgEl = qrSvgRef.current?.querySelector('svg');
            if (!svgEl) return;
            const blob = new Blob([new XMLSerializer().serializeToString(svgEl)], { type: 'image/svg+xml' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `${filename}.svg`;
            a.click();
            URL.revokeObjectURL(a.href);
            return;
        }
        const canvas = qrCanvasRef.current?.querySelector('canvas');
        if (!canvas) return;
        if (format === 'png-t') {
            const nc = document.createElement('canvas');
            nc.width = 512; nc.height = 512;
            const ctx = nc.getContext('2d');
            if (!ctx) return;
            ctx.drawImage(canvas, 0, 0);
            const id = ctx.getImageData(0, 0, 512, 512);
            for (let i = 0; i < id.data.length; i += 4) {
                if (id.data[i] > 240 && id.data[i + 1] > 240 && id.data[i + 2] > 240) id.data[i + 3] = 0;
            }
            ctx.putImageData(id, 0, 0);
            nc.toBlob((b) => { if (!b) return; const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `${filename}_transparent.png`; a.click(); URL.revokeObjectURL(a.href); }, 'image/png');
        } else if (format === 'png') {
            canvas.toBlob((b) => { if (!b) return; const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `${filename}.png`; a.click(); URL.revokeObjectURL(a.href); }, 'image/png');
        } else {
            const nc = document.createElement('canvas');
            nc.width = 512; nc.height = 512;
            const ctx = nc.getContext('2d');
            if (!ctx) return;
            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, 512, 512);
            ctx.drawImage(canvas, 0, 0);
            nc.toBlob((b) => { if (!b) return; const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `${filename}.jpg`; a.click(); URL.revokeObjectURL(a.href); }, 'image/jpeg', 0.95);
        }
    }, [url.alias]);

    return (
        <DashboardLayout header="Link Details">
            <Head title={`Link - /${url.alias}`} />

            <div className="max-w-4xl">
                {/* Back + Actions */}
                <div className="flex items-center justify-between mb-6">
                    <Link
                        href={urlHelper('/dashboard/links')}
                        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Links
                    </Link>
                    <Link
                        href={urlHelper(`/dashboard/links/${url.id}/edit`)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                    </Link>
                </div>

                {/* Link Info Card */}
                <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden mb-6">
                    <div className="px-6 py-5 border-b border-gray-800 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-white">/{url.alias}</h2>
                            {url.title && <p className="text-sm text-gray-400 mt-1">{url.title}</p>}
                        </div>
                        {getStatusBadge()}
                    </div>

                    <div className="p-6 space-y-4">
                        {/* Short URL + Copy */}
                        <div className="flex items-center gap-3 p-3 bg-gray-950 rounded-xl border border-gray-800">
                            <span className="text-sm text-violet-400 font-medium flex-1 truncate">{shortUrl}</span>
                            <button
                                onClick={copyToClipboard}
                                className={`px-4 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
                                    copied
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                        : 'bg-violet-500/10 text-violet-400 border border-violet-500/20 hover:bg-violet-500/20'
                                }`}
                            >
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>

                        {/* Destination */}
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Destination</p>
                            <a href={url.url} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-300 hover:text-white break-all transition-colors">
                                {url.url}
                            </a>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Clicks</p>
                                <p className="text-lg font-bold text-white">{url.total_clicks.toLocaleString()}</p>
                            </div>
                            {url.unique_clicks !== undefined && (
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Unique Clicks</p>
                                    <p className="text-lg font-bold text-white">{url.unique_clicks.toLocaleString()}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Created</p>
                                <p className="text-sm text-gray-300">{formatDate(url.created_at)}</p>
                            </div>
                            {url.expiry_date && (
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Expires</p>
                                    <p className="text-sm text-gray-300">{formatDate(url.expiry_date)}</p>
                                </div>
                            )}
                        </div>

                        {/* Domain & Campaign */}
                        <div className="flex flex-wrap gap-3 pt-2">
                            {url.domain && (
                                <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-800 px-3 py-1.5 rounded-lg">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9" />
                                    </svg>
                                    {url.domain.domain}
                                </div>
                            )}
                            {url.campaign && (
                                <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-800 px-3 py-1.5 rounded-lg">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                                    </svg>
                                    {url.campaign.name}
                                </div>
                            )}
                            {url.password && (
                                <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-800 px-3 py-1.5 rounded-lg">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    Password Protected
                                </div>
                            )}
                        </div>

                        {url.description && (
                            <div className="pt-2">
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Description</p>
                                <p className="text-sm text-gray-400">{url.description}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* QR Code Section */}
                <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden mb-6">
                    <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                            <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                            </svg>
                            QR Code
                        </h3>
                        <button
                            onClick={() => setShowQr(!showQr)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                                showQr
                                    ? 'bg-gray-800 text-gray-400 hover:text-white'
                                    : 'bg-violet-500/10 text-violet-400 border border-violet-500/20 hover:bg-violet-500/20'
                            }`}
                        >
                            {showQr ? 'Hide' : 'Generate QR'}
                        </button>
                    </div>
                    {showQr && (
                        <div className="p-6">
                            <div className="flex flex-col sm:flex-row items-center gap-6">
                                <div className="bg-white rounded-xl p-4">
                                    <div ref={qrSvgRef}>
                                        <QRCodeSVG value={shortUrl} size={160} level="M" />
                                    </div>
                                </div>
                                <div ref={qrCanvasRef} className="hidden">
                                    <QRCodeCanvas value={shortUrl} size={512} level="M" />
                                </div>
                                <div className="flex-1 space-y-3">
                                    <p className="text-xs text-gray-500 font-mono truncate">{shortUrl}</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button onClick={() => downloadQr('svg')} className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-medium rounded-xl transition-colors">
                                            <svg className="w-3.5 h-3.5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                            SVG
                                        </button>
                                        <button onClick={() => downloadQr('png')} className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-medium rounded-xl transition-colors">
                                            <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                            PNG
                                        </button>
                                        <button onClick={() => downloadQr('png-t')} className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-medium rounded-xl transition-colors">
                                            <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                            Transparent PNG
                                        </button>
                                        <button onClick={() => downloadQr('jpg')} className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-medium rounded-xl transition-colors">
                                            <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                            JPG
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Clicks Chart */}
                <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">Clicks (Last 30 Days)</h3>
                        <Link
                            href={urlHelper(`/dashboard/links/${url.id}/analytics`)}
                            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-violet-400 bg-violet-500/10 border border-violet-500/20 rounded-lg hover:bg-violet-500/20 transition-all duration-200"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                            View Analytics
                        </Link>
                    </div>
                    <div className="p-6">
                        {clicks_stats.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500 text-sm">No click data available yet.</p>
                            </div>
                        ) : (
                            <div className="flex items-end gap-1 h-48">
                                {clicks_stats.map((stat, index) => {
                                    const height = (stat.count / maxClicks) * 100;
                                    return (
                                        <div
                                            key={index}
                                            className="flex-1 group relative flex flex-col items-center justify-end"
                                        >
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                                {stat.date}: {stat.count}
                                            </div>
                                            <div
                                                className="w-full rounded-t bg-gradient-to-t from-violet-600 to-fuchsia-500 min-h-[2px] transition-all duration-300 hover:from-violet-500 hover:to-fuchsia-400"
                                                style={{ height: `${Math.max(height, 1)}%` }}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        {clicks_stats.length > 0 && (
                            <div className="flex justify-between mt-2 text-[10px] text-gray-600">
                                <span>{clicks_stats[0]?.date}</span>
                                <span>{clicks_stats[clicks_stats.length - 1]?.date}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
