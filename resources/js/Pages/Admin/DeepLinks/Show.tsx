import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';
import { DeepLink, TimeSeriesPoint } from '@/types';
import { url } from '@/utils';

interface Props {
    deepLink: DeepLink;
    clicks_stats: TimeSeriesPoint[];
}

export default function Show({ deepLink, clicks_stats }: Props) {
    const base = window.location.origin;
    const shortUrl = `${base}/${deepLink.alias}`;
    const maxCount = Math.max(...clicks_stats.map((c) => c.count), 1);

    return (
        <AdminLayout header={deepLink.name}>
            <Head title={deepLink.name} />

            <div className="max-w-4xl">
                <div className="flex items-center justify-between mb-6">
                    <Link href={url('/admin/deep-links')} className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        Back to Deep Links
                    </Link>
                    <div className="flex items-center gap-2">
                        <Link href={url(`/admin/deep-links/${deepLink.id}/analytics`)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                            Analytics
                        </Link>
                        <Link href={url(`/admin/deep-links/${deepLink.id}/edit`)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-white bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            Edit
                        </Link>
                    </div>
                </div>

                {/* Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Clicks</p>
                        <p className="text-2xl font-bold text-white">{deepLink.total_clicks.toLocaleString()}</p>
                    </div>
                    <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Rules</p>
                        <p className="text-2xl font-bold text-white">{deepLink.rules?.length ?? 0}</p>
                    </div>
                    <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Status</p>
                        <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${deepLink.is_active ? 'text-emerald-400' : 'text-red-400'}`}>
                            <span className={`w-2 h-2 rounded-full ${deepLink.is_active ? 'bg-emerald-400' : 'bg-red-400'}`} />
                            {deepLink.is_active ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>

                {/* Details */}
                <div className="rounded-xl bg-gray-900 border border-gray-800 p-6 mb-6 space-y-4">
                    <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-gray-500 mb-0.5">Short URL</p>
                            <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 break-all">{shortUrl}</a>
                        </div>
                        <div>
                            <p className="text-gray-500 mb-0.5">Fallback URL</p>
                            <a href={deepLink.fallback_url} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white break-all">{deepLink.fallback_url}</a>
                        </div>
                        {deepLink.expiry_date && (
                            <div>
                                <p className="text-gray-500 mb-0.5">Expires</p>
                                <p className="text-gray-300">{new Date(deepLink.expiry_date).toLocaleString()}</p>
                            </div>
                        )}
                        {(deepLink.utm_source || deepLink.utm_medium || deepLink.utm_campaign) && (
                            <div>
                                <p className="text-gray-500 mb-0.5">UTM</p>
                                <p className="text-gray-300">
                                    {[deepLink.utm_source, deepLink.utm_medium, deepLink.utm_campaign].filter(Boolean).join(' / ')}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Routing Rules */}
                {deepLink.rules && deepLink.rules.length > 0 && (
                    <div className="rounded-xl bg-gray-900 border border-gray-800 p-6 mb-6">
                        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Routing Rules</h3>
                        <div className="space-y-2">
                            {deepLink.rules.map((rule) => (
                                <div key={rule.id} className="flex items-center gap-3 p-3 bg-gray-950 rounded-lg border border-gray-800 text-sm">
                                    <span className="px-2 py-0.5 bg-violet-500/10 text-violet-400 rounded text-xs font-medium uppercase">{rule.type}</span>
                                    <span className="text-gray-300">{rule.value}</span>
                                    <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                    <span className="text-gray-400 truncate">{rule.destination_url}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Attached Pixels */}
                {deepLink.pixels && deepLink.pixels.length > 0 && (
                    <div className="rounded-xl bg-gray-900 border border-gray-800 p-6 mb-6">
                        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Attached Pixels</h3>
                        <div className="flex flex-wrap gap-2">
                            {deepLink.pixels.map((px) => (
                                <span key={px.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-sm text-gray-300">
                                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                                    {px.name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* 30-day chart */}
                <div className="rounded-xl bg-gray-900 border border-gray-800 p-6">
                    <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Clicks (Last 30 Days)</h3>
                    {clicks_stats.length === 0 ? (
                        <p className="text-sm text-gray-500">No click data yet.</p>
                    ) : (
                        <div className="flex items-end gap-1 h-32">
                            {clicks_stats.map((point) => (
                                <div key={point.date} className="flex-1 flex flex-col items-center gap-1" title={`${point.date}: ${point.count}`}>
                                    <div
                                        className="w-full bg-violet-500/30 rounded-t-sm min-h-[2px]"
                                        style={{ height: `${(point.count / maxCount) * 100}%` }}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
