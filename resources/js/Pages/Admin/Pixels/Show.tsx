import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';
import { Pixel, TimeSeriesPoint } from '@/types';
import { url } from '@/utils';
import { useState } from 'react';

interface Props {
    pixel: Pixel;
    fires_stats: TimeSeriesPoint[];
    embed_codes: { image: string; script: string };
}

export default function Show({ pixel, fires_stats, embed_codes }: Props) {
    const maxCount = Math.max(...fires_stats.map((f) => f.count), 1);
    const [copied, setCopied] = useState<string | null>(null);

    const copyCode = (code: string, label: string) => {
        navigator.clipboard.writeText(code);
        setCopied(label);
        setTimeout(() => setCopied(null), 2000);
    };

    const typeLabel = (t: string) => {
        switch (t) {
            case 'page_view': return 'Page View';
            case 'conversion': return 'Conversion';
            case 'custom': return 'Custom';
            default: return t;
        }
    };

    return (
        <AdminLayout header={pixel.name}>
            <Head title={pixel.name} />

            <div className="max-w-4xl">
                <div className="flex items-center justify-between mb-6">
                    <Link href={url('/admin/pixels')} className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        Back to Pixels
                    </Link>
                    <div className="flex items-center gap-2">
                        <Link href={url(`/admin/pixels/${pixel.id}/analytics`)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                            Analytics
                        </Link>
                        <Link href={url(`/admin/pixels/${pixel.id}/edit`)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-white bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            Edit
                        </Link>
                    </div>
                </div>

                {/* Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Fires</p>
                        <p className="text-2xl font-bold text-white">{pixel.total_fires.toLocaleString()}</p>
                    </div>
                    <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Type</p>
                        <p className="text-lg font-semibold text-white">{typeLabel(pixel.type)}</p>
                    </div>
                    <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Status</p>
                        <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${pixel.is_active ? 'text-emerald-400' : 'text-red-400'}`}>
                            <span className={`w-2 h-2 rounded-full ${pixel.is_active ? 'bg-emerald-400' : 'bg-red-400'}`} />
                            {pixel.is_active ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>

                {/* Embed Codes */}
                <div className="rounded-xl bg-gray-900 border border-gray-800 p-6 mb-6 space-y-5">
                    <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Embed Code</h3>
                    <p className="text-sm text-gray-500">Add one of these snippets to your website to track visits.</p>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-medium text-gray-400">Image Pixel (recommended)</p>
                            <button onClick={() => copyCode(embed_codes.image, 'image')} className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
                                {copied === 'image' ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                        <pre className="px-4 py-3 bg-gray-950 border border-gray-800 rounded-lg text-xs text-gray-300 overflow-x-auto whitespace-pre-wrap break-all">
                            {embed_codes.image}
                        </pre>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-medium text-gray-400">JavaScript Snippet</p>
                            <button onClick={() => copyCode(embed_codes.script, 'script')} className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
                                {copied === 'script' ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                        <pre className="px-4 py-3 bg-gray-950 border border-gray-800 rounded-lg text-xs text-gray-300 overflow-x-auto whitespace-pre-wrap break-all">
                            {embed_codes.script}
                        </pre>
                    </div>
                </div>

                {/* 30-day chart */}
                <div className="rounded-xl bg-gray-900 border border-gray-800 p-6">
                    <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Fires (Last 30 Days)</h3>
                    {fires_stats.length === 0 ? (
                        <p className="text-sm text-gray-500">No fire data yet.</p>
                    ) : (
                        <div className="flex items-end gap-1 h-32">
                            {fires_stats.map((point) => (
                                <div key={point.date} className="flex-1 flex flex-col items-center gap-1" title={`${point.date}: ${point.count}`}>
                                    <div
                                        className="w-full bg-violet-500/30 rounded-t-sm min-h-[2px]"
                                        style={{ height: `${(point.count / maxCount) * 100}%` }}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
