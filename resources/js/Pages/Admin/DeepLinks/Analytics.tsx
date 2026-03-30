import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { DeepLink, AnalyticsSummary, TimeSeriesPoint, BreakdownItem } from '@/types';
import { url } from '@/utils';
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface RulePerformance {
    id: number;
    type: string;
    value: string;
    clicks: number;
}

interface VisitorLogEntry {
    id: number;
    country?: string;
    city?: string;
    browser?: string;
    os?: string;
    device?: string;
    referrer?: string;
    destination_url?: string;
    is_unique: boolean;
    created_at: string;
}

interface Props {
    deepLink: DeepLink;
    range: string;
    ranges: string[];
    custom_from: string;
    custom_to: string;
    summary: AnalyticsSummary;
    clicks_over_time: TimeSeriesPoint[];
    top_countries: BreakdownItem[];
    top_browsers: BreakdownItem[];
    top_os: BreakdownItem[];
    devices: BreakdownItem[];
    rule_performance: RulePerformance[];
    visitor_log: VisitorLogEntry[];
}

const PIE_COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#14b8a6'];

const rangeLabels: Record<string, string> = {
    today: 'Today', '7d': '7 Days', '15d': '15 Days', '30d': '30 Days',
    '3m': '3 Months', '12m': '12 Months', all: 'All Time', custom: 'Custom',
};

export default function Analytics({ deepLink, range, ranges, custom_from, custom_to, summary, clicks_over_time, top_countries, top_browsers, top_os, devices, rule_performance, visitor_log }: Props) {
    const [tab, setTab] = useState<'overview' | 'visitors'>('overview');
    const [dateFrom, setDateFrom] = useState(custom_from);
    const [dateTo, setDateTo] = useState(custom_to);
    const [showCustom, setShowCustom] = useState(range === 'custom');

    useEffect(() => { setDateFrom(custom_from); setDateTo(custom_to); }, [custom_from, custom_to]);

    const changeRange = (newRange: string) => {
        if (newRange === 'custom') { setShowCustom(true); return; }
        setShowCustom(false);
        router.get(url(`/admin/deep-links/${deepLink.id}/analytics`), { range: newRange }, { preserveScroll: true });
    };
    const applyCustomRange = () => {
        router.get(url(`/admin/deep-links/${deepLink.id}/analytics`), { range: 'custom', from: dateFrom, to: dateTo }, { preserveScroll: true });
    };

    return (
        <AdminLayout header="Deep Link Analytics">
            <Head title={`Analytics: ${deepLink.name}`} />

            <div className="max-w-6xl">
                <Link href={url(`/admin/deep-links/${deepLink.id}`)} className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white mb-4 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    Back to Deep Link
                </Link>

                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-semibold text-white">{deepLink.name}</h2>
                        <p className="text-sm text-gray-500">{deepLink.alias} → {deepLink.fallback_url}</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-4 mb-6 border-b border-gray-800 pb-3">
                    <button onClick={() => setTab('overview')} className={`text-sm font-medium pb-1 transition-colors ${tab === 'overview' ? 'text-violet-400 border-b-2 border-violet-400' : 'text-gray-500 hover:text-white'}`}>Overview</button>
                    <button onClick={() => setTab('visitors')} className={`text-sm font-medium pb-1 transition-colors ${tab === 'visitors' ? 'text-violet-400 border-b-2 border-violet-400' : 'text-gray-500 hover:text-white'}`}>Visitor Log</button>
                </div>

                {/* Date range */}
                <div className="flex flex-wrap items-center gap-2 mb-6">
                    {ranges.map((r) => (
                        <button key={r} onClick={() => changeRange(r)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${(showCustom ? 'custom' : range) === r ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' : 'text-gray-500 hover:text-white bg-gray-900 border border-gray-800'}`}>
                            {rangeLabels[r] || r}
                        </button>
                    ))}
                    {showCustom && (
                        <div className="flex items-center gap-2 ml-2">
                            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="px-2 py-1 bg-gray-900 border border-gray-800 rounded-lg text-xs text-white" />
                            <span className="text-gray-600 text-xs">to</span>
                            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="px-2 py-1 bg-gray-900 border border-gray-800 rounded-lg text-xs text-white" />
                            <button onClick={applyCustomRange} className="px-3 py-1 bg-violet-600 text-white text-xs rounded-lg hover:bg-violet-500">Apply</button>
                        </div>
                    )}
                </div>

                {tab === 'overview' ? (
                    <>
                        {/* Summary cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Clicks</p>
                                <p className="text-2xl font-bold text-white">{summary.total_clicks.toLocaleString()}</p>
                            </div>
                            <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Unique Clicks</p>
                                <p className="text-2xl font-bold text-white">{summary.unique_clicks.toLocaleString()}</p>
                            </div>
                            <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Avg. Daily</p>
                                <p className="text-2xl font-bold text-white">{summary.avg_daily}</p>
                            </div>
                        </div>

                        {/* Clicks over time */}
                        <div className="rounded-xl bg-gray-900 border border-gray-800 p-6 mb-6">
                            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Clicks Over Time</h3>
                            {clicks_over_time.length > 0 ? (
                                <ResponsiveContainer width="100%" height={250}>
                                    <LineChart data={clicks_over_time}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                                        <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} />
                                        <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                                        <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: '0.75rem', fontSize: 12 }} />
                                        <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : <p className="text-sm text-gray-500">No data for this period.</p>}
                        </div>

                        {/* Rule performance */}
                        {rule_performance.length > 0 && (
                            <div className="rounded-xl bg-gray-900 border border-gray-800 p-6 mb-6">
                                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Rule Performance</h3>
                                <div className="space-y-3">
                                    {rule_performance.map((rp) => {
                                        const maxClicks = Math.max(...rule_performance.map((r) => r.clicks), 1);
                                        return (
                                            <div key={rp.id} className="flex items-center gap-3">
                                                <span className="w-20 text-xs text-gray-500 uppercase">{rp.type}</span>
                                                <span className="w-16 text-sm text-gray-300">{rp.value}</span>
                                                <div className="flex-1 bg-gray-800 rounded-full h-2">
                                                    <div className="bg-violet-500 h-2 rounded-full" style={{ width: `${(rp.clicks / maxClicks) * 100}%` }} />
                                                </div>
                                                <span className="text-sm text-gray-400 w-12 text-right">{rp.clicks}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Breakdowns */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {/* Countries */}
                            <div className="rounded-xl bg-gray-900 border border-gray-800 p-6">
                                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Top Countries</h3>
                                {top_countries.length > 0 ? (
                                    <div className="space-y-2">
                                        {top_countries.map((item) => (
                                            <div key={item.name} className="flex items-center justify-between text-sm">
                                                <span className="text-gray-300">{item.name}</span>
                                                <span className="text-gray-500">{item.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : <p className="text-sm text-gray-500">No data.</p>}
                            </div>

                            {/* Devices */}
                            <div className="rounded-xl bg-gray-900 border border-gray-800 p-6">
                                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Devices</h3>
                                {devices.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={180}>
                                        <PieChart>
                                            <Pie data={devices} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                                                {devices.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                            </Pie>
                                            <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: '0.75rem', fontSize: 12 }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : <p className="text-sm text-gray-500">No data.</p>}
                            </div>

                            {/* Browsers */}
                            <div className="rounded-xl bg-gray-900 border border-gray-800 p-6">
                                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Top Browsers</h3>
                                {top_browsers.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={180}>
                                        <BarChart data={top_browsers} layout="vertical">
                                            <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                                            <YAxis dataKey="name" type="category" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} width={70} />
                                            <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                                            <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: '0.75rem', fontSize: 12 }} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : <p className="text-sm text-gray-500">No data.</p>}
                            </div>

                            {/* OS */}
                            <div className="rounded-xl bg-gray-900 border border-gray-800 p-6">
                                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Operating Systems</h3>
                                {top_os.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={180}>
                                        <BarChart data={top_os} layout="vertical">
                                            <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                                            <YAxis dataKey="name" type="category" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} width={70} />
                                            <Bar dataKey="count" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                                            <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: '0.75rem', fontSize: 12 }} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : <p className="text-sm text-gray-500">No data.</p>}
                            </div>
                        </div>
                    </>
                ) : (
                    /* Visitor Log */
                    <div className="rounded-xl border border-gray-800 overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-900/60 text-gray-400 text-left">
                                    <th className="px-4 py-3 font-medium">Time</th>
                                    <th className="px-4 py-3 font-medium">Country</th>
                                    <th className="px-4 py-3 font-medium">City</th>
                                    <th className="px-4 py-3 font-medium">Browser</th>
                                    <th className="px-4 py-3 font-medium">OS</th>
                                    <th className="px-4 py-3 font-medium">Device</th>
                                    <th className="px-4 py-3 font-medium">Destination</th>
                                    <th className="px-4 py-3 font-medium">Unique</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800/50">
                                {visitor_log.length === 0 ? (
                                    <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">No visitors in this period.</td></tr>
                                ) : visitor_log.map((v) => (
                                    <tr key={v.id} className="hover:bg-gray-900/40">
                                        <td className="px-4 py-2.5 text-gray-400 whitespace-nowrap">{new Date(v.created_at).toLocaleString()}</td>
                                        <td className="px-4 py-2.5 text-gray-300">{v.country || '—'}</td>
                                        <td className="px-4 py-2.5 text-gray-300">{v.city || '—'}</td>
                                        <td className="px-4 py-2.5 text-gray-300">{v.browser || '—'}</td>
                                        <td className="px-4 py-2.5 text-gray-300">{v.os || '—'}</td>
                                        <td className="px-4 py-2.5 text-gray-300">{v.device || '—'}</td>
                                        <td className="px-4 py-2.5 text-gray-400 truncate max-w-[200px]">{v.destination_url || '—'}</td>
                                        <td className="px-4 py-2.5">
                                            {v.is_unique ? <span className="text-emerald-400 text-xs">Yes</span> : <span className="text-gray-600 text-xs">No</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
