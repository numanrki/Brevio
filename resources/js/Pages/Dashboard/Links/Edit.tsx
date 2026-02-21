import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Url } from '@/types';
import { FormEvent } from 'react';

interface Props {
    url: Url & {
        custom_alias?: string | null;
        description?: string | null;
        password?: string | null;
        domain_id?: number | null;
        campaign_id?: number | null;
    };
}

export default function Edit({ url }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        url: url.url,
        custom_alias: url.custom_alias || '',
        title: url.title || '',
        description: url.description || '',
        password: '',
        expiry_date: url.expiry_date || '',
        is_active: url.is_active,
        is_archived: url.is_archived,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        put(`/dashboard/links/${url.id}`);
    };

    return (
        <DashboardLayout header="Edit Link">
            <Head title={`Edit - /${url.alias}`} />

            <div className="max-w-2xl">
                <div className="mb-6">
                    <Link
                        href={`/dashboard/links/${url.id}`}
                        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Link
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-800">
                        <h2 className="text-lg font-semibold text-white">Edit /{url.alias}</h2>
                        <p className="text-sm text-gray-500 mt-1">Update your shortened link settings.</p>
                    </div>

                    <div className="p-6 space-y-5">
                        {/* Toggles */}
                        <div className="flex flex-wrap gap-6">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <button
                                    type="button"
                                    onClick={() => setData('is_active', !data.is_active)}
                                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                                        data.is_active ? 'bg-emerald-500' : 'bg-gray-700'
                                    }`}
                                >
                                    <span
                                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                                            data.is_active ? 'translate-x-5' : 'translate-x-0'
                                        }`}
                                    />
                                </button>
                                <span className="text-sm text-gray-300">Active</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <button
                                    type="button"
                                    onClick={() => setData('is_archived', !data.is_archived)}
                                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                                        data.is_archived ? 'bg-amber-500' : 'bg-gray-700'
                                    }`}
                                >
                                    <span
                                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                                            data.is_archived ? 'translate-x-5' : 'translate-x-0'
                                        }`}
                                    />
                                </button>
                                <span className="text-sm text-gray-300">Archived</span>
                            </label>
                        </div>

                        {/* Destination URL */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Destination URL *</label>
                            <input
                                type="url"
                                value={data.url}
                                onChange={(e) => setData('url', e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
                                required
                            />
                            {errors.url && <p className="mt-1.5 text-xs text-red-400">{errors.url}</p>}
                        </div>

                        {/* Custom Alias */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Custom Alias</label>
                            <input
                                type="text"
                                value={data.custom_alias}
                                onChange={(e) => setData('custom_alias', e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
                                placeholder={url.alias}
                            />
                            <p className="mt-1.5 text-xs text-gray-500">Current alias: /{url.alias}</p>
                            {errors.custom_alias && <p className="mt-1.5 text-xs text-red-400">{errors.custom_alias}</p>}
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                            <input
                                type="text"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
                                placeholder="Link title for reference"
                            />
                            {errors.title && <p className="mt-1.5 text-xs text-red-400">{errors.title}</p>}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={3}
                                className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all resize-none"
                                placeholder="Optional description..."
                            />
                            {errors.description && <p className="mt-1.5 text-xs text-red-400">{errors.description}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Password Protection</label>
                            <input
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
                                placeholder={url.password ? '••••••• (leave empty to keep)' : 'Leave empty for no password'}
                            />
                            {errors.password && <p className="mt-1.5 text-xs text-red-400">{errors.password}</p>}
                        </div>

                        {/* Expiry Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Expiry Date</label>
                            <input
                                type="datetime-local"
                                value={data.expiry_date}
                                onChange={(e) => setData('expiry_date', e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
                            />
                            {errors.expiry_date && <p className="mt-1.5 text-xs text-red-400">{errors.expiry_date}</p>}
                        </div>
                    </div>

                    <div className="px-6 py-4 bg-gray-950/50 border-t border-gray-800 flex items-center justify-end gap-3">
                        <Link
                            href={`/dashboard/links/${url.id}`}
                            className="px-4 py-2.5 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-sm font-medium rounded-xl transition-all duration-200 disabled:opacity-50"
                        >
                            {processing ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
