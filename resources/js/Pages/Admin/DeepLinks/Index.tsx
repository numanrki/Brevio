import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/Pagination';
import { Head, Link, router } from '@inertiajs/react';
import { PaginatedData, DeepLink } from '@/types';
import { useState, useCallback } from 'react';
import { url } from '@/utils';

interface Props {
    deepLinks: PaginatedData<DeepLink>;
    filters: { search?: string; status?: string };
}

export default function Index({ deepLinks, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    const applyFilters = useCallback(
        (overrides: Record<string, string> = {}) => {
            const params: Record<string, string> = { search, ...overrides };
            Object.keys(params).forEach((k) => { if (!params[k]) delete params[k]; });
            router.get(url('/admin/deep-links'), params, { preserveState: true, preserveScroll: true });
        },
        [search],
    );

    return (
        <AdminLayout header="Deep Links">
            <Head title="Deep Links" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                            placeholder="Search deep links…"
                            className="w-full sm:w-64 pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                        />
                    </div>
                    <select
                        value={filters.status || ''}
                        onChange={(e) => applyFilters({ status: e.target.value })}
                        className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-xl text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="expired">Expired</option>
                    </select>
                </div>

                <Link
                    href={url('/admin/deep-links/create')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-xl transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Create Deep Link
                </Link>
            </div>

            {deepLinks.data.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                    <p className="text-lg font-medium text-gray-400">No deep links yet</p>
                    <p className="text-sm mt-1">Create your first smart deep link to get started.</p>
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto rounded-xl border border-gray-800">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-900/60 text-gray-400 text-left">
                                    <th className="px-4 py-3 font-medium">Name</th>
                                    <th className="px-4 py-3 font-medium">Alias</th>
                                    <th className="px-4 py-3 font-medium text-center">Rules</th>
                                    <th className="px-4 py-3 font-medium text-center">Clicks</th>
                                    <th className="px-4 py-3 font-medium text-center">Status</th>
                                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800/50">
                                {deepLinks.data.map((dl) => (
                                    <tr key={dl.id} className="hover:bg-gray-900/40 transition-colors">
                                        <td className="px-4 py-3">
                                            <Link href={url(`/admin/deep-links/${dl.id}`)} className="text-white hover:text-violet-400 transition-colors font-medium">
                                                {dl.name}
                                            </Link>
                                            <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[200px]">{dl.fallback_url}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <code className="text-xs bg-gray-800 px-2 py-1 rounded text-violet-400">{dl.alias}</code>
                                        </td>
                                        <td className="px-4 py-3 text-center text-gray-300">{dl.rules_count ?? 0}</td>
                                        <td className="px-4 py-3 text-center text-gray-300">{dl.clicks_count ?? dl.total_clicks}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                                dl.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${dl.is_active ? 'bg-emerald-400' : 'bg-red-400'}`} />
                                                {dl.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Link href={url(`/admin/deep-links/${dl.id}/analytics`)} className="p-1.5 text-gray-500 hover:text-white transition-colors" title="Analytics">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                                </Link>
                                                <Link href={url(`/admin/deep-links/${dl.id}/edit`)} className="p-1.5 text-gray-500 hover:text-white transition-colors" title="Edit">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                </Link>
                                                <button
                                                    onClick={() => { if (confirm('Delete this deep link?')) router.delete(url(`/admin/deep-links/${dl.id}`)); }}
                                                    className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"
                                                    title="Delete"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <Pagination
                        links={deepLinks.links}
                        currentPage={deepLinks.current_page}
                        lastPage={deepLinks.last_page}
                    />
                </>
            )}
        </AdminLayout>
    );
}
