import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/Pagination';
import { Head, Link, router } from '@inertiajs/react';
import { PaginatedData, Bio, QrCodeFull } from '@/types';
import { url } from '@/utils';
import { useState, useRef, useEffect, useCallback } from 'react';
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
        navigator.clipboard.writeText(`${base}/bio/${alias}`);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };
    return { copiedId, copy };
}

interface Props {
    bios: PaginatedData<Bio & { widgets_count: number }>;
}

export default function Index({ bios }: Props) {
    const { copiedId, copy } = useCopyLink();
    const [qrPopupId, setQrPopupId] = useState<number | null>(null);
    const [qrDataMap, setQrDataMap] = useState<Record<number, QrCodeFull>>(() => {
        const map: Record<number, QrCodeFull> = {};
        bios.data.forEach((b) => { if (b.qr_code) map[b.id] = b.qr_code; });
        return map;
    });
    const [qrLoading, setQrLoading] = useState<number | null>(null);

    const handleQrClick = (bio: Bio & { widgets_count: number }) => {
        if (qrPopupId === bio.id) { setQrPopupId(null); return; }
        if (qrDataMap[bio.id]) { setQrPopupId(bio.id); return; }
        setQrLoading(bio.id);
        fetch(url(`/admin/bio/${bio.id}/generate-qr`), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '' },
        })
            .then((r) => r.json())
            .then((data) => {
                setQrDataMap((prev) => ({ ...prev, [bio.id]: data.qrCode }));
                setQrPopupId(bio.id);
            })
            .finally(() => setQrLoading(null));
    };

    const handleDelete = (bio: Bio) => {
        if (confirm(`Delete bio page "${bio.name}"? This cannot be undone.`)) {
            router.delete(url(`/admin/bio/${bio.id}`), { preserveScroll: true });
        }
    };

    return (
        <AdminLayout header="Bio Pages">
            <Head title="Bio Pages" />

            <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-gray-500">{bios.total} bio page{bios.total !== 1 ? 's' : ''}</p>
                <Link
                    href={url('/admin/bio/create')}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-violet-500/20"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Create Bio Page
                </Link>
            </div>

            <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-800">
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Alias</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Widgets</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Views</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {bios.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
                                                <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                            </div>
                                            <p className="text-gray-500 text-sm">No bio pages yet</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                bios.data.map((bio) => (
                                    <tr key={bio.id} className="group hover:bg-gray-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-white">{bio.name}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-400">/{bio.alias}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-300">{bio.widgets_count}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-semibold text-gray-300">{bio.views.toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {bio.is_active ? (
                                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">ACTIVE</span>
                                            ) : (
                                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">INACTIVE</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => copy(bio.id, bio.alias)}
                                                    className={`p-2 rounded-lg transition-all ${copiedId === bio.id ? 'text-emerald-400 bg-emerald-500/10' : 'text-gray-500 hover:text-fuchsia-400 hover:bg-fuchsia-500/10'}`}
                                                    title={copiedId === bio.id ? 'Copied!' : 'Copy bio link'}
                                                >
                                                    {copiedId === bio.id ? (
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                    ) : (
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                                                    )}
                                                </button>
                                                <div className="relative">
                                                    <button
                                                        onClick={() => handleQrClick(bio)}
                                                        className={`p-2 rounded-lg transition-all ${qrPopupId === bio.id ? 'text-violet-400 bg-violet-500/10' : 'text-gray-500 hover:text-violet-400 hover:bg-violet-500/10'}`}
                                                        title={qrDataMap[bio.id] ? 'Show QR Code' : 'Generate QR Code'}
                                                    >
                                                        {qrLoading === bio.id ? (
                                                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                                                        ) : (
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                                                        )}
                                                    </button>
                                                    {qrPopupId === bio.id && qrDataMap[bio.id] && (
                                                        <QrPopup qrData={qrDataMap[bio.id]} name={bio.alias} onClose={() => setQrPopupId(null)} />
                                                    )}
                                                </div>
                                                <Link href={url(`/admin/bio/${bio.id}/analytics`)} className="p-2 text-gray-500 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all" title="Analytics">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                                </Link>
                                                <Link href={url(`/admin/bio/${bio.id}`)} className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-all" title="View">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                </Link>
                                                <Link href={url(`/admin/bio/${bio.id}/edit`)} className="p-2 text-gray-500 hover:text-violet-400 hover:bg-violet-500/10 rounded-lg transition-all" title="Edit">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                </Link>
                                                <button onClick={() => handleDelete(bio)} className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all" title="Delete">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {bios.data.length > 0 && (
                    <div className="px-6 py-4 border-t border-gray-800 flex items-center justify-between">
                        <p className="text-sm text-gray-500">Showing <span className="text-gray-300">{bios.data.length}</span> of <span className="text-gray-300">{bios.total}</span></p>
                        <Pagination links={bios.links} currentPage={bios.current_page} lastPage={bios.last_page} />
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
