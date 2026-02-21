import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import { url } from '@/utils';

const THEME_PRESETS = [
    { name: 'Midnight', background: '#0f0f1a', textColor: '#ffffff', buttonColor: '#7c3aed', buttonTextColor: '#ffffff', gradientFrom: '', gradientTo: '', backgroundType: 'solid' },
    { name: 'Ocean', background: '#0c1222', textColor: '#e2e8f0', buttonColor: '#0ea5e9', buttonTextColor: '#ffffff', gradientFrom: '', gradientTo: '', backgroundType: 'solid' },
    { name: 'Sunset', background: '#1a0a1e', textColor: '#fde68a', buttonColor: '#f97316', buttonTextColor: '#ffffff', gradientFrom: '', gradientTo: '', backgroundType: 'solid' },
    { name: 'Forest', background: '#0a1a0f', textColor: '#d1fae5', buttonColor: '#10b981', buttonTextColor: '#ffffff', gradientFrom: '', gradientTo: '', backgroundType: 'solid' },
    { name: 'Rose', background: '#1a0a14', textColor: '#fce7f3', buttonColor: '#ec4899', buttonTextColor: '#ffffff', gradientFrom: '', gradientTo: '', backgroundType: 'solid' },
    { name: 'Gradient Purple', background: '', textColor: '#ffffff', buttonColor: '#8b5cf6', buttonTextColor: '#ffffff', gradientFrom: '#7c3aed', gradientTo: '#ec4899', backgroundType: 'gradient' },
    { name: 'Gradient Ocean', background: '', textColor: '#ffffff', buttonColor: '#06b6d4', buttonTextColor: '#ffffff', gradientFrom: '#0ea5e9', gradientTo: '#6366f1', backgroundType: 'gradient' },
    { name: 'Clean White', background: '#ffffff', textColor: '#1f2937', buttonColor: '#111827', buttonTextColor: '#ffffff', gradientFrom: '', gradientTo: '', backgroundType: 'solid' },
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

const FONT_FAMILIES = [
    { name: 'System', value: 'system-ui, sans-serif' },
    { name: 'Inter', value: "'Inter', sans-serif" },
    { name: 'Poppins', value: "'Poppins', sans-serif" },
    { name: 'Playfair', value: "'Playfair Display', serif" },
];

export default function Create() {
    const [activeTab, setActiveTab] = useState<'basics' | 'theme'>('basics');

    const { data, setData, post, processing, errors } = useForm<{
        name: string;
        alias: string;
        avatar: string;
        seo_title: string;
        seo_description: string;
        theme: string;
    }>({
        name: '',
        alias: '',
        avatar: '',
        seo_title: '',
        seo_description: '',
        theme: JSON.stringify({
            background: '#0f0f1a',
            textColor: '#ffffff',
            buttonStyle: 'filled',
            buttonColor: '#7c3aed',
            buttonTextColor: '#ffffff',
            buttonRadius: '9999px',
            fontFamily: 'system-ui, sans-serif',
            backgroundType: 'solid',
            gradientFrom: '#7c3aed',
            gradientTo: '#ec4899',
        }),
    });

    const theme = JSON.parse(data.theme || '{}');

    const updateTheme = (key: string, value: string) => {
        const newTheme = { ...theme, [key]: value };
        setData('theme', JSON.stringify(newTheme));
    };

    const applyPreset = (preset: typeof THEME_PRESETS[0]) => {
        const newTheme = {
            ...theme,
            background: preset.background,
            textColor: preset.textColor,
            buttonColor: preset.buttonColor,
            buttonTextColor: preset.buttonTextColor,
            backgroundType: preset.backgroundType,
            gradientFrom: preset.gradientFrom,
            gradientTo: preset.gradientTo,
        };
        setData('theme', JSON.stringify(newTheme));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(url('/dashboard/bio'));
    };

    const autoAlias = (name: string) => {
        return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    };

    const getPreviewBg = () => {
        if (theme.backgroundType === 'gradient') {
            return `linear-gradient(135deg, ${theme.gradientFrom || '#7c3aed'}, ${theme.gradientTo || '#ec4899'})`;
        }
        return theme.background || '#0f0f1a';
    };

    const getButtonStyle = (): React.CSSProperties => {
        const base: React.CSSProperties = {
            borderRadius: theme.buttonRadius || '9999px',
            fontFamily: theme.fontFamily || 'system-ui, sans-serif',
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: 500,
            width: '100%',
            textAlign: 'center' as const,
            transition: 'all 0.2s',
        };
        switch (theme.buttonStyle) {
            case 'outline':
                return { ...base, background: 'transparent', border: `2px solid ${theme.buttonColor}`, color: theme.buttonColor };
            case 'soft':
                return { ...base, background: theme.buttonColor + '20', border: 'none', color: theme.buttonColor };
            case 'shadow':
                return { ...base, background: theme.buttonColor, border: 'none', color: theme.buttonTextColor, boxShadow: `0 4px 15px ${theme.buttonColor}40` };
            default:
                return { ...base, background: theme.buttonColor, border: 'none', color: theme.buttonTextColor };
        }
    };

    return (
        <DashboardLayout header="Create Bio Page">
            <Head title="Create Bio Page" />

            <div className="mb-6">
                <Link href={url('/dashboard/bio')}
                    className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Bio Pages
                </Link>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Editor */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Tabs */}
                        <div className="flex gap-1 p-1 bg-gray-900 rounded-xl border border-gray-800 w-fit">
                            <button type="button" onClick={() => setActiveTab('basics')}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'basics' ? 'bg-violet-500/20 text-violet-400' : 'text-gray-400 hover:text-white'}`}>
                                Basics
                            </button>
                            <button type="button" onClick={() => setActiveTab('theme')}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'theme' ? 'bg-violet-500/20 text-violet-400' : 'text-gray-400 hover:text-white'}`}>
                                Design
                            </button>
                        </div>

                        {activeTab === 'basics' && (
                            <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
                                <div className="px-6 py-5 border-b border-gray-800">
                                    <h2 className="text-lg font-semibold text-white">Page Details</h2>
                                    <p className="text-sm text-gray-500 mt-1">Set up your bio page info.</p>
                                </div>
                                <div className="p-6 space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Page Name *</label>
                                        <input type="text" value={data.name}
                                            onChange={(e) => {
                                                setData('name', e.target.value);
                                                if (!data.alias) setData('alias', autoAlias(e.target.value));
                                            }}
                                            className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40"
                                            placeholder="My Links" required />
                                        {errors.name && <p className="mt-1.5 text-xs text-red-400">{errors.name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">URL Alias *</label>
                                        <div className="flex items-center">
                                            <span className="px-3 py-2.5 bg-gray-800 border border-r-0 border-gray-700 rounded-l-xl text-sm text-gray-400">/bio/</span>
                                            <input type="text" value={data.alias}
                                                onChange={(e) => setData('alias', e.target.value)}
                                                className="flex-1 px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-r-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40"
                                                placeholder="my-page" required />
                                        </div>
                                        {errors.alias && <p className="mt-1.5 text-xs text-red-400">{errors.alias}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Avatar URL</label>
                                        <input type="url" value={data.avatar}
                                            onChange={(e) => setData('avatar', e.target.value)}
                                            className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40"
                                            placeholder="https://example.com/avatar.jpg" />
                                        {errors.avatar && <p className="mt-1.5 text-xs text-red-400">{errors.avatar}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">SEO Title</label>
                                        <input type="text" value={data.seo_title}
                                            onChange={(e) => setData('seo_title', e.target.value)}
                                            className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40"
                                            placeholder="Page title for search engines" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">SEO Description</label>
                                        <textarea value={data.seo_description}
                                            onChange={(e) => setData('seo_description', e.target.value)}
                                            rows={2}
                                            className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 resize-none"
                                            placeholder="Description for search engines..." />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'theme' && (
                            <div className="space-y-6">
                                {/* Presets */}
                                <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-800">
                                        <h3 className="text-sm font-semibold text-white">Theme Presets</h3>
                                    </div>
                                    <div className="p-6 grid grid-cols-4 gap-3">
                                        {THEME_PRESETS.map((preset) => (
                                            <button key={preset.name} type="button" onClick={() => applyPreset(preset)}
                                                className="group relative rounded-xl overflow-hidden border border-gray-700 hover:border-violet-500/50 transition-all aspect-[3/4]"
                                                style={{
                                                    background: preset.backgroundType === 'gradient'
                                                        ? `linear-gradient(135deg, ${preset.gradientFrom}, ${preset.gradientTo})`
                                                        : preset.background
                                                }}>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center p-2 gap-1.5">
                                                    <div className="w-6 h-6 rounded-full" style={{ background: preset.buttonColor }} />
                                                    <div className="w-full h-2 rounded-full opacity-50" style={{ background: preset.buttonColor }} />
                                                    <div className="w-3/4 h-2 rounded-full opacity-30" style={{ background: preset.buttonColor }} />
                                                </div>
                                                <div className="absolute bottom-0 inset-x-0 bg-black/60 px-2 py-1">
                                                    <p className="text-[10px] text-white text-center truncate">{preset.name}</p>
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
                                        <div className="flex items-center gap-2 mb-3">
                                            <label className="text-sm text-gray-300 w-20">BG Type</label>
                                            <select value={theme.backgroundType || 'solid'} onChange={(e) => updateTheme('backgroundType', e.target.value)}
                                                className="flex-1 px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40">
                                                <option value="solid">Solid Color</option>
                                                <option value="gradient">Gradient</option>
                                            </select>
                                        </div>
                                        {theme.backgroundType === 'gradient' ? (
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">From</label>
                                                    <div className="flex items-center gap-2">
                                                        <input type="color" value={theme.gradientFrom || '#7c3aed'}
                                                            onChange={(e) => updateTheme('gradientFrom', e.target.value)}
                                                            className="w-8 h-8 rounded-lg border-0 cursor-pointer" />
                                                        <input type="text" value={theme.gradientFrom || '#7c3aed'}
                                                            onChange={(e) => updateTheme('gradientFrom', e.target.value)}
                                                            className="flex-1 px-3 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-xs text-white font-mono" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">To</label>
                                                    <div className="flex items-center gap-2">
                                                        <input type="color" value={theme.gradientTo || '#ec4899'}
                                                            onChange={(e) => updateTheme('gradientTo', e.target.value)}
                                                            className="w-8 h-8 rounded-lg border-0 cursor-pointer" />
                                                        <input type="text" value={theme.gradientTo || '#ec4899'}
                                                            onChange={(e) => updateTheme('gradientTo', e.target.value)}
                                                            className="flex-1 px-3 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-xs text-white font-mono" />
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Background</label>
                                                <div className="flex items-center gap-2">
                                                    <input type="color" value={theme.background || '#0f0f1a'}
                                                        onChange={(e) => updateTheme('background', e.target.value)}
                                                        className="w-8 h-8 rounded-lg border-0 cursor-pointer" />
                                                    <input type="text" value={theme.background || '#0f0f1a'}
                                                        onChange={(e) => updateTheme('background', e.target.value)}
                                                        className="flex-1 px-3 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-xs text-white font-mono" />
                                                </div>
                                            </div>
                                        )}
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Text Color</label>
                                            <div className="flex items-center gap-2">
                                                <input type="color" value={theme.textColor || '#ffffff'}
                                                    onChange={(e) => updateTheme('textColor', e.target.value)}
                                                    className="w-8 h-8 rounded-lg border-0 cursor-pointer" />
                                                <input type="text" value={theme.textColor || '#ffffff'}
                                                    onChange={(e) => updateTheme('textColor', e.target.value)}
                                                    className="flex-1 px-3 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-xs text-white font-mono" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Button Color</label>
                                                <div className="flex items-center gap-2">
                                                    <input type="color" value={theme.buttonColor || '#7c3aed'}
                                                        onChange={(e) => updateTheme('buttonColor', e.target.value)}
                                                        className="w-8 h-8 rounded-lg border-0 cursor-pointer" />
                                                    <input type="text" value={theme.buttonColor || '#7c3aed'}
                                                        onChange={(e) => updateTheme('buttonColor', e.target.value)}
                                                        className="flex-1 px-3 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-xs text-white font-mono" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Button Text</label>
                                                <div className="flex items-center gap-2">
                                                    <input type="color" value={theme.buttonTextColor || '#ffffff'}
                                                        onChange={(e) => updateTheme('buttonTextColor', e.target.value)}
                                                        className="w-8 h-8 rounded-lg border-0 cursor-pointer" />
                                                    <input type="text" value={theme.buttonTextColor || '#ffffff'}
                                                        onChange={(e) => updateTheme('buttonTextColor', e.target.value)}
                                                        className="flex-1 px-3 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-xs text-white font-mono" />
                                                </div>
                                            </div>
                                        </div>
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
                                                <button key={style.value} type="button"
                                                    onClick={() => updateTheme('buttonStyle', style.value)}
                                                    className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${theme.buttonStyle === style.value ? 'border-violet-500 bg-violet-500/10 text-violet-400' : 'border-gray-700 text-gray-400 hover:border-gray-600'}`}>
                                                    {style.name}
                                                </button>
                                            ))}
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-2">Corner Radius</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {BUTTON_RADII.map((r) => (
                                                    <button key={r.value} type="button"
                                                        onClick={() => updateTheme('buttonRadius', r.value)}
                                                        className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${theme.buttonRadius === r.value ? 'border-violet-500 bg-violet-500/10 text-violet-400' : 'border-gray-700 text-gray-400 hover:border-gray-600'}`}>
                                                        {r.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-2">Font</label>
                                            <select value={theme.fontFamily || 'system-ui, sans-serif'}
                                                onChange={(e) => updateTheme('fontFamily', e.target.value)}
                                                className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40">
                                                {FONT_FAMILIES.map((f) => (
                                                    <option key={f.value} value={f.value}>{f.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Submit */}
                        <div className="flex items-center justify-end gap-3">
                            <Link href={url('/dashboard/bio')}
                                className="px-4 py-2.5 text-sm font-medium text-gray-400 hover:text-white transition-colors">
                                Cancel
                            </Link>
                            <button type="submit" disabled={processing}
                                className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50">
                                {processing ? 'Creating...' : 'Create & Add Links'}
                            </button>
                        </div>
                    </div>

                    {/* Right: Live Preview */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-6">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Live Preview</p>
                            <div className="rounded-2xl border border-gray-800 overflow-hidden" style={{ maxHeight: '600px' }}>
                                <div className="relative" style={{
                                    background: getPreviewBg(),
                                    minHeight: '500px',
                                    fontFamily: theme.fontFamily || 'system-ui, sans-serif',
                                }}>
                                    <div className="flex flex-col items-center pt-12 px-6 pb-8">
                                        <div className="w-20 h-20 rounded-full border-2 flex items-center justify-center mb-4"
                                            style={{ borderColor: theme.buttonColor || '#7c3aed' }}>
                                            {data.avatar ? (
                                                <img src={data.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                                                    <span className="text-2xl font-bold text-white">
                                                        {data.name ? data.name.charAt(0).toUpperCase() : '?'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-bold mb-1" style={{ color: theme.textColor || '#ffffff' }}>
                                            {data.name || 'Your Name'}
                                        </h3>
                                        <p className="text-sm opacity-60 mb-8" style={{ color: theme.textColor || '#ffffff' }}>
                                            @{data.alias || 'username'}
                                        </p>
                                        <div className="w-full space-y-3">
                                            <div style={getButtonStyle()}>My Website</div>
                                            <div style={getButtonStyle()}>Instagram</div>
                                            <div style={getButtonStyle()}>Twitter</div>
                                        </div>
                                        <div className="flex gap-4 mt-8">
                                            {['M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.164 6.839 9.49.5.09.682-.218.682-.484 0-.236-.009-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z',
                                                'M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z',
                                                'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z'
                                            ].map((d, i) => (
                                                <svg key={i} className="w-5 h-5 opacity-60" style={{ color: theme.textColor }} fill="currentColor" viewBox="0 0 24 24">
                                                    <path d={d} />
                                                </svg>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p className="text-[10px] text-gray-600 text-center mt-2">You'll add links & social icons after creating</p>
                        </div>
                    </div>
                </div>
            </form>
        </DashboardLayout>
    );
}
