import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { User } from '@/types';
import { url } from '@/utils';

interface Props {
    user: User;
    urls_count: number;
    clicks_count: number;
}

export default function Show({ user, urls_count, clicks_count }: Props) {
    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete "${user.name}"? This action cannot be undone.`)) {
            router.delete(url(`/admin/users/${user.id}`));
        }
    };

    const handleToggleBan = () => {
        const action = user.is_banned ? 'unban' : 'ban';
        if (confirm(`Are you sure you want to ${action} "${user.name}"?`)) {
            router.post(url(`/admin/users/${user.id}/toggle-ban`));
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AdminLayout header="User Details">
            <Head title={`User: ${user.name}`} />

            <div className="max-w-4xl">
                <div className="mb-6">
                    <Link
                        href={url('/admin/users')}
                        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Users
                    </Link>
                </div>

                {/* Profile Card */}
                <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden mb-6">
                    <div className="px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-3xl font-bold text-white flex-shrink-0">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                                <h2 className="text-2xl font-bold text-white truncate">{user.name}</h2>
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                    user.role === 'admin'
                                        ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                                        : 'bg-gray-700/50 text-gray-400 border border-gray-700'
                                }`}>
                                    {user.role.toUpperCase()}
                                </span>
                                {user.is_banned ? (
                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                                        BANNED
                                    </span>
                                ) : (
                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                        ACTIVE
                                    </span>
                                )}
                            </div>
                            <p className="text-gray-400 text-sm">{user.email}</p>
                            {user.username && (
                                <p className="text-gray-500 text-sm mt-0.5">@{user.username}</p>
                            )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <Link
                                href={url(`/admin/users/${user.id}/edit`)}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-xl transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                            </Link>
                            <button
                                onClick={handleToggleBan}
                                className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-colors ${
                                    user.is_banned
                                        ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30'
                                        : 'bg-amber-600/20 text-amber-400 border border-amber-500/30 hover:bg-amber-600/30'
                                }`}
                            >
                                {user.is_banned ? (
                                    <>
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                        Unban
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                        </svg>
                                        Ban
                                    </>
                                )}
                            </button>
                            <button
                                onClick={handleDelete}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600/30 text-sm font-medium rounded-xl transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="rounded-xl bg-gray-900 border border-gray-800 p-6 group hover:border-gray-700 transition-colors">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-400">Links Created</p>
                                <p className="mt-2 text-3xl font-bold text-white">{urls_count.toLocaleString()}</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl bg-gray-900 border border-gray-800 p-6 group hover:border-gray-700 transition-colors">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-400">Total Clicks</p>
                                <p className="mt-2 text-3xl font-bold text-white">{clicks_count.toLocaleString()}</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl bg-gray-900 border border-gray-800 p-6 group hover:border-gray-700 transition-colors">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-400">Plan</p>
                                <p className="mt-2 text-3xl font-bold text-white">{user.plan?.name ?? 'Free'}</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Details */}
                <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-800">
                        <h3 className="text-lg font-semibold text-white">Account Details</h3>
                    </div>
                    <div className="divide-y divide-gray-800/50">
                        <DetailRow label="ID" value={`#${user.id}`} />
                        <DetailRow label="Name" value={user.name} />
                        <DetailRow label="Email" value={user.email} />
                        <DetailRow label="Username" value={user.username ?? '—'} />
                        <DetailRow label="Role" value={user.role.charAt(0).toUpperCase() + user.role.slice(1)} />
                        <DetailRow
                            label="Email Verified"
                            value={user.email_verified_at ? formatDate(user.email_verified_at) : 'Not verified'}
                        />
                        <DetailRow label="API Key" value={user.api_key ?? 'None'} mono />
                        <DetailRow label="Created" value={formatDate(user.created_at)} />
                        <DetailRow label="Last Updated" value={formatDate(user.updated_at)} />
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
    return (
        <div className="flex items-center justify-between px-6 py-3.5">
            <span className="text-sm text-gray-500">{label}</span>
            <span className={`text-sm text-gray-300 ${mono ? 'font-mono text-xs' : ''}`}>{value}</span>
        </div>
    );
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}
