import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { User } from '@/types';
import { FormEvent } from 'react';
import { url } from '@/utils';

interface Props {
    user: User;
}

export default function Edit({ user }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name || '',
        email: user.email || '',
        username: user.username || '',
        password: '',
        password_confirmation: '',
        role: user.role || 'user',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        put(url(`/admin/users/${user.id}`));
    };

    return (
        <AdminLayout header="Edit User">
            <Head title={`Edit ${user.name}`} />

            <div className="max-w-2xl">
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

                <form onSubmit={handleSubmit} className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-800 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/20 flex items-center justify-center text-sm font-bold text-violet-300">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">Edit User</h2>
                            <p className="text-sm text-gray-500">Update account details for {user.name}.</p>
                        </div>
                    </div>

                    <div className="p-6 space-y-5">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
                            />
                            {errors.name && <p className="mt-1.5 text-xs text-red-400">{errors.name}</p>}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
                            />
                            {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>}
                        </div>

                        {/* Username */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                            <input
                                type="text"
                                value={data.username}
                                onChange={(e) => setData('username', e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
                            />
                            {errors.username && <p className="mt-1.5 text-xs text-red-400">{errors.username}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Password
                                <span className="text-gray-500 font-normal ml-1">(leave blank to keep current)</span>
                            </label>
                            <input
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
                                placeholder="••••••••"
                            />
                            {errors.password && <p className="mt-1.5 text-xs text-red-400">{errors.password}</p>}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
                            <input
                                type="password"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
                                placeholder="••••••••"
                            />
                            {errors.password_confirmation && (
                                <p className="mt-1.5 text-xs text-red-400">{errors.password_confirmation}</p>
                            )}
                        </div>

                        {/* Role */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                            <select
                                value={data.role}
                                onChange={(e) => setData('role', e.target.value as 'admin' | 'user')}
                                className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                            {errors.role && <p className="mt-1.5 text-xs text-red-400">{errors.role}</p>}
                        </div>
                    </div>

                    <div className="px-6 py-4 bg-gray-950/50 border-t border-gray-800 flex items-center justify-end gap-3">
                        <Link
                            href={url('/admin/users')}
                            className="px-4 py-2.5 text-sm font-medium text-gray-400 hover:text-white border border-gray-700 hover:border-gray-600 rounded-xl transition-all"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors"
                        >
                            {processing ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
