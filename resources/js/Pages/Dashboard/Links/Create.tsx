import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Domain, Campaign, Overlay, Pixel } from '@/types';
import { url } from '@/utils';
import { FormEvent, useState } from 'react';

interface Props {
    domains: Domain[];
    campaigns: Campaign[];
    overlays: Overlay[];
    pixels: Pixel[];
}

export default function Create({ domains, campaigns, overlays, pixels }: Props) {
    const [showAdvanced, setShowAdvanced] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        url: '',
        custom_alias: '',
        domain_id: '',
        campaign_id: '',
        title: '',
        description: '',
        password: '',
        expiry_date: '',
        pixel_ids: [] as number[],
        overlay_id: '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(url('/dashboard/links'));
    };

    const togglePixel = (pixelId: number) => {
        setData('pixel_ids',
            data.pixel_ids.includes(pixelId)
                ? data.pixel_ids.filter((id) => id !== pixelId)
                : [...data.pixel_ids, pixelId]
        );
    };

    return (
        <DashboardLayout header="Create Link">
            <Head title="Create Link" />

            <div className="max-w-2xl">
                <div className="mb-6">
                    <Link
                        href={url('/dashboard/links')}
                        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Links
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-800">
                        <h2 className="text-lg font-semibold text-white">New Link</h2>
                        <p className="text-sm text-gray-500 mt-1">Shorten a new URL with optional customization.</p>
                    </div>

                    <div className="p-6 space-y-5">
                        {/* Long URL */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Destination URL *</label>
                            <input
                                type="url"
                                value={data.url}
                                onChange={(e) => setData('url', e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
                                placeholder="https://example.com/very-long-url"
                                required
                            />
                            {errors.url && <p className="mt-1.5 text-xs text-red-400">{errors.url}</p>}
                        </div>

                        {/* Custom Alias */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Custom Alias</label>
                            <input
                                type="text"
                                value={data.custom_alias}
                                onChange={(e) => setData('custom_alias', e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
                                placeholder="my-custom-link"
                            />
                            <p className="mt-1.5 text-xs text-gray-500">Leave empty to auto-generate. Only letters, numbers, and hyphens.</p>
                            {errors.custom_alias && <p className="mt-1.5 text-xs text-red-400">{errors.custom_alias}</p>}
                        </div>

                        {/* Domain Selector */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Domain</label>
                            <select
                                value={data.domain_id}
                                onChange={(e) => setData('domain_id', e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
                            >
                                <option value="">Default Domain</option>
                                {domains.map((domain) => (
                                    <option key={domain.id} value={domain.id}>{domain.domain}</option>
                                ))}
                            </select>
                            {errors.domain_id && <p className="mt-1.5 text-xs text-red-400">{errors.domain_id}</p>}
                        </div>

                        {/* Campaign Selector */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Campaign</label>
                            <select
                                value={data.campaign_id}
                                onChange={(e) => setData('campaign_id', e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
                            >
                                <option value="">No Campaign</option>
                                {campaigns.map((campaign) => (
                                    <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
                                ))}
                            </select>
                            {errors.campaign_id && <p className="mt-1.5 text-xs text-red-400">{errors.campaign_id}</p>}
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                            <input
                                type="text"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
                                placeholder="Link title for reference"
                            />
                            {errors.title && <p className="mt-1.5 text-xs text-red-400">{errors.title}</p>}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={3}
                                className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all resize-none"
                                placeholder="Optional description..."
                            />
                            {errors.description && <p className="mt-1.5 text-xs text-red-400">{errors.description}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Password Protection</label>
                            <input
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
                                placeholder="Leave empty for no password"
                            />
                            {errors.password && <p className="mt-1.5 text-xs text-red-400">{errors.password}</p>}
                        </div>

                        {/* Expiry Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Expiry Date</label>
                            <input
                                type="datetime-local"
                                value={data.expiry_date}
                                onChange={(e) => setData('expiry_date', e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
                            />
                            {errors.expiry_date && <p className="mt-1.5 text-xs text-red-400">{errors.expiry_date}</p>}
                        </div>

                        {/* Advanced Section */}
                        <div className="border-t border-gray-800 pt-5">
                            <button
                                type="button"
                                onClick={() => setShowAdvanced(!showAdvanced)}
                                className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                            >
                                <svg
                                    className={`w-4 h-4 transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                                Advanced Options
                            </button>

                            {showAdvanced && (
                                <div className="mt-5 space-y-5">
                                    {/* Pixels */}
                                    {pixels.length > 0 && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-3">Tracking Pixels</label>
                                            <div className="space-y-2">
                                                {pixels.map((pixel) => (
                                                    <label
                                                        key={pixel.id}
                                                        className="flex items-center gap-3 p-3 rounded-lg bg-gray-950 border border-gray-800 cursor-pointer hover:border-gray-700 transition-colors"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={data.pixel_ids.includes(pixel.id)}
                                                            onChange={() => togglePixel(pixel.id)}
                                                            className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-violet-500 focus:ring-violet-500/40 focus:ring-offset-0"
                                                        />
                                                        <div>
                                                            <span className="text-sm text-white">{pixel.name}</span>
                                                            <span className="text-xs text-gray-500 ml-2">({pixel.provider})</span>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Overlay Selector */}
                                    {overlays.length > 0 && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">CTA Overlay</label>
                                            <select
                                                value={data.overlay_id}
                                                onChange={(e) => setData('overlay_id', e.target.value)}
                                                className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
                                            >
                                                <option value="">No Overlay</option>
                                                {overlays.map((overlay) => (
                                                    <option key={overlay.id} value={overlay.id}>{overlay.name} ({overlay.type})</option>
                                                ))}
                                            </select>
                                            {errors.overlay_id && <p className="mt-1.5 text-xs text-red-400">{errors.overlay_id}</p>}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="px-6 py-4 bg-gray-950/50 border-t border-gray-800 flex items-center justify-end gap-3">
                        <Link
                            href={url('/dashboard/links')}
                            className="px-4 py-2.5 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-sm font-medium rounded-xl transition-all duration-200 disabled:opacity-50"
                        >
                            {processing ? 'Creating...' : 'Create Link'}
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
