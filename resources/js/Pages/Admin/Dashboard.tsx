import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';
import { Url } from '@/types';
import { url } from '@/utils';

interface DashboardProps {
    stats: {
        total_links: number;
        total_clicks: number;
        total_bio_pages: number;
        total_qr_codes: number;
    };
    recent_links: Url[];
    pending_reports: number;
}

const statCards = [
    { key: 'total_links', label: 'Total Links', icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1', color: 'from-violet-500 to-purple-600' },
    { key: 'total_clicks', label: 'Total Clicks', icon: 'M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122', color: 'from-cyan-500 to-blue-600' },
    { key: 'total_bio_pages', label: 'Bio Pages', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', color: 'from-emerald-500 to-green-600' },
    { key: 'total_qr_codes', label: 'QR Codes', icon: 'M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z', color: 'from-amber-500 to-orange-600' },
] as const;

export default function Dashboard({ stats, recent_links, pending_reports }: DashboardProps) {
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
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                {statCards.map((card) => (
                    <div key={card.key} className="relative overflow-hidden rounded-xl bg-gray-900 border border-gray-800 p-6 group hover:border-gray-700 transition-colors">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-400">{card.label}</p>
                                <p className="mt-2 text-3xl font-bold text-white">
                                    {formatNumber(stats[card.key])}
                                </p>
                            </div>
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity`}>
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
                                </svg>
                            </div>
                        </div>
                        <div className={`absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r ${card.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
                    </div>
                ))}
            </div>

            {/* Recent Links */}
            <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
                    <h2 className="text-lg font-semibold text-white">Recent Links</h2>
                    <Link href={url('/admin/links')} className="text-sm text-violet-400 hover:text-violet-300 transition-colors">
                        View All →
                    </Link>
                </div>
                <div className="divide-y divide-gray-800">
                    {recent_links.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                            <p className="text-sm text-gray-500">No links yet</p>
                        </div>
                    ) : (
                        recent_links.map((link) => (
                            <div key={link.id} className="px-6 py-3.5 flex items-center gap-4 hover:bg-gray-800/30 transition-colors">
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
        </AdminLayout>
    );
}

function formatNumber(num: number): string {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
    return num.toLocaleString();
}
