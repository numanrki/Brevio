import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { ImageTracker, ImageTrackerView, TimeSeriesPoint } from '@/types';
import { url } from '@/utils';
import { useState } from 'react';

interface Props {
    tracker: ImageTracker;
    views_stats: TimeSeriesPoint[];
    tracking_url: string;
    recent_views: ImageTrackerView[];
}

export default function Show({ tracker, views_stats, tracking_url, recent_views }: Props) {
    const maxCount = Math.max(...views_stats.map((v) => v.count), 1);
    const [copied, setCopied] = useState<string | null>(null);

    const copyCode = (code: string, label: string) => {
        navigator.clipboard.writeText(code);
        setCopied(label);
        setTimeout(() => setCopied(null), 2000);
    };

    const directUrl = tracking_url;
    const htmlEmbed = `<img src="${tracking_url}" alt="" style="display:none" />`;
    const markdownEmbed = `![](${tracking_url})`;

    return (
        <AdminLayout header={tracker.name}>
            <Head title={tracker.name} />

            <div className="max-w-4xl">
                <div className="flex items-center justify-between mb-6">
                    <Link href={url('/admin/image-trackers')} className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        Back to Image Trackers
                    </Link>
                    <button
                        onClick={() => { if (confirm('Delete this image tracker?')) router.delete(url(`/admin/image-trackers/${tracker.id}`)); }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        Delete
                    </button>
                </div>

                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Views</p>
                        <p className="text-2xl font-bold text-white">{(tracker.views_count ?? tracker.total_views).toLocaleString()}</p>
                    </div>
                    <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Original File</p>
                        <p className="text-sm font-medium text-white truncate" title={tracker.original_name}>{tracker.original_name}</p>
                    </div>
                    <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Status</p>
                        <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${tracker.is_active ? 'text-emerald-400' : 'text-red-400'}`}>
                            <span className={`w-2 h-2 rounded-full ${tracker.is_active ? 'bg-emerald-400' : 'bg-red-400'}`} />
                            {tracker.is_active ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>

                {/* Tracking URLs */}
                <div className="rounded-xl bg-gray-900 border border-gray-800 p-6 mb-6 space-y-5">
                    <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Tracking URLs</h3>
                    <p className="text-sm text-gray-500">Share any of these — when someone opens the image, their info is recorded.</p>

                    {/* Direct URL */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-medium text-gray-400">Direct Image URL <span className="text-emerald-400">(share this anywhere)</span></p>
                            <button
                                onClick={() => copyCode(directUrl, 'direct')}
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                                    copied === 'direct'
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                        : 'bg-violet-600 text-white hover:bg-violet-500 border border-violet-600'
                                }`}
                            >
                                {copied === 'direct' ? (
                                    <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Copied!</>
                                ) : (
                                    <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>Copy URL</>
                                )}
                            </button>
                        </div>
                        <pre className="px-4 py-3 bg-gray-950 border border-gray-800 rounded-lg text-xs text-gray-300 overflow-x-auto whitespace-pre-wrap break-all select-all">
                            {directUrl}
                        </pre>
                    </div>

                    {/* HTML Embed */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-medium text-gray-400">Hidden HTML Embed <span className="text-gray-600">(invisible in emails &amp; pages)</span></p>
                            <button
                                onClick={() => copyCode(htmlEmbed, 'html')}
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                                    copied === 'html'
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                        : 'bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 border border-gray-700'
                                }`}
                            >
                                {copied === 'html' ? (
                                    <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Copied!</>
                                ) : (
                                    <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>Copy Code</>
                                )}
                            </button>
                        </div>
                        <pre className="px-4 py-3 bg-gray-950 border border-gray-800 rounded-lg text-xs text-gray-300 overflow-x-auto whitespace-pre-wrap break-all select-all">
                            {htmlEmbed}
                        </pre>
                    </div>

                    {/* Markdown */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-medium text-gray-400">Markdown <span className="text-gray-600">(GitHub, forums, etc.)</span></p>
                            <button
                                onClick={() => copyCode(markdownEmbed, 'markdown')}
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                                    copied === 'markdown'
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                        : 'bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 border border-gray-700'
                                }`}
                            >
                                {copied === 'markdown' ? (
                                    <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Copied!</>
                                ) : (
                                    <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>Copy Code</>
                                )}
                            </button>
                        </div>
                        <pre className="px-4 py-3 bg-gray-950 border border-gray-800 rounded-lg text-xs text-gray-300 overflow-x-auto whitespace-pre-wrap break-all select-all">
                            {markdownEmbed}
                        </pre>
                    </div>

                    {/* What Gets Tracked */}
                    <div className="rounded-lg bg-gray-950/50 border border-gray-800/50 p-4">
                        <p className="text-xs font-medium text-gray-400 mb-2">What gets tracked</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-gray-500">
                            <span>Country &amp; City</span>
                            <span>Browser &amp; OS</span>
                            <span>Device Type</span>
                            <span>Referrer Source</span>
                            <span>User Agent</span>
                            <span>Unique vs Repeat</span>
                        </div>
                    </div>
                </div>

                {/* Image Preview */}
                <div className="rounded-xl bg-gray-900 border border-gray-800 p-6 mb-6">
                    <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Image Preview</h3>
                    <div className="flex justify-center">
                        <img
                            src={tracking_url}
                            alt={tracker.name}
                            className="max-h-64 rounded-lg border border-gray-800"
                        />
                    </div>
                </div>

                {/* 30-Day Chart */}
                <div className="rounded-xl bg-gray-900 border border-gray-800 p-6 mb-6">
                    <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Views (Last 30 Days)</h3>
                    {views_stats.length === 0 ? (
                        <p className="text-sm text-gray-500">No view data yet.</p>
                    ) : (
                        <div className="flex items-end gap-1 h-32">
                            {views_stats.map((point) => (
                                <div key={point.date} className="flex-1 flex flex-col items-center gap-1" title={`${point.date}: ${point.count}`}>
                                    <div
                                        className="w-full bg-fuchsia-500/30 rounded-t-sm min-h-[2px]"
                                        style={{ height: `${(point.count / maxCount) * 100}%` }}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Views Table */}
                <div className="rounded-xl bg-gray-900 border border-gray-800 p-6">
                    <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Recent Views</h3>
                    {recent_views.length === 0 ? (
                        <p className="text-sm text-gray-500">No views yet. Share the tracking URL to start collecting data.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-gray-500 text-left text-xs uppercase tracking-wider">
                                        <th className="pb-3 font-medium">Location</th>
                                        <th className="pb-3 font-medium">Browser</th>
                                        <th className="pb-3 font-medium">OS</th>
                                        <th className="pb-3 font-medium">Device</th>
                                        <th className="pb-3 font-medium text-center">Unique</th>
                                        <th className="pb-3 font-medium text-right">When</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800/50">
                                    {recent_views.map((view) => (
                                        <tr key={view.id} className="text-gray-300">
                                            <td className="py-2.5">
                                                {view.country || view.city ? (
                                                    <span>{[view.city, view.country].filter(Boolean).join(', ')}</span>
                                                ) : (
                                                    <span className="text-gray-600">Unknown</span>
                                                )}
                                            </td>
                                            <td className="py-2.5">{view.browser || <span className="text-gray-600">—</span>}</td>
                                            <td className="py-2.5">{view.os || <span className="text-gray-600">—</span>}</td>
                                            <td className="py-2.5">
                                                <span className="px-2 py-0.5 bg-gray-800 rounded text-xs">{view.device || 'Unknown'}</span>
                                            </td>
                                            <td className="py-2.5 text-center">
                                                {view.is_unique ? (
                                                    <span className="text-emerald-400 text-xs">Yes</span>
                                                ) : (
                                                    <span className="text-gray-600 text-xs">No</span>
                                                )}
                                            </td>
                                            <td className="py-2.5 text-right text-xs text-gray-500">{new Date(view.created_at).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
