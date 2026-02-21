import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/Pagination';
import { Head, Link, router } from '@inertiajs/react';
import { PaginatedData, Domain } from '@/types';
import { url } from '@/utils';

interface DomainExtended extends Domain {
    user_id?: number | null;
    redirect_root?: string | null;
    redirect_404?: string | null;
    is_verified?: boolean;
    is_active?: boolean;
    created_at: string;
    updated_at?: string;
    user?: { id: number; name: string; email: string };
}

interface Props {
    domains: PaginatedData<DomainExtended>;
}

export default function Index({ domains }: Props) {
    const handleDelete = (domain: DomainExtended) => {
        if (confirm(`Are you sure you want to delete "${domain.domain}"? This cannot be undone.`)) {
            router.delete(url(`/admin/domains/${domain.id}`), { preserveScroll: true });
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const getVerifiedBadge = (domain: DomainExtended) => {
        const verified = domain.is_verified ?? (domain.status === 'active');
        if (verified) {
            return (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    VERIFIED
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                PENDING
            </span>
        );
    };

    const getStatusBadge = (domain: DomainExtended) => {
        const active = domain.is_active ?? (domain.status !== 'disabled');
        if (active) {
            return (
                <span className="inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    ACTIVE
                </span>
            );
        }
        return (
            <span className="inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                DISABLED
            </span>
        );
    };

    return (
        <AdminLayout header="Domains">
            <Head title="Manage Domains" />

            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4 mb-6">
                <p className="text-sm text-gray-500">
                    <span className="text-gray-300">{domains.total}</span> domain{domains.total !== 1 ? 's' : ''} total
                </p>
                <Link
                    href={url('/admin/domains/create')}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-xl transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Domain
                </Link>
            </div>

            {/* Table */}
            <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-800">
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Domain</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">User</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Root Redirect</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">404 Redirect</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Verified</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Created</th>
                                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {domains.data.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
                                                <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
                                                </svg>
                                            </div>
                                            <p className="text-gray-500 text-sm">No domains found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                domains.data.map((domain) => (
                                    <tr key={domain.id} className="group hover:bg-gray-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-violet-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
                                                </svg>
                                                <span className="text-sm font-medium text-white">{domain.domain}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {domain.user ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-300 flex-shrink-0">
                                                        {domain.user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="text-sm text-gray-400">{domain.user.name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-600">System</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-400 truncate max-w-[150px] block">
                                                {domain.redirect_root || '—'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-400 truncate max-w-[150px] block">
                                                {domain.redirect_404 || '—'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{getVerifiedBadge(domain)}</td>
                                        <td className="px-6 py-4">{getStatusBadge(domain)}</td>
                                        <td className="px-6 py-4 text-gray-500 text-sm whitespace-nowrap">
                                            {formatDate(domain.created_at)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <Link
                                                    href={url(`/admin/domains/${domain.id}/edit`)}
                                                    className="p-2 text-gray-500 hover:text-violet-400 hover:bg-violet-500/10 rounded-lg transition-all"
                                                    title="Edit"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(domain)}
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
                        Showing <span className="text-gray-300">{domains.data.length}</span> of{' '}
                        <span className="text-gray-300">{domains.total}</span> domains
                    </p>
                    <Pagination links={domains.links} currentPage={domains.current_page} lastPage={domains.last_page} />
                </div>
            </div>
        </AdminLayout>
    );
}
