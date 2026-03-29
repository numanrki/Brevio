import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { url } from '@/utils';
import { FormEvent } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface UrlOption {
    id: number;
    alias: string;
    url: string;
    title?: string;
}

interface QrCodeFull {
    id: number;
    name: string;
    url_id?: number;
    data: Record<string, unknown>;
    style: Record<string, unknown>;
}

interface Props {
    qrCode: QrCodeFull;
    urls: UrlOption[];
}

export default function Edit({ qrCode, urls }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: qrCode.name,
        url_id: String(qrCode.url_id || ''),
        data: JSON.stringify(qrCode.data || {}),
        style: JSON.stringify(qrCode.style || {}),
    });

    const parsedData = (() => { try { return JSON.parse(data.data); } catch { return {}; } })();
    const parsedStyle = (() => { try { return JSON.parse(data.style); } catch { return { foreground: '#000000', background: '#ffffff' }; } })();

    const updateData = (key: string, value: string) => {
        setData('data', JSON.stringify({ ...parsedData, [key]: value }));
    };

    const updateStyle = (key: string, value: string) => {
        setData('style', JSON.stringify({ ...parsedStyle, [key]: value }));
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        put(url(`/admin/qr-codes/${qrCode.id}`));
    };

    const handleDelete = () => {
        if (confirm('Delete this QR code? This cannot be undone.')) {
            router.delete(url(`/admin/qr-codes/${qrCode.id}`));
        }
    };

    return (
        <AdminLayout header="Edit QR Code">
            <Head title={`Edit QR: ${qrCode.name}`} />

            <div className="max-w-3xl">
                <Link href={url('/admin/qr-codes')} className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white mb-6 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    Back to QR Codes
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <form onSubmit={submit} className="space-y-6">
                        <div className="rounded-xl bg-gray-900 border border-gray-800 p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">Name *</label>
                                <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40" />
                                {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">Content *</label>
                                <input type="text" value={parsedData.content || ''} onChange={(e) => updateData('content', e.target.value)} placeholder="URL or text to encode" className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40" />
                                {errors.data && <p className="text-xs text-red-400 mt-1">{errors.data}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">Link to Existing URL</label>
                                <select value={data.url_id} onChange={(e) => setData('url_id', e.target.value)} className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40">
                                    <option value="">None</option>
                                    {urls.map((u) => (
                                        <option key={u.id} value={u.id}>/{u.alias} — {u.title || u.url}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="min-w-0">
                                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Foreground</label>
                                    <div className="flex items-center gap-2">
                                        <input type="color" value={parsedStyle.foreground || '#000000'} onChange={(e) => updateStyle('foreground', e.target.value)} className="w-10 h-10 rounded-lg border border-gray-800 cursor-pointer bg-transparent flex-shrink-0" />
                                        <input type="text" value={parsedStyle.foreground || '#000000'} onChange={(e) => updateStyle('foreground', e.target.value)} className="min-w-0 flex-1 px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-sm text-white font-mono focus:outline-none focus:ring-1 focus:ring-violet-500/40" />
                                    </div>
                                </div>
                                <div className="min-w-0">
                                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Background</label>
                                    <div className="flex items-center gap-2">
                                        <input type="color" value={parsedStyle.background || '#ffffff'} onChange={(e) => updateStyle('background', e.target.value)} className="w-10 h-10 rounded-lg border border-gray-800 cursor-pointer bg-transparent flex-shrink-0" />
                                        <input type="text" value={parsedStyle.background || '#ffffff'} onChange={(e) => updateStyle('background', e.target.value)} className="min-w-0 flex-1 px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-sm text-white font-mono focus:outline-none focus:ring-1 focus:ring-violet-500/40" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <button type="submit" disabled={processing} className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-violet-500/20">
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </button>
                                <Link href={url('/admin/qr-codes')} className="px-6 py-2.5 text-sm text-gray-400 hover:text-white transition-colors">Cancel</Link>
                            </div>
                            <button type="button" onClick={handleDelete} className="px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all">
                                Delete
                            </button>
                        </div>
                    </form>

                    {/* Live Preview */}
                    <div className="rounded-xl bg-gray-900 border border-gray-800 p-6 flex flex-col items-center justify-center">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6">Preview</h3>
                        <div className="p-4 rounded-xl" style={{ backgroundColor: parsedStyle.background || '#ffffff' }}>
                            <QRCodeSVG
                                value={parsedData.content || 'https://example.com'}
                                size={200}
                                fgColor={parsedStyle.foreground || '#000000'}
                                bgColor={parsedStyle.background || '#ffffff'}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
