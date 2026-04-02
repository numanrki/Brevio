import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { url } from '@/utils';
import { FormEvent, useRef, useState } from 'react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm<{
        name: string;
        image: File | null;
    }>({
        name: '',
        image: null,
    });

    const fileRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const handleFile = (file: File | null) => {
        setData('image', file);
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => setPreview(e.target?.result as string);
            reader.readAsDataURL(file);
        } else {
            setPreview(null);
        }
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(url('/admin/image-trackers'), {
            forceFormData: true,
        });
    };

    return (
        <AdminLayout header="Upload Tracked Image">
            <Head title="Upload Tracked Image" />

            <div className="max-w-2xl">
                <Link href={url('/admin/image-trackers')} className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white mb-6 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    Back to Image Trackers
                </Link>

                <form onSubmit={submit} className="space-y-6">
                    <div className="rounded-xl bg-gray-900 border border-gray-800 p-6 space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Name *</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="e.g. Team Photo Tracker"
                                className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40"
                            />
                            {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Image *</label>
                            <div
                                onClick={() => fileRef.current?.click()}
                                className="relative cursor-pointer border-2 border-dashed border-gray-700 hover:border-violet-500/50 rounded-xl p-8 text-center transition-colors"
                            >
                                {preview ? (
                                    <div className="space-y-3">
                                        <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                                        <p className="text-xs text-gray-400">{data.image?.name}</p>
                                        <p className="text-xs text-gray-600">Click to change</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <svg className="w-10 h-10 mx-auto text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        <p className="text-sm text-gray-400">Click to select an image</p>
                                        <p className="text-xs text-gray-600">JPG, PNG, GIF, WebP — Max 10 MB</p>
                                    </div>
                                )}
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/gif,image/webp"
                                    onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                                    className="hidden"
                                />
                            </div>
                            {errors.image && <p className="text-xs text-red-400 mt-1">{errors.image}</p>}
                        </div>
                    </div>

                    <div className="rounded-xl bg-gray-900/50 border border-gray-800/50 p-4">
                        <p className="text-xs font-medium text-gray-400 mb-2">How it works</p>
                        <ol className="text-xs text-gray-500 space-y-1 list-decimal list-inside">
                            <li>Upload any image (photo, meme, screenshot, etc.)</li>
                            <li>Get a tracking URL that looks like a normal image link</li>
                            <li>Share the URL anywhere — email, chat, social media, forums</li>
                            <li>When anyone opens the image, their location &amp; device info is recorded</li>
                        </ol>
                    </div>

                    <div className="flex items-center gap-3">
                        <button type="submit" disabled={processing} className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors">
                            {processing ? 'Uploading…' : 'Upload & Create Tracker'}
                        </button>
                        <Link href={url('/admin/image-trackers')} className="px-6 py-2.5 text-sm text-gray-400 hover:text-white transition-colors">Cancel</Link>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
