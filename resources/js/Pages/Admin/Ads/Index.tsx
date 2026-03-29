import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import { url } from '@/utils';
import { FormEvent } from 'react';

interface Props {
    settings: Record<string, string>;
}

export default function Index({ settings }: Props) {
    const { data, setData, post, processing, recentlySuccessful } = useForm({
        interstitial_ad_above: settings.interstitial_ad_above ?? '',
        interstitial_ad_below: settings.interstitial_ad_below ?? '',
        interstitial_ad_sidebar: settings.interstitial_ad_sidebar ?? '',
        interstitial_default_timer: settings.interstitial_default_timer ?? '10',
        interstitial_default_show_button: settings.interstitial_default_show_button ?? '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(url('/admin/ads'));
    };

    return (
        <AdminLayout header="Ads & Interstitial">
            <Head title="Ads & Interstitial" />

            <div className="max-w-4xl space-y-6">
                {/* Header */}
                <div>
                    <p className="text-sm text-gray-400">
                        Configure the interstitial page shown between the short link and destination. Add ads, set default timer, and control redirect behavior.
                    </p>
                </div>

                {recentlySuccessful && (
                    <div className="px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400">
                        Settings saved successfully.
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* How It Works */}
                    <div className="rounded-xl bg-violet-500/5 border border-violet-500/20 p-5">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-violet-300 mb-1">How It Works</h4>
                                <p className="text-xs text-gray-400 leading-relaxed">
                                    When creating a link, enable <span className="text-violet-400 font-medium">"Apply Timer"</span> or <span className="text-violet-400 font-medium">"Show Click Here Button"</span> to show an interstitial page before redirecting.
                                    Ads placed here will appear on that page. The layout becomes 2-column when a sidebar ad is present.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Default Timer Settings */}
                    <div className="rounded-xl bg-gray-900 border border-gray-800 p-6 space-y-5">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-8 h-8 rounded-lg bg-fuchsia-500/10 flex items-center justify-center">
                                <svg className="w-4 h-4 text-fuchsia-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-white">Timer Defaults</h3>
                                <p className="text-xs text-gray-500">Default values when creating new links. Can be overridden per link.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">Default Timer Duration (seconds)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="120"
                                    value={data.interstitial_default_timer}
                                    onChange={(e) => setData('interstitial_default_timer', e.target.value)}
                                    className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40"
                                />
                                <p className="text-xs text-gray-600 mt-1">Applied when a link has "Apply Timer" enabled.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">Default Show Button</label>
                                <select
                                    value={data.interstitial_default_show_button}
                                    onChange={(e) => setData('interstitial_default_show_button', e.target.value)}
                                    className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40"
                                >
                                    <option value="">Auto Redirect (no button)</option>
                                    <option value="1">Show "Click Here" Button</option>
                                </select>
                                <p className="text-xs text-gray-600 mt-1">Whether to show a manual redirect button after timer.</p>
                            </div>
                        </div>
                    </div>

                    {/* Ad Placements */}
                    <div className="rounded-xl bg-gray-900 border border-gray-800 p-6 space-y-5">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                                <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-white">Ad Placements</h3>
                                <p className="text-xs text-gray-500">HTML or ad code injected into the interstitial page. Leave blank to disable a slot.</p>
                            </div>
                        </div>

                        {/* Visual layout diagram */}
                        <div className="rounded-lg bg-gray-950 border border-gray-800 p-4">
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-3">Page Layout Preview</p>
                            <div className="grid grid-cols-[1fr,auto] gap-2 text-[10px]">
                                <div className="space-y-2">
                                    <div className="p-2 rounded border border-dashed border-amber-500/30 bg-amber-500/5 text-amber-400 text-center">AD ABOVE</div>
                                    <div className="p-4 rounded border border-gray-700 bg-gray-900 text-gray-500 text-center">
                                        <div className="text-xs mb-1">⏱</div>
                                        Timer + Link Info
                                    </div>
                                    <div className="p-2 rounded border border-dashed border-amber-500/30 bg-amber-500/5 text-amber-400 text-center">AD BELOW</div>
                                </div>
                                <div className="w-20 p-2 rounded border border-dashed border-fuchsia-500/30 bg-fuchsia-500/5 text-fuchsia-400 text-center flex items-center justify-center">
                                    SIDEBAR
                                </div>
                            </div>
                        </div>

                        {/* Ad Above */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">
                                <span className="inline-flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                                    Ad Above Content
                                </span>
                            </label>
                            <textarea
                                value={data.interstitial_ad_above}
                                onChange={(e) => setData('interstitial_ad_above', e.target.value)}
                                rows={4}
                                placeholder={'<div style="text-align:center">\n  <!-- Your ad code here -->\n</div>'}
                                className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white font-mono placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 resize-none"
                            />
                        </div>

                        {/* Ad Below */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">
                                <span className="inline-flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                                    Ad Below Content
                                </span>
                            </label>
                            <textarea
                                value={data.interstitial_ad_below}
                                onChange={(e) => setData('interstitial_ad_below', e.target.value)}
                                rows={4}
                                placeholder={'<div style="text-align:center">\n  <!-- Your ad code here -->\n</div>'}
                                className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white font-mono placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 resize-none"
                            />
                        </div>

                        {/* Sidebar Ad */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">
                                <span className="inline-flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-fuchsia-400"></span>
                                    Sidebar Ad
                                </span>
                            </label>
                            <textarea
                                value={data.interstitial_ad_sidebar}
                                onChange={(e) => setData('interstitial_ad_sidebar', e.target.value)}
                                rows={4}
                                placeholder={'<div>\n  <!-- Sidebar ad code -->\n</div>'}
                                className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white font-mono placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 resize-none"
                            />
                            <p className="text-xs text-gray-600 mt-1">When sidebar ad is present, the interstitial page uses a 2-column layout.</p>
                        </div>
                    </div>

                    {/* Save */}
                    <div className="flex items-center gap-3">
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-violet-500/20"
                        >
                            {processing ? 'Saving...' : 'Save Ad Settings'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
