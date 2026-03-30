import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import { AnalyticsSummary, TimeSeriesPoint, BreakdownItem } from '@/types';
import { url } from '@/utils';
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

interface Props {
    range: string;
    ranges: string[];
    custom_from: string;
    custom_to: string;
    filter: string;
    summary: AnalyticsSummary;
    clicks_over_time: TimeSeriesPoint[];
    top_countries: BreakdownItem[];
    top_referrers: BreakdownItem[];
    top_browsers: BreakdownItem[];
    top_os: BreakdownItem[];
    devices: BreakdownItem[];
    top_languages: BreakdownItem[];
    bio_summary: AnalyticsSummary;
    bio_visits_over_time: TimeSeriesPoint[];
    qr_summary: AnalyticsSummary;
    qr_scans_over_time: TimeSeriesPoint[];
}

const PIE_COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#14b8a6'];

const rangeLabels: Record<string, string> = {
    today: 'Today',
    '7d': '7 Days',
    '15d': '15 Days',
    '30d': '30 Days',
    '3m': '3 Months',
    '12m': '12 Months',
    'all': 'All Time',
    'custom': 'Custom',
};

const filterLabels: Record<string, string> = {
    all: 'All',
    links: 'Links',
    qr: 'QR Codes',
    bio: 'Bio Pages',
};

export default function Stats({ range, ranges, custom_from, custom_to, filter, summary, clicks_over_time, top_countries, top_referrers, top_browsers, top_os, devices, top_languages, bio_summary, bio_visits_over_time, qr_summary, qr_scans_over_time }: Props) {
    const [dateFrom, setDateFrom] = useState(custom_from);
    const [dateTo, setDateTo] = useState(custom_to);
    const [showCustom, setShowCustom] = useState(range === 'custom');

    useEffect(() => {
        setDateFrom(custom_from);
        setDateTo(custom_to);
    }, [custom_from, custom_to]);

    const activeRange = showCustom ? 'custom' : range;

    const changeRange = (newRange: string) => {
        if (newRange === 'custom') {
            setShowCustom(true);
            return;
        }
        setShowCustom(false);
        router.get(url('/admin/stats'), { range: newRange, filter }, { preserveScroll: true });
    };

    const applyCustomRange = () => {
        router.get(url('/admin/stats'), { range: 'custom', filter, from: dateFrom, to: dateTo }, { preserveScroll: true });
    };

    const changeFilter = (newFilter: string) => {
        const params: Record<string, string> = { range, filter: newFilter };
        if (range === 'custom') { params.from = dateFrom; params.to = dateTo; }
        router.get(url('/admin/stats'), params, { preserveScroll: true });
    };

    return (
        <AdminLayout header="Statistics">
            <Head title="Statistics" />

            <div className="max-w-6xl">
                {/* Filter + Range Selector */}
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                    <div className="flex items-center gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1">
                        {(['all', 'links', 'qr', 'bio'] as const).map((f) => (
                            <button key={f} onClick={() => changeFilter(f)} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${f === filter ? 'bg-fuchsia-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
                                {filterLabels[f]}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 flex-wrap">
                        {ranges.map((r) => (
                            <button key={r} onClick={() => changeRange(r)} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${r === activeRange ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
                                {rangeLabels[r] || r}
                            </button>
                        ))}
                    </div>
                </div>

                {(showCustom || range === 'custom') && (
                    <div className="flex items-center gap-3 mb-6 p-3 rounded-xl bg-gray-900 border border-gray-800 flex-wrap">
                        <label className="text-xs text-gray-400">From</label>
                        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={{ colorScheme: 'dark' }} className="px-3 py-1.5 bg-gray-950 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40" />
                        <label className="text-xs text-gray-400">To</label>
                        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={{ colorScheme: 'dark' }} className="px-3 py-1.5 bg-gray-950 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40" />
                        <button onClick={applyCustomRange} className="px-4 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium rounded-lg transition-all">Apply</button>
                    </div>
                )}

                {/* Summary Cards */}
                <div className={`grid gap-4 mb-6 ${filter === 'all' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5' : 'grid-cols-1 sm:grid-cols-3'}`}>
                    {(filter === 'all' || filter === 'links') && (
                        <>
                            <SummaryCard label="Link Clicks" value={summary.total_clicks} color="from-violet-500 to-purple-600" />
                            <SummaryCard label="Unique Clicks" value={summary.unique_clicks} color="from-cyan-500 to-blue-600" />
                        </>
                    )}
                    {(filter === 'all' || filter === 'bio') && <SummaryCard label="Bio Views" value={bio_summary.total_clicks} color="from-fuchsia-500 to-pink-600" />}
                    {(filter === 'all' || filter === 'qr') && <SummaryCard label="QR Scans" value={qr_summary.total_clicks} color="from-amber-500 to-orange-600" />}
                    {filter === 'qr' && <SummaryCard label="Unique Scans" value={qr_summary.unique_clicks} color="from-cyan-500 to-blue-600" />}
                    {filter === 'bio' && <SummaryCard label="Unique Views" value={bio_summary.unique_clicks} color="from-cyan-500 to-blue-600" />}
                    <SummaryCard label="Avg. Daily" value={filter === 'qr' ? qr_summary.avg_daily : filter === 'bio' ? bio_summary.avg_daily : summary.avg_daily} color="from-emerald-500 to-green-600" />
                </div>

                {/* Activity Over Time */}
                <div className="rounded-xl bg-gray-900 border border-gray-800 p-6 mb-6">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Activity Over Time</h3>
                    {clicks_over_time.length > 0 || bio_visits_over_time.length > 0 || qr_scans_over_time.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                                <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} allowDuplicatedCategory={false} />
                                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} allowDecimals={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '0.75rem', color: '#e5e7eb' }} />
                                {(filter === 'all' || filter === 'links') && clicks_over_time.length > 0 && <Line type="monotone" data={clicks_over_time} dataKey="count" name="Link Clicks" stroke="#8b5cf6" strokeWidth={2} dot={false} />}
                                {(filter === 'all' || filter === 'bio') && bio_visits_over_time.length > 0 && <Line type="monotone" data={bio_visits_over_time} dataKey="count" name="Bio Views" stroke="#d946ef" strokeWidth={2} dot={false} />}
                                {(filter === 'all' || filter === 'qr') && qr_scans_over_time.length > 0 && <Line type="monotone" data={qr_scans_over_time} dataKey="count" name="QR Scans" stroke="#f59e0b" strokeWidth={2} dot={false} />}
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-center py-12 text-gray-500 text-sm">No data for this period</div>
                    )}
                </div>

                {/* Breakdown Grids */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <BreakdownCard title="Countries" data={top_countries} />
                    <BreakdownCard title="Referrers" data={top_referrers} />
                    <BreakdownCard title="Browsers" data={top_browsers} />
                    <BreakdownCard title="Operating Systems" data={top_os} />
                    <BreakdownCard title="Languages" data={top_languages} />

                    {/* Devices Pie */}
                    <div className="rounded-xl bg-gray-900 border border-gray-800 p-6">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Devices</h3>
                        {devices.length > 0 ? (
                            <div className="flex items-center justify-center gap-8">
                                <PieChart width={180} height={180}>
                                    <Pie data={devices} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={70} strokeWidth={0}>
                                        {devices.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '0.75rem', color: '#e5e7eb' }} />
                                </PieChart>
                                <div className="space-y-2">
                                    {devices.map((d, i) => (
                                        <div key={d.name} className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                                            <span className="text-sm text-gray-300">{d.name}</span>
                                            <span className="text-sm text-gray-500 ml-auto">{d.count.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500 text-sm">No data</div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

function SummaryCard({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div className="relative overflow-hidden rounded-xl bg-gray-900 border border-gray-800 p-6 group hover:border-gray-700 transition-colors">
            <p className="text-sm font-medium text-gray-400">{label}</p>
            <p className="mt-2 text-3xl font-bold text-white">{typeof value === 'number' ? value.toLocaleString() : value}</p>
            <div className={`absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r ${color} opacity-0 group-hover:opacity-100 transition-opacity`} />
        </div>
    );
}

function BreakdownCard({ title, data }: { title: string; data: BreakdownItem[] }) {
    const maxCount = data.length > 0 ? Math.max(...data.map((d) => d.count)) : 1;
    return (
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">{title}</h3>
            {data.length > 0 ? (
                <div className="space-y-3">
                    {data.slice(0, 10).map((item) => (
                        <div key={item.name}>
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-gray-300 truncate mr-3">{item.name || '(unknown)'}</span>
                                <span className="text-xs text-gray-500 flex-shrink-0">{item.count.toLocaleString()}</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full bg-violet-500 rounded-full" style={{ width: `${(item.count / maxCount) * 100}%` }} />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-gray-600 text-center py-6">No data</p>
            )}
        </div>
    );
}
