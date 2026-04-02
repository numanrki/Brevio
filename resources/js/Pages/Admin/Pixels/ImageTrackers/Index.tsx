import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/Pagination';
import { Head, Link, router } from '@inertiajs/react';
import { PaginatedData, ImageTracker } from '@/types';
import { useState, useCallback } from 'react';
import { url } from '@/utils';

interface Props {
    trackers: PaginatedData<ImageTracker>;
    filters: { search?: string };
}

export default function Index({ trackers, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [copiedId, setCopiedId] = useState<number | null>(null);

    const applyFilters = useCallback(() => {
        const params: Record<string, string> = { search };
        Object.keys(params).forEach((k) => { if (!params[k]) delete params[k]; });
        router.get(url('/admin/image-trackers'), params, { preserveState: true, preserveScroll: true });
    }, [search]);

    const copyUrl = (tracker: ImageTracker) => {
        const trackingUrl = `${window.location.origin}/t/${tracker.token}`;
        navigator.clipboard.writeText(trackingUrl);
        setCopiedId(tracker.id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <AdminLayout header="Image Trackers">
            <Head title="Image Trackers" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div className="relative flex-1 sm:flex-none">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                        placeholder="Search image trackers…"
                        className="w-full sm:w-64 pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                    />
                </div>

                <Link
                    href={url('/admin/image-trackers/create')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-xl transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Upload Image
                </Link>
            </div>

            {trackers.data.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <p className="text-lg font-medium text-gray-400">No image trackers yet</p>
                    <p className="text-sm mt-1">Upload an image to start tracking who views it.</p>
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto rounded-xl border border-gray-800">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-900/60 text-gray-400 text-left">
                                    <th className="px-4 py-3 font-medium">Name</th>
                                    <th className="px-4 py-3 font-medium">File</th>
                                    <th className="px-4 py-3 font-medium text-center">Views</th>
                                    <th className="px-4 py-3 font-medium text-center">Status</th>
                                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800/50">
                                {trackers.data.map((t) => (
                                    <tr key={t.id} className="hover:bg-gray-900/40 transition-colors">
                                        <td className="px-4 py-3">
                                            <Link href={url(`/admin/image-trackers/${t.id}`)} className="text-white hover:text-violet-400 transition-colors font-medium">
                                                {t.name}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs text-gray-500 font-mono">{t.original_name}</span>
                                        </td>
                                        <td className="px-4 py-3 text-center text-gray-300">{t.views_count ?? t.total_views}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                                t.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${t.is_active ? 'bg-emerald-400' : 'bg-red-400'}`} />
                                                {t.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => copyUrl(t)}
                                                    className={`p-1.5 transition-colors ${copiedId === t.id ? 'text-emerald-400' : 'text-gray-500 hover:text-violet-400'}`}
                                                    title={copiedId === t.id ? 'Copied!' : 'Copy tracking URL'}
                                                >
                                                    {copiedId === t.id ? (
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                                    ) : (
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                                    )}
                                                </button>
                                                <Link href={url(`/admin/image-trackers/${t.id}`)} className="p-1.5 text-gray-500 hover:text-white transition-colors" title="View Details">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                </Link>
                                                <button
                                                    onClick={() => { if (confirm('Delete this image tracker?')) router.delete(url(`/admin/image-trackers/${t.id}`)); }}
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
                        links={trackers.links}
                        currentPage={trackers.current_page}
                        lastPage={trackers.last_page}
                    />
                </>
            )}
        </AdminLayout>
    );
}
