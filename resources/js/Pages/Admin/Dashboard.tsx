import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';
import { Url, DeepLink, BreakdownItem } from '@/types';
import { url } from '@/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

interface ClickPoint {
    date: string;
    links: number;
    deep_links: number;
}

interface DashboardProps {
    stats: {
        total_links: number;
        total_clicks: number;
        total_bio_pages: number;
        total_qr_codes: number;
        total_deep_links: number;
        total_dl_clicks: number;
    };
    clicks_over_time: ClickPoint[];
    top_referrers: BreakdownItem[];
    top_countries: BreakdownItem[];
    top_browsers: BreakdownItem[];
    recent_links: Url[];
    recent_deep_links: DeepLink[];
    pending_reports: number;
}

const statCards = [
    { key: 'total_links', label: 'Total Links', icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1', color: 'from-violet-500 to-purple-600' },
    { key: 'total_clicks', label: 'Link Clicks', icon: 'M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122', color: 'from-cyan-500 to-blue-600' },
    { key: 'total_deep_links', label: 'Deep Links', icon: 'M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14', color: 'from-teal-500 to-emerald-600' },
    { key: 'total_dl_clicks', label: 'Deep Link Clicks', icon: 'M13 10V3L4 14h7v7l9-11h-7z', color: 'from-fuchsia-500 to-pink-600' },
    { key: 'total_bio_pages', label: 'Bio Pages', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', color: 'from-emerald-500 to-green-600' },
    { key: 'total_qr_codes', label: 'QR Codes', icon: 'M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z', color: 'from-amber-500 to-orange-600' },
] as const;

export default function Dashboard({ stats, clicks_over_time, top_referrers, top_countries, top_browsers, recent_links, recent_deep_links, pending_reports }: DashboardProps) {
    return (
        <AdminLayout header="Dashboard">
            <Head title="Admin Dashboard" />

            {/* Pending Reports Banner */}
            {pending_reports > 0 && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-red-300">
                            {pending_reports} pending report{pending_reports !== 1 ? 's' : ''} need your attention
                        </p>
                    </div>
                    <Link href={url('/admin/reports')} className="ml-auto text-sm font-medium text-red-400 hover:text-red-300 transition-colors">
                        View Reports →
                    </Link>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
                {statCards.map((card) => (
                    <div key={card.key} className="relative overflow-hidden rounded-xl bg-gray-900 border border-gray-800 p-5 group hover:border-gray-700 transition-colors">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{card.label}</p>
                                <p className="mt-1.5 text-2xl font-bold text-white">
                                    {formatNumber(stats[card.key as keyof typeof stats])}
                                </p>
                            </div>
                            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity`}>
                                <svg className="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
                                </svg>
                            </div>
                        </div>
                        <div className={`absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r ${card.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
                    </div>
                ))}
            </div>

            {/* Activity Chart */}
            <div className="rounded-xl bg-gray-900 border border-gray-800 p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Activity — Last 7 Days</h2>
                    <Link href={url('/admin/stats')} className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
                        Full Stats →
                    </Link>
                </div>
                {clicks_over_time.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={clicks_over_time} barGap={2}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                            <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => new Date(v + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short' })} />
                            <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                            <Tooltip
                                contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: '0.75rem', fontSize: 12 }}
                                labelFormatter={(v) => new Date(v + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            />
                            <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af' }} />
                            <Bar dataKey="links" name="Links" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="deep_links" name="Deep Links" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <p className="text-sm text-gray-500 text-center py-8">No activity in the last 7 days.</p>
                )}
            </div>

            {/* 3-column breakdown row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Top Referrers */}
                <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Top Referrers</h3>
                    {top_referrers.length > 0 ? (
                        <div className="space-y-2.5">
                            {top_referrers.map((item) => {
                                const max = top_referrers[0]?.count || 1;
                                return (
                                    <div key={item.name}>
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="text-gray-300 truncate">{item.name}</span>
                                            <span className="text-gray-500 ml-2">{item.count}</span>
                                        </div>
                                        <div className="h-1 bg-gray-800 rounded-full">
                                            <div className="h-1 bg-violet-500 rounded-full transition-all" style={{ width: `${(item.count / max) * 100}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : <p className="text-sm text-gray-600">No referrer data yet.</p>}
                </div>

                {/* Top Countries */}
                <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Top Countries</h3>
                    {top_countries.length > 0 ? (
                        <div className="space-y-2.5">
                            {top_countries.map((item) => {
                                const max = top_countries[0]?.count || 1;
                                return (
                                    <div key={item.name}>
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="text-gray-300">{item.name}</span>
                                            <span className="text-gray-500 ml-2">{item.count}</span>
                                        </div>
                                        <div className="h-1 bg-gray-800 rounded-full">
                                            <div className="h-1 bg-cyan-500 rounded-full transition-all" style={{ width: `${(item.count / max) * 100}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : <p className="text-sm text-gray-600">No country data yet.</p>}
                </div>

                {/* Top Browsers */}
                <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Top Browsers</h3>
                    {top_browsers.length > 0 ? (
                        <div className="space-y-2.5">
                            {top_browsers.map((item) => {
                                const max = top_browsers[0]?.count || 1;
                                return (
                                    <div key={item.name}>
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="text-gray-300">{item.name}</span>
                                            <span className="text-gray-500 ml-2">{item.count}</span>
                                        </div>
                                        <div className="h-1 bg-gray-800 rounded-full">
                                            <div className="h-1 bg-emerald-500 rounded-full transition-all" style={{ width: `${(item.count / max) * 100}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : <p className="text-sm text-gray-600">No browser data yet.</p>}
                </div>
            </div>

            {/* Two-column: Recent Links + Recent Deep Links */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Links */}
                <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-800">
                        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Recent Links</h2>
                        <Link href={url('/admin/links')} className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
                            View All →
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-800/50">
                        {recent_links.length === 0 ? (
                            <div className="px-5 py-8 text-center"><p className="text-sm text-gray-600">No links yet</p></div>
                        ) : (
                            recent_links.map((link) => (
                                <div key={link.id} className="px-5 py-3 flex items-center gap-3 hover:bg-gray-800/30 transition-colors">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-white truncate">/{link.alias}</p>
                                        <p className="text-xs text-gray-500 truncate mt-0.5">{link.url}</p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <span className="text-sm font-semibold text-gray-300">{formatNumber(link.total_clicks ?? 0)}</span>
                                        <p className="text-xs text-gray-500">clicks</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Deep Links */}
                <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-800">
                        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Recent Deep Links</h2>
                        <Link href={url('/admin/deep-links')} className="text-xs text-teal-400 hover:text-teal-300 transition-colors">
                            View All →
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-800/50">
                        {recent_deep_links.length === 0 ? (
                            <div className="px-5 py-8 text-center"><p className="text-sm text-gray-600">No deep links yet</p></div>
                        ) : (
                            recent_deep_links.map((dl) => (
                                <Link key={dl.id} href={url(`/admin/deep-links/${dl.id}`)} className="px-5 py-3 flex items-center gap-3 hover:bg-gray-800/30 transition-colors block">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-white truncate">{dl.name}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">/{dl.alias}</p>
                                    </div>
                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs ${dl.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${dl.is_active ? 'bg-emerald-400' : 'bg-red-400'}`} />
                                            {dl.is_active ? 'Active' : 'Off'}
                                        </span>
                                        <div className="text-right">
                                            <span className="text-sm font-semibold text-gray-300">{formatNumber(dl.total_clicks)}</span>
                                            <p className="text-xs text-gray-500">clicks</p>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

function formatNumber(num: number): string {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
    return num.toLocaleString();
}
