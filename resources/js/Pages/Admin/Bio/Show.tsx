import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';
import { url } from '@/utils';

interface Widget {
    id: number;
    type: string;
    content: Record<string, unknown>;
    position: number;
    is_active: boolean;
}

interface BioFull {
    id: number;
    name: string;
    alias: string;
    avatar?: string;
    theme?: Record<string, unknown>;
    is_active: boolean;
    views: number;
    created_at: string;
    widgets: Widget[];
}

interface Props {
    bio: BioFull;
}

export default function Show({ bio }: Props) {
    const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return (
        <AdminLayout header="Bio Page Details">
            <Head title={`Bio: ${bio.name}`} />

            <div className="max-w-3xl">
                <Link href={url('/admin/bio')} className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white mb-6 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    Back to Bio Pages
                </Link>

                {/* Header */}
                <div className="rounded-xl bg-gray-900 border border-gray-800 p-6 mb-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                            {bio.avatar && (
                                <img src={bio.avatar} alt={bio.name} className="w-14 h-14 rounded-full object-cover border-2 border-gray-800" />
                            )}
                            <div>
                                <h2 className="text-xl font-bold text-white">{bio.name}</h2>
                                <p className="text-sm text-gray-400">/{bio.alias}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <a href={url(`/bio/${bio.alias}`)} target="_blank" rel="noopener noreferrer" className="px-3 py-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-lg text-sm font-medium hover:bg-cyan-500/20 transition-colors">
                                Preview
                            </a>
                            <Link href={url(`/admin/bio/${bio.id}/edit`)} className="px-3 py-2 bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-lg text-sm font-medium hover:bg-violet-500/20 transition-colors">
                                Edit
                            </Link>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-800">
                        <div>
                            <p className="text-xs text-gray-500 uppercase">Status</p>
                            <div className="mt-1">
                                {bio.is_active ? (
                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">ACTIVE</span>
                                ) : (
                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">INACTIVE</span>
                                )}
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase">Views</p>
                            <p className="text-lg font-bold text-white mt-0.5">{bio.views.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase">Created</p>
                            <p className="text-sm text-gray-300 mt-0.5">{formatDate(bio.created_at)}</p>
                        </div>
                    </div>
                </div>

                {/* Widgets */}
                <div className="rounded-xl bg-gray-900 border border-gray-800 p-6">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Widgets ({bio.widgets.length})</h3>
                    {bio.widgets.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-sm text-gray-500">No widgets added yet. Edit the bio page to add widgets.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {bio.widgets.map((widget, idx) => (
                                <div key={widget.id} className="flex items-center gap-4 p-3 bg-gray-950 rounded-lg border border-gray-800">
                                    <span className="text-xs text-gray-600 w-6 text-center">{idx + 1}</span>
                                    <div className="flex-1 min-w-0">
                                        <span className="text-sm font-medium text-white capitalize">{widget.type.replace('_', ' ')}</span>
                                    </div>
                                    {widget.is_active ? (
                                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">ON</span>
                                    ) : (
                                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-gray-700 text-gray-500">OFF</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
