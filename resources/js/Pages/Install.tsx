import { Head } from '@inertiajs/react';
import { useState, useCallback, FormEvent } from 'react';
import { url } from '@/utils';

type Step = 'form' | 'installing' | 'success' | 'error';
type InstallPhase = 'validate' | 'database' | 'migrate' | 'finalize';

interface PhaseConfig {
    key: InstallPhase;
    label: string;
    endpoint: string;
    icon: string;
}

const PHASES: PhaseConfig[] = [
    {
        key: 'validate',
        label: 'Validating configuration...',
        endpoint: '/install/validate',
        icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
        key: 'database',
        label: 'Testing database connection...',
        endpoint: '/install/database',
        icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4',
    },
    {
        key: 'migrate',
        label: 'Creating database tables...',
        endpoint: '/install/migrate',
        icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
    },
    {
        key: 'finalize',
        label: 'Creating admin account...',
        endpoint: '/install/finalize',
        icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    },
];

interface FormData {
    admin_name: string;
    admin_email: string;
    admin_password: string;
    admin_password_confirmation: string;
    db_host: string;
    db_port: string;
    db_database: string;
    db_username: string;
    db_password: string;
    db_prefix: string;
    app_url: string;
}

export default function Install() {
    const [step, setStep] = useState<Step>('form');
    const [currentPhase, setCurrentPhase] = useState(0);
    const [completedPhases, setCompletedPhases] = useState<number[]>([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [errorPhase, setErrorPhase] = useState(-1);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

    const [form, setForm] = useState<FormData>({
        admin_name: '',
        admin_email: '',
        admin_password: '',
        admin_password_confirmation: '',
        db_host: '127.0.0.1',
        db_port: '3306',
        db_database: 'brevio',
        db_username: 'root',
        db_password: '',
        db_prefix: '',
        app_url: window.location.origin + (window.location.pathname.replace(/\/install.*$/, '') || ''),
    });

    const setField = (key: keyof FormData, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        if (fieldErrors[key]) {
            setFieldErrors((prev) => {
                const next = { ...prev };
                delete next[key];
                return next;
            });
        }
    };

    const getCsrfToken = (): string => {
        const meta = document.querySelector('meta[name="csrf-token"]');
        return meta?.getAttribute('content') || '';
    };

    const runPhase = async (phase: PhaseConfig): Promise<boolean> => {
        const res = await fetch(url(phase.endpoint), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCsrfToken(),
                Accept: 'application/json',
            },
            body: JSON.stringify(form),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
            if (res.status === 422 && data.errors) {
                setFieldErrors(data.errors);
            }
            throw new Error(data.message || 'An unknown error occurred.');
        }

        return true;
    };

    const runInstall = useCallback(async () => {
        setStep('installing');
        setCurrentPhase(0);
        setCompletedPhases([]);
        setErrorMessage('');
        setErrorPhase(-1);
        setFieldErrors({});

        for (let i = 0; i < PHASES.length; i++) {
            setCurrentPhase(i);
            try {
                await runPhase(PHASES[i]);
                setCompletedPhases((prev) => [...prev, i]);
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : 'Installation failed.';
                setErrorMessage(msg);
                setErrorPhase(i);
                setStep('error');
                return;
            }
            // Small delay between steps for visual feedback
            await new Promise((r) => setTimeout(r, 400));
        }

        setStep('success');
    }, [form]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        runInstall();
    };

    const handleRetry = () => {
        setStep('form');
        setErrorMessage('');
        setErrorPhase(-1);
    };

    return (
        <>
            <Head title="Install Brevio" />

            <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-12">
                {/* Ambient Background */}
                <div className="fixed inset-0 pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-500/5 rounded-full blur-3xl" />
                </div>

                <div className="relative w-full max-w-xl">
                    {/* Logo */}
                    <div className="flex items-center justify-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/25">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                            Brevio
                        </span>
                    </div>

                    {step === 'form' && (
                        <FormStep
                            form={form}
                            setField={setField}
                            fieldErrors={fieldErrors}
                            errorMessage={errorMessage}
                            onSubmit={handleSubmit}
                        />
                    )}

                    {step === 'installing' && (
                        <ProgressStep
                            phases={PHASES}
                            currentPhase={currentPhase}
                            completedPhases={completedPhases}
                        />
                    )}

                    {step === 'success' && <SuccessStep />}

                    {step === 'error' && (
                        <ErrorStep
                            phases={PHASES}
                            errorPhase={errorPhase}
                            errorMessage={errorMessage}
                            completedPhases={completedPhases}
                            onRetry={handleRetry}
                        />
                    )}
                </div>
            </div>
        </>
    );
}

/* ─── Form Step ─── */

function FormStep({
    form,
    setField,
    fieldErrors,
    errorMessage,
    onSubmit,
}: {
    form: FormData;
    setField: (key: keyof FormData, value: string) => void;
    fieldErrors: Record<string, string[]>;
    errorMessage: string;
    onSubmit: (e: FormEvent) => void;
}) {
    const err = (key: string) => fieldErrors[key]?.[0];

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div className="text-center mb-2">
                <h1 className="text-xl font-bold text-white">Installation Wizard</h1>
                <p className="text-sm text-gray-500 mt-1">Configure your Brevio instance in just a few steps.</p>
            </div>

            {errorMessage && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                    {errorMessage}
                </div>
            )}

            {/* Application Settings */}
            <fieldset className="rounded-xl bg-gray-900 border border-gray-800 p-5 space-y-4">
                <legend className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">Application</legend>
                <Field label="Application URL" value={form.app_url} onChange={(v) => setField('app_url', v)} error={err('app_url')} placeholder="http://localhost/welink" />
            </fieldset>

            {/* Database Settings */}
            <fieldset className="rounded-xl bg-gray-900 border border-gray-800 p-5 space-y-4">
                <legend className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">Database</legend>
                <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                        <Field label="Host" value={form.db_host} onChange={(v) => setField('db_host', v)} error={err('db_host')} placeholder="127.0.0.1" />
                    </div>
                    <Field label="Port" value={form.db_port} onChange={(v) => setField('db_port', v)} error={err('db_port')} placeholder="3306" />
                </div>
                <Field label="Database Name" value={form.db_database} onChange={(v) => setField('db_database', v)} error={err('db_database')} placeholder="brevio" />
                <div className="grid grid-cols-2 gap-4">
                    <Field label="Username" value={form.db_username} onChange={(v) => setField('db_username', v)} error={err('db_username')} placeholder="root" />
                    <Field label="Password" value={form.db_password} onChange={(v) => setField('db_password', v)} error={err('db_password')} placeholder="Leave blank if none" type="password" />
                </div>
                <Field label="Table Prefix" value={form.db_prefix} onChange={(v) => setField('db_prefix', v)} error={err('db_prefix')} placeholder="Optional, e.g. brev_" />
            </fieldset>

            {/* Admin Account */}
            <fieldset className="rounded-xl bg-gray-900 border border-gray-800 p-5 space-y-4">
                <legend className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">Admin Account</legend>
                <Field label="Full Name" value={form.admin_name} onChange={(v) => setField('admin_name', v)} error={err('admin_name')} placeholder="John Doe" />
                <Field label="Email" value={form.admin_email} onChange={(v) => setField('admin_email', v)} error={err('admin_email')} placeholder="admin@example.com" type="email" />
                <div className="grid grid-cols-2 gap-4">
                    <Field label="Password" value={form.admin_password} onChange={(v) => setField('admin_password', v)} error={err('admin_password')} placeholder="Min 8 characters" type="password" />
                    <Field label="Confirm Password" value={form.admin_password_confirmation} onChange={(v) => setField('admin_password_confirmation', v)} error={err('admin_password_confirmation')} placeholder="Repeat password" type="password" />
                </div>
            </fieldset>

            <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-violet-500/20 text-sm"
            >
                Install Brevio
            </button>
        </form>
    );
}

/* ─── Progress Step ─── */

function ProgressStep({
    phases,
    currentPhase,
    completedPhases,
}: {
    phases: PhaseConfig[];
    currentPhase: number;
    completedPhases: number[];
}) {
    return (
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-8">
            <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-violet-500/10 flex items-center justify-center">
                    <svg className="w-8 h-8 text-violet-400 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                </div>
                <h2 className="text-lg font-bold text-white">Installing Brevio...</h2>
                <p className="text-sm text-gray-500 mt-1">Please wait while we set everything up.</p>
            </div>

            <div className="space-y-4">
                {phases.map((phase, idx) => {
                    const isCompleted = completedPhases.includes(idx);
                    const isCurrent = idx === currentPhase && !isCompleted;
                    const isPending = idx > currentPhase;

                    return (
                        <div
                            key={phase.key}
                            className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-500 ${
                                isCompleted ? 'bg-emerald-500/5' : isCurrent ? 'bg-violet-500/5' : 'opacity-40'
                            }`}
                        >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                                isCompleted
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : isCurrent
                                    ? 'bg-violet-500/20 text-violet-400'
                                    : 'bg-gray-800 text-gray-600'
                            }`}>
                                {isCompleted ? (
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : isCurrent ? (
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d={phase.icon} />
                                    </svg>
                                )}
                            </div>
                            <span className={`text-sm font-medium transition-colors duration-500 ${
                                isCompleted ? 'text-emerald-400' : isCurrent ? 'text-white' : 'text-gray-600'
                            }`}>
                                {isCompleted ? phase.label.replace('...', ' — Done!') : phase.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/* ─── Success Step ─── */

function SuccessStep() {
    return (
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Installation Complete!</h2>
            <p className="text-sm text-gray-400 mb-8">Brevio has been successfully installed and configured.</p>

            <a
                href={url('/admin/login')}
                className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-violet-500/20 text-sm"
            >
                Go to Login
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
            </a>
        </div>
    );
}

/* ─── Error Step ─── */

function ErrorStep({
    phases,
    errorPhase,
    errorMessage,
    completedPhases,
    onRetry,
}: {
    phases: PhaseConfig[];
    errorPhase: number;
    errorMessage: string;
    completedPhases: number[];
    onRetry: () => void;
}) {
    return (
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-8">
            <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
                    <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h2 className="text-lg font-bold text-white">Installation Failed</h2>
            </div>

            <div className="space-y-3 mb-6">
                {phases.map((phase, idx) => {
                    const isCompleted = completedPhases.includes(idx);
                    const isFailed = idx === errorPhase;

                    if (idx > errorPhase) return null;

                    return (
                        <div
                            key={phase.key}
                            className={`flex items-center gap-4 p-3 rounded-lg ${
                                isCompleted ? 'bg-emerald-500/5' : isFailed ? 'bg-red-500/5' : ''
                            }`}
                        >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                isCompleted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                                {isCompleted ? (
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                )}
                            </div>
                            <span className={`text-sm font-medium ${isCompleted ? 'text-emerald-400' : 'text-red-400'}`}>
                                {isCompleted ? phase.label.replace('...', ' — Done!') : phase.label.replace('...', ' — Failed')}
                            </span>
                        </div>
                    );
                })}
            </div>

            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 mb-6 break-words">
                {errorMessage}
            </div>

            <button
                onClick={onRetry}
                className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl transition-all text-sm"
            >
                Back to Configuration
            </button>
        </div>
    );
}

/* ─── Field Component ─── */

function Field({
    label,
    value,
    onChange,
    error,
    placeholder,
    type = 'text',
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    error?: string;
    placeholder?: string;
    type?: string;
}) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={`w-full px-4 py-2.5 bg-gray-950 border rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all ${
                    error ? 'border-red-500/50' : 'border-gray-800'
                }`}
            />
            {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
        </div>
    );
}
