import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/Pagination';
import { Head, Link, router } from '@inertiajs/react';
import { PaginatedData, User } from '@/types';
import { useState, useCallback, useRef, useEffect } from 'react';
import { url } from '@/utils';

interface Props {
    users: PaginatedData<User>;
    filters: {
        search?: string;
        role?: string;
        banned?: string;
    };
}

export default function Index({ users, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [role, setRole] = useState(filters.role || '');
    const [banned, setBanned] = useState(filters.banned || '');
    const searchTimeout = useRef<ReturnType<typeof setTimeout>>();

    const applyFilters = useCallback(
        (params: Record<string, string>) => {
            router.get(
                url('/admin/users'),
                { ...params },
                { preserveState: true, preserveScroll: true, replace: true }
            );
        },
        []
    );

    useEffect(() => {
        clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            const params: Record<string, string> = {};
            if (search) params.search = search;
            if (role) params.role = role;
            if (banned) params.banned = banned;
            applyFilters(params);
        }, 300);
        return () => clearTimeout(searchTimeout.current);
    }, [search]);

    const handleFilterChange = (key: 'role' | 'banned', value: string) => {
        if (key === 'role') setRole(value);
        if (key === 'banned') setBanned(value);

        const params: Record<string, string> = {};
        if (search) params.search = search;
        if (key === 'role') {
            if (value) params.role = value;
            if (banned) params.banned = banned;
        } else {
            if (role) params.role = role;
            if (value) params.banned = value;
        }
        applyFilters(params);
    };

    const handleDelete = (user: User) => {
        if (confirm(`Are you sure you want to delete "${user.name}"? This action cannot be undone.`)) {
            router.delete(url(`/admin/users/${user.id}`), { preserveScroll: true });
        }
    };

    const handleToggleBan = (user: User) => {
        const action = user.is_banned ? 'unban' : 'ban';
        if (confirm(`Are you sure you want to ${action} "${user.name}"?`)) {
            router.post(url(`/admin/users/${user.id}/toggle-ban`), {}, { preserveScroll: true });
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
        <AdminLayout header="Users">
            <Head title="Manage Users" />

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                    {/* Search */}
                    <div className="relative w-full sm:w-72">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search users..."
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
                        />
                    </div>

                    {/* Role Filter */}
                    <select
                        value={role}
                        onChange={(e) => handleFilterChange('role', e.target.value)}
                        className="px-3 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40"
                    >
                        <option value="">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="user">User</option>
                    </select>

                    {/* Banned Filter */}
                    <select
                        value={banned}
                        onChange={(e) => handleFilterChange('banned', e.target.value)}
                        className="px-3 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40"
                    >
                        <option value="">All Status</option>
                        <option value="1">Banned</option>
                        <option value="0">Active</option>
                    </select>
                </div>

                <Link
                    href={url('/admin/users/create')}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-xl transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add User
                </Link>
            </div>

            {/* Table */}
            <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-800">
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">User</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Role</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Joined</th>
                                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {users.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
                                                <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                </svg>
                                            </div>
                                            <p className="text-gray-500 text-sm">No users found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                users.data.map((user) => (
                                    <tr key={user.id} className="group hover:bg-gray-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/20 flex items-center justify-center text-sm font-bold text-violet-300 flex-shrink-0">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <Link
                                                        href={url(`/admin/users/${user.id}`)}
                                                        className="text-sm font-medium text-white hover:text-violet-400 transition-colors truncate block"
                                                    >
                                                        {user.name}
                                                    </Link>
                                                    {user.username && (
                                                        <p className="text-xs text-gray-500 truncate">@{user.username}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                                user.role === 'admin'
                                                    ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                                                    : 'bg-gray-700/50 text-gray-400 border border-gray-700'
                                            }`}>
                                                {user.role.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.is_banned ? (
                                                <span className="inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                                                    BANNED
                                                </span>
                                            ) : (
                                                <span className="inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                    ACTIVE
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-sm whitespace-nowrap">
                                            {formatDate(user.created_at)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <Link
                                                    href={url(`/admin/users/${user.id}`)}
                                                    className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
                                                    title="View"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </Link>
                                                <Link
                                                    href={url(`/admin/users/${user.id}/edit`)}
                                                    className="p-2 text-gray-500 hover:text-violet-400 hover:bg-violet-500/10 rounded-lg transition-all"
                                                    title="Edit"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </Link>
                                                <button
                                                    onClick={() => handleToggleBan(user)}
                                                    className={`p-2 rounded-lg transition-all ${
                                                        user.is_banned
                                                            ? 'text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/10'
                                                            : 'text-gray-500 hover:text-amber-400 hover:bg-amber-500/10'
                                                    }`}
                                                    title={user.is_banned ? 'Unban' : 'Ban'}
                                                >
                                                    {user.is_banned ? (
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                        </svg>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user)}
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
                        Showing <span className="text-gray-300">{users.data.length}</span> of{' '}
                        <span className="text-gray-300">{users.total}</span> users
                    </p>
                    <Pagination links={users.links} currentPage={users.current_page} lastPage={users.last_page} />
                </div>
            </div>
        </AdminLayout>
    );
}
