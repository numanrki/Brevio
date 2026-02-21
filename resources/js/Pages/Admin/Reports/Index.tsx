import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/Pagination';
import { Head, router } from '@inertiajs/react';
import { PaginatedData, Report } from '@/types';
import { url } from '@/utils';

interface Props {
    reports: PaginatedData<Report>;
}

export default function Index({ reports }: Props) {
    const handleUpdateStatus = (report: Report, status: 'reviewed' | 'dismissed') => {
        const action = status === 'reviewed' ? 'mark as reviewed' : 'dismiss';
        if (confirm(`Are you sure you want to ${action} this report?`)) {
            router.put(url(`/admin/reports/${report.id}`), { status }, { preserveScroll: true });
        }
    };

    const handleDelete = (report: Report) => {
        if (confirm('Are you sure you want to delete this report? This cannot be undone.')) {
            router.delete(url(`/admin/reports/${report.id}`), { preserveScroll: true });
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const getStatusBadge = (status: Report['status']) => {
        switch (status) {
            case 'pending':
                return (
                    <span className="inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        PENDING
                    </span>
                );
            case 'reviewed':
                return (
                    <span className="inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        REVIEWED
                    </span>
                );
            case 'dismissed':
                return (
                    <span className="inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-700/50 text-gray-400 border border-gray-700">
                        DISMISSED
                    </span>
                );
        }
    };

    return (
        <AdminLayout header="Reports">
            <Head title="Manage Reports" />

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="rounded-xl bg-gray-900 border border-gray-800 p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-white">
                            {reports.data.filter((r) => r.status === 'pending').length}
                        </p>
                        <p className="text-xs text-gray-500">Pending</p>
                    </div>
                </div>
                <div className="rounded-xl bg-gray-900 border border-gray-800 p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-white">
                            {reports.data.filter((r) => r.status === 'reviewed').length}
                        </p>
                        <p className="text-xs text-gray-500">Reviewed</p>
                    </div>
                </div>
                <div className="rounded-xl bg-gray-900 border border-gray-800 p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-700/30 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-white">
                            {reports.data.filter((r) => r.status === 'dismissed').length}
                        </p>
                        <p className="text-xs text-gray-500">Dismissed</p>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-800">
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Reported URL</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Reporter</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Reason</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {reports.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
                                                <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <p className="text-gray-500 text-sm">No reports found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                reports.data.map((report) => (
                                    <tr key={report.id} className="group hover:bg-gray-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            {report.url ? (
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-white truncate max-w-[200px]">{report.url.alias}</p>
                                                    <p className="text-xs text-gray-500 truncate max-w-[200px]">{report.url.url}</p>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-600">URL deleted</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-400">{(report as any).reporter_email ?? '—'}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-400 max-w-[250px] truncate" title={report.reason}>
                                                {report.reason}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">{getStatusBadge(report.status)}</td>
                                        <td className="px-6 py-4 text-gray-500 text-sm whitespace-nowrap">
                                            {formatDate(report.created_at)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                {report.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleUpdateStatus(report, 'reviewed')}
                                                            className="p-2 text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all"
                                                            title="Mark as Reviewed"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateStatus(report, 'dismissed')}
                                                            className="p-2 text-gray-500 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all"
                                                            title="Dismiss"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                            </svg>
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(report)}
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
                        Showing <span className="text-gray-300">{reports.data.length}</span> of{' '}
                        <span className="text-gray-300">{reports.total}</span> reports
                    </p>
                    <Pagination links={reports.links} currentPage={reports.current_page} lastPage={reports.last_page} />
                </div>
            </div>
        </AdminLayout>
    );
}
