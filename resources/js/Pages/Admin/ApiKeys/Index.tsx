import { useForm, usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { url } from '@/utils';
import { useState } from 'react';

interface ApiKeyItem {
    id: number;
    name: string;
    key_prefix: string;
    scopes: string[];
    is_active: boolean;
    last_used_at: string | null;
    expires_at: string | null;
    created_at: string;
}

const DOC_SECTIONS = [
    { key: 'overview', label: 'Overview', desc: 'Introduction, base URL, rate limits' },
    { key: 'authentication', label: 'Authentication', desc: 'How to authenticate API requests' },
    { key: 'links', label: 'Links API', desc: 'Create, read, update, delete short links' },
    { key: 'bio-pages', label: 'Bio Pages API', desc: 'Manage bio pages programmatically' },
    { key: 'qr-codes', label: 'QR Codes API', desc: 'Manage QR codes programmatically' },
    { key: 'deep-links', label: 'Deep Links API', desc: 'Smart routing & deep link management' },
    { key: 'pixels', label: 'Pixels API', desc: 'Manage tracking pixels' },
    { key: 'stats', label: 'Statistics API', desc: 'Access analytics & statistics' },
    { key: 'errors', label: 'Error Handling', desc: 'Error codes and troubleshooting' },
];

const EXPIRY_OPTIONS = [
    { value: 'never', label: 'Never expires' },
    { value: '30d', label: '30 days' },
    { value: '60d', label: '60 days' },
    { value: '90d', label: '90 days' },
    { value: '1y', label: '1 year' },
];

export default function Index() {
    const { apiKeys, availableScopes, flash } = usePage<{ apiKeys: ApiKeyItem[]; availableScopes: Record<string, string>; flash?: { success?: string; new_key?: string }; auth: any; app_version?: string }>().props;
    const [showCreate, setShowCreate] = useState(false);
    const [newKeyVisible, setNewKeyVisible] = useState<string | null>(flash?.new_key || null);
    const [copied, setCopied] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
    const [confirmRegen, setConfirmRegen] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<'keys' | 'docs'>('keys');
    const [revealedKeys, setRevealedKeys] = useState<Record<number, string>>({});
    const [revealLoading, setRevealLoading] = useState<number | null>(null);

    const form = useForm({
        name: '',
        scopes: [] as string[],
        expires_in: 'never',
    });

    const handleScopeToggle = (scope: string) => {
        const current = form.data.scopes;
        if (current.includes(scope)) {
            form.setData('scopes', current.filter(s => s !== scope));
        } else {
            form.setData('scopes', [...current, scope]);
        }
    };

    const selectAllScopes = () => {
        form.setData('scopes', Object.keys(availableScopes));
    };

    const clearAllScopes = () => {
        form.setData('scopes', []);
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(url('/admin/api-keys'), {
            onSuccess: (page: any) => {
                form.reset();
                setShowCreate(false);
                if (page.props?.flash?.new_key) {
                    setNewKeyVisible(page.props.flash.new_key);
                }
            },
        });
    };

    const handleDelete = (id: number) => {
        router.delete(url(`/admin/api-keys/${id}`), {
            onSuccess: () => setConfirmDelete(null),
        });
    };

    const handleRegenerate = (id: number) => {
        router.post(url(`/admin/api-keys/${id}/regenerate`), {}, {
            onSuccess: () => setConfirmRegen(null),
        });
    };

    const handleToggle = (id: number) => {
        router.post(url(`/admin/api-keys/${id}/toggle`));
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const [revealError, setRevealError] = useState<Record<number, string>>({});

    const handleRevealKey = async (id: number) => {
        if (revealedKeys[id]) {
            setRevealedKeys(prev => {
                const next = { ...prev };
                delete next[id];
                return next;
            });
            return;
        }
        setRevealLoading(id);
        setRevealError(prev => { const next = { ...prev }; delete next[id]; return next; });
        try {
            const res = await fetch(url(`/admin/api-keys/${id}/reveal`), {
                headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            });
            if (res.ok) {
                const data = await res.json();
                setRevealedKeys(prev => ({ ...prev, [id]: data.key }));
            } else {
                const data = await res.json().catch(() => null);
                setRevealError(prev => ({ ...prev, [id]: data?.message || 'Failed to reveal key. Try regenerating it.' }));
            }
        } finally {
            setRevealLoading(null);
        }
    };

    const scopeLabels: Record<string, string> = availableScopes;

    return (
        <AdminLayout header="API Management">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* New Key Alert */}
                {newKeyVisible && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5">
                        <div className="flex items-start gap-3">
                            <svg className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <div className="flex-1">
                                <h3 className="text-emerald-400 font-semibold text-sm">API Key Created Successfully</h3>
                                <p className="text-emerald-300/70 text-xs mt-1">Copy your API key now. You won't be able to see it again!</p>
                                <div className="flex items-center gap-2 mt-3">
                                    <code className="flex-1 bg-gray-950 text-emerald-300 px-4 py-2.5 rounded-lg text-sm font-mono border border-gray-800 break-all">
                                        {newKeyVisible}
                                    </code>
                                    <button
                                        onClick={() => copyToClipboard(newKeyVisible)}
                                        className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                            copied
                                                ? 'bg-emerald-500/20 text-emerald-400'
                                                : 'bg-gray-800 text-white hover:bg-gray-700'
                                        }`}
                                    >
                                        {copied ? 'Copied!' : 'Copy'}
                                    </button>
                                </div>
                            </div>
                            <button onClick={() => setNewKeyVisible(null)} className="text-gray-400 hover:text-white">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex items-center gap-1 bg-gray-900/50 p-1 rounded-xl border border-gray-800 w-fit">
                    <button
                        onClick={() => setActiveTab('keys')}
                        className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                            activeTab === 'keys'
                                ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                        }`}
                    >
                        <span className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                            API Keys
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('docs')}
                        className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                            activeTab === 'docs'
                                ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                        }`}
                    >
                        <span className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            Documentation
                        </span>
                    </button>
                </div>

                {/* API Keys Tab */}
                {activeTab === 'keys' && (
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-white">Your API Keys</h2>
                                <p className="text-sm text-gray-400 mt-1">Generate and manage API keys for programmatic access</p>
                            </div>
                            <button
                                onClick={() => setShowCreate(!showCreate)}
                                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl text-sm font-medium hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-500/25"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                </svg>
                                Create API Key
                            </button>
                        </div>

                        {/* Create Form */}
                        {showCreate && (
                            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                                <h3 className="text-white font-semibold mb-4">Create New API Key</h3>
                                <form onSubmit={handleCreate} className="space-y-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Key Name</label>
                                            <input
                                                type="text"
                                                value={form.data.name}
                                                onChange={e => form.setData('name', e.target.value)}
                                                placeholder="e.g., Production Server, Mobile App"
                                                className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-sm"
                                            />
                                            {form.errors.name && <p className="text-red-400 text-xs mt-1">{form.errors.name}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Expiration</label>
                                            <select
                                                value={form.data.expires_in}
                                                onChange={e => form.setData('expires_in', e.target.value)}
                                                className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-sm"
                                            >
                                                {EXPIRY_OPTIONS.map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <label className="block text-sm font-medium text-gray-300">Permissions (Scopes)</label>
                                            <div className="flex items-center gap-2">
                                                <button type="button" onClick={selectAllScopes} className="text-xs text-violet-400 hover:text-violet-300 transition-colors">Select All</button>
                                                <span className="text-gray-600">|</span>
                                                <button type="button" onClick={clearAllScopes} className="text-xs text-gray-400 hover:text-gray-300 transition-colors">Clear All</button>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {Object.entries(scopeLabels).map(([scope, label]) => (
                                                <label
                                                    key={scope}
                                                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                                                        form.data.scopes.includes(scope)
                                                            ? 'bg-violet-500/10 border-violet-500/30 text-violet-300'
                                                            : 'bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700'
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={form.data.scopes.includes(scope)}
                                                        onChange={() => handleScopeToggle(scope)}
                                                        className="sr-only"
                                                    />
                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                                                        form.data.scopes.includes(scope)
                                                            ? 'bg-violet-500 border-violet-500'
                                                            : 'border-gray-600'
                                                    }`}>
                                                        {form.data.scopes.includes(scope) && (
                                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium">{label}</p>
                                                        <p className="text-xs opacity-60 font-mono">{scope}</p>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                        {form.errors.scopes && <p className="text-red-400 text-xs mt-2">{form.errors.scopes}</p>}
                                    </div>

                                    <div className="flex items-center gap-3 pt-2">
                                        <button
                                            type="submit"
                                            disabled={form.processing}
                                            className="px-5 py-2.5 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-500 transition-colors disabled:opacity-50"
                                        >
                                            {form.processing ? 'Creating...' : 'Generate Key'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { setShowCreate(false); form.reset(); }}
                                            className="px-5 py-2.5 text-gray-400 hover:text-white text-sm font-medium transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Keys List */}
                        {apiKeys.length === 0 ? (
                            <div className="bg-gray-900 rounded-xl border border-gray-800 p-12 text-center">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-800 flex items-center justify-center">
                                    <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                    </svg>
                                </div>
                                <h3 className="text-white font-semibold">No API Keys Yet</h3>
                                <p className="text-gray-400 text-sm mt-1">Create your first API key to start using the Brevio API</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {apiKeys.map(key => (
                                    <div key={key.id} className={`bg-gray-900 rounded-xl border p-5 transition-colors ${key.is_active ? 'border-gray-800 hover:border-gray-700' : 'border-gray-800/50 opacity-60'}`}>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    <h3 className="text-white font-semibold">{key.name}</h3>
                                                    <span className="text-xs font-mono text-gray-500 bg-gray-800 px-2 py-0.5 rounded">
                                                        {key.key_prefix}...
                                                    </span>
                                                    {!key.is_active && (
                                                        <span className="text-xs px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">Disabled</span>
                                                    )}
                                                    {key.expires_at && (
                                                        <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                                            Expires {key.expires_at}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap gap-1.5 mt-2">
                                                    {key.scopes.map(scope => (
                                                        <span key={scope} className="text-xs font-mono px-2 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20">
                                                            {scope}
                                                        </span>
                                                    ))}
                                                </div>
                                                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                                                    <span>Created {key.created_at}</span>
                                                    {key.last_used_at && <span>Last used {key.last_used_at}</span>}
                                                </div>
                                                {revealedKeys[key.id] && (
                                                    <div className="flex items-center gap-2 mt-3">
                                                        <code className="flex-1 bg-gray-950 text-violet-300 px-3 py-2 rounded-lg text-xs font-mono border border-gray-800 break-all">
                                                            {revealedKeys[key.id]}
                                                        </code>
                                                    </div>
                                                )}
                                                {revealError[key.id] && (
                                                    <div className="mt-3 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                                                        {revealError[key.id]}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                {/* View Key */}
                                                <button
                                                    onClick={() => handleRevealKey(key.id)}
                                                    className={`p-2 rounded-lg transition-all ${
                                                        revealedKeys[key.id]
                                                            ? 'text-violet-400 bg-violet-500/10'
                                                            : 'text-gray-400 hover:text-violet-400 hover:bg-violet-500/10'
                                                    }`}
                                                    title={revealedKeys[key.id] ? 'Hide key' : 'View key'}
                                                    disabled={revealLoading === key.id}
                                                >
                                                    {revealLoading === key.id ? (
                                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                        </svg>
                                                    ) : revealedKeys[key.id] ? (
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    )}
                                                </button>

                                                {/* Copy Key (visible when revealed) */}
                                                {revealedKeys[key.id] && (
                                                    <button
                                                        onClick={() => copyToClipboard(revealedKeys[key.id])}
                                                        className="p-2 text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all"
                                                        title="Copy API key"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                        </svg>
                                                    </button>
                                                )}

                                                {/* Toggle On/Off */}
                                                <button
                                                    onClick={() => handleToggle(key.id)}
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                        key.is_active ? 'bg-violet-600' : 'bg-gray-700'
                                                    }`}
                                                    title={key.is_active ? 'Disable API key' : 'Enable API key'}
                                                >
                                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                        key.is_active ? 'translate-x-6' : 'translate-x-1'
                                                    }`} />
                                                </button>

                                                {/* Regenerate */}
                                                {confirmRegen === key.id ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-amber-400">Regenerate?</span>
                                                        <button
                                                            onClick={() => handleRegenerate(key.id)}
                                                            className="px-3 py-1.5 bg-amber-500/20 text-amber-400 rounded-lg text-xs font-medium hover:bg-amber-500/30 transition-colors"
                                                        >
                                                            Yes
                                                        </button>
                                                        <button
                                                            onClick={() => setConfirmRegen(null)}
                                                            className="px-3 py-1.5 text-gray-400 hover:text-white text-xs transition-colors"
                                                        >
                                                            No
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setConfirmRegen(key.id)}
                                                        className="p-2 text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all"
                                                        title="Regenerate key"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                        </svg>
                                                    </button>
                                                )}

                                                {/* Delete */}
                                                {confirmDelete === key.id ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-red-400">Revoke?</span>
                                                        <button
                                                            onClick={() => handleDelete(key.id)}
                                                            className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-xs font-medium hover:bg-red-500/30 transition-colors"
                                                        >
                                                            Yes
                                                        </button>
                                                        <button
                                                            onClick={() => setConfirmDelete(null)}
                                                            className="px-3 py-1.5 text-gray-400 hover:text-white text-xs transition-colors"
                                                        >
                                                            No
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setConfirmDelete(key.id)}
                                                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                                        title="Revoke key"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Documentation Tab */}
                {activeTab === 'docs' && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-lg font-semibold text-white">API Documentation</h2>
                            <p className="text-sm text-gray-400 mt-1">Learn how to integrate with the Brevio API. Each section opens in a new protected tab — links are token-secured and expire after 30 minutes.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {DOC_SECTIONS.map(section => (
                                <a
                                    key={section.key}
                                    href={url(`/admin/api-docs/${section.key}`)}
                                    target="_blank"
                                    rel="noopener"
                                    className="group bg-gray-900 rounded-xl border border-gray-800 p-5 hover:border-violet-500/30 hover:bg-gray-900/80 transition-all"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center mb-3">
                                            <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                            </svg>
                                        </div>
                                        <svg className="w-4 h-4 text-gray-600 group-hover:text-violet-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </div>
                                    <h3 className="text-white font-semibold text-sm">{section.label}</h3>
                                    <p className="text-gray-400 text-xs mt-1">{section.desc}</p>
                                </a>
                            ))}
                        </div>

                        {/* Quick Reference */}
                        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                            <h3 className="text-white font-semibold mb-4">Quick Reference</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm">
                                    <span className="text-gray-400 w-24 flex-shrink-0">Base URL</span>
                                    <code className="bg-gray-950 px-3 py-1.5 rounded-lg text-violet-400 font-mono text-xs border border-gray-800">
                                        {window.location.origin}{url('/api/v1')}
                                    </code>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <span className="text-gray-400 w-24 flex-shrink-0">Auth Header</span>
                                    <code className="bg-gray-950 px-3 py-1.5 rounded-lg text-fuchsia-400 font-mono text-xs border border-gray-800">
                                        Authorization: Bearer YOUR_API_KEY
                                    </code>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <span className="text-gray-400 w-24 flex-shrink-0">Format</span>
                                    <code className="bg-gray-950 px-3 py-1.5 rounded-lg text-emerald-400 font-mono text-xs border border-gray-800">
                                        application/json
                                    </code>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
