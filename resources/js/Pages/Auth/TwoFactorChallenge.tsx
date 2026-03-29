import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { url } from '@/utils';

export default function TwoFactorChallenge() {
    const [useRecovery, setUseRecovery] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        code: '',
        recovery_code: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(url('/admin/2fa'));
    };

    return (
        <>
            <Head title="Two-Factor Authentication" />

            <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
                <div className="fixed inset-0 pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-500/5 rounded-full blur-3xl" />
                </div>

                <div className="relative w-full max-w-sm">
                    {/* Logo */}
                    <div className="flex items-center justify-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <span className="text-2xl font-bold text-white">Brevio</span>
                    </div>

                    {/* Card */}
                    <div className="rounded-2xl bg-gray-900 border border-gray-800 p-8">
                        <h2 className="text-lg font-semibold text-white text-center mb-1">Two-Factor Authentication</h2>
                        <p className="text-sm text-gray-500 text-center mb-6">
                            {useRecovery
                                ? 'Enter one of your emergency recovery codes.'
                                : 'Enter the 6-digit code from your authenticator app.'}
                        </p>

                        <form onSubmit={submit} className="space-y-5">
                            {!useRecovery ? (
                                <div>
                                    <label htmlFor="code" className="block text-sm font-medium text-gray-300 mb-2">Verification Code</label>
                                    <input
                                        id="code"
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        maxLength={6}
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-center text-lg font-mono text-white tracking-[0.5em] placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
                                        placeholder="000000"
                                        autoFocus
                                        autoComplete="one-time-code"
                                        required
                                    />
                                    {errors.code && <p className="mt-1.5 text-xs text-red-400">{errors.code}</p>}
                                </div>
                            ) : (
                                <div>
                                    <label htmlFor="recovery_code" className="block text-sm font-medium text-gray-300 mb-2">Recovery Code</label>
                                    <input
                                        id="recovery_code"
                                        type="text"
                                        value={data.recovery_code}
                                        onChange={(e) => setData('recovery_code', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-center text-sm font-mono text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
                                        placeholder="xxxx-xxxx"
                                        autoFocus
                                        required
                                    />
                                    {errors.recovery_code && <p className="mt-1.5 text-xs text-red-400">{errors.recovery_code}</p>}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={processing || (!useRecovery && data.code.length !== 6) || (useRecovery && !data.recovery_code)}
                                className="w-full py-2.5 px-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-sm font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? 'Verifying...' : 'Verify'}
                            </button>
                        </form>

                        <button
                            type="button"
                            onClick={() => {
                                setUseRecovery(!useRecovery);
                                setData({ code: '', recovery_code: '' });
                            }}
                            className="block w-full text-center text-sm text-gray-500 hover:text-gray-300 mt-4 transition-colors"
                        >
                            {useRecovery ? 'Use authenticator code' : 'Use recovery code'}
                        </button>

                        <a href={url('/admin/login')} className="block text-center text-sm text-gray-600 hover:text-gray-400 mt-2 transition-colors">
                            ← Back to login
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}
