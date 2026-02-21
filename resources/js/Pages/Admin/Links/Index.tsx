import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/Pagination';
import { Head, Link, router } from '@inertiajs/react';
import { PaginatedData, Url } from '@/types';
import { useState, useCallback, useRef, useEffect } from 'react';
import { url } from '@/utils';

interface Props {
    links: PaginatedData<Url>;
    filters: {
        search?: string;
        status?: string;
    };
}

export default function Index({ links, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const searchTimeout = useRef<ReturnType<typeof setTimeout>>();

    const applyFilters = useCallback(
        (params: Record<string, string>) => {
            router.get(url('/admin/links'), params, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        },
        []
    );

    useEffect(() => {
        clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            const params: Record<string, string> = {};
            if (search) params.search = search;
            if (status) params.status = status;
            applyFilters(params);
        }, 300);
        return () => clearTimeout(searchTimeout.current);
    }, [search]);

    const handleStatusChange = (value: string) => {
        setStatus(value);
        const params: Record<string, string> = {};
        if (search) params.search = search;
        if (value) params.status = value;
        applyFilters(params);
    };

    const handleDelete = (link: Url) => {
        if (confirm(`Are you sure you want to delete the link "${link.alias}"? This cannot be undone.`)) {
            router.delete(url(`/admin/links/${link.id}`), { preserveScroll: true });
        }
    };

    const truncateUrl = (url: string, maxLen = 50) => {
        return url.length > maxLen ? url.substring(0, maxLen) + '...' : url;
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const getStatusBadge = (link: Url) => {
        if (link.is_archived) {
            return (
                <span className="inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-700/50 text-gray-400 border border-gray-700">
                    ARCHIVED
                </span>
            );
        }
        if (link.expiry_date && new Date(link.expiry_date) < new Date()) {
            return (
                <span className="inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    EXPIRED
                </span>
            );
        }
        if (!link.is_active) {
            return (
                <span className="inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                    DISABLED
                </span>
            );
        }
        return (
            <span className="inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                ACTIVE
            </span>
        );
    };

    return (
        <AdminLayout header="Links">
            <Head title="Manage Links" />

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                    {/* Search */}
                    <div className="relative w-full sm:w-72">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search links..."
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
                        />
                    </div>

                    {/* Status Filter */}
                    <select
                        value={status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        className="px-3 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40"
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="archived">Archived</option>
                        <option value="expired">Expired</option>
                        <option value="disabled">Disabled</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-800">
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Alias</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Original URL</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">User</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Clicks</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Created</th>
                                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {links.data.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
                                                <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                                </svg>
                                            </div>
                                            <p className="text-gray-500 text-sm">No links found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                links.data.map((link) => (
                                    <tr key={link.id} className="group hover:bg-gray-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-violet-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                                </svg>
                                                <span className="text-sm font-medium text-white">{link.alias}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-400" title={link.url}>
                                                {truncateUrl(link.url)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {link.user ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-300 flex-shrink-0">
                                                        {link.user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="text-sm text-gray-400 truncate max-w-[120px]">{link.user.name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-600">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-semibold text-gray-300">{link.total_clicks.toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-4">{getStatusBadge(link)}</td>
                                        <td className="px-6 py-4 text-gray-500 text-sm whitespace-nowrap">
                                            {formatDate(link.created_at)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <Link
                                                    href={url(`/admin/links/${link.id}`)}
                                                    className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
                                                    title="View"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </Link>
                                                <Link
                                                    href={url(`/admin/links/${link.id}/edit`)}
                                                    className="p-2 text-gray-500 hover:text-violet-400 hover:bg-violet-500/10 rounded-lg transition-all"
                                                    title="Edit"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(link)}
                                                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                                    title="Delete"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <div className="px-6 py-4 border-t border-gray-800 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                        Showing <span className="text-gray-300">{links.data.length}</span> of{' '}
                        <span className="text-gray-300">{links.total}</span> links
                    </p>
                    <Pagination links={links.links} currentPage={links.current_page} lastPage={links.last_page} />
                </div>
            </div>
        </AdminLayout>
    );
}
