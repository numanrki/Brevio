import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Url } from '@/types';
import { url } from '@/utils';
import { QRCodeSVG } from 'qrcode.react';

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
}

export default function Show({ qrCode }: Props) {
    const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const content = (qrCode.data?.content as string) || '';
    const foreground = (qrCode.style?.foreground as string) || '#000000';
    const background = (qrCode.style?.background as string) || '#ffffff';

    const handleDelete = () => {
        if (confirm('Delete this QR code? This cannot be undone.')) {
            router.delete(url(`/admin/qr-codes/${qrCode.id}`));
        }
    };

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
                                value={content || 'https://example.com'}
                                size={220}
                                fgColor={foreground}
                                bgColor={background}
                            />
                        </div>
                        <div className="flex items-center gap-3 mt-4">
                            <div className="flex items-center gap-1.5">
                                <div className="w-4 h-4 rounded border border-gray-700" style={{ backgroundColor: foreground }} />
                                <span className="text-xs text-gray-500">{foreground}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-4 h-4 rounded border border-gray-700" style={{ backgroundColor: background }} />
                                <span className="text-xs text-gray-500">{background}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
