import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { url } from '@/utils';
import { FormEvent, useState } from 'react';

interface Widget {
    id?: number;
    type: string;
    content: Record<string, unknown>;
    position: number;
    is_active: boolean;
}

interface BioFull {
    id: number;
    name: string;
    alias: string;
    avatar?: string;
    theme?: Record<string, unknown>;
    custom_css?: string;
    seo_title?: string;
    seo_description?: string;
    is_active: boolean;
    widgets: Widget[];
}

interface Props {
    bio: BioFull;
}

const WIDGET_TYPES = ['link', 'heading', 'text', 'divider', 'image', 'social', 'video', 'spotify', 'map'];

export default function Edit({ bio }: Props) {
    const [widgets, setWidgets] = useState<Widget[]>(bio.widgets || []);

    const { data, setData, put, processing, errors } = useForm({
        name: bio.name,
        alias: bio.alias,
        avatar: bio.avatar || '',
        custom_css: bio.custom_css || '',
        seo_title: bio.seo_title || '',
        seo_description: bio.seo_description || '',
        is_active: bio.is_active,
        theme: JSON.stringify(bio.theme || {}),
        widgets: JSON.stringify(widgets),
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        // Update widgets JSON before submitting
        setData('widgets', JSON.stringify(widgets));
        put(url(`/admin/bio/${bio.id}`));
    };

    const addWidget = (type: string) => {
        const newWidget: Widget = {
            type,
            content: {},
            position: widgets.length,
            is_active: true,
        };
        setWidgets([...widgets, newWidget]);
    };

    const removeWidget = (index: number) => {
        setWidgets(widgets.filter((_, i) => i !== index));
    };

    const moveWidget = (index: number, direction: -1 | 1) => {
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= widgets.length) return;
        const updated = [...widgets];
        [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
        updated.forEach((w, i) => (w.position = i));
        setWidgets(updated);
    };

    const updateWidgetContent = (index: number, key: string, value: string) => {
        const updated = [...widgets];
        updated[index] = { ...updated[index], content: { ...updated[index].content, [key]: value } };
        setWidgets(updated);
    };

    const toggleWidget = (index: number) => {
        const updated = [...widgets];
        updated[index] = { ...updated[index], is_active: !updated[index].is_active };
        setWidgets(updated);
    };

    const handleDelete = () => {
        if (confirm('Delete this bio page? This cannot be undone.')) {
            router.delete(url(`/admin/bio/${bio.id}`));
        }
    };

    return (
        <AdminLayout header="Edit Bio Page">
            <Head title={`Edit Bio: ${bio.name}`} />

            <div className="max-w-3xl">
                <Link href={url('/admin/bio')} className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white mb-6 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    Back to Bio Pages
                </Link>

                <form onSubmit={submit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="rounded-xl bg-gray-900 border border-gray-800 p-6 space-y-5">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Page Settings</h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">Name *</label>
                                <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40" />
                                {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">Alias *</label>
                                <input type="text" value={data.alias} onChange={(e) => setData('alias', e.target.value)} className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40" />
                                {errors.alias && <p className="text-xs text-red-400 mt-1">{errors.alias}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Avatar URL</label>
                            <input type="text" value={data.avatar} onChange={(e) => setData('avatar', e.target.value)} className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">SEO Title</label>
                                <input type="text" value={data.seo_title} onChange={(e) => setData('seo_title', e.target.value)} className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">SEO Description</label>
                                <input type="text" value={data.seo_description} onChange={(e) => setData('seo_description', e.target.value)} className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Custom CSS</label>
                            <textarea value={data.custom_css} onChange={(e) => setData('custom_css', e.target.value)} rows={4} placeholder=".bio-page { }" className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white font-mono placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 resize-none" />
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} className="w-4 h-4 rounded bg-gray-950 border-gray-700 text-violet-500 focus:ring-violet-500/40" />
                            <span className="text-sm text-gray-300">Active</span>
                        </label>
                    </div>

                    {/* Widgets */}
                    <div className="rounded-xl bg-gray-900 border border-gray-800 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Widgets ({widgets.length})</h3>
                        </div>

                        {widgets.length > 0 && (
                            <div className="space-y-3 mb-4">
                                {widgets.map((widget, idx) => (
                                    <div key={idx} className="p-4 bg-gray-950 rounded-lg border border-gray-800">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex flex-col gap-0.5">
                                                    <button type="button" onClick={() => moveWidget(idx, -1)} disabled={idx === 0} className="text-gray-600 hover:text-white disabled:opacity-30 transition-colors">
                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                                                    </button>
                                                    <button type="button" onClick={() => moveWidget(idx, 1)} disabled={idx === widgets.length - 1} className="text-gray-600 hover:text-white disabled:opacity-30 transition-colors">
                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                                    </button>
                                                </div>
                                                <span className="text-sm font-medium text-white capitalize">{widget.type.replace('_', ' ')}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button type="button" onClick={() => toggleWidget(idx)} className={`text-xs px-2 py-0.5 rounded ${widget.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-700 text-gray-500'}`}>
                                                    {widget.is_active ? 'ON' : 'OFF'}
                                                </button>
                                                <button type="button" onClick={() => removeWidget(idx)} className="p-1 text-gray-500 hover:text-red-400 transition-colors">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                        {/* Content fields based on type */}
                                        {(widget.type === 'link' || widget.type === 'heading' || widget.type === 'text') && (
                                            <div className="space-y-2">
                                                <input
                                                    type="text"
                                                    value={(widget.content.title as string) || ''}
                                                    onChange={(e) => updateWidgetContent(idx, 'title', e.target.value)}
                                                    placeholder={widget.type === 'link' ? 'Link title' : 'Text content'}
                                                    className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500/40"
                                                />
                                                {widget.type === 'link' && (
                                                    <input
                                                        type="url"
                                                        value={(widget.content.url as string) || ''}
                                                        onChange={(e) => updateWidgetContent(idx, 'url', e.target.value)}
                                                        placeholder="https://..."
                                                        className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500/40"
                                                    />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Add widget */}
                        <div className="flex flex-wrap gap-2">
                            {WIDGET_TYPES.map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => addWidget(type)}
                                    className="px-3 py-1.5 text-xs font-medium text-gray-400 bg-gray-950 border border-gray-800 rounded-lg hover:text-white hover:border-gray-700 transition-all capitalize"
                                >
                                    + {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button type="submit" disabled={processing} className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-violet-500/20">
                                {processing ? 'Saving...' : 'Save Changes'}
                            </button>
                            <Link href={url('/admin/bio')} className="px-6 py-2.5 text-sm text-gray-400 hover:text-white transition-colors">Cancel</Link>
                        </div>
                        <button type="button" onClick={handleDelete} className="px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all">
                            Delete Bio Page
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
