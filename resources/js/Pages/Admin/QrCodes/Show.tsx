import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Url } from '@/types';
import { url } from '@/utils';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { useRef, useCallback } from 'react';

interface QrCodeFull {
    id: number;
    name: string;
    type: string;
    data: Record<string, unknown>;
    style: Record<string, unknown>;
    scans: number;
    created_at: string;
    url?: Url;
}

interface Props {
    qrCode: QrCodeFull;
    scanUrl: string;
}

const HD_SIZE = 1024;

export default function Show({ qrCode, scanUrl }: Props) {
    const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const content = (qrCode.data?.content as string) || '';
    const foreground = (qrCode.style?.foreground as string) || '#000000';
    const background = (qrCode.style?.background as string) || '#ffffff';
    const hdCanvasRef = useRef<HTMLDivElement>(null);

    const handleDelete = () => {
        if (confirm('Delete this QR code? This cannot be undone.')) {
            router.delete(url(`/admin/qr-codes/${qrCode.id}`));
        }
    };

    const downloadFile = (dataUrl: string, filename: string) => {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const getCanvas = (): HTMLCanvasElement | null => {
        return hdCanvasRef.current?.querySelector('canvas') || null;
    };

    const downloadSVG = useCallback(() => {
        const svgEl = document.getElementById('qr-preview-svg');
        if (!svgEl) return;
        const clone = svgEl.cloneNode(true) as SVGElement;
        clone.setAttribute('width', String(HD_SIZE));
        clone.setAttribute('height', String(HD_SIZE));
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(clone);
        const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        downloadFile(URL.createObjectURL(blob), `${qrCode.name}.svg`);
    }, [qrCode.name]);

    const downloadPNG = useCallback(() => {
        const canvas = getCanvas();
        if (!canvas) return;
        downloadFile(canvas.toDataURL('image/png'), `${qrCode.name}.png`);
    }, [qrCode.name]);

    const downloadTransparentPNG = useCallback(() => {
        const canvas = getCanvas();
        if (!canvas) return;
        const tmpCanvas = document.createElement('canvas');
        tmpCanvas.width = HD_SIZE;
        tmpCanvas.height = HD_SIZE;
        const ctx = tmpCanvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(canvas, 0, 0);
        // Remove background color pixels, keep foreground
        const imageData = ctx.getImageData(0, 0, HD_SIZE, HD_SIZE);
        const bgR = parseInt(background.slice(1, 3), 16);
        const bgG = parseInt(background.slice(3, 5), 16);
        const bgB = parseInt(background.slice(5, 7), 16);
        for (let i = 0; i < imageData.data.length; i += 4) {
            const r = imageData.data[i], g = imageData.data[i + 1], b = imageData.data[i + 2];
            if (Math.abs(r - bgR) < 30 && Math.abs(g - bgG) < 30 && Math.abs(b - bgB) < 30) {
                imageData.data[i + 3] = 0; // make transparent
            }
        }
        ctx.putImageData(imageData, 0, 0);
        downloadFile(tmpCanvas.toDataURL('image/png'), `${qrCode.name}-transparent.png`);
    }, [qrCode.name, background]);

    const downloadJPG = useCallback(() => {
        const canvas = getCanvas();
        if (!canvas) return;
        // JPG doesn't support transparency, draw on white bg
        const tmpCanvas = document.createElement('canvas');
        tmpCanvas.width = HD_SIZE;
        tmpCanvas.height = HD_SIZE;
        const ctx = tmpCanvas.getContext('2d');
        if (!ctx) return;
        ctx.fillStyle = background;
        ctx.fillRect(0, 0, HD_SIZE, HD_SIZE);
        ctx.drawImage(canvas, 0, 0);
        downloadFile(tmpCanvas.toDataURL('image/jpeg', 0.95), `${qrCode.name}.jpg`);
    }, [qrCode.name, background]);

    const downloadButtons = [
        { label: 'SVG', desc: 'Vector', onClick: downloadSVG },
        { label: 'PNG', desc: `${HD_SIZE}px`, onClick: downloadPNG },
        { label: 'PNG', desc: 'Transparent', onClick: downloadTransparentPNG },
        { label: 'JPG', desc: `${HD_SIZE}px`, onClick: downloadJPG },
    ];

    return (
        <AdminLayout header="QR Code Details">
            <Head title={`QR: ${qrCode.name}`} />

            <div className="max-w-3xl">
                <Link href={url('/admin/qr-codes')} className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white mb-6 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    Back to QR Codes
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Info */}
                    <div className="rounded-xl bg-gray-900 border border-gray-800 p-6">
                        <div className="flex items-start justify-between mb-4">
                            <h2 className="text-xl font-bold text-white">{qrCode.name}</h2>
                            <div className="flex items-center gap-2">
                                <Link href={url(`/admin/qr-codes/${qrCode.id}/edit`)} className="px-3 py-2 bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-lg text-sm font-medium hover:bg-violet-500/20 transition-colors">
                                    Edit
                                </Link>
                                <button onClick={handleDelete} className="px-3 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-sm font-medium hover:bg-red-500/20 transition-colors">
                                    Delete
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-gray-800">
                            <div>
                                <p className="text-xs text-gray-500 uppercase">Content</p>
                                <p className="text-sm text-gray-300 mt-0.5 break-all">{content || '—'}</p>
                            </div>
                            {qrCode.url && (
                                <div>
                                    <p className="text-xs text-gray-500 uppercase">Linked URL</p>
                                    <p className="text-sm text-gray-300 mt-0.5">/{qrCode.url.alias}</p>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase">Scans</p>
                                    <p className="text-lg font-bold text-white mt-0.5">{qrCode.scans.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase">Created</p>
                                    <p className="text-sm text-gray-300 mt-0.5">{formatDate(qrCode.created_at)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* QR Preview */}
                    <div className="rounded-xl bg-gray-900 border border-gray-800 p-6 flex flex-col items-center justify-center">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6">QR Code</h3>
                        <div className="p-4 rounded-xl" style={{ backgroundColor: background }}>
                            <QRCodeSVG
                                id="qr-preview-svg"
                                value={scanUrl}
                                size={220}
                                fgColor={foreground}
                                bgColor={background}
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-3 break-all text-center max-w-[240px]">Scan URL: {scanUrl}</p>
                        <div className="flex items-center gap-3 mt-3">
                            <div className="flex items-center gap-1.5">
                                <div className="w-4 h-4 rounded border border-gray-700" style={{ backgroundColor: foreground }} />
                                <span className="text-xs text-gray-500">{foreground}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-4 h-4 rounded border border-gray-700" style={{ backgroundColor: background }} />
                                <span className="text-xs text-gray-500">{background}</span>
                            </div>
                        </div>

                        {/* Download Buttons */}
                        <div className="mt-6 w-full border-t border-gray-800 pt-5">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 text-center">Download</p>
                            <div className="grid grid-cols-2 gap-2">
                                {downloadButtons.map((btn, i) => (
                                    <button
                                        key={i}
                                        onClick={btn.onClick}
                                        className="flex items-center justify-center gap-2 px-3 py-2.5 bg-gray-950 border border-gray-800 rounded-lg hover:border-violet-500/30 hover:bg-violet-500/5 transition-all group"
                                    >
                                        <svg className="w-4 h-4 text-gray-500 group-hover:text-violet-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                        <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">{btn.label}</span>
                                        <span className="text-[10px] text-gray-600">{btn.desc}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hidden HD canvas for export */}
            <div ref={hdCanvasRef} style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
                <QRCodeCanvas
                    value={scanUrl}
                    size={HD_SIZE}
                    fgColor={foreground}
                    bgColor={background}
                    level="H"
                />
            </div>
        </AdminLayout>
    );
}
