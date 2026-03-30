import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/Pagination';
import { Head, Link, router } from '@inertiajs/react';
import { PaginatedData, Url, QrCodeFull } from '@/types';
import { useState, useCallback, useRef, useEffect } from 'react';
import { url } from '@/utils';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';

const HD_SIZE = 1024;

function QrPopup({ qrData, name, onClose }: { qrData: QrCodeFull; name: string; onClose: () => void }) {
    const popupRef = useRef<HTMLDivElement>(null);
    const hdCanvasRef = useRef<HTMLDivElement>(null);
    const content = qrData.data?.content || '';
    const foreground = qrData.style?.foreground || '#000000';
    const background = qrData.style?.background || '#ffffff';

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(e.target as Node)) onClose();
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [onClose]);

    const downloadFile = (dataUrl: string, filename: string) => {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const getCanvas = (): HTMLCanvasElement | null => hdCanvasRef.current?.querySelector('canvas') || null;

    const downloadSVG = () => {
        const svgEl = popupRef.current?.querySelector('.qr-svg-el') as SVGElement | null;
        if (!svgEl) return;
        const clone = svgEl.cloneNode(true) as SVGElement;
        clone.setAttribute('width', String(HD_SIZE));
        clone.setAttribute('height', String(HD_SIZE));
        const blob = new Blob([new XMLSerializer().serializeToString(clone)], { type: 'image/svg+xml;charset=utf-8' });
        downloadFile(URL.createObjectURL(blob), `${name}.svg`);
    };

    const downloadPNG = () => {
        const canvas = getCanvas();
        if (!canvas) return;
        downloadFile(canvas.toDataURL('image/png'), `${name}.png`);
    };

    const downloadTransparentPNG = () => {
        const canvas = getCanvas();
        if (!canvas) return;
        const tmp = document.createElement('canvas');
        tmp.width = HD_SIZE; tmp.height = HD_SIZE;
        const ctx = tmp.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(canvas, 0, 0);
        const img = ctx.getImageData(0, 0, HD_SIZE, HD_SIZE);
        const bgR = parseInt(background.slice(1, 3), 16), bgG = parseInt(background.slice(3, 5), 16), bgB = parseInt(background.slice(5, 7), 16);
        for (let i = 0; i < img.data.length; i += 4) {
            if (Math.abs(img.data[i] - bgR) < 30 && Math.abs(img.data[i + 1] - bgG) < 30 && Math.abs(img.data[i + 2] - bgB) < 30) img.data[i + 3] = 0;
        }
        ctx.putImageData(img, 0, 0);
        downloadFile(tmp.toDataURL('image/png'), `${name}-transparent.png`);
    };

    const downloadJPG = () => {
        const canvas = getCanvas();
        if (!canvas) return;
        const tmp = document.createElement('canvas');
        tmp.width = HD_SIZE; tmp.height = HD_SIZE;
        const ctx = tmp.getContext('2d');
        if (!ctx) return;
        ctx.fillStyle = background;
        ctx.fillRect(0, 0, HD_SIZE, HD_SIZE);
        ctx.drawImage(canvas, 0, 0);
        downloadFile(tmp.toDataURL('image/jpeg', 0.95), `${name}.jpg`);
    };

    return (
        <div ref={popupRef} className="absolute right-0 top-full mt-2 z-50 w-72 rounded-xl bg-gray-900 border border-gray-700 shadow-2xl shadow-black/50 p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-center mb-3">
                <QRCodeSVG className="qr-svg-el" value={content} size={160} fgColor={foreground} bgColor={background} />
            </div>
            <div style={{ position: 'absolute', left: '-9999px' }} ref={hdCanvasRef}>
                <QRCodeCanvas value={content} size={HD_SIZE} fgColor={foreground} bgColor={background} />
            </div>
            <p className="text-[10px] text-gray-500 text-center mb-3 truncate">{content}</p>
            <div className="grid grid-cols-2 gap-1.5">
                <button onClick={downloadSVG} className="px-2 py-1.5 text-[11px] font-medium rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition-all">SVG</button>
                <button onClick={downloadPNG} className="px-2 py-1.5 text-[11px] font-medium rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition-all">PNG</button>
                <button onClick={downloadTransparentPNG} className="px-2 py-1.5 text-[11px] font-medium rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition-all">Transparent</button>
                <button onClick={downloadJPG} className="px-2 py-1.5 text-[11px] font-medium rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition-all">JPG</button>
            </div>
        </div>
    );
}

function useCopyLink() {
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const copy = (id: number, alias: string) => {
        const base = window.location.origin + window.location.pathname.replace(/\/admin.*$/, '');
        navigator.clipboard.writeText(`${base}/${alias}`);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };
    return { copiedId, copy };
}

interface Props {
    links: PaginatedData<Url>;
    filters: {
        search?: string;
        status?: string;
    };
}

export default function Index({ links, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const searchTimeout = useRef<ReturnType<typeof setTimeout>>();
    const { copiedId, copy } = useCopyLink();
    const [qrPopupId, setQrPopupId] = useState<number | null>(null);
    const [qrDataMap, setQrDataMap] = useState<Record<number, QrCodeFull>>(() => {
        const map: Record<number, QrCodeFull> = {};
        links.data.forEach((l) => { if (l.qr_codes && l.qr_codes.length > 0) map[l.id] = l.qr_codes[0]; });
        return map;
    });
    const [qrLoading, setQrLoading] = useState<number | null>(null);

    const handleQrClick = (link: Url) => {
        if (qrPopupId === link.id) { setQrPopupId(null); return; }
        if (qrDataMap[link.id]) { setQrPopupId(link.id); return; }
        setQrLoading(link.id);
        fetch(url(`/admin/links/${link.id}/generate-qr`), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '' },
        })
            .then((r) => r.json())
            .then((data) => {
                setQrDataMap((prev) => ({ ...prev, [link.id]: data.qrCode }));
                setQrPopupId(link.id);
            })
            .finally(() => setQrLoading(null));
    };

    const applyFilters = useCallback(
        (params: Record<string, string>) => {
            router.get(url('/admin/links'), params, {
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
        if (confirm(`Are you sure you want to delete the link "${link.alias}"? This cannot be undone.`)) {
            router.delete(url(`/admin/links/${link.id}`), { preserveScroll: true });
        }
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

    return (
        <AdminLayout header="Links">
            <Head title="Manage Links" />

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                    {/* Search */}
                    <div className="relative w-full sm:w-72">
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

                    {/* Status Filter */}
                    <select
                        value={status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        className="px-3 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40"
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="archived">Archived</option>
                        <option value="expired">Expired</option>
                        <option value="disabled">Disabled</option>
                    </select>
                </div>

                <Link
                    href={url('/admin/links/create')}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-violet-500/20"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Link
                </Link>
            </div>

            {/* Table */}
            <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-800">
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Link</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Clicks</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Created</th>
                                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {links.data.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
                                                <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                                </svg>
                                            </div>
                                            <p className="text-gray-500 text-sm">No links found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                links.data.map((link) => (
                                    <tr key={link.id} className="group hover:bg-gray-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-violet-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                                </svg>
                                                <div className="min-w-0">
                                                    <span className="text-sm font-medium text-white block">{window.location.origin.replace(/\/admin.*$/, '')}/{link.alias}</span>
                                                    <span className="text-xs text-gray-500 block truncate" title={link.url}>{truncateUrl(link.url, 40)}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-semibold text-gray-300">{link.total_clicks.toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-4">{getStatusBadge(link)}</td>
                                        <td className="px-6 py-4 text-gray-500 text-sm whitespace-nowrap">
                                            {formatDate(link.created_at)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <Link
                                                    href={url(`/admin/links/${link.id}/analytics`)}
                                                    className="p-2 text-gray-500 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all"
                                                    title="Analytics"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                    </svg>
                                                </Link>
                                                <button
                                                    onClick={() => copy(link.id, link.alias)}
                                                    className={`p-2 rounded-lg transition-all ${copiedId === link.id ? 'text-emerald-400 bg-emerald-500/10' : 'text-gray-500 hover:text-fuchsia-400 hover:bg-fuchsia-500/10'}`}
                                                    title={copiedId === link.id ? 'Copied!' : 'Copy short link'}
                                                >
                                                    {copiedId === link.id ? (
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                    ) : (
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                                                    )}
                                                </button>
                                                <div className="relative">
                                                    <button
                                                        onClick={() => handleQrClick(link)}
                                                        className={`p-2 rounded-lg transition-all ${qrPopupId === link.id ? 'text-violet-400 bg-violet-500/10' : 'text-gray-500 hover:text-violet-400 hover:bg-violet-500/10'}`}
                                                        title={qrDataMap[link.id] ? 'Show QR Code' : 'Generate QR Code'}
                                                    >
                                                        {qrLoading === link.id ? (
                                                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                                                        ) : (
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                                                        )}
                                                    </button>
                                                    {qrPopupId === link.id && qrDataMap[link.id] && (
                                                        <QrPopup qrData={qrDataMap[link.id]} name={link.alias} onClose={() => setQrPopupId(null)} />
                                                    )}
                                                </div>
                                                <Link
                                                    href={url(`/admin/links/${link.id}`)}
                                                    className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
                                                    title="View"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </Link>
                                                <Link
                                                    href={url(`/admin/links/${link.id}/edit`)}
                                                    className="p-2 text-gray-500 hover:text-violet-400 hover:bg-violet-500/10 rounded-lg transition-all"
                                                    title="Edit"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(link)}
                                                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                                    title="Delete"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <div className="px-6 py-4 border-t border-gray-800 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                        Showing <span className="text-gray-300">{links.data.length}</span> of{' '}
                        <span className="text-gray-300">{links.total}</span> links
                    </p>
                    <Pagination links={links.links} currentPage={links.current_page} lastPage={links.last_page} />
                </div>
            </div>
        </AdminLayout>
    );
}
