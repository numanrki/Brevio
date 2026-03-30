import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Pixel } from '@/types';
import { url } from '@/utils';
import { FormEvent } from 'react';

interface Props {
    pixels: Pick<Pixel, 'id' | 'name' | 'type'>[];
}

interface RuleForm {
    type: string;
    value: string;
    destination_url: string;
}

export default function Create({ pixels }: Props) {
    const { data, setData, post, processing, errors } = useForm<{
        name: string;
        alias: string;
        fallback_url: string;
        is_active: boolean;
        allowed_devices: string[];
        expiry_date: string;
        utm_source: string;
        utm_medium: string;
        utm_campaign: string;
        rules: RuleForm[];
        pixel_ids: number[];
    }>({
        name: '',
        alias: '',
        fallback_url: '',
        is_active: true,
        allowed_devices: [],
        expiry_date: '',
        utm_source: '',
        utm_medium: '',
        utm_campaign: '',
        rules: [],
        pixel_ids: [],
    });

    const addRule = () => {
        setData('rules', [...data.rules, { type: 'device', value: '', destination_url: '' }]);
    };

    const updateRule = (index: number, field: keyof RuleForm, value: string) => {
        const updated = [...data.rules];
        updated[index] = { ...updated[index], [field]: value };
        setData('rules', updated);
    };

    const removeRule = (index: number) => {
        setData('rules', data.rules.filter((_, i) => i !== index));
    };

    const togglePixel = (pixelId: number) => {
        setData('pixel_ids', data.pixel_ids.includes(pixelId)
            ? data.pixel_ids.filter((id) => id !== pixelId)
            : [...data.pixel_ids, pixelId]);
    };

    const toggleDevice = (device: string) => {
        setData('allowed_devices', data.allowed_devices.includes(device)
            ? data.allowed_devices.filter((d) => d !== device)
            : [...data.allowed_devices, device]);
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(url('/admin/deep-links'));
    };

    return (
        <AdminLayout header="Create Deep Link">
            <Head title="Create Deep Link" />

            <div className="max-w-2xl">
                <Link href={url('/admin/deep-links')} className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white mb-6 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    Back to Deep Links
                </Link>

                <form onSubmit={submit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="rounded-xl bg-gray-900 border border-gray-800 p-6 space-y-5">
                        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Basic Info</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Name *</label>
                            <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="e.g. iOS App Link" className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40" />
                            {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Custom Alias</label>
                            <input type="text" value={data.alias} onChange={(e) => setData('alias', e.target.value)} placeholder="Leave blank to auto-generate" className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40" />
                            {errors.alias && <p className="text-xs text-red-400 mt-1">{errors.alias}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Fallback URL *</label>
                            <input type="url" value={data.fallback_url} onChange={(e) => setData('fallback_url', e.target.value)} placeholder="https://example.com" className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40" />
                            {errors.fallback_url && <p className="text-xs text-red-400 mt-1">{errors.fallback_url}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">Expiry Date</label>
                                <input type="datetime-local" value={data.expiry_date} onChange={(e) => setData('expiry_date', e.target.value)} className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40" />
                            </div>
                            <div className="flex items-end pb-1">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} className="w-4 h-4 bg-gray-950 border-gray-700 rounded text-violet-500 focus:ring-violet-500/40" />
                                    <span className="text-sm text-gray-300">Active</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Access Restrictions */}
                    <div className="rounded-xl bg-gray-900 border border-gray-800 p-6 space-y-4">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Access Restrictions</h3>
                            <p className="text-xs text-gray-500 mt-1">Leave all unchecked to allow everyone. Select specific platforms to restrict access.</p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {[
                                { value: 'android', label: 'Android', color: 'text-green-400' },
                                { value: 'ios', label: 'iOS', color: 'text-gray-200' },
                                { value: 'windows', label: 'Windows', color: 'text-blue-400' },
                                { value: 'macos', label: 'macOS', color: 'text-gray-300' },
                                { value: 'linux', label: 'Linux', color: 'text-orange-400' },
                                { value: 'mobile', label: 'Mobile', color: 'text-violet-400' },
                                { value: 'tablet', label: 'Tablet', color: 'text-cyan-400' },
                                { value: 'desktop', label: 'Desktop', color: 'text-yellow-400' },
                            ].map((opt) => (
                                <label key={opt.value} className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors ${
                                    data.allowed_devices.includes(opt.value) ? 'bg-violet-500/10 border-violet-500/30' : 'bg-gray-950 border-gray-800 hover:border-gray-700'
                                }`}>
                                    <input type="checkbox" checked={data.allowed_devices.includes(opt.value)} onChange={() => toggleDevice(opt.value)} className="w-4 h-4 bg-gray-950 border-gray-700 rounded text-violet-500 focus:ring-violet-500/40" />
                                    <span className={`text-sm font-medium ${opt.color}`}>{opt.label}</span>
                                </label>
                            ))}
                        </div>
                        {errors.allowed_devices && <p className="text-xs text-red-400">{errors.allowed_devices}</p>}
                    </div>

                    {/* UTM Parameters */}
                    <div className="rounded-xl bg-gray-900 border border-gray-800 p-6 space-y-5">
                        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">UTM Parameters</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">Source</label>
                                <input type="text" value={data.utm_source} onChange={(e) => setData('utm_source', e.target.value)} placeholder="google" className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">Medium</label>
                                <input type="text" value={data.utm_medium} onChange={(e) => setData('utm_medium', e.target.value)} placeholder="cpc" className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">Campaign</label>
                                <input type="text" value={data.utm_campaign} onChange={(e) => setData('utm_campaign', e.target.value)} placeholder="summer_sale" className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40" />
                            </div>
                        </div>
                    </div>

                    {/* Routing Rules */}
                    <div className="rounded-xl bg-gray-900 border border-gray-800 p-6 space-y-5">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Routing Rules</h3>
                            <button type="button" onClick={addRule} className="inline-flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                Add Rule
                            </button>
                        </div>

                        {data.rules.length === 0 && (
                            <p className="text-sm text-gray-500">No rules yet. All visitors will be sent to the fallback URL.</p>
                        )}

                        {data.rules.map((rule, i) => (
                            <div key={i} className="flex items-start gap-3 p-4 bg-gray-950 rounded-lg border border-gray-800">
                                <div className="flex-1 grid grid-cols-3 gap-3">
                                    <select value={rule.type} onChange={(e) => updateRule(i, 'type', e.target.value)} className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500/40">
                                        <option value="device">Device</option>
                                        <option value="country">Country</option>
                                        <option value="os">OS</option>
                                        <option value="browser">Browser</option>
                                    </select>
                                    <input type="text" value={rule.value} onChange={(e) => updateRule(i, 'value', e.target.value)} placeholder={rule.type === 'device' ? 'mobile' : rule.type === 'country' ? 'US' : rule.type === 'os' ? 'iOS' : 'Chrome'} className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40" />
                                    <input type="url" value={rule.destination_url} onChange={(e) => updateRule(i, 'destination_url', e.target.value)} placeholder="https://..." className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40" />
                                </div>
                                <button type="button" onClick={() => removeRule(i)} className="mt-1 p-1.5 text-gray-500 hover:text-red-400 transition-colors">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        ))}
                        {errors.rules && <p className="text-xs text-red-400">{errors.rules}</p>}
                    </div>

                    {/* Tracking Pixels */}
                    {pixels.length > 0 && (
                        <div className="rounded-xl bg-gray-900 border border-gray-800 p-6 space-y-4">
                            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Attach Pixels</h3>
                            <div className="space-y-2">
                                {pixels.map((px) => (
                                    <label key={px.id} className="flex items-center gap-3 p-3 bg-gray-950 rounded-lg border border-gray-800 cursor-pointer hover:border-gray-700 transition-colors">
                                        <input type="checkbox" checked={data.pixel_ids.includes(px.id)} onChange={() => togglePixel(px.id)} className="w-4 h-4 bg-gray-950 border-gray-700 rounded text-violet-500 focus:ring-violet-500/40" />
                                        <span className="text-sm text-white">{px.name}</span>
                                        <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">{px.type}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-3">
                        <button type="submit" disabled={processing} className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors">
                            {processing ? 'Creating…' : 'Create Deep Link'}
                        </button>
                        <Link href={url('/admin/deep-links')} className="px-6 py-2.5 text-sm text-gray-400 hover:text-white transition-colors">Cancel</Link>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
