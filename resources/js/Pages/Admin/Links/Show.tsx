import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';
import { Url, Domain } from '@/types';
import { url as urlHelper } from '@/utils';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface ClickStat {
    date: string;
    count: number;
}

interface Props {
    url: Url & { domain?: Domain };
    clicks_stats: ClickStat[];
}

export default function Show({ url: link, clicks_stats }: Props) {
    const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const getStatusBadge = () => {
        if (link.is_archived) return <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-700/50 text-gray-400 border border-gray-700">ARCHIVED</span>;
        if (link.expiry_date && new Date(link.expiry_date) < new Date()) return <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">EXPIRED</span>;
        if (!link.is_active) return <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">DISABLED</span>;
        return <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">ACTIVE</span>;
    };

    return (
        <AdminLayout header="Link Details">
            <Head title={`Link: ${link.alias}`} />

            <div className="max-w-4xl">
                <Link href={urlHelper('/admin/links')} className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white mb-6 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    Back to Links
                </Link>

                {/* Header */}
                <div className="rounded-xl bg-gray-900 border border-gray-800 p-6 mb-6">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-xl font-bold text-white">/{link.alias}</h2>
                                {getStatusBadge()}
                            </div>
                            <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-violet-400 transition-colors break-all">
                                {link.url}
                            </a>
                            {link.title && <p className="text-sm text-gray-500 mt-1">{link.title}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                            <Link href={urlHelper(`/admin/links/${link.id}/analytics`)} className="px-3 py-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-lg text-sm font-medium hover:bg-cyan-500/20 transition-colors">
                                Analytics
                            </Link>
                            <Link href={urlHelper(`/admin/links/${link.id}/edit`)} className="px-3 py-2 bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-lg text-sm font-medium hover:bg-violet-500/20 transition-colors">
                                Edit
                            </Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-800">
                        <div>
                            <p className="text-xs text-gray-500 uppercase">Total Clicks</p>
                            <p className="text-lg font-bold text-white mt-0.5">{link.total_clicks.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase">Created</p>
                            <p className="text-sm text-gray-300 mt-0.5">{formatDate(link.created_at)}</p>
                        </div>
                        {link.domain && (
                            <div>
                                <p className="text-xs text-gray-500 uppercase">Domain</p>
                                <p className="text-sm text-gray-300 mt-0.5">{link.domain.domain}</p>
                            </div>
                        )}
                        {link.expiry_date && (
                            <div>
                                <p className="text-xs text-gray-500 uppercase">Expires</p>
                                <p className="text-sm text-gray-300 mt-0.5">{formatDate(link.expiry_date)}</p>
                            </div>
                        )}
                    </div>

                    {link.description && (
                        <div className="pt-4 mt-4 border-t border-gray-800">
                            <p className="text-xs text-gray-500 uppercase mb-1">Description</p>
                            <p className="text-sm text-gray-400">{link.description}</p>
                        </div>
                    )}
                </div>

                {/* Clicks Chart (30 days) */}
                <div className="rounded-xl bg-gray-900 border border-gray-800 p-6">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Clicks — Last 30 Days</h3>
                    {clicks_stats.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={clicks_stats}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                                <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} allowDecimals={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '0.75rem', color: '#e5e7eb' }} />
                                <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-center py-12 text-gray-500 text-sm">No click data for this period</div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
