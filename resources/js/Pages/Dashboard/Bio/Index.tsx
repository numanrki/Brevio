import DashboardLayout from '@/Layouts/DashboardLayout';
import Pagination from '@/Components/Pagination';
import { Head, Link, router } from '@inertiajs/react';
import { PaginatedData, Bio } from '@/types';
import { url } from '@/utils';

interface ExtendedBio extends Bio {
    avatar?: string | null;
    widgets?: { id: number }[];
    seo_title?: string | null;
}

interface Props {
    bios: PaginatedData<ExtendedBio>;
}

export default function Index({ bios }: Props) {
    const handleDelete = (bio: ExtendedBio) => {
        if (confirm(`Are you sure you want to delete "${bio.name}"? This cannot be undone.`)) {
            router.delete(url(`/dashboard/bio/${bio.id}`), { preserveScroll: true });
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
        <DashboardLayout header="Bio Pages">
            <Head title="Bio Pages" />

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <p className="text-gray-400 text-sm">Create and manage your bio link pages.</p>
                <Link
                    href={url('/dashboard/bio/create')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-sm font-medium rounded-xl transition-all duration-200"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Bio Page
                </Link>
            </div>

            {/* Bio Cards */}
            {bios.data.length === 0 ? (
                <div className="rounded-xl bg-gray-900 border border-gray-800 p-12 text-center">
                    <svg className="w-12 h-12 text-gray-700 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <p className="text-gray-500 text-sm mb-4">No bio pages yet.</p>
                    <Link
                        href={url('/dashboard/bio/create')}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-xl transition-colors"
                    >
                        Create your first bio page
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {bios.data.map((bio) => (
                        <div key={bio.id} className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden hover:border-gray-700 transition-colors">
                            <div className="p-5">
                                <div className="flex items-start gap-4">
                                    {/* Avatar */}
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0">
                                        {bio.avatar ? (
                                            <img src={bio.avatar} alt={bio.name} className="w-12 h-12 rounded-full object-cover" />
                                        ) : (
                                            <span className="text-lg font-bold text-white">{bio.name.charAt(0).toUpperCase()}</span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-white font-semibold truncate">{bio.name}</h3>
                                        <p className="text-sm text-gray-500">/{bio.alias}</p>
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                                        </svg>
                                        {bio.widgets?.length ?? 0} widgets
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        {bio.views ?? 0} views
                                    </span>
                                    <span>{formatDate(bio.created_at)}</span>
                                </div>
                            </div>

                            <div className="px-5 py-3 bg-gray-950/50 border-t border-gray-800 flex items-center gap-2">
                                <Link
                                    href={url(`/dashboard/bio/${bio.id}`)}
                                    className="flex-1 text-center px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
                                >
                                    View
                                </Link>
                                <Link
                                    href={url(`/dashboard/bio/${bio.id}/edit`)}
                                    className="flex-1 text-center px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
                                >
                                    Edit
                                </Link>
                                <button
                                    onClick={() => handleDelete(bio)}
                                    className="flex-1 text-center px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {bios.data.length > 0 && (
                <div className="mt-6">
                    <Pagination links={bios.links} currentPage={bios.current_page} lastPage={bios.last_page} />
                </div>
            )}
        </DashboardLayout>
    );
}
