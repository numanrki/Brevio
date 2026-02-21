import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head } from '@inertiajs/react';

interface Props {
    clicks_over_time: { date: string; count: number }[];
    top_countries: { country: string; count: number }[];
    top_referrers: { referrer: string; count: number }[];
    top_browsers: { browser: string; count: number }[];
}

export default function Stats({ clicks_over_time, top_countries, top_referrers, top_browsers }: Props) {
    const maxClicks = Math.max(...clicks_over_time.map((s) => s.count), 1);
    const maxCountry = Math.max(...top_countries.map((s) => s.count), 1);
    const maxReferrer = Math.max(...top_referrers.map((s) => s.count), 1);
    const maxBrowser = Math.max(...top_browsers.map((s) => s.count), 1);

    const totalClicks = clicks_over_time.reduce((sum, s) => sum + s.count, 0);

    return (
        <DashboardLayout header="Statistics">
            <Head title="Statistics" />

            {/* Summary */}
            <div className="mb-8">
                <p className="text-gray-400 text-sm">
                    Overview of your link performance and audience insights.
                </p>
            </div>

            {/* Clicks Over Time */}
            <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden mb-6">
                <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-white">Clicks Over Time</h3>
                        <p className="text-sm text-gray-500 mt-0.5">Total: {totalClicks.toLocaleString()} clicks</p>
                    </div>
                </div>
                <div className="p-6">
                    {clicks_over_time.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-sm">No click data available yet.</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-end gap-1 h-56">
                                {clicks_over_time.map((stat, index) => {
                                    const height = (stat.count / maxClicks) * 100;
                                    return (
                                        <div
                                            key={index}
                                            className="flex-1 group relative flex flex-col items-center justify-end"
                                        >
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 border border-gray-700">
                                                {stat.date}: {stat.count.toLocaleString()}
                                            </div>
                                            <div
                                                className="w-full rounded-t bg-gradient-to-t from-violet-600 to-fuchsia-500 min-h-[2px] transition-all duration-300 hover:from-violet-500 hover:to-fuchsia-400"
                                                style={{ height: `${Math.max(height, 1)}%` }}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="flex justify-between mt-3 text-[10px] text-gray-600">
                                <span>{clicks_over_time[0]?.date}</span>
                                <span>{clicks_over_time[clicks_over_time.length - 1]?.date}</span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Top Countries */}
                <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-800">
                        <h3 className="text-lg font-semibold text-white">Top Countries</h3>
                    </div>
                    <div className="p-6">
                        {top_countries.length === 0 ? (
                            <p className="text-gray-500 text-sm text-center py-8">No data available.</p>
                        ) : (
                            <div className="space-y-3">
                                {top_countries.map((item, index) => (
                                    <div key={index}>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-sm text-gray-300">{item.country || 'Unknown'}</span>
                                            <span className="text-sm font-medium text-white">{item.count.toLocaleString()}</span>
                                        </div>
                                        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500"
                                                style={{ width: `${(item.count / maxCountry) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Top Browsers */}
                <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-800">
                        <h3 className="text-lg font-semibold text-white">Top Browsers</h3>
                    </div>
                    <div className="p-6">
                        {top_browsers.length === 0 ? (
                            <p className="text-gray-500 text-sm text-center py-8">No data available.</p>
                        ) : (
                            <div className="space-y-3">
                                {top_browsers.map((item, index) => (
                                    <div key={index}>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-sm text-gray-300">{item.browser || 'Unknown'}</span>
                                            <span className="text-sm font-medium text-white">{item.count.toLocaleString()}</span>
                                        </div>
                                        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                                                style={{ width: `${(item.count / maxBrowser) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Top Referrers - Full Width */}
            <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-800">
                    <h3 className="text-lg font-semibold text-white">Top Referrers</h3>
                </div>
                <div className="p-6">
                    {top_referrers.length === 0 ? (
                        <p className="text-gray-500 text-sm text-center py-8">No referrer data available.</p>
                    ) : (
                        <div className="space-y-3">
                            {top_referrers.map((item, index) => (
                                <div key={index} className="flex items-center gap-4">
                                    <div className="w-8 text-right">
                                        <span className="text-xs font-mono text-gray-600">#{index + 1}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-sm text-gray-300 truncate">{item.referrer || 'Direct / Unknown'}</span>
                                            <span className="text-sm font-medium text-white ml-4 flex-shrink-0">{item.count.toLocaleString()}</span>
                                        </div>
                                        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-500"
                                                style={{ width: `${(item.count / maxReferrer) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
