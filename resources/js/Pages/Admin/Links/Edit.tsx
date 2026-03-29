import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { Url } from '@/types';
import { url } from '@/utils';
import { FormEvent } from 'react';

interface Props {
    url: Url;
}

export default function Edit({ url: link }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        url: link.url,
        title: link.title || '',
        description: link.description || '',
        password: '',
        expiry_date: link.expiry_date ? link.expiry_date.slice(0, 16) : '',
        is_active: link.is_active,
        is_archived: link.is_archived,
        apply_timer: link.meta?.apply_timer || false,
        show_button: link.meta?.show_button || false,
        timer_duration: String(link.meta?.timer_duration || 10),
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        put(url(`/admin/links/${link.id}`));
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this link? This cannot be undone.')) {
            router.delete(url(`/admin/links/${link.id}`));
        }
    };

    return (
        <AdminLayout header="Edit Link">
            <Head title={`Edit: ${link.alias}`} />

            <div className="max-w-2xl">
                <Link href={url('/admin/links')} className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white mb-6 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    Back to Links
                </Link>

                <form onSubmit={submit} className="space-y-6">
                    <div className="rounded-xl bg-gray-900 border border-gray-800 p-6 space-y-5">
                        {/* Alias (read-only) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Alias</label>
                            <div className="px-4 py-2.5 bg-gray-950/50 border border-gray-800 rounded-xl text-sm text-gray-500">
                                /{link.alias}
                            </div>
                        </div>

                        {/* URL */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Destination URL *</label>
                            <input
                                type="url"
                                value={data.url}
                                onChange={(e) => setData('url', e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40"
                            />
                            {errors.url && <p className="text-xs text-red-400 mt-1">{errors.url}</p>}
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Title</label>
                            <input
                                type="text"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={3}
                                className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 resize-none"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Password Protection</label>
                            <input
                                type="text"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Leave blank to keep current"
                                className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40"
                            />
                        </div>

                        {/* Expiry Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Expiry Date</label>
                            <input
                                type="datetime-local"
                                value={data.expiry_date}
                                onChange={(e) => setData('expiry_date', e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40"
                            />
                        </div>

                        {/* Toggles */}
                        <div className="flex items-center gap-6 pt-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="w-4 h-4 rounded bg-gray-950 border-gray-700 text-violet-500 focus:ring-violet-500/40"
                                />
                                <span className="text-sm text-gray-300">Active</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.is_archived}
                                    onChange={(e) => setData('is_archived', e.target.checked)}
                                    className="w-4 h-4 rounded bg-gray-950 border-gray-700 text-violet-500 focus:ring-violet-500/40"
                                />
                                <span className="text-sm text-gray-300">Archived</span>
                            </label>
                        </div>
                    </div>

                    {/* Interstitial Options */}
                    <div className="rounded-xl bg-gray-900 border border-gray-800 p-6 space-y-5">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Redirect Behavior</h3>
                        <p className="text-xs text-gray-500 -mt-2">Control what happens when someone opens this short link.</p>

                        <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg bg-gray-950 border border-gray-800 hover:border-violet-500/20 transition-colors">
                            <input
                                type="checkbox"
                                checked={data.apply_timer}
                                onChange={(e) => setData('apply_timer', e.target.checked)}
                                className="w-4 h-4 mt-0.5 rounded bg-gray-950 border-gray-700 text-violet-500 focus:ring-violet-500/40"
                            />
                            <div>
                                <span className="text-sm font-medium text-gray-200 block">Apply Timer</span>
                                <span className="text-xs text-gray-500">Show a countdown timer before redirecting to the destination URL.</span>
                            </div>
                        </label>

                        {data.apply_timer && (
                            <div className="pl-7">
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">Timer Duration (seconds)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="60"
                                    value={data.timer_duration}
                                    onChange={(e) => setData('timer_duration', e.target.value)}
                                    className="w-32 px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40"
                                />
                            </div>
                        )}

                        <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg bg-gray-950 border border-gray-800 hover:border-violet-500/20 transition-colors">
                            <input
                                type="checkbox"
                                checked={data.show_button}
                                onChange={(e) => setData('show_button', e.target.checked)}
                                className="w-4 h-4 mt-0.5 rounded bg-gray-950 border-gray-700 text-violet-500 focus:ring-violet-500/40"
                            />
                            <div>
                                <span className="text-sm font-medium text-gray-200 block">Show "Click Here" Button</span>
                                <span className="text-xs text-gray-500">Instead of auto-redirecting after timer, show a button for the user to click.</span>
                            </div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-violet-500/20"
                            >
                                {processing ? 'Saving...' : 'Save Changes'}
                            </button>
                            <Link href={url('/admin/links')} className="px-6 py-2.5 text-sm text-gray-400 hover:text-white transition-colors">
                                Cancel
                            </Link>
                        </div>
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all"
                        >
                            Delete Link
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
