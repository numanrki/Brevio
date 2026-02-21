import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Bio } from '@/types';
import { url } from '@/utils';
import { FormEvent, useState } from 'react';

interface BioWidget {
    id?: number;
    bio_id?: number;
    type: string;
    content: Record<string, any>;
    position: number;
    is_active: boolean;
}

interface ExtendedBio extends Bio {
    avatar?: string | null;
    seo_title?: string | null;
    seo_description?: string | null;
    theme?: Record<string, any> | null;
    custom_css?: string | null;
    widgets?: BioWidget[];
}

interface Props {
    bio: ExtendedBio;
}

const SOCIAL_PLATFORMS = [
    { name: 'Instagram', icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z', color: '#E4405F', prefix: 'https://instagram.com/' },
    { name: 'Twitter / X', icon: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z', color: '#000000', prefix: 'https://x.com/' },
    { name: 'TikTok', icon: 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z', color: '#000000', prefix: 'https://tiktok.com/@' },
    { name: 'YouTube', icon: 'M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z', color: '#FF0000', prefix: 'https://youtube.com/@' },
    { name: 'GitHub', icon: 'M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.164 6.839 9.49.5.09.682-.218.682-.484 0-.236-.009-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z', color: '#181717', prefix: 'https://github.com/' },
    { name: 'LinkedIn', icon: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z', color: '#0A66C2', prefix: 'https://linkedin.com/in/' },
    { name: 'Facebook', icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z', color: '#1877F2', prefix: 'https://facebook.com/' },
    { name: 'Snapchat', icon: 'M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.217-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641 0 12.017 0z', color: '#FFFC00', prefix: 'https://snapchat.com/add/' },
];

const WIDGET_TYPES = [
    { type: 'link', name: 'Link', icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1', description: 'Add a clickable link button' },
    { type: 'social', name: 'Social Links', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0', description: 'Social media icon row' },
    { type: 'heading', name: 'Heading', icon: 'M4 6h16M4 12h8', description: 'Section divider text' },
    { type: 'text', name: 'Text Block', icon: 'M4 6h16M4 12h16M4 18h7', description: 'Paragraph or bio text' },
];

const THEME_PRESETS = [
    { name: 'Midnight', background: '#0f0f1a', textColor: '#ffffff', buttonColor: '#7c3aed', buttonTextColor: '#ffffff', backgroundType: 'solid', gradientFrom: '', gradientTo: '' },
    { name: 'Ocean', background: '#0c1222', textColor: '#e2e8f0', buttonColor: '#0ea5e9', buttonTextColor: '#ffffff', backgroundType: 'solid', gradientFrom: '', gradientTo: '' },
    { name: 'Forest', background: '#0a1a0f', textColor: '#d1fae5', buttonColor: '#10b981', buttonTextColor: '#ffffff', backgroundType: 'solid', gradientFrom: '', gradientTo: '' },
    { name: 'Rose', background: '#1a0a14', textColor: '#fce7f3', buttonColor: '#ec4899', buttonTextColor: '#ffffff', backgroundType: 'solid', gradientFrom: '', gradientTo: '' },
    { name: 'Gradient Purple', background: '', textColor: '#ffffff', buttonColor: '#8b5cf6', buttonTextColor: '#ffffff', backgroundType: 'gradient', gradientFrom: '#7c3aed', gradientTo: '#ec4899' },
    { name: 'Clean White', background: '#ffffff', textColor: '#1f2937', buttonColor: '#111827', buttonTextColor: '#ffffff', backgroundType: 'solid', gradientFrom: '', gradientTo: '' },
];

const BUTTON_STYLES = [
    { name: 'Filled', value: 'filled' },
    { name: 'Outline', value: 'outline' },
    { name: 'Soft', value: 'soft' },
    { name: 'Shadow', value: 'shadow' },
];

const BUTTON_RADII = [
    { name: 'Square', value: '0' },
    { name: 'Rounded', value: '8px' },
    { name: 'Pill', value: '9999px' },
];

export default function Edit({ bio }: Props) {
    const [activeTab, setActiveTab] = useState<'widgets' | 'design' | 'settings'>('widgets');
    const [showAddWidget, setShowAddWidget] = useState(false);
    const [editingSocial, setEditingSocial] = useState<number | null>(null);

    const theme = bio.theme || {
        background: '#0f0f1a', textColor: '#ffffff', buttonStyle: 'filled',
        buttonColor: '#7c3aed', buttonTextColor: '#ffffff', buttonRadius: '9999px',
        fontFamily: 'system-ui, sans-serif', backgroundType: 'solid',
        gradientFrom: '#7c3aed', gradientTo: '#ec4899',
    };

    const [widgets, setWidgets] = useState<BioWidget[]>(
        (bio.widgets || []).map((w, i) => ({ ...w, position: w.position ?? i }))
    );
    const [currentTheme, setCurrentTheme] = useState(theme);
    const [bioName, setBioName] = useState(bio.name);
    const [bioAlias, setBioAlias] = useState(bio.alias);
    const [bioAvatar, setBioAvatar] = useState(bio.avatar || '');
    const [seoTitle, setSeoTitle] = useState(bio.seo_title || '');
    const [seoDesc, setSeoDesc] = useState(bio.seo_description || '');
    const [saving, setSaving] = useState(false);

    const bioUrl = `${window.location.origin}${url('/bio/' + bio.alias)}`;

    const addWidget = (type: string) => {
        const newWidget: BioWidget = {
            type,
            content: type === 'link' ? { title: 'My Link', url: 'https://' }
                : type === 'social' ? { platforms: [] }
                : type === 'heading' ? { text: 'Section Title' }
                : { text: 'Your text here...' },
            position: widgets.length,
            is_active: true,
        };
        setWidgets([...widgets, newWidget]);
        setShowAddWidget(false);
    };

    const updateWidget = (index: number, content: Record<string, any>) => {
        const updated = [...widgets];
        updated[index] = { ...updated[index], content };
        setWidgets(updated);
    };

    const toggleWidget = (index: number) => {
        const updated = [...widgets];
        updated[index] = { ...updated[index], is_active: !updated[index].is_active };
        setWidgets(updated);
    };

    const removeWidget = (index: number) => {
        setWidgets(widgets.filter((_, i) => i !== index).map((w, i) => ({ ...w, position: i })));
    };

    const moveWidget = (index: number, direction: 'up' | 'down') => {
        if ((direction === 'up' && index === 0) || (direction === 'down' && index === widgets.length - 1)) return;
        const updated = [...widgets];
        const swap = direction === 'up' ? index - 1 : index + 1;
        [updated[index], updated[swap]] = [updated[swap], updated[index]];
        setWidgets(updated.map((w, i) => ({ ...w, position: i })));
    };

    const addSocialPlatform = (widgetIndex: number, platform: typeof SOCIAL_PLATFORMS[0]) => {
        const widget = widgets[widgetIndex];
        const platforms = [...(widget.content.platforms || [])];
        if (!platforms.find((p: any) => p.name === platform.name)) {
            platforms.push({ name: platform.name, url: platform.prefix, icon: platform.icon, color: platform.color });
            updateWidget(widgetIndex, { ...widget.content, platforms });
        }
    };

    const removeSocialPlatform = (widgetIndex: number, platformIndex: number) => {
        const widget = widgets[widgetIndex];
        const platforms = [...(widget.content.platforms || [])];
        platforms.splice(platformIndex, 1);
        updateWidget(widgetIndex, { ...widget.content, platforms });
    };

    const updateSocialUrl = (widgetIndex: number, platformIndex: number, newUrl: string) => {
        const widget = widgets[widgetIndex];
        const platforms = [...(widget.content.platforms || [])];
        platforms[platformIndex] = { ...platforms[platformIndex], url: newUrl };
        updateWidget(widgetIndex, { ...widget.content, platforms });
    };

    const updateTheme = (key: string, value: string) => {
        setCurrentTheme({ ...currentTheme, [key]: value });
    };

    const applyPreset = (preset: typeof THEME_PRESETS[0]) => {
        setCurrentTheme({
            ...currentTheme,
            background: preset.background,
            textColor: preset.textColor,
            buttonColor: preset.buttonColor,
            buttonTextColor: preset.buttonTextColor,
            backgroundType: preset.backgroundType,
            gradientFrom: preset.gradientFrom,
            gradientTo: preset.gradientTo,
        });
    };

    const handleSave = (e: FormEvent) => {
        e.preventDefault();
        setSaving(true);
        router.put(url(`/dashboard/bio/${bio.id}`), {
            name: bioName,
            alias: bioAlias,
            avatar: bioAvatar,
            seo_title: seoTitle,
            seo_description: seoDesc,
            theme: JSON.stringify(currentTheme),
            widgets: widgets.map((w, i) => ({
                type: w.type,
                content: w.content,
                position: i,
                is_active: w.is_active,
            })),
        }, {
            preserveScroll: true,
            onFinish: () => setSaving(false),
        });
    };

    const getPreviewBg = () => {
        if (currentTheme.backgroundType === 'gradient') {
            return `linear-gradient(135deg, ${currentTheme.gradientFrom || '#7c3aed'}, ${currentTheme.gradientTo || '#ec4899'})`;
        }
        return currentTheme.background || '#0f0f1a';
    };

    const getButtonStyle = (overrides?: Record<string, string>): React.CSSProperties => {
        const t = { ...currentTheme, ...overrides };
        const base: React.CSSProperties = {
            borderRadius: t.buttonRadius || '9999px',
            fontFamily: t.fontFamily || 'system-ui, sans-serif',
            padding: '12px 20px', fontSize: '13px', fontWeight: 500,
            width: '100%', textAlign: 'center' as const, display: 'block',
            textDecoration: 'none', transition: 'all 0.2s',
        };
        switch (t.buttonStyle) {
            case 'outline': return { ...base, background: 'transparent', border: `2px solid ${t.buttonColor}`, color: t.buttonColor };
            case 'soft': return { ...base, background: t.buttonColor + '20', border: 'none', color: t.buttonColor };
            case 'shadow': return { ...base, background: t.buttonColor, border: 'none', color: t.buttonTextColor, boxShadow: `0 4px 15px ${t.buttonColor}40` };
            default: return { ...base, background: t.buttonColor, border: 'none', color: t.buttonTextColor };
        }
    };

    return (
        <DashboardLayout header={`Edit: ${bio.name}`}>
            <Head title={`Edit - ${bio.name}`} />

            <div className="mb-6 flex items-center justify-between">
                <Link href={url('/dashboard/bio')}
                    className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Bio Pages
                </Link>
                <a href={bioUrl} target="_blank" rel="noopener noreferrer"
                    className="text-xs font-medium text-violet-400 bg-violet-500/10 hover:bg-violet-500/20 px-3 py-1.5 rounded-lg transition-colors">
                    View Live Page →
                </a>
            </div>

            <form onSubmit={handleSave}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Editor */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Tabs */}
                        <div className="flex gap-1 p-1 bg-gray-900 rounded-xl border border-gray-800 w-fit">
                            {(['widgets', 'design', 'settings'] as const).map(tab => (
                                <button key={tab} type="button" onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all capitalize ${activeTab === tab ? 'bg-violet-500/20 text-violet-400' : 'text-gray-400 hover:text-white'}`}>
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Widgets Tab */}
                        {activeTab === 'widgets' && (
                            <div className="space-y-4">
                                {/* Widget List */}
                                {widgets.map((widget, index) => (
                                    <div key={index} className={`rounded-xl bg-gray-900 border border-gray-800 overflow-hidden ${!widget.is_active ? 'opacity-50' : ''}`}>
                                        <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-800">
                                            {/* Reorder */}
                                            <div className="flex flex-col gap-0.5">
                                                <button type="button" onClick={() => moveWidget(index, 'up')}
                                                    className="text-gray-600 hover:text-gray-300 transition-colors" disabled={index === 0}>
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                                                </button>
                                                <button type="button" onClick={() => moveWidget(index, 'down')}
                                                    className="text-gray-600 hover:text-gray-300 transition-colors" disabled={index === widgets.length - 1}>
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                                </button>
                                            </div>

                                            <span className="text-xs font-semibold text-gray-500 uppercase">{widget.type}</span>
                                            <div className="flex-1" />

                                            <button type="button" onClick={() => toggleWidget(index)}
                                                className={`text-xs px-2 py-1 rounded-md transition-colors ${widget.is_active ? 'text-emerald-400 bg-emerald-500/10' : 'text-gray-500 bg-gray-800'}`}>
                                                {widget.is_active ? 'Active' : 'Hidden'}
                                            </button>
                                            <button type="button" onClick={() => removeWidget(index)}
                                                className="text-gray-600 hover:text-red-400 transition-colors">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>

                                        <div className="p-4">
                                            {/* Link widget */}
                                            {widget.type === 'link' && (
                                                <div className="space-y-3">
                                                    <input type="text" value={widget.content.title || ''}
                                                        onChange={(e) => updateWidget(index, { ...widget.content, title: e.target.value })}
                                                        className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                                                        placeholder="Link title" />
                                                    <input type="url" value={widget.content.url || ''}
                                                        onChange={(e) => updateWidget(index, { ...widget.content, url: e.target.value })}
                                                        className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                                                        placeholder="https://example.com" />
                                                </div>
                                            )}

                                            {/* Social widget */}
                                            {widget.type === 'social' && (
                                                <div className="space-y-3">
                                                    <div className="flex flex-wrap gap-2">
                                                        {(widget.content.platforms || []).map((platform: any, pi: number) => (
                                                            <div key={pi} className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2 text-sm group">
                                                                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24" style={{ color: platform.color }}>
                                                                    <path d={platform.icon} />
                                                                </svg>
                                                                {editingSocial === pi ? (
                                                                    <input type="url" value={platform.url} autoFocus
                                                                        onChange={(e) => updateSocialUrl(index, pi, e.target.value)}
                                                                        onBlur={() => setEditingSocial(null)}
                                                                        onKeyDown={(e) => e.key === 'Enter' && setEditingSocial(null)}
                                                                        className="bg-gray-900 border border-gray-700 rounded px-2 py-0.5 text-xs text-white w-48 focus:outline-none" />
                                                                ) : (
                                                                    <span className="text-gray-300 text-xs cursor-pointer hover:text-white"
                                                                        onClick={() => setEditingSocial(pi)}>
                                                                        {platform.name}
                                                                    </span>
                                                                )}
                                                                <button type="button" onClick={() => removeSocialPlatform(index, pi)}
                                                                    className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-2">Add platform:</p>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {SOCIAL_PLATFORMS.filter(p => !(widget.content.platforms || []).find((ep: any) => ep.name === p.name)).map((platform) => (
                                                                <button key={platform.name} type="button"
                                                                    onClick={() => addSocialPlatform(index, platform)}
                                                                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs text-gray-400 hover:text-white transition-colors">
                                                                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" style={{ color: platform.color }}>
                                                                        <path d={platform.icon} />
                                                                    </svg>
                                                                    {platform.name}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Heading widget */}
                                            {widget.type === 'heading' && (
                                                <input type="text" value={widget.content.text || ''}
                                                    onChange={(e) => updateWidget(index, { ...widget.content, text: e.target.value })}
                                                    className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                                                    placeholder="Section heading" />
                                            )}

                                            {/* Text widget */}
                                            {widget.type === 'text' && (
                                                <textarea value={widget.content.text || ''}
                                                    onChange={(e) => updateWidget(index, { ...widget.content, text: e.target.value })}
                                                    rows={3}
                                                    className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 resize-none"
                                                    placeholder="Enter your text..." />
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {/* Add Widget Button */}
                                {showAddWidget ? (
                                    <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
                                        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
                                            <h3 className="text-sm font-semibold text-white">Add Widget</h3>
                                            <button type="button" onClick={() => setShowAddWidget(false)} className="text-gray-500 hover:text-white">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </div>
                                        <div className="p-4 grid grid-cols-2 gap-3">
                                            {WIDGET_TYPES.map((wt) => (
                                                <button key={wt.type} type="button" onClick={() => addWidget(wt.type)}
                                                    className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-800 hover:border-violet-500/50 hover:bg-violet-500/5 transition-all">
                                                    <svg className="w-6 h-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d={wt.icon} />
                                                    </svg>
                                                    <span className="text-sm font-medium text-white">{wt.name}</span>
                                                    <span className="text-[10px] text-gray-500">{wt.description}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <button type="button" onClick={() => setShowAddWidget(true)}
                                        className="w-full py-4 border-2 border-dashed border-gray-800 hover:border-violet-500/40 rounded-xl text-sm text-gray-500 hover:text-violet-400 transition-all flex items-center justify-center gap-2">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                        Add Widget
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Design Tab */}
                        {activeTab === 'design' && (
                            <div className="space-y-6">
                                {/* Presets */}
                                <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-800">
                                        <h3 className="text-sm font-semibold text-white">Theme Presets</h3>
                                    </div>
                                    <div className="p-6 grid grid-cols-3 sm:grid-cols-6 gap-3">
                                        {THEME_PRESETS.map((preset) => (
                                            <button key={preset.name} type="button" onClick={() => applyPreset(preset)}
                                                className="rounded-xl overflow-hidden border border-gray-700 hover:border-violet-500/50 transition-all aspect-[3/4]"
                                                style={{
                                                    background: preset.backgroundType === 'gradient'
                                                        ? `linear-gradient(135deg, ${preset.gradientFrom}, ${preset.gradientTo})`
                                                        : preset.background
                                                }}>
                                                <div className="flex flex-col items-center justify-center h-full p-2 gap-1">
                                                    <div className="w-5 h-5 rounded-full" style={{ background: preset.buttonColor }} />
                                                    <div className="w-full h-1.5 rounded-full opacity-50" style={{ background: preset.buttonColor }} />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Colors */}
                                <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-800">
                                        <h3 className="text-sm font-semibold text-white">Colors</h3>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        <div className="flex items-center gap-2">
                                            <label className="text-sm text-gray-300 w-24">BG Type</label>
                                            <select value={currentTheme.backgroundType || 'solid'} onChange={(e) => updateTheme('backgroundType', e.target.value)}
                                                className="flex-1 px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40">
                                                <option value="solid">Solid Color</option>
                                                <option value="gradient">Gradient</option>
                                            </select>
                                        </div>
                                        {currentTheme.backgroundType === 'gradient' ? (
                                            <div className="grid grid-cols-2 gap-3">
                                                {[['gradientFrom', 'From'], ['gradientTo', 'To']].map(([key, label]) => (
                                                    <div key={key}>
                                                        <label className="block text-xs text-gray-500 mb-1">{label}</label>
                                                        <div className="flex items-center gap-2">
                                                            <input type="color" value={(currentTheme as any)[key] || '#7c3aed'}
                                                                onChange={(e) => updateTheme(key, e.target.value)}
                                                                className="w-8 h-8 rounded-lg border-0 cursor-pointer" />
                                                            <input type="text" value={(currentTheme as any)[key] || '#7c3aed'}
                                                                onChange={(e) => updateTheme(key, e.target.value)}
                                                                className="flex-1 px-3 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-xs text-white font-mono" />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Background</label>
                                                <div className="flex items-center gap-2">
                                                    <input type="color" value={currentTheme.background || '#0f0f1a'}
                                                        onChange={(e) => updateTheme('background', e.target.value)}
                                                        className="w-8 h-8 rounded-lg border-0 cursor-pointer" />
                                                    <input type="text" value={currentTheme.background || '#0f0f1a'}
                                                        onChange={(e) => updateTheme('background', e.target.value)}
                                                        className="flex-1 px-3 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-xs text-white font-mono" />
                                                </div>
                                            </div>
                                        )}
                                        {[['textColor', 'Text Color', '#ffffff'], ['buttonColor', 'Button', '#7c3aed'], ['buttonTextColor', 'Button Text', '#ffffff']].map(([key, label, fallback]) => (
                                            <div key={key}>
                                                <label className="block text-xs text-gray-500 mb-1">{label}</label>
                                                <div className="flex items-center gap-2">
                                                    <input type="color" value={(currentTheme as any)[key] || fallback}
                                                        onChange={(e) => updateTheme(key, e.target.value)}
                                                        className="w-8 h-8 rounded-lg border-0 cursor-pointer" />
                                                    <input type="text" value={(currentTheme as any)[key] || fallback}
                                                        onChange={(e) => updateTheme(key, e.target.value)}
                                                        className="flex-1 px-3 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-xs text-white font-mono" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Button Style */}
                                <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-800">
                                        <h3 className="text-sm font-semibold text-white">Button Style</h3>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        <div className="grid grid-cols-4 gap-2">
                                            {BUTTON_STYLES.map((style) => (
                                                <button key={style.value} type="button" onClick={() => updateTheme('buttonStyle', style.value)}
                                                    className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${currentTheme.buttonStyle === style.value ? 'border-violet-500 bg-violet-500/10 text-violet-400' : 'border-gray-700 text-gray-400 hover:border-gray-600'}`}>
                                                    {style.name}
                                                </button>
                                            ))}
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-2">Corner Radius</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {BUTTON_RADII.map((r) => (
                                                    <button key={r.value} type="button" onClick={() => updateTheme('buttonRadius', r.value)}
                                                        className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${currentTheme.buttonRadius === r.value ? 'border-violet-500 bg-violet-500/10 text-violet-400' : 'border-gray-700 text-gray-400 hover:border-gray-600'}`}>
                                                        {r.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Settings Tab */}
                        {activeTab === 'settings' && (
                            <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
                                <div className="px-6 py-5 border-b border-gray-800">
                                    <h2 className="text-lg font-semibold text-white">Page Settings</h2>
                                </div>
                                <div className="p-6 space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Page Name *</label>
                                        <input type="text" value={bioName} onChange={(e) => setBioName(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">URL Alias *</label>
                                        <div className="flex items-center">
                                            <span className="px-3 py-2.5 bg-gray-800 border border-r-0 border-gray-700 rounded-l-xl text-sm text-gray-400">/bio/</span>
                                            <input type="text" value={bioAlias} onChange={(e) => setBioAlias(e.target.value)}
                                                className="flex-1 px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-r-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40" required />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Avatar URL</label>
                                        <input type="url" value={bioAvatar} onChange={(e) => setBioAvatar(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                                            placeholder="https://example.com/avatar.jpg" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">SEO Title</label>
                                        <input type="text" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                                            placeholder="Page title" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">SEO Description</label>
                                        <textarea value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} rows={2}
                                            className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 resize-none"
                                            placeholder="Description..." />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Save Button */}
                        <div className="flex items-center justify-end gap-3">
                            <Link href={url('/dashboard/bio')}
                                className="px-4 py-2.5 text-sm font-medium text-gray-400 hover:text-white transition-colors">Cancel</Link>
                            <button type="submit" disabled={saving}
                                className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50">
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>

                    {/* Right: Live Preview */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-6">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Live Preview</p>
                            <div className="rounded-2xl border border-gray-800 overflow-hidden overflow-y-auto" style={{ maxHeight: '700px' }}>
                                <div style={{
                                    background: getPreviewBg(),
                                    minHeight: '500px',
                                    fontFamily: currentTheme.fontFamily || 'system-ui, sans-serif',
                                }}>
                                    <div className="flex flex-col items-center pt-10 px-5 pb-8">
                                        {/* Avatar */}
                                        <div className="w-20 h-20 rounded-full border-2 mb-3 overflow-hidden flex items-center justify-center"
                                            style={{ borderColor: currentTheme.buttonColor || '#7c3aed' }}>
                                            {bioAvatar ? (
                                                <img src={bioAvatar} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                                                    <span className="text-2xl font-bold text-white">{bioName ? bioName.charAt(0).toUpperCase() : '?'}</span>
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-bold mb-0.5" style={{ color: currentTheme.textColor }}>{bioName || 'Your Name'}</h3>
                                        <p className="text-sm opacity-50 mb-6" style={{ color: currentTheme.textColor }}>@{bioAlias || 'username'}</p>

                                        {/* Render widgets */}
                                        <div className="w-full space-y-3">
                                            {widgets.filter(w => w.is_active).map((widget, i) => {
                                                if (widget.type === 'link') {
                                                    return <div key={i} style={getButtonStyle()}>{widget.content.title || 'Untitled Link'}</div>;
                                                }
                                                if (widget.type === 'heading') {
                                                    return <p key={i} className="text-center font-semibold text-sm pt-2" style={{ color: currentTheme.textColor }}>{widget.content.text}</p>;
                                                }
                                                if (widget.type === 'text') {
                                                    return <p key={i} className="text-center text-xs opacity-70 px-2" style={{ color: currentTheme.textColor }}>{widget.content.text}</p>;
                                                }
                                                if (widget.type === 'social') {
                                                    return (
                                                        <div key={i} className="flex justify-center gap-3 py-2">
                                                            {(widget.content.platforms || []).map((p: any, pi: number) => (
                                                                <svg key={pi} className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" style={{ color: currentTheme.textColor, opacity: 0.7 }}>
                                                                    <path d={p.icon} />
                                                                </svg>
                                                            ))}
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            })}
                                        </div>

                                        {widgets.filter(w => w.is_active).length === 0 && (
                                            <p className="text-sm opacity-40 mt-4" style={{ color: currentTheme.textColor }}>Add widgets to see them here</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </DashboardLayout>
    );
}
