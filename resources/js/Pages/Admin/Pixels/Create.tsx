import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { url } from '@/utils';
import { FormEvent } from 'react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        type: 'page_view',
        is_active: true,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(url('/admin/pixels'));
    };

    return (
        <AdminLayout header="Create Pixel">
            <Head title="Create Pixel" />

            <div className="max-w-2xl">
                <Link href={url('/admin/pixels')} className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white mb-6 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    Back to Pixels
                </Link>

                <form onSubmit={submit} className="space-y-6">
                    <div className="rounded-xl bg-gray-900 border border-gray-800 p-6 space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Name *</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="e.g. Homepage Pixel"
                                className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40"
                            />
                            {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Type *</label>
                            <select
                                value={data.type}
                                onChange={(e) => setData('type', e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40"
                            >
                                <option value="page_view">Page View</option>
                                <option value="conversion">Conversion</option>
                                <option value="custom">Custom Event</option>
                            </select>
                            {errors.type && <p className="text-xs text-red-400 mt-1">{errors.type}</p>}
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                                className="w-4 h-4 bg-gray-950 border-gray-700 rounded text-violet-500 focus:ring-violet-500/40"
                            />
                            <label className="text-sm text-gray-300">Active</label>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button type="submit" disabled={processing} className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors">
                            {processing ? 'Creating…' : 'Create Pixel'}
                        </button>
                        <Link href={url('/admin/pixels')} className="px-6 py-2.5 text-sm text-gray-400 hover:text-white transition-colors">Cancel</Link>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
