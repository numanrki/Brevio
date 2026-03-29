import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { url } from '@/utils';
import { FormEvent, useState, useRef } from 'react';

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

const WIDGET_TYPES: { type: string; label: string; icon: string }[] = [
    { type: 'link', label: 'Link', icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' },
    { type: 'heading', label: 'Heading', icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z' },
    { type: 'text', label: 'Text', icon: 'M4 6h16M4 12h16M4 18h7' },
    { type: 'divider', label: 'Divider', icon: 'M20 12H4' },
    { type: 'image', label: 'Image', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { type: 'social', label: 'Social Links', icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z' },
    { type: 'video', label: 'Video', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
    { type: 'spotify', label: 'Spotify', icon: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3' },
    { type: 'map', label: 'Map', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z' },
];

const SOCIAL_PLATFORMS = [
    'twitter', 'instagram', 'facebook', 'tiktok', 'youtube', 'linkedin',
    'github', 'discord', 'twitch', 'snapchat', 'pinterest', 'reddit',
    'telegram', 'whatsapp', 'email', 'website',
];

export default function Edit({ bio }: Props) {
    const [widgets, setWidgets] = useState<Widget[]>(bio.widgets || []);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Form fields (non-widget)
    const [name, setName] = useState(bio.name);
    const [alias, setAlias] = useState(bio.alias);
    const [avatar, setAvatar] = useState(bio.avatar || '');
    const [customCss, setCustomCss] = useState(bio.custom_css || '');
    const [seoTitle, setSeoTitle] = useState(bio.seo_title || '');
    const [seoDescription, setSeoDescription] = useState(bio.seo_description || '');
    const [isActive, setIsActive] = useState(bio.is_active);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        router.put(url(`/admin/bio/${bio.id}`), {
            name,
            alias,
            avatar,
            custom_css: customCss,
            seo_title: seoTitle,
            seo_description: seoDescription,
            is_active: isActive,
            theme: JSON.stringify(bio.theme || {}),
            widgets: JSON.stringify(widgets),
        }, {
            onError: (errs) => setErrors(errs as Record<string, string>),
            onFinish: () => setProcessing(false),
        });
    };

    const addWidget = (type: string) => {
        const defaults: Record<string, Record<string, unknown>> = {
            link: { title: '', url: '' },
            heading: { title: '' },
            text: { title: '' },
            divider: { style: 'solid' },
            image: { url: '', alt: '', link: '' },
            social: { platforms: {} },
            video: { url: '', provider: 'youtube' },
            spotify: { url: '', type: 'track' },
            map: { address: '', lat: '', lng: '' },
        };
        const newWidget: Widget = {
            type,
            content: defaults[type] || {},
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

    const updateWidgetContent = (index: number, key: string, value: unknown) => {
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
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40" />
                                {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">Alias *</label>
                                <input type="text" value={alias} onChange={(e) => setAlias(e.target.value)} className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40" />
                                {errors.alias && <p className="text-xs text-red-400 mt-1">{errors.alias}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Avatar URL</label>
                            <input type="text" value={avatar} onChange={(e) => setAvatar(e.target.value)} className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">SEO Title</label>
                                <input type="text" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">SEO Description</label>
                                <input type="text" value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Custom CSS</label>
                            <textarea value={customCss} onChange={(e) => setCustomCss(e.target.value)} rows={4} placeholder=".bio-page { }" className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white font-mono placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 resize-none" />
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="w-4 h-4 rounded bg-gray-950 border-gray-700 text-violet-500 focus:ring-violet-500/40" />
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
                                                <span className="text-[10px] text-gray-600">#{idx + 1}</span>
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

                                        <WidgetEditor widget={widget} index={idx} updateContent={updateWidgetContent} />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Add widget buttons */}
                        <div className="flex flex-wrap gap-2">
                            {WIDGET_TYPES.map((wt) => (
                                <button
                                    key={wt.type}
                                    type="button"
                                    onClick={() => addWidget(wt.type)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-400 bg-gray-950 border border-gray-800 rounded-lg hover:text-white hover:border-violet-500/30 hover:bg-violet-500/5 transition-all"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d={wt.icon} />
                                    </svg>
                                    {wt.label}
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

/* ─── Widget Editor ─── */

const inputClass = 'w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-violet-500/40';

function WidgetEditor({
    widget,
    index,
    updateContent,
}: {
    widget: Widget;
    index: number;
    updateContent: (index: number, key: string, value: unknown) => void;
}) {
    const c = widget.content;

    switch (widget.type) {
        case 'link':
            return (
                <div className="space-y-2">
                    <input type="text" value={(c.title as string) || ''} onChange={(e) => updateContent(index, 'title', e.target.value)} placeholder="Link title" className={inputClass} />
                    <input type="url" value={(c.url as string) || ''} onChange={(e) => updateContent(index, 'url', e.target.value)} placeholder="https://example.com" className={inputClass} />
                </div>
            );

        case 'heading':
            return (
                <input type="text" value={(c.title as string) || ''} onChange={(e) => updateContent(index, 'title', e.target.value)} placeholder="Heading text" className={inputClass} />
            );

        case 'text':
            return (
                <textarea value={(c.title as string) || ''} onChange={(e) => updateContent(index, 'title', e.target.value)} placeholder="Text content..." rows={3} className={inputClass + ' resize-none'} />
            );

        case 'divider':
            return (
                <select value={(c.style as string) || 'solid'} onChange={(e) => updateContent(index, 'style', e.target.value)} className={inputClass}>
                    <option value="solid">Solid line</option>
                    <option value="dashed">Dashed line</option>
                    <option value="dotted">Dotted line</option>
                    <option value="space">Blank space</option>
                </select>
            );

        case 'image':
            return (
                <div className="space-y-2">
                    <input type="url" value={(c.url as string) || ''} onChange={(e) => updateContent(index, 'url', e.target.value)} placeholder="Image URL (https://...)" className={inputClass} />
                    <input type="text" value={(c.alt as string) || ''} onChange={(e) => updateContent(index, 'alt', e.target.value)} placeholder="Alt text (optional)" className={inputClass} />
                    <input type="url" value={(c.link as string) || ''} onChange={(e) => updateContent(index, 'link', e.target.value)} placeholder="Click-through URL (optional)" className={inputClass} />
                </div>
            );

        case 'social':
            return <SocialEditor platforms={(c.platforms as Record<string, string>) || {}} onChange={(p) => updateContent(index, 'platforms', p)} />;

        case 'video':
            return (
                <div className="space-y-2">
                    <input type="url" value={(c.url as string) || ''} onChange={(e) => updateContent(index, 'url', e.target.value)} placeholder="YouTube or Vimeo URL" className={inputClass} />
                    <select value={(c.provider as string) || 'youtube'} onChange={(e) => updateContent(index, 'provider', e.target.value)} className={inputClass}>
                        <option value="youtube">YouTube</option>
                        <option value="vimeo">Vimeo</option>
                    </select>
                </div>
            );

        case 'spotify':
            return (
                <div className="space-y-2">
                    <input type="url" value={(c.url as string) || ''} onChange={(e) => updateContent(index, 'url', e.target.value)} placeholder="Spotify URL (track, album, or playlist)" className={inputClass} />
                    <select value={(c.type as string) || 'track'} onChange={(e) => updateContent(index, 'type', e.target.value)} className={inputClass}>
                        <option value="track">Track</option>
                        <option value="album">Album</option>
                        <option value="playlist">Playlist</option>
                        <option value="artist">Artist</option>
                    </select>
                </div>
            );

        case 'map':
            return (
                <div className="space-y-2">
                    <input type="text" value={(c.address as string) || ''} onChange={(e) => updateContent(index, 'address', e.target.value)} placeholder="Address or place name" className={inputClass} />
                    <div className="grid grid-cols-2 gap-2">
                        <input type="text" value={(c.lat as string) || ''} onChange={(e) => updateContent(index, 'lat', e.target.value)} placeholder="Latitude (optional)" className={inputClass} />
                        <input type="text" value={(c.lng as string) || ''} onChange={(e) => updateContent(index, 'lng', e.target.value)} placeholder="Longitude (optional)" className={inputClass} />
                    </div>
                </div>
            );

        default:
            return <p className="text-xs text-gray-500">No editor for this widget type.</p>;
    }
}

/* ─── Social Links Editor ─── */

function SocialEditor({
    platforms,
    onChange,
}: {
    platforms: Record<string, string>;
    onChange: (platforms: Record<string, string>) => void;
}) {
    const [showAdd, setShowAdd] = useState(false);
    const activePlatforms = Object.keys(platforms).filter((k) => platforms[k] !== undefined);
    const availablePlatforms = SOCIAL_PLATFORMS.filter((p) => !activePlatforms.includes(p));

    const addPlatform = (platform: string) => {
        onChange({ ...platforms, [platform]: '' });
        setShowAdd(false);
    };

    const removePlatform = (platform: string) => {
        const next = { ...platforms };
        delete next[platform];
        onChange(next);
    };

    const updatePlatform = (platform: string, value: string) => {
        onChange({ ...platforms, [platform]: value });
    };

    const getPlaceholder = (platform: string) => {
        const map: Record<string, string> = {
            twitter: 'https://twitter.com/username',
            instagram: 'https://instagram.com/username',
            facebook: 'https://facebook.com/username',
            tiktok: 'https://tiktok.com/@username',
            youtube: 'https://youtube.com/@channel',
            linkedin: 'https://linkedin.com/in/username',
            github: 'https://github.com/username',
            discord: 'https://discord.gg/invite',
            twitch: 'https://twitch.tv/username',
            snapchat: 'https://snapchat.com/add/username',
            pinterest: 'https://pinterest.com/username',
            reddit: 'https://reddit.com/u/username',
            telegram: 'https://t.me/username',
            whatsapp: 'https://wa.me/1234567890',
            email: 'mailto:you@example.com',
            website: 'https://yourwebsite.com',
        };
        return map[platform] || 'https://...';
    };

    return (
        <div className="space-y-2">
            {activePlatforms.map((platform) => (
                <div key={platform} className="flex items-center gap-2">
                    <span className="w-24 text-xs font-medium text-gray-400 capitalize flex-shrink-0">{platform}</span>
                    <input
                        type="url"
                        value={platforms[platform] || ''}
                        onChange={(e) => updatePlatform(platform, e.target.value)}
                        placeholder={getPlaceholder(platform)}
                        className={inputClass}
                    />
                    <button type="button" onClick={() => removePlatform(platform)} className="p-1 text-gray-500 hover:text-red-400 flex-shrink-0 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            ))}

            {activePlatforms.length === 0 && !showAdd && (
                <p className="text-xs text-gray-600">No social links added yet.</p>
            )}

            {showAdd ? (
                <div className="flex flex-wrap gap-1.5 p-3 bg-gray-900 rounded-lg border border-gray-800">
                    {availablePlatforms.map((p) => (
                        <button key={p} type="button" onClick={() => addPlatform(p)} className="px-2.5 py-1 text-xs font-medium text-gray-400 bg-gray-950 border border-gray-800 rounded-md hover:text-white hover:border-violet-500/30 transition-all capitalize">
                            {p}
                        </button>
                    ))}
                    {availablePlatforms.length === 0 && <p className="text-xs text-gray-500">All platforms added.</p>}
                    <button type="button" onClick={() => setShowAdd(false)} className="px-2.5 py-1 text-xs text-gray-500 hover:text-white transition-colors">Cancel</button>
                </div>
            ) : (
                <button type="button" onClick={() => setShowAdd(true)} className="inline-flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                    Add social platform
                </button>
            )}
        </div>
    );
}
