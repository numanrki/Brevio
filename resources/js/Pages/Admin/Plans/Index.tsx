import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/Pagination';
import { Head, Link, router } from '@inertiajs/react';
import { PaginatedData, Plan } from '@/types';
import { url } from '@/utils';

interface Props {
    plans: PaginatedData<Plan>;
}

export default function Index({ plans }: Props) {
    const handleDelete = (plan: Plan) => {
        if (confirm(`Are you sure you want to delete the "${plan.name}" plan? This cannot be undone.`)) {
            router.delete(url(`/admin/plans/${plan.id}`), { preserveScroll: true });
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
    };

    return (
        <AdminLayout header="Plans">
            <Head title="Manage Plans" />

            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4 mb-6">
                <p className="text-sm text-gray-500">
                    <span className="text-gray-300">{plans.total}</span> plan{plans.total !== 1 ? 's' : ''} total
                </p>
                <Link
                    href={url('/admin/plans/create')}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-xl transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Plan
                </Link>
            </div>

            {/* Plans Grid */}
            {plans.data.length === 0 ? (
                <div className="rounded-xl bg-gray-900 border border-gray-800 px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <p className="text-gray-500 text-sm">No plans created yet</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {plans.data.map((plan) => (
                        <div
                            key={plan.id}
                            className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden hover:border-gray-700 transition-colors group"
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                                        {plan.is_active ? (
                                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                ACTIVE
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-700/50 text-gray-400 border border-gray-700">
                                                INACTIVE
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {plan.description && (
                                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{plan.description}</p>
                                )}

                                {/* Pricing */}
                                <div className="flex items-baseline gap-1 mb-4">
                                    <span className="text-3xl font-bold text-white">{formatPrice(plan.price_monthly)}</span>
                                    <span className="text-sm text-gray-500">/mo</span>
                                    {plan.price_yearly > 0 && (
                                        <span className="text-sm text-gray-600 ml-2">
                                            ({formatPrice(plan.price_yearly)}/yr)
                                        </span>
                                    )}
                                </div>

                                {/* Limits */}
                                <div className="space-y-2 mb-4">
                                    <LimitRow label="Links" value={plan.limits?.link_limit} />
                                    <LimitRow label="Clicks" value={plan.limits?.click_limit} />
                                    <LimitRow label="Domains" value={plan.limits?.allowed_domains} />
                                    <LimitRow label="Bio Pages" value={plan.limits?.allowed_bio_pages} />
                                    <LimitRow label="QR Codes" value={plan.limits?.allowed_qr_codes} />
                                    <LimitRow label="Pixels" value={plan.limits?.allowed_pixels} />
                                    <LimitRow label="Teams" value={plan.limits?.allowed_teams} />
                                </div>

                                {/* Features */}
                                {plan.features && Object.keys(plan.features).length > 0 && (
                                    <div className="pt-4 border-t border-gray-800">
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Features</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {Object.entries(plan.features).map(([key, enabled]) => (
                                                <span
                                                    key={key}
                                                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                                                        enabled
                                                            ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                                                            : 'bg-gray-800 text-gray-600 border border-gray-700 line-through'
                                                    }`}
                                                >
                                                    {key.replace(/_/g, ' ')}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="px-6 py-3 bg-gray-950/50 border-t border-gray-800 flex items-center justify-end gap-2">
                                <Link
                                    href={url(`/admin/plans/${plan.id}/edit`)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-400 hover:text-violet-400 hover:bg-violet-500/10 rounded-lg transition-all"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Edit
                                </Link>
                                <button
                                    onClick={() => handleDelete(plan)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            <div className="mt-6">
                <Pagination links={plans.links} currentPage={plans.current_page} lastPage={plans.last_page} />
            </div>
        </AdminLayout>
    );
}

function LimitRow({ label, value }: { label: string; value?: number }) {
    const display = value === undefined || value === null ? '—' : value === -1 || value >= 999999 ? 'Unlimited' : value.toLocaleString();
    return (
        <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">{label}</span>
            <span className="text-gray-300 font-medium">{display}</span>
        </div>
    );
}
