import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/Pagination';
import { Head, Link, router } from '@inertiajs/react';
import { PaginatedData, Pixel } from '@/types';
import { useState, useCallback } from 'react';
import { url } from '@/utils';

interface Props {
    pixels: PaginatedData<Pixel>;
    filters: { search?: string; type?: string };
}

export default function Index({ pixels, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [copiedId, setCopiedId] = useState<number | null>(null);

    const copyPixelCode = (px: Pixel) => {
        const base = window.location.origin;
        const code = `<script src="${base}/pixel/${px.token}.js" async></script>`;
        navigator.clipboard.writeText(code);
        setCopiedId(px.id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const applyFilters = useCallback(
        (overrides: Record<string, string> = {}) => {
            const params: Record<string, string> = { search, ...overrides };
            Object.keys(params).forEach((k) => { if (!params[k]) delete params[k]; });
            router.get(url('/admin/pixels'), params, { preserveState: true, preserveScroll: true });
        },
        [search],
    );

    const typeLabel = (t: string) => {
        switch (t) {
            case 'page_view': return 'Page View';
            case 'conversion': return 'Conversion';
            case 'custom': return 'Custom';
            default: return t;
        }
    };

    return (
        <AdminLayout header="Tracking Pixels">
            <Head title="Tracking Pixels" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                            placeholder="Search pixels…"
                            className="w-full sm:w-64 pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                        />
                    </div>
                    <select
                        value={filters.type || ''}
                        onChange={(e) => applyFilters({ type: e.target.value })}
                        className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-xl text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                    >
                        <option value="">All Types</option>
                        <option value="page_view">Page View</option>
                        <option value="conversion">Conversion</option>
                        <option value="custom">Custom</option>
                    </select>
                </div>

                <Link
                    href={url('/admin/pixels/create')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-xl transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Create Pixel
                </Link>
            </div>

            {pixels.data.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    <p className="text-lg font-medium text-gray-400">No pixels yet</p>
                    <p className="text-sm mt-1">Create your first tracking pixel to monitor page views.</p>
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto rounded-xl border border-gray-800">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-900/60 text-gray-400 text-left">
                                    <th className="px-4 py-3 font-medium">Name</th>
                                    <th className="px-4 py-3 font-medium">Type</th>
                                    <th className="px-4 py-3 font-medium text-center">Fires</th>
                                    <th className="px-4 py-3 font-medium text-center">Status</th>
                                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800/50">
                                {pixels.data.map((px) => (
                                    <tr key={px.id} className="hover:bg-gray-900/40 transition-colors">
                                        <td className="px-4 py-3">
                                            <Link href={url(`/admin/pixels/${px.id}`)} className="text-white hover:text-violet-400 transition-colors font-medium">
                                                {px.name}
                                            </Link>
                                            <p className="text-xs text-gray-500 mt-0.5 font-mono">{px.token}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-0.5 bg-gray-800 text-gray-300 rounded text-xs">{typeLabel(px.type)}</span>
                                        </td>
                                        <td className="px-4 py-3 text-center text-gray-300">{px.fires_count ?? px.total_fires}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                                px.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${px.is_active ? 'bg-emerald-400' : 'bg-red-400'}`} />
                                                {px.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => copyPixelCode(px)}
                                                    className={`p-1.5 transition-colors ${copiedId === px.id ? 'text-emerald-400' : 'text-gray-500 hover:text-violet-400'}`}
                                                    title={copiedId === px.id ? 'Copied!' : 'Copy embed code'}
                                                >
                                                    {copiedId === px.id ? (
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                                    ) : (
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                                    )}
                                                </button>
                                                <Link href={url(`/admin/pixels/${px.id}/analytics`)} className="p-1.5 text-gray-500 hover:text-white transition-colors" title="Analytics">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                                </Link>
                                                <Link href={url(`/admin/pixels/${px.id}/edit`)} className="p-1.5 text-gray-500 hover:text-white transition-colors" title="Edit">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                </Link>
                                                <button
                                                    onClick={() => { if (confirm('Delete this pixel?')) router.delete(url(`/admin/pixels/${px.id}`)); }}
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
                        links={pixels.links}
                        currentPage={pixels.current_page}
                        lastPage={pixels.last_page}
                    />
                </>
            )}
        </AdminLayout>
    );
}
