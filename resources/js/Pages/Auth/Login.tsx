import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { url } from '@/utils';

export default function Login({ status, googleEnabled, googleAuthOnly }: { status?: string; googleEnabled?: boolean; googleAuthOnly?: boolean }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(url('/admin/login'));
    };

    const showLoginForm = !googleAuthOnly;

    return (
        <>
            <Head title="Admin Login" />

            <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
                {/* Ambient Background */}
                <div className="fixed inset-0 pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-500/5 rounded-full blur-3xl" />
                </div>

                <div className="relative w-full max-w-sm">
                    {/* Logo */}
                    <div className="flex items-center justify-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                        </div>
                        <span className="text-2xl font-bold text-white">Brevio</span>
                    </div>

                    {/* Card */}
                    <div className="rounded-2xl bg-gray-900 border border-gray-800 p-8">
                        <h2 className="text-lg font-semibold text-white text-center mb-1">Welcome back</h2>
                        <p className="text-sm text-gray-500 text-center mb-6">Sign in to your admin panel</p>

                        {status && (
                            <div className="mb-4 text-sm font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-2">
                                {status}
                            </div>
                        )}

                        {errors.email && (
                            <div className="mb-4 text-sm font-medium text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
                                {errors.email}
                            </div>
                        )}

                        {/* Google Sign-In */}
                        {googleEnabled && (
                            <div className={showLoginForm ? 'mb-5' : ''}>
                                <a
                                    href={url('/auth/google/redirect')}
                                    className="flex items-center justify-center gap-3 w-full py-2.5 px-4 bg-white hover:bg-gray-100 text-gray-800 text-sm font-medium rounded-xl transition-colors"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                    Sign in with Google
                                </a>

                                {showLoginForm && (
                                    <div className="relative mt-5">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-gray-800" />
                                        </div>
                                        <div className="relative flex justify-center text-xs">
                                            <span className="bg-gray-900 px-3 text-gray-500">or continue with email</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Email/Password Form */}
                        {showLoginForm && (
                            <form onSubmit={submit} className="space-y-5">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
                                        placeholder="admin@brevio.link"
                                        autoComplete="username"
                                        autoFocus
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                                    <input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
                                        placeholder="••••••••"
                                        autoComplete="current-password"
                                        required
                                    />
                                    {errors.password && <p className="mt-1.5 text-xs text-red-400">{errors.password}</p>}
                                </div>

                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.remember}
                                            onChange={(e) => setData('remember', e.target.checked)}
                                            className="w-4 h-4 rounded border-gray-700 bg-gray-950 text-violet-500 focus:ring-violet-500/40 focus:ring-offset-0"
                                        />
                                        <span className="text-sm text-gray-400">Remember me</span>
                                    </label>
                                    <a href={url('/admin/forgot-password')} className="text-sm text-violet-400 hover:text-violet-300 transition-colors">
                                        Forgot password?
                                    </a>
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full py-2.5 px-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-sm font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing ? 'Signing in...' : 'Sign In'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
