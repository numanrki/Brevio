import DashboardLayout from '@/Layouts/DashboardLayout';
import Pagination from '@/Components/Pagination';
import { Head, Link, router } from '@inertiajs/react';
import { PaginatedData, QrCode } from '@/types';
import { url } from '@/utils';

interface ExtendedQrCode extends QrCode {
    url_id?: number | null;
    data?: Record<string, any>;
    style?: Record<string, any> | null;
    url?: { id: number; alias: string; url: string };
    updated_at?: string;
}

interface Props {
    qrCodes: PaginatedData<ExtendedQrCode>;
}

export default function Index({ qrCodes }: Props) {
    const handleDelete = (qrCode: ExtendedQrCode) => {
        if (confirm(`Are you sure you want to delete "${qrCode.name}"? This cannot be undone.`)) {
            router.delete(url(`/dashboard/qr-codes/${qrCode.id}`), { preserveScroll: true });
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <DashboardLayout header="QR Codes">
            <Head title="QR Codes" />

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <p className="text-gray-400 text-sm">Create and manage your QR codes.</p>
                <Link
                    href={url('/dashboard/qr-codes/create')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-sm font-medium rounded-xl transition-all duration-200"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create QR Code
                </Link>
            </div>

            {/* QR Code Grid */}
            {qrCodes.data.length === 0 ? (
                <div className="rounded-xl bg-gray-900 border border-gray-800 p-12 text-center">
                    <svg className="w-12 h-12 text-gray-700 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                    <p className="text-gray-500 text-sm mb-4">No QR codes yet.</p>
                    <Link
                        href={url('/dashboard/qr-codes/create')}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-xl transition-colors"
                    >
                        Create your first QR code
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {qrCodes.data.map((qrCode) => (
                        <div key={qrCode.id} className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden hover:border-gray-700 transition-colors">
                            <div className="p-5">
                                <div className="flex items-start gap-4">
                                    {/* QR Icon */}
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-6 h-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-white font-semibold truncate">{qrCode.name}</h3>
                                        {qrCode.url && (
                                            <p className="text-xs text-gray-500 mt-0.5 truncate">
                                                Linked: /{qrCode.url.alias}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
                                        </svg>
                                        {qrCode.scans} scans
                                    </span>
                                    <span>{formatDate(qrCode.created_at)}</span>
                                </div>
                            </div>

                            <div className="px-5 py-3 bg-gray-950/50 border-t border-gray-800 flex items-center gap-2">
                                <Link
                                    href={url(`/dashboard/qr-codes/${qrCode.id}`)}
                                    className="flex-1 text-center px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
                                >
                                    View
                                </Link>
                                <Link
                                    href={url(`/dashboard/qr-codes/${qrCode.id}/edit`)}
                                    className="flex-1 text-center px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
                                >
                                    Edit
                                </Link>
                                <button
                                    onClick={() => handleDelete(qrCode)}
                                    className="flex-1 text-center px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {qrCodes.data.length > 0 && (
                <div className="mt-6">
                    <Pagination links={qrCodes.links} currentPage={qrCodes.current_page} lastPage={qrCodes.last_page} />
                </div>
            )}
        </DashboardLayout>
    );
}
