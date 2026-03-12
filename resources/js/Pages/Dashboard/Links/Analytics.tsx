import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Url, AnalyticsSummary, TimeSeriesPoint, BreakdownItem } from '@/types';
import { url as urlHelper } from '@/utils';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
} from 'recharts';

interface Props {
    url: Url & {
        domain?: { id: number; domain: string };
        campaign?: { id: number; name: string };
    };
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

const RANGE_LABELS: Record<string, string> = {
    today: 'Today',
    '7d': '7 Days',
    '15d': '15 Days',
    '30d': '30 Days',
    '3m': '3 Months',
    '12m': '12 Months',
};

const DEVICE_COLORS = ['#8b5cf6', '#d946ef', '#06b6d4', '#f59e0b'];
const BREAKDOWN_GRADIENTS = {
    violet: 'from-violet-500 to-fuchsia-500',
    cyan: 'from-cyan-500 to-blue-500',
    emerald: 'from-emerald-500 to-green-500',
    amber: 'from-amber-500 to-orange-500',
    rose: 'from-rose-500 to-pink-500',
};

function ProgressList({ items, gradient }: { items: BreakdownItem[]; gradient: string }) {
    const max = Math.max(...items.map((i) => i.count), 1);
    return (
        <div className="space-y-3">
            {items.map((item, i) => (
                <div key={i}>
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-gray-300 truncate">{item.name || 'Unknown'}</span>
                        <span className="text-sm font-medium text-white ml-4 flex-shrink-0">{item.count.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-500`}
                            style={{ width: `${(item.count / max) * 100}%` }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

function EmptyState({ message }: { message: string }) {
    return <p className="text-gray-500 text-sm text-center py-8">{message}</p>;
}

function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs">
            <p className="text-gray-400">{label}</p>
            <p className="text-white font-medium">{payload[0].value.toLocaleString()} clicks</p>
        </div>
    );
}

export default function Analytics({
    url, range, ranges, summary, clicks_over_time,
    top_countries, top_cities, top_referrers, top_browsers,
    top_os, devices, top_languages,
}: Props) {
    const changeRange = (newRange: string) => {
        router.get(
            urlHelper(`/dashboard/links/${url.id}/analytics`),
            { range: newRange },
            { preserveState: true, preserveScroll: true }
        );
    };

    const shortUrl = `${window.location.origin}${urlHelper('/' + url.alias)}`;
    const totalDevices = devices.reduce((s, d) => s + d.count, 0) || 1;

    return (
        <DashboardLayout header="Link Analytics">
            <Head title={`Analytics - /${url.alias}`} />
            <div className="max-w-6xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <Link
                            href={urlHelper(`/dashboard/links/${url.id}`)}
                            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            Back to Link
                        </Link>
                        <span className="text-gray-700">|</span>
                        <h2 className="text-lg font-bold text-white">/{url.alias}</h2>
                    </div>

                    {/* Date Range Selector */}
                    <div className="flex items-center gap-1 bg-gray-900 rounded-xl border border-gray-800 p-1">
                        {ranges.map((r) => (
                            <button
                                key={r}
                                onClick={() => changeRange(r)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                                    range === r
                                        ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                                        : 'text-gray-500 hover:text-gray-300'
                                }`}
                            >
                                {RANGE_LABELS[r] || r}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    {[
                        { label: 'Total Clicks', value: summary.total_clicks, color: 'text-violet-400' },
                        { label: 'Unique Clicks', value: summary.unique_clicks, color: 'text-fuchsia-400' },
                        { label: 'Avg. Daily', value: summary.avg_daily, color: 'text-cyan-400' },
                    ].map((card) => (
                        <div key={card.label} className="rounded-xl bg-gray-900 border border-gray-800 p-5">
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{card.label}</p>
                            <p className={`text-2xl font-bold ${card.color}`}>{card.value.toLocaleString()}</p>
                        </div>
                    ))}
                </div>

                {/* Clicks Over Time Chart */}
                <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden mb-6">
                    <div className="px-6 py-4 border-b border-gray-800">
                        <h3 className="text-lg font-semibold text-white">Clicks Over Time</h3>
                    </div>
                    <div className="p-6">
                        {clicks_over_time.length === 0 ? (
                            <EmptyState message="No click data for this period." />
                        ) : (
                            <ResponsiveContainer width="100%" height={280}>
                                <AreaChart data={clicks_over_time} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                    <defs>
                                        <linearGradient id="clickGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: 10, fill: '#6b7280' }}
                                        tickLine={false}
                                        axisLine={{ stroke: '#374151' }}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 10, fill: '#6b7280' }}
                                        tickLine={false}
                                        axisLine={{ stroke: '#374151' }}
                                        allowDecimals={false}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="count"
                                        stroke="#8b5cf6"
                                        strokeWidth={2}
                                        fill="url(#clickGradient)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Devices Donut + Languages */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Device Breakdown Donut */}
                    <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-800">
                            <h3 className="text-lg font-semibold text-white">Devices</h3>
                        </div>
                        <div className="p-6">
                            {devices.length === 0 ? (
                                <EmptyState message="No device data." />
                            ) : (
                                <div className="flex items-center justify-center">
                                    <ResponsiveContainer width="100%" height={220}>
                                        <PieChart>
                                            <Pie
                                                data={devices}
                                                dataKey="count"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={55}
                                                outerRadius={85}
                                                paddingAngle={3}
                                                strokeWidth={0}
                                            >
                                                {devices.map((_, i) => (
                                                    <Cell key={i} fill={DEVICE_COLORS[i % DEVICE_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Legend
                                                formatter={(value: string) => <span className="text-xs text-gray-400 capitalize">{value}</span>}
                                            />
                                            <Tooltip
                                                formatter={(value: any, name: any) => [
                                                    `${Number(value).toLocaleString()} (${((Number(value) / totalDevices) * 100).toFixed(1)}%)`,
                                                    String(name).charAt(0).toUpperCase() + String(name).slice(1),
                                                ]}
                                                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', fontSize: '12px' }}
                                                itemStyle={{ color: '#e5e7eb' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Languages */}
                    <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-800">
                            <h3 className="text-lg font-semibold text-white">Top Languages</h3>
                        </div>
                        <div className="p-6">
                            {top_languages.length === 0 ? (
                                <EmptyState message="No language data." />
                            ) : (
                                <ProgressList items={top_languages} gradient={BREAKDOWN_GRADIENTS.amber} />
                            )}
                        </div>
                    </div>
                </div>

                {/* Countries + Cities */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-800">
                            <h3 className="text-lg font-semibold text-white">Top Countries</h3>
                        </div>
                        <div className="p-6">
                            {top_countries.length === 0 ? (
                                <EmptyState message="No country data." />
                            ) : (
                                <ProgressList items={top_countries} gradient={BREAKDOWN_GRADIENTS.violet} />
                            )}
                        </div>
                    </div>
                    <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-800">
                            <h3 className="text-lg font-semibold text-white">Top Cities</h3>
                        </div>
                        <div className="p-6">
                            {top_cities.length === 0 ? (
                                <EmptyState message="No city data." />
                            ) : (
                                <ProgressList items={top_cities} gradient={BREAKDOWN_GRADIENTS.rose} />
                            )}
                        </div>
                    </div>
                </div>

                {/* Browsers + OS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-800">
                            <h3 className="text-lg font-semibold text-white">Top Browsers</h3>
                        </div>
                        <div className="p-6">
                            {top_browsers.length === 0 ? (
                                <EmptyState message="No browser data." />
                            ) : (
                                <ProgressList items={top_browsers} gradient={BREAKDOWN_GRADIENTS.cyan} />
                            )}
                        </div>
                    </div>
                    <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-800">
                            <h3 className="text-lg font-semibold text-white">Top OS</h3>
                        </div>
                        <div className="p-6">
                            {top_os.length === 0 ? (
                                <EmptyState message="No OS data." />
                            ) : (
                                <ProgressList items={top_os} gradient={BREAKDOWN_GRADIENTS.emerald} />
                            )}
                        </div>
                    </div>
                </div>

                {/* Referrers - Full Width */}
                <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-800">
                        <h3 className="text-lg font-semibold text-white">Top Referrers</h3>
                    </div>
                    <div className="p-6">
                        {top_referrers.length === 0 ? (
                            <EmptyState message="No referrer data." />
                        ) : (
                            <div className="space-y-3">
                                {top_referrers.map((item, index) => {
                                    const max = Math.max(...top_referrers.map((r) => r.count), 1);
                                    return (
                                        <div key={index} className="flex items-center gap-4">
                                            <div className="w-8 text-right">
                                                <span className="text-xs font-mono text-gray-600">#{index + 1}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <span className="text-sm text-gray-300 truncate">{item.name || 'Direct / Unknown'}</span>
                                                    <span className="text-sm font-medium text-white ml-4 flex-shrink-0">{item.count.toLocaleString()}</span>
                                                </div>
                                                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-500"
                                                        style={{ width: `${(item.count / max) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
