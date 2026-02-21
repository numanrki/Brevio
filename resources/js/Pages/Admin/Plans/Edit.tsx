import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Plan } from '@/types';
import { FormEvent } from 'react';
import { url } from '@/utils';

const DEFAULT_FEATURES = [
    'custom_alias',
    'password_protection',
    'expiry_dates',
    'bulk_links',
    'api_access',
    'custom_domains',
    'bio_pages',
    'qr_codes',
    'pixels',
    'teams',
    'overlays',
    'splash_pages',
    'deep_links',
    'ab_testing',
    'advanced_stats',
];

interface Props {
    plan: Plan;
}

export default function Edit({ plan }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: plan.name || '',
        slug: plan.slug || '',
        description: plan.description || '',
        price_monthly: plan.price_monthly ?? 0,
        price_yearly: plan.price_yearly ?? 0,
        link_limit: plan.limits?.link_limit ?? 100,
        click_limit: plan.limits?.click_limit ?? 10000,
        allowed_domains: plan.limits?.allowed_domains ?? 1,
        allowed_bio_pages: plan.limits?.allowed_bio_pages ?? 1,
        allowed_qr_codes: plan.limits?.allowed_qr_codes ?? 10,
        allowed_pixels: plan.limits?.allowed_pixels ?? 5,
        allowed_teams: plan.limits?.allowed_teams ?? 1,
        features: (plan.features || {}) as Record<string, boolean>,
        is_active: plan.is_active ?? true,
        sort_order: (plan as any).sort_order ?? 0,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        put(url(`/admin/plans/${plan.id}`));
    };

    const toggleFeature = (feature: string) => {
        setData('features', {
            ...data.features,
            [feature]: !data.features[feature],
        });
    };

    return (
        <AdminLayout header="Edit Plan">
            <Head title={`Edit ${plan.name}`} />

            <div className="max-w-3xl">
                <div className="mb-6">
                    <Link
                        href={url('/admin/plans')}
                        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Plans
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-800">
                            <h2 className="text-lg font-semibold text-white">Basic Information</h2>
                            <p className="text-sm text-gray-500 mt-1">Update plan name and pricing for <span className="text-gray-300">{plan.name}</span>.</p>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
                                    />
                                    {errors.name && <p className="mt-1.5 text-xs text-red-400">{errors.name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Slug</label>
                                    <input
                                        type="text"
                                        value={data.slug}
                                        onChange={(e) => setData('slug', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
                                    />
                                    {errors.slug && <p className="mt-1.5 text-xs text-red-400">{errors.slug}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all resize-none"
                                />
                                {errors.description && <p className="mt-1.5 text-xs text-red-400">{errors.description}</p>}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Monthly Price ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.price_monthly}
                                        onChange={(e) => setData('price_monthly', parseFloat(e.target.value) || 0)}
                                        className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
                                    />
                                    {errors.price_monthly && <p className="mt-1.5 text-xs text-red-400">{errors.price_monthly}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Yearly Price ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.price_yearly}
                                        onChange={(e) => setData('price_yearly', parseFloat(e.target.value) || 0)}
                                        className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
                                    />
                                    {errors.price_yearly && <p className="mt-1.5 text-xs text-red-400">{errors.price_yearly}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Sort Order</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={data.sort_order}
                                        onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                        className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
                                    />
                                    {errors.sort_order && <p className="mt-1.5 text-xs text-red-400">{errors.sort_order}</p>}
                                </div>
                                <div className="flex items-end">
                                    <label className="flex items-center gap-3 cursor-pointer py-2.5">
                                        <div
                                            className={`relative w-11 h-6 rounded-full transition-colors ${data.is_active ? 'bg-violet-600' : 'bg-gray-700'}`}
                                            onClick={() => setData('is_active', !data.is_active)}
                                        >
                                            <div
                                                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                                                    data.is_active ? 'translate-x-5' : 'translate-x-0'
                                                }`}
                                            />
                                        </div>
                                        <span className="text-sm font-medium text-gray-300">Active</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Limits */}
                    <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-800">
                            <h2 className="text-lg font-semibold text-white">Usage Limits</h2>
                            <p className="text-sm text-gray-500 mt-1">Set the maximum allowances for this plan. Use -1 for unlimited.</p>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                <LimitInput label="Link Limit" value={data.link_limit} onChange={(v) => setData('link_limit', v)} error={errors.link_limit} />
                                <LimitInput label="Click Limit" value={data.click_limit} onChange={(v) => setData('click_limit', v)} error={errors.click_limit} />
                                <LimitInput label="Domains" value={data.allowed_domains} onChange={(v) => setData('allowed_domains', v)} error={errors.allowed_domains} />
                                <LimitInput label="Bio Pages" value={data.allowed_bio_pages} onChange={(v) => setData('allowed_bio_pages', v)} error={errors.allowed_bio_pages} />
                                <LimitInput label="QR Codes" value={data.allowed_qr_codes} onChange={(v) => setData('allowed_qr_codes', v)} error={errors.allowed_qr_codes} />
                                <LimitInput label="Pixels" value={data.allowed_pixels} onChange={(v) => setData('allowed_pixels', v)} error={errors.allowed_pixels} />
                                <LimitInput label="Teams" value={data.allowed_teams} onChange={(v) => setData('allowed_teams', v)} error={errors.allowed_teams} />
                            </div>
                        </div>
                    </div>

                    {/* Features */}
                    <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-800">
                            <h2 className="text-lg font-semibold text-white">Features</h2>
                            <p className="text-sm text-gray-500 mt-1">Toggle the features included with this plan.</p>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {DEFAULT_FEATURES.map((feature) => (
                                    <label
                                        key={feature}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                                            data.features[feature]
                                                ? 'bg-violet-500/10 border-violet-500/30 text-violet-300'
                                                : 'bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700'
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={!!data.features[feature]}
                                            onChange={() => toggleFeature(feature)}
                                            className="sr-only"
                                        />
                                        <div
                                            className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-all ${
                                                data.features[feature]
                                                    ? 'bg-violet-600 border-violet-500'
                                                    : 'bg-gray-800 border-gray-700'
                                            }`}
                                        >
                                            {data.features[feature] && (
                                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                        <span className="text-sm font-medium capitalize">{feature.replace(/_/g, ' ')}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex items-center justify-end gap-3">
                        <Link
                            href={url('/admin/plans')}
                            className="px-4 py-2.5 text-sm font-medium text-gray-400 hover:text-white border border-gray-700 hover:border-gray-600 rounded-xl transition-all"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors"
                        >
                            {processing ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}

function LimitInput({ label, value, onChange, error }: { label: string; value: number; onChange: (v: number) => void; error?: string }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
            <input
                type="number"
                min="-1"
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
            />
            {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
        </div>
    );
}
