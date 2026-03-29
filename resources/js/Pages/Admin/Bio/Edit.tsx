import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { url } from '@/utils';
import { FormEvent, useState, useRef, useMemo, ChangeEvent } from 'react';
import { SocialIcon, SOCIAL_ICON_MAP } from '@/Components/SocialIcons';

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
    { type: 'products', label: 'Products', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
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
    const [avatarUploading, setAvatarUploading] = useState(false);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatarUploading(true);
        const formData = new FormData();
        formData.append('avatar', file);
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            const res = await fetch(url('/admin/bio/upload-avatar'), {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': csrfToken, Accept: 'application/json' },
                body: formData,
            });
            const json = await res.json();
            if (json.success) {
                setAvatar(json.url);
            }
        } catch { /* ignore */ } finally {
            setAvatarUploading(false);
            if (avatarInputRef.current) avatarInputRef.current.value = '';
        }
    };

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
            products: { items: [{ image: '', title: '', description: '', url: '', buttonText: 'Buy Now' }] },
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

            <div className="max-w-6xl">
                <Link href={url('/admin/bio')} className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white mb-6 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    Back to Bio Pages
                </Link>

                <div className="grid grid-cols-1 xl:grid-cols-[1fr,380px] gap-6 items-start">
                {/* Left — Form */}
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
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Avatar</label>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-gray-700 overflow-hidden bg-gray-950 flex items-center justify-center">
                                    {avatar ? (
                                        <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    )}
                                </div>
                                <div className="flex-1 flex gap-2">
                                    <input type="text" value={avatar} onChange={(e) => setAvatar(e.target.value)} placeholder="https://example.com/avatar.jpg" className="flex-1 px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40" />
                                    <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={handleAvatarUpload} className="hidden" />
                                    <button type="button" onClick={() => avatarInputRef.current?.click()} disabled={avatarUploading} className="px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-300 hover:text-white hover:border-violet-500/30 transition-all disabled:opacity-50 whitespace-nowrap">
                                        {avatarUploading ? 'Uploading…' : 'Upload'}
                                    </button>
                                </div>
                            </div>
                            {avatar && (
                                <button type="button" onClick={() => setAvatar('')} className="text-xs text-red-400 hover:text-red-300 transition-colors">Remove avatar</button>
                            )}
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

                {/* Right — Live Preview */}
                <div className="sticky top-6">
                    <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Live Preview</h3>
                            <a href={url(`/bio/${alias}`)} target="_blank" rel="noopener noreferrer" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
                                Open →
                            </a>
                        </div>
                        {/* Phone frame */}
                        <div className="p-4 bg-gray-950">
                            <div className="mx-auto w-full max-w-[320px] rounded-2xl overflow-hidden border border-gray-700 shadow-2xl" style={{ height: '580px' }}>
                                <BioPreview name={name} alias={alias} avatar={avatar} widgets={widgets} theme={bio.theme || {}} />
                            </div>
                        </div>
                    </div>
                </div>
                </div>
            </div>
        </AdminLayout>
    );
}

/* ─── Bio Live Preview ─── */

function BioPreview({ name, alias, avatar, widgets, theme: rawTheme }: { name: string; alias: string; avatar: string; widgets: Widget[]; theme: Record<string, unknown> }) {
    const t = {
        background: (rawTheme.background as string) || '#0f0f1a',
        textColor: (rawTheme.textColor as string) || '#ffffff',
        buttonStyle: (rawTheme.buttonStyle as string) || 'filled',
        buttonColor: (rawTheme.buttonColor as string) || '#7c3aed',
        buttonTextColor: (rawTheme.buttonTextColor as string) || '#ffffff',
        buttonRadius: (rawTheme.buttonRadius as string) || '9999px',
        fontFamily: (rawTheme.fontFamily as string) || 'system-ui, sans-serif',
        backgroundType: (rawTheme.backgroundType as string) || 'solid',
        gradientFrom: (rawTheme.gradientFrom as string) || '#7c3aed',
        gradientTo: (rawTheme.gradientTo as string) || '#ec4899',
    };

    const bg = t.backgroundType === 'gradient'
        ? `linear-gradient(135deg, ${t.gradientFrom}, ${t.gradientTo})`
        : t.background;

    const btnBase: React.CSSProperties = {
        borderRadius: t.buttonRadius, fontFamily: t.fontFamily,
        padding: '10px 16px', fontSize: '12px', fontWeight: 500,
        width: '100%', textAlign: 'center', display: 'block',
        textDecoration: 'none', cursor: 'default',
    };
    const btnStyle: React.CSSProperties = t.buttonStyle === 'outline'
        ? { ...btnBase, background: 'transparent', border: `2px solid ${t.buttonColor}`, color: t.buttonColor }
        : t.buttonStyle === 'soft'
        ? { ...btnBase, background: t.buttonColor + '20', border: 'none', color: t.buttonColor }
        : t.buttonStyle === 'shadow'
        ? { ...btnBase, background: t.buttonColor, border: 'none', color: t.buttonTextColor, boxShadow: `0 4px 12px ${t.buttonColor}40` }
        : { ...btnBase, background: t.buttonColor, border: 'none', color: t.buttonTextColor };

    const activeWidgets = widgets.filter((w) => w.is_active);

    return (
        <div style={{ background: bg, height: '100%', fontFamily: t.fontFamily, overflowY: 'auto' }}>
            <div style={{ maxWidth: '320px', margin: '0 auto', padding: '28px 16px 40px' }}>
                {/* Avatar */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', border: `2px solid ${t.buttonColor}`, overflow: 'hidden', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {avatar ? (
                            <img src={avatar} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${t.buttonColor}, ${t.gradientTo})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ fontSize: '22px', fontWeight: 700, color: '#fff' }}>{name ? name.charAt(0).toUpperCase() : '?'}</span>
                            </div>
                        )}
                    </div>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: t.textColor, margin: 0 }}>{name || 'Untitled'}</p>
                    <p style={{ fontSize: '10px', color: t.textColor, opacity: 0.5, margin: '2px 0 0' }}>@{alias || '...'}</p>
                </div>

                {/* Widgets */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {activeWidgets.length === 0 && (
                        <p style={{ textAlign: 'center', fontSize: '11px', color: t.textColor, opacity: 0.4 }}>Add widgets to see them here</p>
                    )}
                    {activeWidgets.map((w, i) => {
                        if (w.type === 'link') return <div key={i} style={btnStyle}>{(w.content.title as string) || 'Untitled Link'}</div>;
                        if (w.type === 'heading') return <div key={i} style={{ padding: '8px 0 2px', textAlign: 'center' }}><p style={{ fontSize: '12px', fontWeight: 600, color: t.textColor, margin: 0 }}>{(w.content.text as string) || (w.content.title as string) || ''}</p></div>;
                        if (w.type === 'text') return <div key={i} style={{ textAlign: 'center' }}><p style={{ fontSize: '10px', color: t.textColor, opacity: 0.7, margin: 0, lineHeight: 1.5 }}>{(w.content.text as string) || (w.content.title as string) || ''}</p></div>;
                        if (w.type === 'divider') {
                            const ds = (w.content.style as string) || 'solid';
                            return ds === 'space' ? <div key={i} style={{ height: '16px' }} /> : <hr key={i} style={{ border: 'none', borderTop: `1px ${ds} ${t.textColor}25`, margin: '4px 0' }} />;
                        }
                        if (w.type === 'image' && w.content.url) return <img key={i} src={w.content.url as string} alt="" style={{ width: '100%', borderRadius: '8px', display: 'block' }} />;
                        if (w.type === 'social') {
                            const plats = (w.content.platforms as Record<string, string>) || {};
                            const entries = Object.entries(plats).filter(([, v]) => v);
                            return (
                                <div key={i} style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '8px 0', flexWrap: 'wrap' }}>
                                    {entries.map(([k]) => {
                                        const cfg = SOCIAL_ICON_MAP[k];
                                        return (
                                            <div key={k} style={{ width: '32px', height: '32px', borderRadius: '50%', background: cfg ? cfg.color : t.textColor + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <SocialIcon platform={k} size={16} color="#ffffff" />
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        }
                        if (w.type === 'video') return <div key={i} style={{ borderRadius: '8px', background: t.textColor + '10', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: '10px', color: t.textColor, opacity: 0.5 }}>▶ Video</span></div>;
                        if (w.type === 'spotify') return <div key={i} style={{ borderRadius: '8px', background: '#1DB954' + '20', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: '10px', color: '#1DB954' }}>♫ Spotify</span></div>;
                        if (w.type === 'map') return <div key={i} style={{ borderRadius: '8px', background: t.textColor + '10', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: '10px', color: t.textColor, opacity: 0.5 }}>📍 Map</span></div>;
                        if (w.type === 'products') {
                            const items = (w.content.items as Array<{ image: string; title: string; description: string; url: string; buttonText: string }>) || [];
                            if (items.length === 0) return <div key={i} style={{ padding: '8px', textAlign: 'center' }}><span style={{ fontSize: '9px', color: t.textColor, opacity: 0.4 }}>No products</span></div>;
                            return (
                                <div key={i} style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px', scrollbarWidth: 'none' }}>
                                    {items.map((p, pi) => (
                                        <div key={pi} style={{ flex: '0 0 100px', borderRadius: '8px', overflow: 'hidden', background: t.textColor + '08', border: `1px solid ${t.textColor}10` }}>
                                            {p.image ? (
                                                <img src={p.image} alt="" style={{ width: '100%', height: '64px', objectFit: 'cover', display: 'block' }} />
                                            ) : (
                                                <div style={{ width: '100%', height: '64px', background: t.buttonColor + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <span style={{ fontSize: '16px' }}>🛍️</span>
                                                </div>
                                            )}
                                            <div style={{ padding: '6px' }}>
                                                <p style={{ fontSize: '8px', fontWeight: 600, color: t.textColor, margin: 0, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title || 'Product'}</p>
                                                <div style={{ marginTop: '4px', padding: '3px 6px', borderRadius: t.buttonRadius, background: t.buttonColor, textAlign: 'center' }}>
                                                    <span style={{ fontSize: '7px', fontWeight: 600, color: t.buttonTextColor }}>{p.buttonText || 'Buy'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        }
                        return null;
                    })}
                </div>

                <p style={{ textAlign: 'center', fontSize: '8px', color: t.textColor, opacity: 0.2, marginTop: '24px', marginBottom: '2px' }}>Powered by Brevio</p>
                <p style={{ textAlign: 'center', fontSize: '7px', color: t.textColor, opacity: 0.15 }}>Designed & Developed by Numan Rasheed</p>
            </div>
        </div>
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
            return <ImageEditor content={c} index={index} updateContent={updateContent} />;

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

        case 'products':
            return <ProductsEditor content={c} index={index} updateContent={updateContent} />;

        default:
            return <p className="text-xs text-gray-500">No editor for this widget type.</p>;
    }
}

/* ─── Image Upload Editor ─── */

function ImageEditor({
    content: c,
    index,
    updateContent,
}: {
    content: Record<string, unknown>;
    index: number;
    updateContent: (index: number, key: string, value: unknown) => void;
}) {
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (file: File) => {
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', file);
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            const res = await fetch(url('/admin/bio/upload-image'), {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': csrfToken, Accept: 'application/json' },
                body: formData,
            });
            const data = await res.json();
            if (data.success && data.url) {
                updateContent(index, 'url', data.url);
            }
        } catch {
            // silently fail
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <input type="url" value={(c.url as string) || ''} onChange={(e) => updateContent(index, 'url', e.target.value)} placeholder="Image URL (https://...)" className={inputClass + ' flex-1'} />
                <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="flex-shrink-0 px-3 py-2 bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-lg text-sm font-medium hover:bg-violet-500/20 transition-colors disabled:opacity-50"
                >
                    {uploading ? 'Uploading...' : 'Upload'}
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = ''; }} />
            </div>
            {(c.url as string) && (
                <img src={c.url as string} alt="Preview" className="w-full max-h-40 object-cover rounded-lg border border-gray-800" />
            )}
            <input type="text" value={(c.alt as string) || ''} onChange={(e) => updateContent(index, 'alt', e.target.value)} placeholder="Alt text (optional)" className={inputClass} />
            <input type="url" value={(c.link as string) || ''} onChange={(e) => updateContent(index, 'link', e.target.value)} placeholder="Click-through URL (optional)" className={inputClass} />
        </div>
    );
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
                    <span className="w-24 text-xs font-medium text-gray-400 flex-shrink-0 flex items-center gap-1.5 capitalize">
                        <SocialIcon platform={platform} size={14} color={SOCIAL_ICON_MAP[platform]?.color} />
                        {SOCIAL_ICON_MAP[platform]?.label || platform}
                    </span>
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
                        <button key={p} type="button" onClick={() => addPlatform(p)} className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-gray-400 bg-gray-950 border border-gray-800 rounded-md hover:text-white hover:border-violet-500/30 transition-all capitalize">
                            <SocialIcon platform={p} size={12} color={SOCIAL_ICON_MAP[p]?.color} />
                            {SOCIAL_ICON_MAP[p]?.label || p}
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

/* ─── Products Editor ─── */

interface ProductItem {
    image: string;
    title: string;
    description: string;
    url: string;
    buttonText: string;
}

function ProductsEditor({
    content: c,
    index,
    updateContent,
}: {
    content: Record<string, unknown>;
    index: number;
    updateContent: (index: number, key: string, value: unknown) => void;
}) {
    const items = ((c.items as ProductItem[]) || []);
    const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
    const fileRefs = useRef<Record<number, HTMLInputElement | null>>({});

    const updateItem = (itemIdx: number, field: keyof ProductItem, value: string) => {
        const updated = items.map((item, i) => i === itemIdx ? { ...item, [field]: value } : item);
        updateContent(index, 'items', updated);
    };

    const addItem = () => {
        updateContent(index, 'items', [...items, { image: '', title: '', description: '', url: '', buttonText: 'Buy Now' }]);
    };

    const removeItem = (itemIdx: number) => {
        updateContent(index, 'items', items.filter((_, i) => i !== itemIdx));
    };

    const moveItem = (itemIdx: number, direction: -1 | 1) => {
        const newIdx = itemIdx + direction;
        if (newIdx < 0 || newIdx >= items.length) return;
        const updated = [...items];
        [updated[itemIdx], updated[newIdx]] = [updated[newIdx], updated[itemIdx]];
        updateContent(index, 'items', updated);
    };

    const handleImageUpload = async (itemIdx: number, file: File) => {
        setUploadingIdx(itemIdx);
        try {
            const formData = new FormData();
            formData.append('image', file);
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            const res = await fetch(url('/admin/bio/upload-image'), {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': csrfToken, Accept: 'application/json' },
                body: formData,
            });
            const data = await res.json();
            if (data.success && data.url) {
                updateItem(itemIdx, 'image', data.url);
            }
        } catch { /* ignore */ } finally {
            setUploadingIdx(null);
        }
    };

    return (
        <div className="space-y-3">
            {items.map((item, idx) => (
                <div key={idx} className="p-3 bg-gray-900 rounded-lg border border-gray-800 space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-400">Product #{idx + 1}</span>
                        <div className="flex items-center gap-1">
                            <button type="button" onClick={() => moveItem(idx, -1)} disabled={idx === 0} className="p-0.5 text-gray-600 hover:text-white disabled:opacity-30 transition-colors">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                            </button>
                            <button type="button" onClick={() => moveItem(idx, 1)} disabled={idx === items.length - 1} className="p-0.5 text-gray-600 hover:text-white disabled:opacity-30 transition-colors">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </button>
                            <button type="button" onClick={() => removeItem(idx)} className="p-0.5 text-gray-500 hover:text-red-400 transition-colors">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                    </div>

                    {/* Image */}
                    <div className="flex items-center gap-2">
                        <input type="url" value={item.image} onChange={(e) => updateItem(idx, 'image', e.target.value)} placeholder="Product image URL" className={inputClass + ' flex-1'} />
                        <button
                            type="button"
                            onClick={() => fileRefs.current[idx]?.click()}
                            disabled={uploadingIdx === idx}
                            className="flex-shrink-0 px-2.5 py-2 bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-lg text-xs font-medium hover:bg-violet-500/20 transition-colors disabled:opacity-50"
                        >
                            {uploadingIdx === idx ? '...' : 'Upload'}
                        </button>
                        <input
                            ref={(el) => { fileRefs.current[idx] = el; }}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(idx, f); e.target.value = ''; }}
                        />
                    </div>
                    {item.image && (
                        <img src={item.image} alt="" className="w-full h-20 object-cover rounded-lg border border-gray-800" />
                    )}

                    {/* Title & Description */}
                    <input type="text" value={item.title} onChange={(e) => updateItem(idx, 'title', e.target.value)} placeholder="Product title" className={inputClass} />
                    <input type="text" value={item.description} onChange={(e) => updateItem(idx, 'description', e.target.value)} placeholder="Short description" className={inputClass} />

                    {/* URL & Button Text */}
                    <div className="grid grid-cols-2 gap-2">
                        <input type="url" value={item.url} onChange={(e) => updateItem(idx, 'url', e.target.value)} placeholder="https://buy-link.com" className={inputClass} />
                        <input type="text" value={item.buttonText} onChange={(e) => updateItem(idx, 'buttonText', e.target.value)} placeholder="Buy Now" className={inputClass} />
                    </div>
                </div>
            ))}

            <button type="button" onClick={addItem} className="inline-flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                Add product
            </button>
        </div>
    );
}
