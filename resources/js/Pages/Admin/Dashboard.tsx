import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';
import { Url, User } from '@/types';
import { url } from '@/utils';

interface DashboardProps {
    stats: {
        total_links: number;
        total_clicks: number;
        total_users: number;
        total_revenue: number;
    };
    recent_links: (Url & { user?: User })[];
    recent_users: User[];
    pending_reports: number;
}

const statCards = [
    { key: 'total_links', label: 'Total Links', icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1', color: 'from-violet-500 to-purple-600' },
    { key: 'total_clicks', label: 'Total Clicks', icon: 'M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122', color: 'from-cyan-500 to-blue-600' },
    { key: 'total_users', label: 'Total Users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', color: 'from-emerald-500 to-green-600' },
    { key: 'total_revenue', label: 'Revenue', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'from-amber-500 to-orange-600', prefix: '$' },
] as const;

export default function Dashboard({ stats, recent_links, recent_users, pending_reports }: DashboardProps) {
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
                                    {'prefix' in card ? card.prefix : ''}
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

            {/* Tables */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
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
                            <EmptyState message="No links yet" />
                        ) : (
                            recent_links.map((link) => (
                                <div key={link.id} className="px-6 py-3.5 flex items-center gap-4 hover:bg-gray-800/30 transition-colors">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-white truncate">
                                            {link.alias}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate mt-0.5">{link.url}</p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <span className="text-sm font-semibold text-gray-300">
                                            {formatNumber(link.total_clicks ?? 0)}
                                        </span>
                                        <p className="text-xs text-gray-500">clicks</p>
                                    </div>
                                    {link.user && (
                                        <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-300 flex-shrink-0" title={link.user.name}>
                                            {link.user.name?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Users */}
                <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
                        <h2 className="text-lg font-semibold text-white">Recent Users</h2>
                        <Link href={url('/admin/users')} className="text-sm text-violet-400 hover:text-violet-300 transition-colors">
                            View All →
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-800">
                        {recent_users.length === 0 ? (
                            <EmptyState message="No users yet" />
                        ) : (
                            recent_users.map((user) => (
                                <div key={user.id} className="px-6 py-3.5 flex items-center gap-4 hover:bg-gray-800/30 transition-colors">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/20 flex items-center justify-center text-sm font-bold text-violet-300 flex-shrink-0">
                                        {user.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-white truncate">{user.name}</p>
                                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {user.role === 'admin' && (
                                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
                                                ADMIN
                                            </span>
                                        )}
                                        {user.is_banned ? (
                                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                                                BANNED
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                ACTIVE
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="px-6 py-12 text-center">
            <p className="text-sm text-gray-500">{message}</p>
        </div>
    );
}

function formatNumber(num: number): string {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
    return num.toLocaleString();
}
