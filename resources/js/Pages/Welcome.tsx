import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { User } from '@/types';
import { url } from '@/utils';

interface WelcomeProps {
    stats: {
        total_links: number;
        total_clicks: number;
        total_users: number;
    };
}

export default function Welcome({ stats }: WelcomeProps) {
    const { auth } = usePage<any>().props as { auth: { user: User | null } };
    const { data, setData, post, processing } = useForm({ url: '' });
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleShorten: FormEventHandler = (e) => {
        e.preventDefault();
        post(url('/dashboard/links'), { preserveScroll: true });
    };

    return (
        <>
            <Head title="Brevio - Modern URL Shortener" />

            <div className="min-h-screen bg-gray-950 text-white overflow-hidden">
                {/* Ambient Background */}
                <div className="fixed inset-0 pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-3xl" />
                </div>

                {/* Navigation */}
                <nav className="relative z-50 border-b border-gray-800/50 bg-gray-950/80 backdrop-blur-xl">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                    </svg>
                                </div>
                                <span className="text-xl font-bold">Brevio</span>
                            </div>

                            <div className="hidden md:flex items-center gap-8">
                                <a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">Features</a>
                                <a href="#stats" className="text-sm text-gray-400 hover:text-white transition-colors">Stats</a>
                                <a href="#pricing" className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</a>
                            </div>

                            <div className="hidden md:flex items-center gap-3">
                                {auth.user ? (
                                    <Link href={url('/dashboard')} className="px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white transition-all">
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link href={url('/login')} className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">
                                            Sign In
                                        </Link>
                                        <Link href={url('/register')} className="px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white transition-all">
                                            Get Started Free
                                        </Link>
                                    </>
                                )}
                            </div>

                            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-gray-400 hover:text-white">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                                </svg>
                            </button>
                        </div>

                        {mobileMenuOpen && (
                            <div className="md:hidden py-4 border-t border-gray-800/50 space-y-3">
                                <a href="#features" className="block text-sm text-gray-400 hover:text-white">Features</a>
                                <a href="#stats" className="block text-sm text-gray-400 hover:text-white">Stats</a>
                                <a href="#pricing" className="block text-sm text-gray-400 hover:text-white">Pricing</a>
                                <div className="pt-3 space-y-2">
                                    {auth.user ? (
                                        <Link href={url('/dashboard')} className="block px-4 py-2 text-center text-sm font-medium rounded-lg bg-violet-600 text-white">Dashboard</Link>
                                    ) : (
                                        <>
                                            <Link href={url('/login')} className="block text-sm text-gray-300 text-center">Sign In</Link>
                                            <Link href={url('/register')} className="block px-4 py-2 text-center text-sm font-medium rounded-lg bg-violet-600 text-white">Get Started</Link>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="relative pt-20 pb-32 sm:pt-32 sm:pb-40">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium mb-8">
                            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                            Powerful URL Management Platform
                        </div>

                        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
                            <span className="block">Shorten, Track &</span>
                            <span className="block mt-2 bg-gradient-to-r from-violet-400 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent">
                                Optimize Your Links
                            </span>
                        </h1>

                        <p className="mt-6 text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                            Create branded short links, QR codes, and bio pages. Track every click with advanced analytics.
                            All in one modern platform.
                        </p>

                        {/* Shorten Form */}
                        <form onSubmit={handleShorten} className="mt-10 max-w-2xl mx-auto">
                            <div className="flex flex-col sm:flex-row gap-3 p-2 rounded-2xl bg-gray-900 border border-gray-800">
                                <div className="flex-1 relative">
                                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                    </svg>
                                    <input
                                        type="url"
                                        value={data.url}
                                        onChange={(e) => setData('url', e.target.value)}
                                        placeholder="Paste your long URL here..."
                                        className="w-full pl-12 pr-4 py-3.5 bg-transparent border-0 text-white placeholder-gray-500 focus:ring-0 focus:outline-none text-sm sm:text-base"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={processing || !data.url}
                                    className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-medium text-sm sm:text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                >
                                    {processing ? 'Shortening...' : 'Shorten Link'}
                                </button>
                            </div>
                        </form>

                        <p className="mt-4 text-xs text-gray-500">
                            Free to use &middot; No registration required for basic shortening
                        </p>
                    </div>
                </section>

                {/* Stats Section */}
                <section id="stats" className="relative py-20 border-t border-gray-800/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
                            {[
                                { label: 'Links Created', value: stats.total_links, icon: '🔗' },
                                { label: 'Total Clicks', value: stats.total_clicks, icon: '📊' },
                                { label: 'Happy Users', value: stats.total_users, icon: '👥' },
                            ].map((stat) => (
                                <div key={stat.label} className="p-8 rounded-2xl bg-gray-900/50 border border-gray-800 hover:border-gray-700 transition-colors">
                                    <div className="text-3xl mb-3">{stat.icon}</div>
                                    <div className="text-3xl sm:text-4xl font-bold text-white">{formatNumber(stat.value)}</div>
                                    <div className="mt-2 text-sm text-gray-400">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="relative py-20 border-t border-gray-800/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl sm:text-4xl font-bold">Everything You Need</h2>
                            <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
                                Powerful features to create, manage, and analyze your short links at scale.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {features.map((feature) => (
                                <div key={feature.title} className="group p-6 rounded-2xl bg-gray-900/50 border border-gray-800 hover:border-violet-500/30 transition-all duration-300 hover:-translate-y-0.5">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d={feature.icon} />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                                    <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="relative py-20 border-t border-gray-800/50">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <div className="p-12 rounded-3xl bg-gradient-to-br from-violet-500/10 via-gray-900 to-fuchsia-500/10 border border-gray-800">
                            <h2 className="text-3xl sm:text-4xl font-bold">Ready to Get Started?</h2>
                            <p className="mt-4 text-gray-400 max-w-xl mx-auto">
                                Join thousands of marketers, developers, and creators who trust Brevio for their link management.
                            </p>
                            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link href={url('/register')} className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-medium transition-all">
                                    Create Free Account
                                </Link>
                                <Link href={url('/login')} className="px-8 py-3.5 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800 font-medium transition-all">
                                    Sign In
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-gray-800/50 py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                    </svg>
                                </div>
                                <span className="font-bold">Brevio</span>
                            </div>
                            <p className="text-sm text-gray-500">
                                &copy; {new Date().getFullYear()} Brevio. All rights reserved.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}

const features = [
    {
        title: 'Smart Link Shortening',
        description: 'Create branded short links with custom aliases, password protection, and expiration dates.',
        icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
        color: 'from-violet-500 to-purple-600',
    },
    {
        title: 'Advanced Analytics',
        description: 'Track clicks, referrers, browsers, countries, and devices in real-time with beautiful dashboards.',
        icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
        color: 'from-cyan-500 to-blue-600',
    },
    {
        title: 'Bio Pages',
        description: 'Build stunning link-in-bio pages with customizable themes, widgets, and your own branding.',
        icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
        color: 'from-emerald-500 to-green-600',
    },
    {
        title: 'QR Code Generator',
        description: 'Generate dynamic QR codes with custom colors and styles, linked to your shortened URLs.',
        icon: 'M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z',
        color: 'from-amber-500 to-orange-600',
    },
    {
        title: 'Custom Domains',
        description: 'Use your own branded domains for short links. Full DNS verification and root redirect support.',
        icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9',
        color: 'from-rose-500 to-pink-600',
    },
    {
        title: 'Team Collaboration',
        description: 'Invite team members, assign roles, and manage links collaboratively with shared workspaces.',
        icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
        color: 'from-indigo-500 to-violet-600',
    },
];

function formatNumber(num: number): string {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
    return num.toLocaleString();
}
