import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { url } from '@/utils';
import { FormEvent } from 'react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        alias: '',
        avatar: '',
        seo_title: '',
        seo_description: '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(url('/admin/bio'));
    };

    return (
        <AdminLayout header="Create Bio Page">
            <Head title="Create Bio Page" />

            <div className="max-w-2xl">
                <Link href={url('/admin/bio')} className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white mb-6 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    Back to Bio Pages
                </Link>

                <form onSubmit={submit} className="space-y-6">
                    <div className="rounded-xl bg-gray-900 border border-gray-800 p-6 space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Name *</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="My Bio Page"
                                className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40"
                            />
                            {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Alias *</label>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">/bio/</span>
                                <input
                                    type="text"
                                    value={data.alias}
                                    onChange={(e) => setData('alias', e.target.value)}
                                    placeholder="my-page"
                                    className="flex-1 px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40"
                                />
                            </div>
                            {errors.alias && <p className="text-xs text-red-400 mt-1">{errors.alias}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Avatar URL</label>
                            <input
                                type="text"
                                value={data.avatar}
                                onChange={(e) => setData('avatar', e.target.value)}
                                placeholder="https://example.com/avatar.jpg"
                                className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">SEO Title</label>
                            <input
                                type="text"
                                value={data.seo_title}
                                onChange={(e) => setData('seo_title', e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">SEO Description</label>
                            <textarea
                                value={data.seo_description}
                                onChange={(e) => setData('seo_description', e.target.value)}
                                rows={3}
                                className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 resize-none"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-violet-500/20"
                        >
                            {processing ? 'Creating...' : 'Create Bio Page'}
                        </button>
                        <Link href={url('/admin/bio')} className="px-6 py-2.5 text-sm text-gray-400 hover:text-white transition-colors">Cancel</Link>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
