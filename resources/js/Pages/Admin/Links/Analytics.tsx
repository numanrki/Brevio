import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Url, Domain, AnalyticsSummary, TimeSeriesPoint, BreakdownItem } from '@/types';
import { url } from '@/utils';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface Props {
    url: Url & { domain?: Domain };
    range: string;
    ranges: string[];
    summary: AnalyticsSummary;
    clicks_over_time: TimeSeriesPoint[];
    top_countries: BreakdownItem[];
    top_cities: BreakdownItem[];
    top_referrers: BreakdownItem[];
    top_browsers: BreakdownItem[];
    top_os: BreakdownItem[];
    devices: BreakdownItem[];
    top_languages: BreakdownItem[];
}

const PIE_COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#14b8a6'];

const rangeLabels: Record<string, string> = {
    today: 'Today',
    '7d': '7 Days',
    '15d': '15 Days',
    '30d': '30 Days',
    '3m': '3 Months',
    '12m': '12 Months',
};

export default function Analytics({ url: link, range, ranges, summary, clicks_over_time, top_countries, top_cities, top_referrers, top_browsers, top_os, devices, top_languages }: Props) {
    const changeRange = (newRange: string) => {
        router.get(url(`/admin/links/${link.id}/analytics`), { range: newRange }, { preserveState: true, preserveScroll: true });
    };

    return (
        <AdminLayout header="Link Analytics">
            <Head title={`Analytics: ${link.alias}`} />

            <div className="max-w-6xl">
                {/* Back + link info */}
                <Link href={url(`/admin/links/${link.id}`)} className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white mb-4 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    Back to Link
                </Link>

                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-bold text-white">/{link.alias}</h2>
                        <p className="text-sm text-gray-500 truncate max-w-md">{link.url}</p>
                    </div>
                    {/* Range Selector */}
                    <div className="flex items-center gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1">
                        {ranges.map((r) => (
                            <button
                                key={r}
                                onClick={() => changeRange(r)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${r === range ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                            >
                                {rangeLabels[r] || r}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <SummaryCard label="Total Clicks" value={summary.total_clicks} />
                    <SummaryCard label="Unique Clicks" value={summary.unique_clicks} />
                    <SummaryCard label="Avg. Daily" value={summary.avg_daily} />
                </div>

                {/* Clicks over time */}
                <div className="rounded-xl bg-gray-900 border border-gray-800 p-6 mb-6">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Clicks Over Time</h3>
                    {clicks_over_time.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <LineChart data={clicks_over_time}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                                <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} allowDecimals={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '0.75rem', color: '#e5e7eb' }} />
                                <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <EmptyChart />
                    )}
                </div>

                {/* Breakdown grids */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <BreakdownCard title="Countries" data={top_countries} />
                    <BreakdownCard title="Cities" data={top_cities} />
                    <BreakdownCard title="Referrers" data={top_referrers} />
                    <BreakdownCard title="Browsers" data={top_browsers} />
                    <BreakdownCard title="Operating Systems" data={top_os} />
                    <BreakdownCard title="Languages" data={top_languages} />
                </div>

                {/* Devices pie chart */}
                <div className="rounded-xl bg-gray-900 border border-gray-800 p-6">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Devices</h3>
                    {devices.length > 0 ? (
                        <div className="flex items-center justify-center gap-8">
                            <PieChart width={200} height={200}>
                                <Pie data={devices} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} strokeWidth={0}>
                                    {devices.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '0.75rem', color: '#e5e7eb' }} />
                            </PieChart>
                            <div className="space-y-2">
                                {devices.map((d, i) => (
                                    <div key={d.name} className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                                        <span className="text-sm text-gray-300">{d.name}</span>
                                        <span className="text-sm text-gray-500 ml-auto">{d.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <EmptyChart />
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
            <p className="text-xs font-medium text-gray-500 uppercase">{label}</p>
            <p className="text-2xl font-bold text-white mt-1">{typeof value === 'number' ? value.toLocaleString() : value}</p>
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

function EmptyChart() {
    return <div className="text-center py-12 text-gray-500 text-sm">No data for this period</div>;
}
