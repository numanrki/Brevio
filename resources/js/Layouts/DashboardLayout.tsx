import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, useState } from 'react';
import { User } from '@/types';
import { url } from '@/utils';

interface DashboardLayoutProps extends PropsWithChildren {
    header?: string;
}

const navigation = [
    { name: 'Dashboard', href: url('/dashboard'), icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Links', href: url('/dashboard/links'), icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' },
    { name: 'Bio Pages', href: url('/dashboard/bio'), icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { name: 'QR Codes', href: url('/dashboard/qr-codes'), icon: 'M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z' },
    { name: 'Campaigns', href: url('/dashboard/campaigns'), icon: 'M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9' },
    { name: 'Overlays', href: url('/dashboard/overlays'), icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { name: 'Pixels', href: url('/dashboard/pixels'), icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
    { name: 'Teams', href: url('/dashboard/teams'), icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { name: 'Domains', href: url('/dashboard/domains'), icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9' },
    { name: 'Stats', href: url('/dashboard/stats'), icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
];

export default function DashboardLayout({ children, header }: DashboardLayoutProps) {
    const { auth } = usePage<{ auth: { user: User & { plan?: { name: string } } } }>().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const currentPath = window.location.pathname;

    return (
        <div className="min-h-screen bg-gray-950">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
                    <div className="fixed inset-y-0 left-0 w-72 bg-gray-900 border-r border-gray-800">
                        <SidebarContent currentPath={currentPath} onClose={() => setSidebarOpen(false)} user={auth.user} />
                    </div>
                </div>
            )}

            {/* Desktop sidebar */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72">
                <div className="flex flex-col w-72 bg-gray-900 border-r border-gray-800">
                    <SidebarContent currentPath={currentPath} user={auth.user} />
                </div>
            </div>

            {/* Main content */}
            <div className="lg:pl-72">
                {/* Top bar */}
                <div className="sticky top-0 z-30 flex items-center h-16 px-4 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800 sm:px-6 lg:px-8">
                    <button
                        className="text-gray-400 hover:text-white lg:hidden"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <div className="flex-1 flex items-center justify-between ml-4 lg:ml-0">
                        {header && <h1 className="text-xl font-semibold text-white">{header}</h1>}
                        <div className="flex items-center gap-4 ml-auto">
                            {auth.user.role === 'admin' && (
                                <Link href={url('/admin')} className="text-sm text-gray-400 hover:text-white transition-colors">
                                    Admin Panel →
                                </Link>
                            )}
                            <div className="flex items-center gap-3">
                                {auth.user.avatar ? (
                                    <img
                                        src={auth.user.avatar}
                                        alt={auth.user.name}
                                        className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-700"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-sm font-bold">
                                        {auth.user.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <span className="text-sm text-gray-300 hidden sm:block">{auth.user.name}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Page content */}
                <main className="p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}

function SidebarContent({ currentPath, onClose, user }: { currentPath: string; onClose?: () => void; user: User & { plan?: { name: string } } }) {
    return (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center h-16 px-6 border-b border-gray-800">
                <Link href={url('/')} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                    </div>
                    <span className="text-lg font-bold text-white">Brevio</span>
                    {user.plan && (
                        <span className="text-[10px] font-medium text-fuchsia-400 bg-fuchsia-500/10 px-1.5 py-0.5 rounded">
                            {user.plan.name}
                        </span>
                    )}
                </Link>
                {onClose && (
                    <button onClick={onClose} className="ml-auto text-gray-400 hover:text-white lg:hidden">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {navigation.map((item) => {
                    const isActive = item.href === url('/dashboard')
                        ? currentPath === url('/dashboard') || currentPath === url('/dashboard') + '/'
                        : currentPath.startsWith(item.href);
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                isActive
                                    ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                            }`}
                        >
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                            </svg>
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom section */}
            <div className="p-4 border-t border-gray-800">
                <Link
                    href={url('/logout')}
                    method="post"
                    as="button"
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                </Link>
            </div>
        </div>
    );
}
