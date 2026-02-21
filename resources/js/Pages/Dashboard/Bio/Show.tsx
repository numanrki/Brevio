import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import { Bio } from '@/types';
import { url } from '@/utils';

interface BioWidget {
    id: number;
    bio_id: number;
    type: string;
    content: Record<string, any>;
    sort_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface ExtendedBio extends Bio {
    avatar?: string | null;
    seo_title?: string | null;
    seo_description?: string | null;
    theme?: Record<string, any> | null;
    custom_css?: string | null;
    widgets?: BioWidget[];
    updated_at?: string;
}

interface Props {
    bio: ExtendedBio;
}

export default function Show({ bio }: Props) {
    const sortedWidgets = [...(bio.widgets || [])].sort((a, b) => a.sort_order - b.sort_order);
    const bioUrl = `${window.location.origin}${url('/bio/' + bio.alias)}`;

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <DashboardLayout header="Bio Page Details">
            <Head title={`Bio - ${bio.name}`} />

            <div className="max-w-2xl">
                <div className="flex items-center justify-between mb-6">
                    <Link
                        href={url('/dashboard/bio')}
                        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Bio Pages
                    </Link>
                    <Link
                        href={url(`/dashboard/bio/${bio.id}/edit`)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                    </Link>
                </div>

                {/* Bio Info */}
                <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden mb-6">
                    <div className="p-6 flex items-start gap-5">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0">
                            {bio.avatar ? (
                                <img src={bio.avatar} alt={bio.name} className="w-16 h-16 rounded-full object-cover" />
                            ) : (
                                <span className="text-2xl font-bold text-white">{bio.name.charAt(0).toUpperCase()}</span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-xl font-bold text-white">{bio.name}</h2>
                            <p className="text-sm text-violet-400 mt-1">/{bio.alias}</p>
                            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                                <span>{bio.views ?? 0} views</span>
                                <span>{sortedWidgets.length} widgets</span>
                                <span>Created {formatDate(bio.created_at)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-3 bg-gray-950/50 border-t border-gray-800">
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-400 truncate flex-1">{bioUrl}</span>
                            <a
                                href={bioUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-medium text-violet-400 bg-violet-500/10 hover:bg-violet-500/20 px-3 py-1.5 rounded-lg transition-colors"
                            >
                                Visit Page →
                            </a>
                        </div>
                    </div>
                </div>

                {/* SEO Info */}
                {(bio.seo_title || bio.seo_description) && (
                    <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden mb-6">
                        <div className="px-6 py-4 border-b border-gray-800">
                            <h3 className="text-sm font-semibold text-white">SEO Settings</h3>
                        </div>
                        <div className="p-6 space-y-3">
                            {bio.seo_title && (
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Title</p>
                                    <p className="text-sm text-gray-300">{bio.seo_title}</p>
                                </div>
                            )}
                            {bio.seo_description && (
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Description</p>
                                    <p className="text-sm text-gray-400">{bio.seo_description}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Widgets */}
                <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-800">
                        <h3 className="text-lg font-semibold text-white">Widgets</h3>
                    </div>
                    {sortedWidgets.length === 0 ? (
                        <div className="p-8 text-center">
                            <p className="text-gray-500 text-sm">No widgets on this bio page.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-800">
                            {sortedWidgets.map((widget, index) => (
                                <div key={widget.id} className="px-6 py-4 flex items-center gap-4">
                                    <span className="text-xs font-mono text-gray-600 w-6 text-center">{index + 1}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm text-white font-medium capitalize">{widget.type}</p>
                                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                                widget.is_active
                                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                    : 'bg-gray-700/50 text-gray-400 border border-gray-700'
                                            }`}>
                                                {widget.is_active ? 'ACTIVE' : 'HIDDEN'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1 truncate">
                                            {JSON.stringify(widget.content)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
