import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import { QrCode } from '@/types';
import { url } from '@/utils';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { useRef, useState, useCallback } from 'react';

interface ExtendedQrCode extends QrCode {
    url_id?: number | null;
    data?: Record<string, any>;
    style?: Record<string, any> | null;
    url?: { id: number; alias: string; url: string; title?: string | null };
    updated_at?: string;
}

interface Props {
    qrCode: ExtendedQrCode;
}

export default function Show({ qrCode }: Props) {
    const canvasRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<HTMLDivElement>(null);
    const [downloading, setDownloading] = useState<string | null>(null);

    const style = qrCode.style || {};
    const data = qrCode.data || {};
    const fgColor = style.foreground || '#000000';
    const bgColor = style.background || '#ffffff';
    const size = style.size || 300;
    const ecLevel = (style.errorCorrection || 'M') as 'L' | 'M' | 'Q' | 'H';

    // Build QR value from data
    const getQrValue = () => {
        if (qrCode.url) {
            return `${window.location.origin}${url('/' + qrCode.url.alias)}`;
        }
        switch (data.type) {
            case 'url': return data.value || data.url || 'https://example.com';
            case 'text': return data.value || data.text || 'Hello';
            case 'email': {
                let mailto = `mailto:${data.email || ''}`;
                const params: string[] = [];
                if (data.subject) params.push(`subject=${encodeURIComponent(data.subject)}`);
                if (data.body) params.push(`body=${encodeURIComponent(data.body)}`);
                if (params.length) mailto += '?' + params.join('&');
                return mailto;
            }
            case 'phone': return `tel:${data.value || data.phone || ''}`;
            case 'wifi': return `WIFI:T:${data.encryption || 'WPA'};S:${data.ssid || ''};P:${data.password || ''};;`;
            default: return data.value || 'https://example.com';
        }
    };

    const qrValue = getQrValue();

    const getContentLabel = () => {
        switch (data.type) {
            case 'url': return data.value || data.url || '—';
            case 'text': return (data.value || data.text || '').substring(0, 60) + ((data.value || data.text || '').length > 60 ? '...' : '');
            case 'email': return data.email || '—';
            case 'phone': return data.value || data.phone || '—';
            case 'wifi': return data.ssid || '—';
            default: return '—';
        }
    };

    const downloadSVG = useCallback(() => {
        setDownloading('svg');
        const svgEl = svgRef.current?.querySelector('svg');
        if (!svgEl) { setDownloading(null); return; }
        const svgData = new XMLSerializer().serializeToString(svgEl);
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `${qrCode.name.replace(/\s+/g, '_')}.svg`;
        a.click();
        URL.revokeObjectURL(downloadUrl);
        setTimeout(() => setDownloading(null), 500);
    }, [qrCode.name]);

    const downloadPNG = useCallback((transparent: boolean) => {
        const key = transparent ? 'png-t' : 'png';
        setDownloading(key);
        const canvas = canvasRef.current?.querySelector('canvas');
        if (!canvas) { setDownloading(null); return; }

        if (transparent) {
            // Create a new canvas with transparent background
            const newCanvas = document.createElement('canvas');
            newCanvas.width = size;
            newCanvas.height = size;
            const ctx = newCanvas.getContext('2d');
            if (!ctx) { setDownloading(null); return; }
            // Draw original canvas
            ctx.drawImage(canvas, 0, 0);
            // Make background transparent
            const imageData = ctx.getImageData(0, 0, size, size);
            const pixels = imageData.data;
            const bgR = parseInt(bgColor.slice(1, 3), 16);
            const bgG = parseInt(bgColor.slice(3, 5), 16);
            const bgB = parseInt(bgColor.slice(5, 7), 16);
            for (let i = 0; i < pixels.length; i += 4) {
                if (Math.abs(pixels[i] - bgR) < 10 && Math.abs(pixels[i + 1] - bgG) < 10 && Math.abs(pixels[i + 2] - bgB) < 10) {
                    pixels[i + 3] = 0;
                }
            }
            ctx.putImageData(imageData, 0, 0);
            newCanvas.toBlob((blob) => {
                if (!blob) { setDownloading(null); return; }
                const downloadUrl = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = downloadUrl;
                a.download = `${qrCode.name.replace(/\s+/g, '_')}_transparent.png`;
                a.click();
                URL.revokeObjectURL(downloadUrl);
                setTimeout(() => setDownloading(null), 500);
            }, 'image/png');
        } else {
            canvas.toBlob((blob) => {
                if (!blob) { setDownloading(null); return; }
                const downloadUrl = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = downloadUrl;
                a.download = `${qrCode.name.replace(/\s+/g, '_')}.png`;
                a.click();
                URL.revokeObjectURL(downloadUrl);
                setTimeout(() => setDownloading(null), 500);
            }, 'image/png');
        }
    }, [qrCode.name, size, bgColor]);

    const downloadJPG = useCallback(() => {
        setDownloading('jpg');
        const canvas = canvasRef.current?.querySelector('canvas');
        if (!canvas) { setDownloading(null); return; }
        // JPG needs white background if bg is transparent-ish
        const newCanvas = document.createElement('canvas');
        newCanvas.width = size;
        newCanvas.height = size;
        const ctx = newCanvas.getContext('2d');
        if (!ctx) { setDownloading(null); return; }
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, size, size);
        ctx.drawImage(canvas, 0, 0);
        newCanvas.toBlob((blob) => {
            if (!blob) { setDownloading(null); return; }
            const downloadUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `${qrCode.name.replace(/\s+/g, '_')}.jpg`;
            a.click();
            URL.revokeObjectURL(downloadUrl);
            setTimeout(() => setDownloading(null), 500);
        }, 'image/jpeg', 0.95);
    }, [qrCode.name, size, bgColor]);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <DashboardLayout header={qrCode.name}>
            <Head title={`QR Code - ${qrCode.name}`} />

            <div className="mb-6 flex items-center justify-between">
                <Link href={url('/dashboard/qr-codes')}
                    className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to QR Codes
                </Link>
                <Link href={url(`/dashboard/qr-codes/${qrCode.id}/edit`)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: QR Code Display + Downloads */}
                <div className="lg:col-span-1 space-y-4">
                    {/* QR Code Card */}
                    <div className="rounded-2xl bg-gray-900 border border-gray-800 p-6 flex flex-col items-center">
                        <div className="rounded-xl p-4 mb-4" style={{ background: bgColor }}>
                            <div ref={svgRef}>
                                <QRCodeSVG
                                    value={qrValue}
                                    size={200}
                                    fgColor={fgColor}
                                    bgColor={bgColor}
                                    level={ecLevel}
                                />
                            </div>
                        </div>
                        {/* Hidden canvas for downloads */}
                        <div ref={canvasRef} className="hidden">
                            <QRCodeCanvas
                                value={qrValue}
                                size={size}
                                fgColor={fgColor}
                                bgColor={bgColor}
                                level={ecLevel}
                            />
                        </div>
                        <p className="text-xs text-gray-500">{size} × {size} px • Error Correction: {ecLevel}</p>
                    </div>

                    {/* Download Buttons */}
                    <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
                        <div className="px-5 py-3 border-b border-gray-800">
                            <h3 className="text-sm font-semibold text-white">Download</h3>
                        </div>
                        <div className="p-4 grid grid-cols-2 gap-2">
                            <button onClick={downloadSVG} disabled={downloading === 'svg'}
                                className="flex items-center justify-center gap-2 px-3 py-2.5 bg-gray-800 hover:bg-gray-700 text-white text-xs font-medium rounded-xl transition-colors disabled:opacity-50">
                                <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                SVG
                            </button>
                            <button onClick={() => downloadPNG(false)} disabled={downloading === 'png'}
                                className="flex items-center justify-center gap-2 px-3 py-2.5 bg-gray-800 hover:bg-gray-700 text-white text-xs font-medium rounded-xl transition-colors disabled:opacity-50">
                                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                PNG
                            </button>
                            <button onClick={() => downloadPNG(true)} disabled={downloading === 'png-t'}
                                className="flex items-center justify-center gap-2 px-3 py-2.5 bg-gray-800 hover:bg-gray-700 text-white text-xs font-medium rounded-xl transition-colors disabled:opacity-50">
                                <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                Transparent PNG
                            </button>
                            <button onClick={downloadJPG} disabled={downloading === 'jpg'}
                                className="flex items-center justify-center gap-2 px-3 py-2.5 bg-gray-800 hover:bg-gray-700 text-white text-xs font-medium rounded-xl transition-colors disabled:opacity-50">
                                <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                JPG
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right: Info */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Stats */}
                    <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
                        <div className="p-6 flex items-center gap-6">
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Scans</p>
                                <p className="text-3xl font-bold text-white">{qrCode.scans.toLocaleString()}</p>
                            </div>
                            <div className="h-12 border-l border-gray-800" />
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Created</p>
                                <p className="text-sm text-gray-300">{formatDate(qrCode.created_at)}</p>
                            </div>
                            <div className="h-12 border-l border-gray-800" />
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Type</p>
                                <p className="text-sm text-gray-300 capitalize">{data.type || 'URL'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Linked URL */}
                    {qrCode.url && (
                        <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-800">
                                <h3 className="text-sm font-semibold text-white">Linked URL</h3>
                            </div>
                            <div className="p-6">
                                <div className="flex items-center gap-3 p-3 bg-gray-950 rounded-xl border border-gray-800">
                                    <svg className="w-4 h-4 text-violet-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                    </svg>
                                    <div className="flex-1 min-w-0">
                                        <Link href={url(`/dashboard/links/${qrCode.url.id}`)} className="text-sm text-violet-400 hover:text-violet-300 font-medium transition-colors">
                                            /{qrCode.url.alias}
                                        </Link>
                                        <p className="text-xs text-gray-500 truncate mt-0.5">{qrCode.url.url}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Content */}
                    <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-800">
                            <h3 className="text-sm font-semibold text-white">Content</h3>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center gap-3 p-3 bg-gray-950 rounded-xl border border-gray-800">
                                <span className="text-[10px] font-bold uppercase text-gray-500 bg-gray-800 px-2 py-0.5 rounded">{data.type || 'URL'}</span>
                                <span className="text-sm text-gray-300 truncate">{getContentLabel()}</span>
                            </div>
                            <p className="text-[11px] text-gray-600 mt-2 font-mono break-all">{qrValue}</p>
                        </div>
                    </div>

                    {/* Style Info */}
                    <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-800">
                            <h3 className="text-sm font-semibold text-white">Style</h3>
                        </div>
                        <div className="p-6 flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded border border-gray-700" style={{ background: fgColor }} />
                                <div>
                                    <p className="text-[10px] text-gray-500">Foreground</p>
                                    <p className="text-xs font-mono text-gray-300">{fgColor}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded border border-gray-700" style={{ background: bgColor }} />
                                <div>
                                    <p className="text-[10px] text-gray-500">Background</p>
                                    <p className="text-xs font-mono text-gray-300">{bgColor}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-500">Size</p>
                                <p className="text-xs text-gray-300">{size}px</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-500">EC Level</p>
                                <p className="text-xs text-gray-300">{ecLevel}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
