import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Domain } from '@/types';
import { url } from '@/utils';
import { FormEvent } from 'react';

interface Props {
    domains: Domain[];
}

export default function Create({ domains }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        url: '',
        alias: '',
        domain_id: '',
        title: '',
        description: '',
        password: '',
        expiry_date: '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(url('/admin/links'));
    };

    return (
        <AdminLayout header="Create Link">
            <Head title="Create Link" />

            <div className="max-w-2xl">
                <Link href={url('/admin/links')} className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white mb-6 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    Back to Links
                </Link>

                <form onSubmit={submit} className="space-y-6">
                    <div className="rounded-xl bg-gray-900 border border-gray-800 p-6 space-y-5">
                        {/* URL */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Destination URL *</label>
                            <input
                                type="url"
                                value={data.url}
                                onChange={(e) => setData('url', e.target.value)}
                                placeholder="https://example.com/long-url"
                                className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40"
                            />
                            {errors.url && <p className="text-xs text-red-400 mt-1">{errors.url}</p>}
                        </div>

                        {/* Alias */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Custom Alias</label>
                            <input
                                type="text"
                                value={data.alias}
                                onChange={(e) => setData('alias', e.target.value)}
                                placeholder="Leave blank to auto-generate"
                                className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40"
                            />
                            {errors.alias && <p className="text-xs text-red-400 mt-1">{errors.alias}</p>}
                        </div>

                        {/* Domain */}
                        {domains.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">Domain</label>
                                <select
                                    value={data.domain_id}
                                    onChange={(e) => setData('domain_id', e.target.value)}
                                    className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40"
                                >
                                    <option value="">Default Domain</option>
                                    {domains.map((d) => (
                                        <option key={d.id} value={d.id}>{d.domain}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Title</label>
                            <input
                                type="text"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                placeholder="Optional title for this link"
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
                                placeholder="Optional description"
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
                                placeholder="Leave blank for no password"
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
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-violet-500/20"
                        >
                            {processing ? 'Creating...' : 'Create Link'}
                        </button>
                        <Link href={url('/admin/links')} className="px-6 py-2.5 text-sm text-gray-400 hover:text-white transition-colors">
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
