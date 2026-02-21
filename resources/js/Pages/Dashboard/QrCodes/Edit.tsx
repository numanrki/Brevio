import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { QrCode } from '@/types';
import { FormEvent, useState } from 'react';
import { url } from '@/utils';

interface UrlOption {
    id: number;
    alias: string;
    url: string;
    title: string | null;
}

interface ExtendedQrCode extends QrCode {
    url_id?: number | null;
    data?: Record<string, any>;
    style?: Record<string, any> | null;
    url?: { id: number; alias: string; url: string };
    updated_at?: string;
}

interface Props {
    qrCode: ExtendedQrCode;
    urls: UrlOption[];
}

const QR_TYPES = [
    { type: 'url', name: 'URL', icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' },
    { type: 'text', name: 'Text', icon: 'M4 6h16M4 12h16M4 18h7' },
    { type: 'email', name: 'Email', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { type: 'phone', name: 'Phone', icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' },
    { type: 'wifi', name: 'WiFi', icon: 'M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.858 15.355-5.858 21.213 0' },
];

const STYLE_PRESETS = [
    { name: 'Classic', fg: '#000000', bg: '#ffffff' },
    { name: 'Inverted', fg: '#ffffff', bg: '#000000' },
    { name: 'Violet', fg: '#7c3aed', bg: '#ffffff' },
    { name: 'Ocean', fg: '#0ea5e9', bg: '#f0f9ff' },
    { name: 'Rose', fg: '#ec4899', bg: '#fff1f2' },
    { name: 'Forest', fg: '#10b981', bg: '#ecfdf5' },
];

export default function Edit({ qrCode, urls }: Props) {
    const existingData = qrCode.data || {};
    const existingStyle = qrCode.style || {};

    const [name, setName] = useState(qrCode.name);
    const [urlId, setUrlId] = useState(qrCode.url_id?.toString() || '');
    const [qrType, setQrType] = useState(existingData.type || 'url');
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Data fields
    const [dataUrl, setDataUrl] = useState(existingData.value || existingData.url || '');
    const [dataText, setDataText] = useState(existingData.value || existingData.text || '');
    const [dataEmail, setDataEmail] = useState(existingData.email || '');
    const [dataEmailSubject, setDataEmailSubject] = useState(existingData.subject || '');
    const [dataEmailBody, setDataEmailBody] = useState(existingData.body || '');
    const [dataPhone, setDataPhone] = useState(existingData.value || existingData.phone || '');
    const [dataWifiSsid, setDataWifiSsid] = useState(existingData.ssid || '');
    const [dataWifiPassword, setDataWifiPassword] = useState(existingData.password || '');
    const [dataWifiEncryption, setDataWifiEncryption] = useState(existingData.encryption || 'WPA');

    // Style
    const [foreground, setForeground] = useState(existingStyle.foreground || '#000000');
    const [background, setBackground] = useState(existingStyle.background || '#ffffff');
    const [errorCorrection, setErrorCorrection] = useState(existingStyle.errorCorrection || 'M');
    const [size, setSize] = useState((existingStyle.size || 300).toString());

    const buildData = () => {
        switch (qrType) {
            case 'url': return { type: 'url', value: dataUrl };
            case 'text': return { type: 'text', value: dataText };
            case 'email': return { type: 'email', email: dataEmail, subject: dataEmailSubject, body: dataEmailBody };
            case 'phone': return { type: 'phone', value: dataPhone };
            case 'wifi': return { type: 'wifi', ssid: dataWifiSsid, password: dataWifiPassword, encryption: dataWifiEncryption };
            default: return { type: qrType };
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});
        router.put(url(`/dashboard/qr-codes/${qrCode.id}`), {
            name,
            url_id: urlId || null,
            data: JSON.stringify(buildData()),
            style: JSON.stringify({
                foreground,
                background,
                errorCorrection,
                size: parseInt(size),
            }),
        }, {
            onError: (errs) => { setErrors(errs); setSaving(false); },
            onFinish: () => setSaving(false),
        });
    };

    return (
        <DashboardLayout header={`Edit: ${qrCode.name}`}>
            <Head title={`Edit - ${qrCode.name}`} />

            <div className="mb-6 flex items-center justify-between">
                <Link href={url(`/dashboard/qr-codes/${qrCode.id}`)}
                    className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to QR Code
                </Link>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basics */}
                        <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-800">
                                <h3 className="text-sm font-semibold text-white">Basics</h3>
                            </div>
                            <div className="p-6 space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Name *</label>
                                    <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                                        required />
                                    {errors.name && <p className="mt-1.5 text-xs text-red-400">{errors.name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Link to URL (optional)</label>
                                    <select value={urlId} onChange={(e) => setUrlId(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40">
                                        <option value="">None — standalone QR code</option>
                                        {urls.map((u) => (
                                            <option key={u.id} value={u.id}>/{u.alias} — {u.title || u.url}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* QR Type & Content */}
                        <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-800">
                                <h3 className="text-sm font-semibold text-white">QR Code Content</h3>
                            </div>
                            <div className="p-6 space-y-5">
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                                    {QR_TYPES.map((t) => (
                                        <button key={t.type} type="button" onClick={() => setQrType(t.type)}
                                            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${qrType === t.type ? 'border-violet-500 bg-violet-500/10 text-violet-400' : 'border-gray-800 text-gray-500 hover:border-gray-700'}`}>
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d={t.icon} />
                                            </svg>
                                            <span className="text-xs font-medium">{t.name}</span>
                                        </button>
                                    ))}
                                </div>

                                {qrType === 'url' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">URL *</label>
                                        <input type="url" value={dataUrl} onChange={(e) => setDataUrl(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                                            placeholder="https://example.com" />
                                    </div>
                                )}
                                {qrType === 'text' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Text *</label>
                                        <textarea value={dataText} onChange={(e) => setDataText(e.target.value)} rows={3}
                                            className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 resize-none"
                                            placeholder="Your text..." />
                                    </div>
                                )}
                                {qrType === 'email' && (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                                            <input type="email" value={dataEmail} onChange={(e) => setDataEmail(e.target.value)}
                                                className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                                                placeholder="hello@example.com" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
                                            <input type="text" value={dataEmailSubject} onChange={(e) => setDataEmailSubject(e.target.value)}
                                                className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Body</label>
                                            <textarea value={dataEmailBody} onChange={(e) => setDataEmailBody(e.target.value)} rows={2}
                                                className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 resize-none" />
                                        </div>
                                    </div>
                                )}
                                {qrType === 'phone' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number *</label>
                                        <input type="tel" value={dataPhone} onChange={(e) => setDataPhone(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                                            placeholder="+1 234 567 8900" />
                                    </div>
                                )}
                                {qrType === 'wifi' && (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Network Name (SSID) *</label>
                                            <input type="text" value={dataWifiSsid} onChange={(e) => setDataWifiSsid(e.target.value)}
                                                className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                                            <input type="text" value={dataWifiPassword} onChange={(e) => setDataWifiPassword(e.target.value)}
                                                className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Encryption</label>
                                            <select value={dataWifiEncryption} onChange={(e) => setDataWifiEncryption(e.target.value)}
                                                className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40">
                                                <option value="WPA">WPA/WPA2</option>
                                                <option value="WEP">WEP</option>
                                                <option value="">None</option>
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Style */}
                        <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-800">
                                <h3 className="text-sm font-semibold text-white">Style</h3>
                            </div>
                            <div className="p-6 space-y-5">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-2">Quick Presets</label>
                                    <div className="grid grid-cols-6 gap-2">
                                        {STYLE_PRESETS.map((p) => (
                                            <button key={p.name} type="button"
                                                onClick={() => { setForeground(p.fg); setBackground(p.bg); }}
                                                className={`aspect-square rounded-xl border transition-all flex items-center justify-center ${foreground === p.fg && background === p.bg ? 'border-violet-500 ring-2 ring-violet-500/30' : 'border-gray-700 hover:border-gray-600'}`}
                                                style={{ background: p.bg }} title={p.name}>
                                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill={p.fg}>
                                                    <rect x="3" y="3" width="7" height="7" rx="1" />
                                                    <rect x="14" y="3" width="7" height="7" rx="1" />
                                                    <rect x="3" y="14" width="7" height="7" rx="1" />
                                                    <rect x="14" y="14" width="4" height="4" rx="0.5" />
                                                </svg>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Foreground</label>
                                        <div className="flex items-center gap-2">
                                            <input type="color" value={foreground} onChange={(e) => setForeground(e.target.value)}
                                                className="w-8 h-8 rounded-lg border-0 cursor-pointer" />
                                            <input type="text" value={foreground} onChange={(e) => setForeground(e.target.value)}
                                                className="flex-1 px-3 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-xs text-white font-mono" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Background</label>
                                        <div className="flex items-center gap-2">
                                            <input type="color" value={background} onChange={(e) => setBackground(e.target.value)}
                                                className="w-8 h-8 rounded-lg border-0 cursor-pointer" />
                                            <input type="text" value={background} onChange={(e) => setBackground(e.target.value)}
                                                className="flex-1 px-3 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-xs text-white font-mono" />
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Error Correction</label>
                                        <select value={errorCorrection} onChange={(e) => setErrorCorrection(e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40">
                                            <option value="L">Low (7%)</option>
                                            <option value="M">Medium (15%)</option>
                                            <option value="Q">Quartile (25%)</option>
                                            <option value="H">High (30%)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Size (px)</label>
                                        <input type="number" value={size} onChange={(e) => setSize(e.target.value)} min="100" max="1000" step="50"
                                            className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="flex items-center justify-end gap-3">
                            <Link href={url(`/dashboard/qr-codes/${qrCode.id}`)}
                                className="px-4 py-2.5 text-sm font-medium text-gray-400 hover:text-white transition-colors">Cancel</Link>
                            <button type="submit" disabled={saving}
                                className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50">
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>

                    {/* Right: Preview */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-6">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Preview</p>
                            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-8 flex flex-col items-center">
                                <div className="rounded-xl p-4" style={{ background }}>
                                    <svg viewBox="0 0 100 100" className="w-48 h-48">
                                        <rect x="4" y="4" width="24" height="24" rx="2" fill={foreground} />
                                        <rect x="7" y="7" width="18" height="18" rx="1" fill={background} />
                                        <rect x="10" y="10" width="12" height="12" rx="1" fill={foreground} />
                                        <rect x="72" y="4" width="24" height="24" rx="2" fill={foreground} />
                                        <rect x="75" y="7" width="18" height="18" rx="1" fill={background} />
                                        <rect x="78" y="10" width="12" height="12" rx="1" fill={foreground} />
                                        <rect x="4" y="72" width="24" height="24" rx="2" fill={foreground} />
                                        <rect x="7" y="75" width="18" height="18" rx="1" fill={background} />
                                        <rect x="10" y="78" width="12" height="12" rx="1" fill={foreground} />
                                        {[
                                            [34,8],[42,8],[50,8],[58,8],
                                            [34,16],[46,16],[58,16],[66,16],
                                            [8,34],[16,34],[34,34],[42,34],[50,34],[58,34],[66,34],[78,34],
                                            [8,42],[24,42],[42,42],[58,42],[78,42],
                                            [8,50],[16,50],[34,50],[50,50],[66,50],[78,50],
                                            [8,58],[24,58],[42,58],[58,58],[78,58],
                                            [8,66],[16,66],[34,66],[50,66],[66,66],[78,66],
                                            [34,74],[42,74],[58,74],[78,74],
                                            [34,82],[50,82],[66,82],[78,82],
                                            [42,90],[58,90],[78,90],
                                        ].map(([x, y], i) => (
                                            <rect key={i} x={x} y={y} width="6" height="6" rx="0.5" fill={foreground} />
                                        ))}
                                    </svg>
                                </div>
                                <p className="text-xs text-gray-500 mt-4">{parseInt(size)} × {parseInt(size)} px</p>
                                <p className="text-[10px] text-gray-600 mt-1 capitalize">{qrType} QR Code</p>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </DashboardLayout>
    );
}
