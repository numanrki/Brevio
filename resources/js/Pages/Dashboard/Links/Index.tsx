import DashboardLayout from '@/Layouts/DashboardLayout';
import Pagination from '@/Components/Pagination';
import { Head, Link, router } from '@inertiajs/react';
import { PaginatedData, Url } from '@/types';
import { url } from '@/utils';
import { useState, useCallback, useRef, useEffect } from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';

interface Props {
    urls: PaginatedData<Url>;
    filters: {
        search?: string;
        status?: string;
    };
}

const statusTabs = [
    { label: 'All', value: '' },
    { label: 'Active', value: 'active' },
    { label: 'Archived', value: 'archived' },
    { label: 'Expired', value: 'expired' },
];

export default function Index({ urls, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [copied, setCopied] = useState<number | null>(null);
    const [qrModal, setQrModal] = useState<{ alias: string; id: number } | null>(null);
    const qrCanvasRef = useRef<HTMLDivElement>(null);
    const qrSvgRef = useRef<HTMLDivElement>(null);
    const searchTimeout = useRef<ReturnType<typeof setTimeout>>();

    const applyFilters = useCallback(
        (params: Record<string, string>) => {
            router.get(url('/dashboard/links'), params, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        },
        []
    );

    useEffect(() => {
        clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            const params: Record<string, string> = {};
            if (search) params.search = search;
            if (status) params.status = status;
            applyFilters(params);
        }, 300);
        return () => clearTimeout(searchTimeout.current);
    }, [search]);

    const handleStatusChange = (value: string) => {
        setStatus(value);
        const params: Record<string, string> = {};
        if (search) params.search = search;
        if (value) params.status = value;
        applyFilters(params);
    };

    const handleDelete = (link: Url) => {
        if (confirm(`Are you sure you want to delete "/${link.alias}"? This cannot be undone.`)) {
            router.delete(url(`/dashboard/links/${link.id}`), { preserveScroll: true });
        }
    };

    const copyToClipboard = (alias: string, id: number) => {
        const shortUrl = `${window.location.origin}${url('/' + alias)}`;
        navigator.clipboard.writeText(shortUrl);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    const truncateUrl = (url: string, maxLen = 50) => {
        return url.length > maxLen ? url.substring(0, maxLen) + '...' : url;
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const getStatusBadge = (link: Url) => {
        if (link.is_archived) {
            return (
                <span className="inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-700/50 text-gray-400 border border-gray-700">
                    ARCHIVED
                </span>
            );
        }
        if (link.expiry_date && new Date(link.expiry_date) < new Date()) {
            return (
                <span className="inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    EXPIRED
                </span>
            );
        }
        if (!link.is_active) {
            return (
                <span className="inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                    DISABLED
                </span>
            );
        }
        return (
            <span className="inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                ACTIVE
            </span>
        );
    };

    const getQrShortUrl = (alias: string) => `${window.location.origin}${url('/' + alias)}`;

    const downloadQr = (format: 'svg' | 'png' | 'png-t' | 'jpg') => {
        if (!qrModal) return;
        const filename = qrModal.alias;

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
            nc.toBlob((b) => {
                if (!b) return;
                const a = document.createElement('a');
                a.href = URL.createObjectURL(b);
                a.download = `${filename}_transparent.png`;
                a.click();
                URL.revokeObjectURL(a.href);
            }, 'image/png');
        } else if (format === 'png') {
            canvas.toBlob((b) => {
                if (!b) return;
                const a = document.createElement('a');
                a.href = URL.createObjectURL(b);
                a.download = `${filename}.png`;
                a.click();
                URL.revokeObjectURL(a.href);
            }, 'image/png');
        } else {
            const nc = document.createElement('canvas');
            nc.width = 512; nc.height = 512;
            const ctx = nc.getContext('2d');
            if (!ctx) return;
            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, 512, 512);
            ctx.drawImage(canvas, 0, 0);
            nc.toBlob((b) => {
                if (!b) return;
                const a = document.createElement('a');
                a.href = URL.createObjectURL(b);
                a.download = `${filename}.jpg`;
                a.click();
                URL.revokeObjectURL(a.href);
            }, 'image/jpeg', 0.95);
        }
    };

    return (
        <DashboardLayout header="Links">
            <Head title="My Links" />

            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex-1 max-w-md">
                    <div className="relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search links..."
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
                        />
                    </div>
                </div>
                <Link
                    href={url('/dashboard/links/create')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-sm font-medium rounded-xl transition-all duration-200"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Link
                </Link>
            </div>

            {/* Status Tabs */}
            <div className="flex gap-1 mb-6 p-1 bg-gray-900 rounded-xl border border-gray-800 w-fit">
                {statusTabs.map((tab) => (
                    <button
                        key={tab.value}
                        onClick={() => handleStatusChange(tab.value)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                            status === tab.value
                                ? 'bg-violet-500/20 text-violet-400'
                                : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Links Table */}
            <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
                {urls.data.length === 0 ? (
                    <div className="p-12 text-center">
                        <svg className="w-12 h-12 text-gray-700 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        <p className="text-gray-500 text-sm mb-4">No links found.</p>
                        <Link
                            href={url('/dashboard/links/create')}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-xl transition-colors"
                        >
                            Create your first link
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-800">
                                        <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Alias</th>
                                        <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
                                        <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                                        <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                        <th className="text-right py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800/50">
                                    {urls.data.map((link) => (
                                        <tr key={link.id} className="hover:bg-gray-800/30 transition-colors">
                                            <td className="py-3 px-6">
                                                <Link href={url(`/dashboard/links/${link.id}`)} className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
                                                    /{link.alias}
                                                </Link>
                                            </td>
                                            <td className="py-3 px-6 text-gray-400 max-w-xs">
                                                <span className="truncate block">{truncateUrl(link.url)}</span>
                                            </td>
                                            <td className="py-3 px-6">
                                                <span className="text-white font-medium">{link.total_clicks.toLocaleString()}</span>
                                            </td>
                                            <td className="py-3 px-6">
                                                {getStatusBadge(link)}
                                            </td>
                                            <td className="py-3 px-6 text-gray-500">
                                                {formatDate(link.created_at)}
                                            </td>
                                            <td className="py-3 px-6">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => copyToClipboard(link.alias, link.id)}
                                                        className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
                                                        title="Copy short link"
                                                    >
                                                        {copied === link.id ? (
                                                            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        ) : (
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                            </svg>
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => setQrModal({ alias: link.alias, id: link.id })}
                                                        className="p-1.5 text-gray-400 hover:text-violet-400 rounded-lg hover:bg-violet-500/10 transition-colors"
                                                        title="Generate QR Code"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                                        </svg>
                                                    </button>
                                                    <Link
                                                        href={url(`/dashboard/links/${link.id}/edit`)}
                                                        className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
                                                        title="Edit"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(link)}
                                                        className="p-1.5 text-gray-400 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="px-6 py-4 border-t border-gray-800">
                            <Pagination links={urls.links} currentPage={urls.current_page} lastPage={urls.last_page} />
                        </div>
                    </>
                )}
            </div>

            {/* QR Code Modal */}
            {qrModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setQrModal(null)}>
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-white">QR Code for /{qrModal.alias}</h3>
                            <button onClick={() => setQrModal(null)} className="p-1 text-gray-500 hover:text-white transition-colors">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex justify-center mb-4">
                            <div className="bg-white rounded-xl p-4">
                                <div ref={qrSvgRef}>
                                    <QRCodeSVG value={getQrShortUrl(qrModal.alias)} size={180} level="M" />
                                </div>
                            </div>
                        </div>
                        <div ref={qrCanvasRef} className="hidden">
                            <QRCodeCanvas value={getQrShortUrl(qrModal.alias)} size={512} level="M" />
                        </div>
                        <p className="text-[11px] text-gray-500 text-center mb-4 font-mono truncate">{getQrShortUrl(qrModal.alias)}</p>
                        <div className="grid grid-cols-4 gap-2">
                            <button onClick={() => downloadQr('svg')} className="flex flex-col items-center gap-1 px-2 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors">
                                <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                <span className="text-[10px] text-gray-400 font-medium">SVG</span>
                            </button>
                            <button onClick={() => downloadQr('png')} className="flex flex-col items-center gap-1 px-2 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors">
                                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                <span className="text-[10px] text-gray-400 font-medium">PNG</span>
                            </button>
                            <button onClick={() => downloadQr('png-t')} className="flex flex-col items-center gap-1 px-2 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors">
                                <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                <span className="text-[10px] text-gray-400 font-medium">T-PNG</span>
                            </button>
                            <button onClick={() => downloadQr('jpg')} className="flex flex-col items-center gap-1 px-2 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors">
                                <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                <span className="text-[10px] text-gray-400 font-medium">JPG</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
