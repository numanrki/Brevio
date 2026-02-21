import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Url, Plan, User } from '@/types';
import { url } from '@/utils';
import { FormEvent, useState } from 'react';

interface DashboardProps {
    total_links: number;
    total_clicks: number;
    recent_links: Url[];
    plan: Plan | null;
}

export default function Dashboard({ total_links, total_clicks, recent_links, plan }: DashboardProps) {
    const { auth } = usePage<{ auth: { user: User } }>().props;
    const [copied, setCopied] = useState<number | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        url: '',
    });

    const handleQuickShorten = (e: FormEvent) => {
        e.preventDefault();
        post(url('/dashboard/links'), {
            onSuccess: () => reset(),
        });
    };

    const copyToClipboard = (alias: string, id: number) => {
        const shortUrl = `${window.location.origin}${url('/' + alias)}`;
        navigator.clipboard.writeText(shortUrl);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <DashboardLayout header="Dashboard">
            <Head title="Dashboard" />

            {/* Welcome */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-white">
                    Welcome back, {auth.user.name}
                </h2>
                <p className="text-gray-400 mt-1">Here&apos;s what&apos;s happening with your links.</p>
            </div>

            {/* Stats + Plan Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
                {/* Total Links */}
                <div className="rounded-xl bg-gray-900 border border-gray-800 p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Total Links</p>
                            <p className="text-2xl font-bold text-white">{total_links.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                {/* Total Clicks */}
                <div className="rounded-xl bg-gray-900 border border-gray-800 p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Total Clicks</p>
                            <p className="text-2xl font-bold text-white">{total_clicks.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                {/* Plan Info */}
                <div className="rounded-xl bg-gray-900 border border-gray-800 p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-600 flex items-center justify-center flex-shrink-0">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-400">Current Plan</p>
                            <p className="text-lg font-bold text-white">{plan ? plan.name : 'Free'}</p>
                        </div>
                        {!plan && (
                            <Link
                                href={url('/pricing')}
                                className="text-xs font-medium text-violet-400 bg-violet-500/10 hover:bg-violet-500/20 px-3 py-1.5 rounded-lg transition-colors"
                            >
                                Upgrade
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Shorten */}
            <div className="rounded-xl bg-gray-900 border border-gray-800 p-6 mb-8">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Shorten</h3>
                <form onSubmit={handleQuickShorten} className="flex gap-3">
                    <div className="flex-1">
                        <input
                            type="url"
                            value={data.url}
                            onChange={(e) => setData('url', e.target.value)}
                            placeholder="Paste a long URL here..."
                            className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
                            required
                        />
                        {errors.url && <p className="mt-1.5 text-xs text-red-400">{errors.url}</p>}
                    </div>
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-sm font-medium rounded-xl transition-all duration-200 disabled:opacity-50 flex-shrink-0"
                    >
                        {processing ? 'Shortening...' : 'Shorten'}
                    </button>
                </form>
            </div>

            {/* Recent Links */}
            <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Recent Links</h3>
                    <Link href={url('/dashboard/links')} className="text-sm text-violet-400 hover:text-violet-300 transition-colors">
                        View All →
                    </Link>
                </div>
                {recent_links.length === 0 ? (
                    <div className="p-12 text-center">
                        <svg className="w-12 h-12 text-gray-700 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        <p className="text-gray-500 text-sm">No links yet. Shorten your first link above!</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-800">
                                    <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Alias</th>
                                    <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
                                    <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                                    <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                    <th className="text-right py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800/50">
                                {recent_links.map((link) => (
                                    <tr key={link.id} className="hover:bg-gray-800/30 transition-colors">
                                        <td className="py-3 px-6">
                                            <Link href={`/dashboard/links/${link.id}`} className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
                                                /{link.alias}
                                            </Link>
                                        </td>
                                        <td className="py-3 px-6 text-gray-400 max-w-xs truncate">
                                            {link.url}
                                        </td>
                                        <td className="py-3 px-6">
                                            <span className="text-white font-medium">{link.total_clicks.toLocaleString()}</span>
                                        </td>
                                        <td className="py-3 px-6 text-gray-500">
                                            {formatDate(link.created_at)}
                                        </td>
                                        <td className="py-3 px-6 text-right">
                                            <button
                                                onClick={() => copyToClipboard(link.alias, link.id)}
                                                className="text-gray-400 hover:text-white transition-colors"
                                                title="Copy short link"
                                            >
                                                {copied === link.id ? (
                                                    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                    </svg>
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
