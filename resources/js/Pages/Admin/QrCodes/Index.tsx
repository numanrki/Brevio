import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/Pagination';
import { Head, Link, router } from '@inertiajs/react';
import { PaginatedData, Url } from '@/types';
import { url } from '@/utils';

interface QrCodeItem {
    id: number;
    name: string;
    type: string;
    scans: number;
    created_at: string;
    url?: Url;
}

interface Props {
    qrCodes: PaginatedData<QrCodeItem>;
}

export default function Index({ qrCodes }: Props) {
    const handleDelete = (qr: QrCodeItem) => {
        if (confirm(`Delete QR code "${qr.name}"? This cannot be undone.`)) {
            router.delete(url(`/admin/qr-codes/${qr.id}`), { preserveScroll: true });
        }
    };

    const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return (
        <AdminLayout header="QR Codes">
            <Head title="QR Codes" />

            <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-gray-500">{qrCodes.total} QR code{qrCodes.total !== 1 ? 's' : ''}</p>
                <Link
                    href={url('/admin/qr-codes/create')}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-violet-500/20"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Create QR Code
                </Link>
            </div>

            <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-800">
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Linked URL</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Scans</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Created</th>
                                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {qrCodes.data.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
                                                <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                                            </div>
                                            <p className="text-gray-500 text-sm">No QR codes yet</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                qrCodes.data.map((qr) => (
                                    <tr key={qr.id} className="group hover:bg-gray-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-white">{qr.name}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {qr.url ? (
                                                <span className="text-sm text-gray-400">/{qr.url.alias}</span>
                                            ) : (
                                                <span className="text-sm text-gray-600">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-semibold text-gray-300">{qr.scans.toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-sm whitespace-nowrap">{formatDate(qr.created_at)}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <Link href={url(`/admin/qr-codes/${qr.id}`)} className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-all" title="View">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                </Link>
                                                <Link href={url(`/admin/qr-codes/${qr.id}/edit`)} className="p-2 text-gray-500 hover:text-violet-400 hover:bg-violet-500/10 rounded-lg transition-all" title="Edit">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                </Link>
                                                <button onClick={() => handleDelete(qr)} className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all" title="Delete">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {qrCodes.data.length > 0 && (
                    <div className="px-6 py-4 border-t border-gray-800 flex items-center justify-between">
                        <p className="text-sm text-gray-500">Showing <span className="text-gray-300">{qrCodes.data.length}</span> of <span className="text-gray-300">{qrCodes.total}</span></p>
                        <Pagination links={qrCodes.links} currentPage={qrCodes.current_page} lastPage={qrCodes.last_page} />
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
