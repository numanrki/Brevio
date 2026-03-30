import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Pixel } from '@/types';
import { url } from '@/utils';
import { FormEvent } from 'react';

interface Props {
    pixel: Pixel;
}

export default function Edit({ pixel }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: pixel.name,
        type: pixel.type,
        is_active: pixel.is_active,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        put(url(`/admin/pixels/${pixel.id}`));
    };

    return (
        <AdminLayout header="Edit Pixel">
            <Head title="Edit Pixel" />

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

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Token</label>
                            <div className="px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-gray-500 font-mono">
                                {pixel.token}
                            </div>
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
                            {processing ? 'Saving…' : 'Save Changes'}
                        </button>
                        <Link href={url('/admin/pixels')} className="px-6 py-2.5 text-sm text-gray-400 hover:text-white transition-colors">Cancel</Link>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
