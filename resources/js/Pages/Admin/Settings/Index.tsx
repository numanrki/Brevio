import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEvent, useState, useCallback } from 'react';
import { url } from '@/utils';
import { QRCodeSVG } from 'qrcode.react';

interface Props {
    settings: Record<string, string>;
    has2fa: boolean;
}

interface SettingField {
    key: string;
    label: string;
    type: 'text' | 'email' | 'password' | 'url' | 'textarea' | 'number';
    placeholder?: string;
}

interface SettingSection {
    title: string;
    description: string;
    icon: string;
    fields: SettingField[];
}

const sections: SettingSection[] = [
    {
        title: 'General',
        description: 'Basic site configuration settings.',
        icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
        fields: [
            { key: 'site_name', label: 'Site Name', type: 'text', placeholder: 'Brevio' },
            { key: 'site_description', label: 'Site Description', type: 'text', placeholder: 'The modern URL shortener' },
            { key: 'site_url', label: 'Site URL', type: 'url', placeholder: 'https://brevio.link' },
        ],
    },
    {
        title: 'Email',
        description: 'Configure outgoing email settings.',
        icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
        fields: [
            { key: 'mail_driver', label: 'Mail Driver', type: 'text', placeholder: 'smtp' },
            { key: 'mail_host', label: 'Mail Host', type: 'text', placeholder: 'smtp.mailgun.org' },
            { key: 'mail_port', label: 'Mail Port', type: 'number', placeholder: '587' },
            { key: 'mail_username', label: 'Mail Username', type: 'text', placeholder: 'your-username' },
            { key: 'mail_password', label: 'Mail Password', type: 'password', placeholder: '••••••••' },
            { key: 'mail_from', label: 'Mail From Address', type: 'email', placeholder: 'noreply@brevio.link' },
        ],
    },
    {
        title: 'Social',
        description: 'Social media profile links.',
        icon: 'M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z',
        fields: [
            { key: 'facebook_url', label: 'Facebook URL', type: 'url', placeholder: 'https://facebook.com/brevio' },
            { key: 'twitter_url', label: 'Twitter / X URL', type: 'url', placeholder: 'https://x.com/brevio' },
        ],
    },
    {
        title: 'Advanced',
        description: 'Analytics tracking and custom code injection.',
        icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
        fields: [
            { key: 'google_analytics_id', label: 'Google Analytics ID', type: 'text', placeholder: 'G-XXXXXXXXXX' },
            { key: 'custom_head_code', label: 'Custom Head Code', type: 'textarea', placeholder: '<!-- Custom head code -->' },
            { key: 'custom_footer_code', label: 'Custom Footer Code', type: 'textarea', placeholder: '<!-- Custom footer code -->' },
        ],
    },
];

export default function Index({ settings, has2fa }: Props) {
    // Build initial data from all known keys
    const allKeys = sections.flatMap((s) => s.fields.map((f) => f.key));
    const initialData: Record<string, string> = {};
    allKeys.forEach((key) => {
        initialData[key] = settings[key] ?? '';
    });

    const { data, setData, post, processing, errors, recentlySuccessful } = useForm(initialData);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(url('/admin/settings'));
    };

    const getValue = (key: string) => data[key] ?? '';
    const setValue = (key: string, value: string) => setData(key as keyof typeof data, value);

    return (
        <AdminLayout header="Settings">
            <Head title="Site Settings" />

            <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
                {sections.map((section) => (
                    <div key={section.title} className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-800 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d={section.icon} />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-white">{section.title}</h2>
                                <p className="text-sm text-gray-500 mt-0.5">{section.description}</p>
                            </div>
                        </div>
                        <div className="p-6 space-y-5">
                            {section.fields.map((field) => (
                                <div key={field.key}>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">{field.label}</label>
                                    {field.type === 'textarea' ? (
                                        <textarea
                                            value={getValue(field.key)}
                                            onChange={(e) => setValue(field.key, e.target.value)}
                                            rows={4}
                                            className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all resize-none font-mono"
                                            placeholder={field.placeholder}
                                        />
                                    ) : (
                                        <input
                                            type={field.type}
                                            value={getValue(field.key)}
                                            onChange={(e) => setValue(field.key, e.target.value)}
                                            className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
                                            placeholder={field.placeholder}
                                        />
                                    )}
                                    {errors[field.key] && (
                                        <p className="mt-1.5 text-xs text-red-400">{errors[field.key]}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Security — 2FA */}
                <TwoFactorSection initialEnabled={has2fa} />

                {/* Submit */}
                <div className="flex items-center justify-end gap-3">
                    {recentlySuccessful && (
                        <div className="flex items-center gap-2 text-sm text-emerald-400">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Settings saved
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors"
                    >
                        {processing ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}

/* ─── Two-Factor Authentication Section ─── */

function TwoFactorSection({ initialEnabled }: { initialEnabled: boolean }) {
    const [enabled, setEnabled] = useState(initialEnabled);
    const [setupState, setSetupState] = useState<'idle' | 'loading' | 'setup' | 'confirming'>('idle');
    const [secret, setSecret] = useState('');
    const [qrUrl, setQrUrl] = useState('');
    const [code, setCode] = useState('');
    const [disablePassword, setDisablePassword] = useState('');
    const [error, setError] = useState('');
    const [showDisable, setShowDisable] = useState(false);

    const csrfToken = () =>
        document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

    const apiCall = async (endpoint: string, body: Record<string, string> = {}) => {
        const res = await fetch(url(endpoint), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken(), Accept: 'application/json' },
            body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || 'Request failed');
        return data;
    };

    const startSetup = async () => {
        setSetupState('loading');
        setError('');
        try {
            const data = await apiCall('/admin/2fa/setup');
            setSecret(data.secret);
            setQrUrl(data.qr_url);
            setSetupState('setup');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Setup failed');
            setSetupState('idle');
        }
    };

    const confirmSetup = async () => {
        setSetupState('confirming');
        setError('');
        try {
            await apiCall('/admin/2fa/confirm', { code });
            setEnabled(true);
            setSetupState('idle');
            setCode('');
            setSecret('');
            setQrUrl('');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Verification failed');
            setSetupState('setup');
        }
    };

    const disable2FA = async () => {
        setError('');
        try {
            await apiCall('/admin/2fa/disable', { password: disablePassword });
            setEnabled(false);
            setShowDisable(false);
            setDisablePassword('');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to disable');
        }
    };

    return (
        <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-800 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-white">Security</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Two-factor authentication (2FA) with Google Authenticator.</p>
                </div>
            </div>

            <div className="p-6">
                {/* Status badge */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-300">Two-Factor Authentication</span>
                        {enabled ? (
                            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">Enabled</span>
                        ) : (
                            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-gray-700/50 text-gray-400 border border-gray-700 uppercase">Disabled</span>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 mb-4">{error}</div>
                )}

                {/* Not enabled — show setup */}
                {!enabled && setupState === 'idle' && (
                    <div>
                        <p className="text-sm text-gray-400 mb-4">
                            Add an extra layer of security to your account. You'll need an authenticator app like Google Authenticator, Microsoft Authenticator, or Authy.
                        </p>
                        <button
                            onClick={startSetup}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Enable 2FA
                        </button>
                    </div>
                )}

                {setupState === 'loading' && (
                    <div className="flex items-center gap-3 text-gray-400 text-sm">
                        <svg className="w-5 h-5 animate-spin text-violet-400" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Generating secret...
                    </div>
                )}

                {/* Setup — QR code + secret + verify */}
                {setupState === 'setup' && (
                    <div className="space-y-5">
                        <p className="text-sm text-gray-400">
                            Scan this QR code with your authenticator app, then enter the 6-digit code to confirm.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            {/* QR Code */}
                            <div className="p-3 bg-white rounded-xl flex-shrink-0">
                                <QRCodeSVG value={qrUrl} size={160} />
                            </div>

                            <div className="space-y-3 flex-1 min-w-0">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase mb-1">Manual Entry Key</p>
                                    <code className="text-sm font-mono text-violet-400 bg-violet-500/10 px-3 py-1.5 rounded-lg block break-all select-all">{secret}</code>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Verification Code</label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        maxLength={6}
                                        value={code}
                                        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        placeholder="000000"
                                        className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm font-mono text-white tracking-widest placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40"
                                    />
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={confirmSetup}
                                        disabled={code.length !== 6 || setupState === 'confirming' as string}
                                        className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-all"
                                    >
                                        Verify & Enable
                                    </button>
                                    <button
                                        onClick={() => { setSetupState('idle'); setCode(''); setError(''); }}
                                        className="px-4 py-2.5 text-sm text-gray-400 hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {setupState === 'confirming' && (
                    <div className="flex items-center gap-3 text-gray-400 text-sm">
                        <svg className="w-5 h-5 animate-spin text-emerald-400" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Verifying code...
                    </div>
                )}

                {/* Enabled — show disable option */}
                {enabled && setupState === 'idle' && !showDisable && (
                    <div>
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/10 mb-4">
                            <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm text-emerald-400">Your account is protected with two-factor authentication.</p>
                        </div>
                        <button
                            onClick={() => setShowDisable(true)}
                            className="px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all"
                        >
                            Disable 2FA
                        </button>
                    </div>
                )}

                {/* Disable confirmation */}
                {showDisable && (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-400">Enter your password to disable two-factor authentication.</p>
                        <input
                            type="password"
                            value={disablePassword}
                            onChange={(e) => setDisablePassword(e.target.value)}
                            placeholder="Your password"
                            className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/40"
                        />
                        <div className="flex items-center gap-3">
                            <button
                                onClick={disable2FA}
                                disabled={!disablePassword}
                                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-all"
                            >
                                Confirm Disable
                            </button>
                            <button
                                onClick={() => { setShowDisable(false); setDisablePassword(''); setError(''); }}
                                className="px-4 py-2.5 text-sm text-gray-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
