import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import { useState, useCallback } from 'react';
import { url } from '@/utils';

interface Release {
    version: string;
    name: string;
    body: string;
    published_at: string | null;
    html_url: string;
    zipball_url: string;
}

interface Commit {
    sha: string;
    short_sha: string;
    message: string;
    author: string;
    date: string | null;
    html_url: string;
}

interface StepStatus {
    step: string;
    status: 'pending' | 'running' | 'done' | 'failed';
}

type Channel = 'stable' | 'beta';
type PageState = 'idle' | 'checking' | 'installing' | 'success' | 'error';

const INSTALL_STEPS: { key: string; label: string }[] = [
    { key: 'download', label: 'Downloading update package' },
    { key: 'extract', label: 'Extracting files' },
    { key: 'apply', label: 'Applying file changes' },
    { key: 'migrate', label: 'Running database migrations' },
    { key: 'cache', label: 'Clearing caches' },
];

interface Props {
    currentVersion: string;
    lastCheck: string | null;
}

export default function Index({ currentVersion, lastCheck }: Props) {
    const [channel, setChannel] = useState<Channel>('stable');
    const [state, setState] = useState<PageState>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    // Stable channel state
    const [release, setRelease] = useState<Release | null>(null);
    const [hasStableUpdate, setHasStableUpdate] = useState(false);

    // Beta channel state
    const [commits, setCommits] = useState<Commit[]>([]);

    // Install progress
    const [installSteps, setInstallSteps] = useState<StepStatus[]>([]);
    const [newVersion, setNewVersion] = useState('');
    const [migrateOutput, setMigrateOutput] = useState('');

    const csrfToken = () =>
        document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

    const apiCall = async (endpoint: string, body?: Record<string, string>) => {
        const res = await fetch(url(endpoint), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken(),
                Accept: 'application/json',
            },
            body: body ? JSON.stringify(body) : undefined,
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
            throw new Error(data.message || 'Request failed');
        }
        return data;
    };

    const checkStable = useCallback(async () => {
        setState('checking');
        setErrorMessage('');
        try {
            const data = await apiCall('/admin/updates/check-stable');
            setRelease(data.release);
            setHasStableUpdate(data.has_update);
            setState('idle');
        } catch (err: unknown) {
            setErrorMessage(err instanceof Error ? err.message : 'Check failed');
            setState('error');
        }
    }, []);

    const checkBeta = useCallback(async () => {
        setState('checking');
        setErrorMessage('');
        try {
            const data = await apiCall('/admin/updates/check-beta');
            setCommits(data.commits || []);
            setState('idle');
        } catch (err: unknown) {
            setErrorMessage(err instanceof Error ? err.message : 'Check failed');
            setState('error');
        }
    }, []);

    const installUpdate = useCallback(
        async (endpoint: string, body: Record<string, string>) => {
            setState('installing');
            setErrorMessage('');
            setInstallSteps(INSTALL_STEPS.map((s) => ({ step: s.key, status: 'pending' })));
            setNewVersion('');
            setMigrateOutput('');

            // Simulate step progression visually
            const stepKeys = INSTALL_STEPS.map((s) => s.key);
            let currentIdx = 0;

            const progressInterval = setInterval(() => {
                if (currentIdx < stepKeys.length) {
                    setInstallSteps((prev) =>
                        prev.map((s, i) =>
                            i === currentIdx ? { ...s, status: 'running' } : i < currentIdx ? { ...s, status: 'done' } : s
                        )
                    );
                    currentIdx++;
                }
            }, 2000);

            try {
                const data = await apiCall(endpoint, body);
                clearInterval(progressInterval);

                // Mark all done
                setInstallSteps(INSTALL_STEPS.map((s) => ({ step: s.key, status: 'done' })));
                setNewVersion(data.new_version || '');
                setMigrateOutput(data.migrate || '');
                setState('success');
            } catch (err: unknown) {
                clearInterval(progressInterval);
                setInstallSteps((prev) =>
                    prev.map((s) =>
                        s.status === 'running' ? { ...s, status: 'failed' } : s
                    )
                );
                setErrorMessage(err instanceof Error ? err.message : 'Installation failed');
                setState('error');
            }
        },
        []
    );

    const handleChannelSwitch = (ch: Channel) => {
        setChannel(ch);
        setState('idle');
        setErrorMessage('');
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AdminLayout header="Updates">
            <Head title="System Updates" />

            {/* Version Info Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">Installed Version</p>
                        <p className="text-lg font-bold text-white">v{currentVersion}</p>
                    </div>
                </div>
                {lastCheck && (
                    <p className="text-xs text-gray-600">Last checked: {formatDate(lastCheck)}</p>
                )}
            </div>

            {/* Channel Tabs */}
            <div className="flex gap-1 p-1 rounded-xl bg-gray-900 border border-gray-800 mb-6 w-fit">
                <button
                    onClick={() => handleChannelSwitch('stable')}
                    className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                        channel === 'stable'
                            ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                    }`}
                >
                    <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Stable
                    </span>
                </button>
                <button
                    onClick={() => handleChannelSwitch('beta')}
                    className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                        channel === 'beta'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                    }`}
                >
                    <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                        Beta
                    </span>
                </button>
            </div>

            {/* Installing Progress */}
            {state === 'installing' && (
                <div className="rounded-xl bg-gray-900 border border-gray-800 p-8">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-violet-500/10 flex items-center justify-center">
                            <svg className="w-8 h-8 text-violet-400 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-bold text-white">Installing Update...</h2>
                        <p className="text-sm text-gray-500 mt-1">Please do not close this page.</p>
                    </div>
                    <StepList steps={installSteps} />
                </div>
            )}

            {/* Success */}
            {state === 'success' && (
                <div className="rounded-xl bg-gray-900 border border-gray-800 p-8 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
                        <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Update Installed!</h2>
                    <p className="text-sm text-gray-400 mb-2">
                        Updated from <span className="text-gray-300 font-medium">v{currentVersion}</span> to{' '}
                        <span className="text-emerald-400 font-medium">v{newVersion}</span>
                    </p>
                    {migrateOutput && (
                        <pre className="text-xs text-gray-500 bg-gray-950 rounded-lg p-3 mt-4 text-left max-h-40 overflow-auto">{migrateOutput}</pre>
                    )}
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-violet-500/20"
                    >
                        Reload Admin Panel
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Error */}
            {state === 'error' && (
                <div className="rounded-xl bg-gray-900 border border-gray-800 p-8">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
                            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-bold text-white">Operation Failed</h2>
                    </div>
                    {installSteps.length > 0 && <StepList steps={installSteps} />}
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 mt-4 break-words">
                        {errorMessage}
                    </div>
                    <button
                        onClick={() => setState('idle')}
                        className="mt-4 w-full py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl transition-all text-sm"
                    >
                        Back
                    </button>
                </div>
            )}

            {/* Stable Channel Content */}
            {state !== 'installing' && state !== 'success' && state !== 'error' && channel === 'stable' && (
                <div className="space-y-6">
                    {/* Check Button */}
                    <div className="rounded-xl bg-gray-900 border border-gray-800 p-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-base font-semibold text-white">Stable Releases</h3>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    Official releases from GitHub. Recommended for production use.
                                </p>
                            </div>
                            <button
                                onClick={checkStable}
                                disabled={state === 'checking'}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-violet-500/20"
                            >
                                {state === 'checking' ? (
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                )}
                                Check for Updates
                            </button>
                        </div>
                    </div>

                    {/* Release Card */}
                    {release && (
                        <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
                            <div className={`px-6 py-4 border-b border-gray-800 flex items-center justify-between ${hasStableUpdate ? 'bg-emerald-500/5' : 'bg-gray-800/30'}`}>
                                <div className="flex items-center gap-3">
                                    {hasStableUpdate ? (
                                        <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                                            Update Available
                                        </span>
                                    ) : (
                                        <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-gray-700/50 text-gray-400 border border-gray-700 uppercase">
                                            Up to Date
                                        </span>
                                    )}
                                    <h3 className="text-base font-bold text-white">{release.name}</h3>
                                </div>
                                <span className="text-xs text-gray-500">{formatDate(release.published_at)}</span>
                            </div>
                            <div className="p-6">
                                {/* Version comparison */}
                                <div className="flex items-center gap-4 mb-6 p-4 rounded-lg bg-gray-950">
                                    <div className="text-center flex-1">
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Installed</p>
                                        <p className="text-lg font-bold text-gray-300">v{currentVersion}</p>
                                    </div>
                                    <svg className="w-5 h-5 text-gray-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                    <div className="text-center flex-1">
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Latest</p>
                                        <p className={`text-lg font-bold ${hasStableUpdate ? 'text-emerald-400' : 'text-gray-300'}`}>v{release.version}</p>
                                    </div>
                                </div>

                                {/* Release notes */}
                                {release.body && (
                                    <div className="mb-6">
                                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Release Notes</h4>
                                        <div className="text-sm text-gray-400 bg-gray-950 rounded-lg p-4 max-h-60 overflow-auto whitespace-pre-wrap leading-relaxed">
                                            {release.body}
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => installUpdate('/admin/updates/install-stable', { version: release.version })}
                                        className={`inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-medium rounded-xl transition-all shadow-lg ${
                                            hasStableUpdate
                                                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/20'
                                                : 'bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 shadow-gray-500/10'
                                        }`}
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        {hasStableUpdate ? `Install v${release.version}` : `Reinstall v${release.version}`}
                                    </button>
                                    {release.html_url && (
                                        <a
                                            href={release.html_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded-xl transition-all"
                                        >
                                            View on GitHub
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Beta Channel Content */}
            {state !== 'installing' && state !== 'success' && state !== 'error' && channel === 'beta' && (
                <div className="space-y-6">
                    {/* Warning */}
                    <div className="rounded-xl bg-amber-500/5 border border-amber-500/20 p-4 flex items-start gap-3">
                        <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div>
                            <p className="text-sm font-medium text-amber-400">Beta Updates Warning</p>
                            <p className="text-xs text-amber-400/70 mt-0.5">
                                Beta updates may be unstable. We recommend installing stable releases only.
                                These updates pull directly from the latest commits and may contain untested changes.
                            </p>
                        </div>
                    </div>

                    {/* Fetch Commits */}
                    <div className="rounded-xl bg-gray-900 border border-gray-800 p-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-base font-semibold text-white">Beta Channel</h3>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    Latest commits from the main branch. Use at your own risk.
                                </p>
                            </div>
                            <button
                                onClick={checkBeta}
                                disabled={state === 'checking'}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 disabled:opacity-50 text-amber-400 text-sm font-medium rounded-xl transition-all"
                            >
                                {state === 'checking' ? (
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                )}
                                Fetch Latest Commits
                            </button>
                        </div>
                    </div>

                    {/* Commits List */}
                    {commits.length > 0 && (
                        <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
                            <div className="px-6 py-3 border-b border-gray-800 bg-gray-800/30 flex items-center justify-between">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    Recent Commits ({commits.length})
                                </p>
                                <button
                                    onClick={() => {
                                        if (confirm(`Install latest commit ${commits[0].short_sha}?\n\n"${commits[0].message.split('\n')[0]}"\n\nThis will update to the newest code from the main branch.`)) {
                                            installUpdate('/admin/updates/install-beta', { sha: commits[0].sha });
                                        }
                                    }}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-medium rounded-lg transition-all shadow-lg shadow-amber-500/20"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Install Latest ({commits[0].short_sha})
                                </button>
                            </div>
                            <div className="divide-y divide-gray-800/50 max-h-[600px] overflow-auto">
                                {commits.map((commit, idx) => (
                                    <div key={commit.sha} className={`px-6 py-4 hover:bg-gray-800/30 transition-colors ${idx === 0 ? 'bg-amber-500/5' : ''}`}>
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    {idx === 0 && (
                                                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase flex-shrink-0">Latest</span>
                                                    )}
                                                    <p className="text-sm text-white font-medium truncate">{commit.message.split('\n')[0]}</p>
                                                </div>
                                                <div className="flex items-center gap-3 mt-1.5">
                                                    <code className="text-[11px] font-mono text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded">
                                                        {commit.short_sha}
                                                    </code>
                                                    <span className="text-xs text-gray-500">{commit.author}</span>
                                                    <span className="text-xs text-gray-600">{formatDate(commit.date)}</span>
                                                </div>
                                            </div>
                                            <a
                                                href={commit.html_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-shrink-0 p-1.5 text-gray-500 hover:text-white transition-colors"
                                                title="View on GitHub"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </AdminLayout>
    );
}

/* Step Progress List */
function StepList({ steps }: { steps: StepStatus[] }) {
    return (
        <div className="space-y-3">
            {INSTALL_STEPS.map((step, idx) => {
                const s = steps.find((st) => st.step === step.key);
                const status = s?.status || 'pending';

                return (
                    <div
                        key={step.key}
                        className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-500 ${
                            status === 'done'
                                ? 'bg-emerald-500/5'
                                : status === 'running'
                                ? 'bg-violet-500/5'
                                : status === 'failed'
                                ? 'bg-red-500/5'
                                : 'opacity-40'
                        }`}
                    >
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                                status === 'done'
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : status === 'running'
                                    ? 'bg-violet-500/20 text-violet-400'
                                    : status === 'failed'
                                    ? 'bg-red-500/20 text-red-400'
                                    : 'bg-gray-800 text-gray-600'
                            }`}
                        >
                            {status === 'done' ? (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            ) : status === 'running' ? (
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                            ) : status === 'failed' ? (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <span className="text-xs font-bold">{idx + 1}</span>
                            )}
                        </div>
                        <span
                            className={`text-sm font-medium transition-colors duration-500 ${
                                status === 'done'
                                    ? 'text-emerald-400'
                                    : status === 'running'
                                    ? 'text-white'
                                    : status === 'failed'
                                    ? 'text-red-400'
                                    : 'text-gray-600'
                            }`}
                        >
                            {step.label}
                            {status === 'done' && ' — Done!'}
                            {status === 'failed' && ' — Failed'}
                            {status === 'running' && '...'}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
