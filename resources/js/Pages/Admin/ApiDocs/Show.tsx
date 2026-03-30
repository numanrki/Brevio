import { usePage } from '@inertiajs/react';
import { url as urlHelper } from '@/utils';
import { useState, useEffect } from 'react';

const SECTION_CONTENT: Record<string, { title: string; content: React.ReactNode }> = {
    overview: { title: 'API Overview', content: <OverviewSection /> },
    authentication: { title: 'Authentication', content: <AuthenticationSection /> },
    links: { title: 'Links API', content: <LinksSection /> },
    'bio-pages': { title: 'Bio Pages API', content: <BioPagesSection /> },
    'qr-codes': { title: 'QR Codes API', content: <QrCodesSection /> },
    'deep-links': { title: 'Deep Links API', content: <DeepLinksSection /> },
    pixels: { title: 'Pixels API', content: <PixelsSection /> },
    stats: { title: 'Statistics API', content: <StatsSection /> },
    errors: { title: 'Error Handling', content: <ErrorsSection /> },
};

export default function Show() {
    const { section, token } = usePage<{ section: string; token: string; auth: any; app_version?: string }>().props;
    const [verified, setVerified] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
        fetch(urlHelper('/admin/api-docs/verify'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken, Accept: 'application/json' },
            body: JSON.stringify({ token }),
        })
            .then(res => { if (res.ok) setVerified(true); })
            .finally(() => setLoading(false));
    }, [token]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="animate-pulse text-gray-400">Verifying access...</div>
            </div>
        );
    }

    if (!verified) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="bg-gray-900 rounded-xl border border-red-500/20 p-8 max-w-md text-center">
                    <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v.01M12 9v3m9 3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h2 className="text-white font-semibold text-lg">Access Denied</h2>
                    <p className="text-gray-400 text-sm mt-2">This documentation page has expired or is not accessible. Please go back to the API management page and try again.</p>
                </div>
            </div>
        );
    }

    const content = SECTION_CONTENT[section];
    if (!content) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="text-gray-400">Section not found.</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950">
            <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-800">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                    </div>
                    <div>
                        <span className="text-violet-400 text-xs font-medium uppercase tracking-wider">Brevio API Documentation</span>
                        <h1 className="text-2xl font-bold text-white">{content.title}</h1>
                    </div>
                </div>
                {content.content}
                <div className="mt-12 pt-6 border-t border-gray-800 text-center">
                    <p className="text-xs text-gray-600">This page is token-protected and expires after 30 minutes. Shared URLs will not work for other users.</p>
                </div>
            </div>
        </div>
    );
}

/* ─── Shared Components ─── */

function CodeBlock({ code }: { code: string }) {
    const [copied, setCopied] = useState(false);
    const copy = () => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); };
    return (
        <div className="relative group">
            <pre className="bg-gray-950 border border-gray-800 rounded-lg p-4 overflow-x-auto text-sm font-mono text-gray-300"><code>{code}</code></pre>
            <button onClick={copy} className="absolute top-2 right-2 px-2 py-1 bg-gray-800 text-gray-400 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:text-white">
                {copied ? 'Copied!' : 'Copy'}
            </button>
        </div>
    );
}

function Endpoint({ method, path, desc }: { method: string; path: string; desc: string }) {
    const c: Record<string, string> = { GET: 'bg-emerald-500/20 text-emerald-400', POST: 'bg-blue-500/20 text-blue-400', PUT: 'bg-amber-500/20 text-amber-400', DELETE: 'bg-red-500/20 text-red-400' };
    return (
        <div className="flex items-center gap-3 py-3 border-b border-gray-800/50 last:border-0">
            <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${c[method] || 'bg-gray-800 text-gray-400'}`}>{method}</span>
            <code className="text-sm text-violet-400 font-mono">{path}</code>
            <span className="text-sm text-gray-400 ml-auto">{desc}</span>
        </div>
    );
}

function ParamTable({ params }: { params: [string, string, string, string][] }) {
    return (
        <div className="bg-gray-900 rounded-lg border border-gray-800 divide-y divide-gray-800">
            {params.map(([name, type, required, desc]) => (
                <div key={name} className="flex items-center gap-4 px-4 py-3 text-sm">
                    <code className="text-violet-400 font-mono text-xs w-28">{name}</code>
                    <span className="text-gray-500 font-mono text-xs w-16">{type}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded w-16 text-center ${required === 'Required' ? 'bg-red-500/10 text-red-400' : 'bg-gray-800 text-gray-500'}`}>{required}</span>
                    <span className="text-gray-300">{desc}</span>
                </div>
            ))}
        </div>
    );
}

/* ─── Section Components ─── */

function OverviewSection() {
    const baseUrl = `${window.location.origin}/api/v1`;
    return (
        <div className="space-y-8">
            <section>
                <h2 className="text-lg font-semibold text-white mb-3">Introduction</h2>
                <p className="text-gray-300 text-sm leading-relaxed">
                    The Brevio API allows you to programmatically manage short links, bio pages, QR codes, deep links, tracking pixels, and view analytics.
                    All endpoints return JSON and use standard HTTP methods.
                </p>
            </section>
            <section>
                <h2 className="text-lg font-semibold text-white mb-3">Base URL</h2>
                <CodeBlock code={baseUrl} />
            </section>
            <section>
                <h2 className="text-lg font-semibold text-white mb-3">Rate Limits</h2>
                <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
                    <ul className="space-y-2 text-sm text-gray-300">
                        <li className="flex justify-between"><span>Read endpoints (GET)</span><span className="text-violet-400 font-mono">60 req/min</span></li>
                        <li className="flex justify-between"><span>Write endpoints (POST/PUT/DELETE)</span><span className="text-violet-400 font-mono">30 req/min</span></li>
                    </ul>
                </div>
            </section>
            <section>
                <h2 className="text-lg font-semibold text-white mb-3">Available Scopes</h2>
                <div className="bg-gray-900 rounded-lg border border-gray-800 divide-y divide-gray-800">
                    {[
                        ['links:read', 'View links and their analytics'],
                        ['links:write', 'Create, update, and delete links'],
                        ['bio:read', 'View bio pages'],
                        ['bio:write', 'Create, update, and delete bio pages'],
                        ['qr:read', 'View QR codes'],
                        ['qr:write', 'Create, update, and delete QR codes'],
                        ['deep-links:read', 'View deep links and their rules'],
                        ['deep-links:write', 'Create, update, and delete deep links'],
                        ['pixels:read', 'View tracking pixels and fire logs'],
                        ['pixels:write', 'Create, update, and delete pixels'],
                        ['stats:read', 'View statistics and analytics data'],
                        ['account:read', 'View account information'],
                    ].map(([scope, desc]) => (
                        <div key={scope} className="flex items-center gap-4 px-4 py-3">
                            <code className="text-xs font-mono text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded">{scope}</code>
                            <span className="text-sm text-gray-300">{desc}</span>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

function AuthenticationSection() {
    const base = window.location.origin;
    return (
        <div className="space-y-8">
            <section>
                <h2 className="text-lg font-semibold text-white mb-3">API Key Authentication</h2>
                <p className="text-gray-300 text-sm leading-relaxed mb-4">
                    Include your API key in the <code className="text-violet-400 bg-gray-800 px-1.5 py-0.5 rounded text-xs">Authorization</code> header using the Bearer scheme.
                </p>
                <CodeBlock code={`curl -X GET "${base}/api/v1/links" \\\n  -H "Authorization: Bearer brev_YOUR_API_KEY" \\\n  -H "Accept: application/json"`} />
            </section>
            <section>
                <h2 className="text-lg font-semibold text-white mb-3">Getting an API Key</h2>
                <ol className="space-y-3 text-sm text-gray-300">
                    {['Go to the API Management page in the admin panel', 'Click "Create API Key" and give it a descriptive name', 'Select the scopes (permissions) the key should have', 'Choose an expiration period or set to never expire', 'Copy the key immediately — it\'s shown only once!'].map((t, i) => (
                        <li key={i} className="flex gap-3">
                            <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center flex-shrink-0 text-xs font-bold">{i + 1}</span>
                            {t}
                        </li>
                    ))}
                </ol>
            </section>
            <section>
                <h2 className="text-lg font-semibold text-white mb-3">Scopes & Permissions</h2>
                <p className="text-gray-300 text-sm leading-relaxed mb-3">
                    Each API key has specific scopes. Requesting an endpoint without the required scope returns a <code className="text-red-400 bg-gray-800 px-1.5 py-0.5 rounded text-xs">403 Forbidden</code> error.
                    You can also enable/disable an API key using the toggle button without deleting it.
                </p>
                <CodeBlock code={`// Response when missing required scope\n{\n  "message": "Missing required scope: links:write"\n}`} />
            </section>
            <section>
                <h2 className="text-lg font-semibold text-white mb-3">JavaScript (fetch)</h2>
                <CodeBlock code={`const response = await fetch('${base}/api/v1/links', {\n  headers: {\n    'Authorization': 'Bearer brev_YOUR_API_KEY',\n    'Accept': 'application/json',\n    'Content-Type': 'application/json',\n  },\n});\nconst data = await response.json();`} />
            </section>
            <section>
                <h2 className="text-lg font-semibold text-white mb-3">Python (requests)</h2>
                <CodeBlock code={`import requests\n\nheaders = {\n    'Authorization': 'Bearer brev_YOUR_API_KEY',\n    'Accept': 'application/json',\n}\n\nresponse = requests.get('${base}/api/v1/links', headers=headers)\nprint(response.json())`} />
            </section>
            <section>
                <h2 className="text-lg font-semibold text-white mb-3">PHP (cURL)</h2>
                <CodeBlock code={`$ch = curl_init('${base}/api/v1/links');\ncurl_setopt_array($ch, [\n    CURLOPT_RETURNTRANSFER => true,\n    CURLOPT_HTTPHEADER => [\n        'Authorization: Bearer brev_YOUR_API_KEY',\n        'Accept: application/json',\n    ],\n]);\n$response = json_decode(curl_exec($ch), true);\ncurl_close($ch);`} />
            </section>
        </div>
    );
}

function LinksSection() {
    const base = window.location.origin;
    return (
        <div className="space-y-8">
            <section>
                <h2 className="text-lg font-semibold text-white mb-3">Endpoints</h2>
                <div className="bg-gray-900 rounded-lg border border-gray-800 px-4">
                    <Endpoint method="GET" path="/api/v1/links" desc="List all links" />
                    <Endpoint method="GET" path="/api/v1/links/{id}" desc="Get a link" />
                    <Endpoint method="POST" path="/api/v1/links" desc="Create a link" />
                    <Endpoint method="PUT" path="/api/v1/links/{id}" desc="Update a link" />
                    <Endpoint method="DELETE" path="/api/v1/links/{id}" desc="Delete a link" />
                    <Endpoint method="GET" path="/api/v1/links/{id}/analytics" desc="Get link analytics" />
                </div>
            </section>
            <section>
                <h2 className="text-lg font-semibold text-white mb-3">Create a Short Link</h2>
                <p className="text-gray-300 text-sm mb-3">Required scope: <code className="text-violet-400 bg-gray-800 px-1.5 py-0.5 rounded text-xs">links:write</code></p>
                <CodeBlock code={`curl -X POST "${base}/api/v1/links" \\\n  -H "Authorization: Bearer brev_YOUR_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "url": "https://example.com/very-long-url",\n    "alias": "my-link",\n    "title": "Example Link"\n  }'`} />
                <h3 className="text-white font-medium text-sm mt-6 mb-2">Parameters</h3>
                <ParamTable params={[
                    ['url', 'string', 'Required', 'The destination URL to shorten'],
                    ['alias', 'string', 'Optional', 'Custom alias (auto-generated if omitted)'],
                    ['title', 'string', 'Optional', 'Link title for reference'],
                    ['description', 'string', 'Optional', 'Link description'],
                    ['is_active', 'boolean', 'Optional', 'Whether link is active (default: true)'],
                    ['expiry_date', 'string', 'Optional', 'Expiration date (ISO 8601)'],
                ]} />
            </section>
            <section>
                <h2 className="text-lg font-semibold text-white mb-3">Example Response</h2>
                <CodeBlock code={`{\n  "data": {\n    "id": 42,\n    "alias": "my-link",\n    "url": "https://example.com/very-long-url",\n    "short_url": "${base}/my-link",\n    "title": "Example Link",\n    "is_active": true,\n    "total_clicks": 0,\n    "created_at": "2025-03-30T10:00:00Z"\n  }\n}`} />
            </section>
        </div>
    );
}

function BioPagesSection() {
    const base = window.location.origin;
    return (
        <div className="space-y-8">
            <section>
                <h2 className="text-lg font-semibold text-white mb-3">Endpoints</h2>
                <div className="bg-gray-900 rounded-lg border border-gray-800 px-4">
                    <Endpoint method="GET" path="/api/v1/bio" desc="List all bio pages" />
                    <Endpoint method="GET" path="/api/v1/bio/{id}" desc="Get a bio page" />
                    <Endpoint method="POST" path="/api/v1/bio" desc="Create a bio page" />
                    <Endpoint method="PUT" path="/api/v1/bio/{id}" desc="Update a bio page" />
                    <Endpoint method="DELETE" path="/api/v1/bio/{id}" desc="Delete a bio page" />
                </div>
            </section>
            <section>
                <h2 className="text-lg font-semibold text-white mb-3">Create a Bio Page</h2>
                <p className="text-gray-300 text-sm mb-3">Required scope: <code className="text-violet-400 bg-gray-800 px-1.5 py-0.5 rounded text-xs">bio:write</code></p>
                <CodeBlock code={`curl -X POST "${base}/api/v1/bio" \\\n  -H "Authorization: Bearer brev_YOUR_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "name": "My Bio Page",\n    "alias": "john",\n    "is_active": true\n  }'`} />
                <h3 className="text-white font-medium text-sm mt-6 mb-2">Parameters</h3>
                <ParamTable params={[
                    ['name', 'string', 'Required', 'Bio page display name'],
                    ['alias', 'string', 'Required', 'URL alias (e.g., /bio/john)'],
                    ['is_active', 'boolean', 'Optional', 'Whether page is active (default: true)'],
                ]} />
            </section>
            <section>
                <h2 className="text-lg font-semibold text-white mb-3">Example Response</h2>
                <CodeBlock code={`{\n  "data": {\n    "id": 5,\n    "name": "My Bio Page",\n    "alias": "john",\n    "is_active": true,\n    "views": 0,\n    "public_url": "${base}/bio/john",\n    "created_at": "2025-03-30T10:00:00Z"\n  }\n}`} />
            </section>
        </div>
    );
}

function QrCodesSection() {
    const base = window.location.origin;
    return (
        <div className="space-y-8">
            <section>
                <h2 className="text-lg font-semibold text-white mb-3">Endpoints</h2>
                <div className="bg-gray-900 rounded-lg border border-gray-800 px-4">
                    <Endpoint method="GET" path="/api/v1/qr-codes" desc="List all QR codes" />
                    <Endpoint method="GET" path="/api/v1/qr-codes/{id}" desc="Get a QR code" />
                    <Endpoint method="POST" path="/api/v1/qr-codes" desc="Create a QR code" />
                    <Endpoint method="PUT" path="/api/v1/qr-codes/{id}" desc="Update a QR code" />
                    <Endpoint method="DELETE" path="/api/v1/qr-codes/{id}" desc="Delete a QR code" />
                </div>
            </section>
            <section>
                <h2 className="text-lg font-semibold text-white mb-3">Create a QR Code</h2>
                <p className="text-gray-300 text-sm mb-3">Required scope: <code className="text-violet-400 bg-gray-800 px-1.5 py-0.5 rounded text-xs">qr:write</code></p>
                <CodeBlock code={`curl -X POST "${base}/api/v1/qr-codes" \\\n  -H "Authorization: Bearer brev_YOUR_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "name": "My QR Code",\n    "type": "url",\n    "data": { "content": "https://example.com" },\n    "style": { "foreground": "#000000", "background": "#FFFFFF", "size": 300 }\n  }'`} />
                <h3 className="text-white font-medium text-sm mt-6 mb-2">Parameters</h3>
                <ParamTable params={[
                    ['name', 'string', 'Required', 'Name for the QR code'],
                    ['type', 'string', 'Required', 'Type: url, text, email, phone, wifi, vcard'],
                    ['data', 'object', 'Required', 'QR code data (varies by type)'],
                    ['style', 'object', 'Optional', 'Style: foreground, background, size'],
                ]} />
            </section>
        </div>
    );
}

function DeepLinksSection() {
    return (
        <div className="space-y-8">
            <section>
                <h2 className="text-lg font-semibold text-white mb-3">About Deep Links</h2>
                <p className="text-gray-300 text-sm leading-relaxed">
                    Deep links provide smart routing based on device, OS, country, and browser. They direct users to the appropriate app store or platform-specific URL automatically.
                </p>
            </section>
            <section>
                <h2 className="text-lg font-semibold text-white mb-3">Endpoints</h2>
                <p className="text-gray-300 text-sm mb-3">
                    Requires <code className="text-violet-400 bg-gray-800 px-1.5 py-0.5 rounded text-xs">deep-links:read</code> or <code className="text-violet-400 bg-gray-800 px-1.5 py-0.5 rounded text-xs ml-1">deep-links:write</code>
                </p>
                <div className="bg-gray-900 rounded-lg border border-gray-800 px-4">
                    <Endpoint method="GET" path="/api/v1/deep-links" desc="List all deep links" />
                    <Endpoint method="GET" path="/api/v1/deep-links/{id}" desc="Get a deep link" />
                    <Endpoint method="POST" path="/api/v1/deep-links" desc="Create a deep link" />
                    <Endpoint method="PUT" path="/api/v1/deep-links/{id}" desc="Update a deep link" />
                    <Endpoint method="DELETE" path="/api/v1/deep-links/{id}" desc="Delete a deep link" />
                </div>
            </section>
            <section>
                <h2 className="text-lg font-semibold text-white mb-3">Routing Rules</h2>
                <div className="bg-gray-900 rounded-lg border border-gray-800 divide-y divide-gray-800">
                    {[
                        ['device', 'Route by device type', 'mobile, tablet, desktop'],
                        ['os', 'Route by operating system', 'ios, android, windows, macos, linux'],
                        ['country', 'Route by country code', 'US, GB, DE, IN, etc.'],
                        ['browser', 'Route by browser', 'chrome, firefox, safari, edge'],
                    ].map(([type, desc, values]) => (
                        <div key={type} className="px-4 py-3">
                            <div className="flex items-center gap-3">
                                <code className="text-violet-400 font-mono text-xs">{type}</code>
                                <span className="text-gray-300 text-sm">{desc}</span>
                            </div>
                            <p className="text-gray-500 text-xs mt-1">Values: {values}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

function PixelsSection() {
    const base = window.location.origin;
    return (
        <div className="space-y-8">
            <section>
                <h2 className="text-lg font-semibold text-white mb-3">About Tracking Pixels</h2>
                <p className="text-gray-300 text-sm leading-relaxed">
                    Tracking pixels let you monitor page views and conversions across your links. Attach pixels to links to fire events on platforms like Facebook, Google Analytics, TikTok, and more.
                </p>
            </section>
            <section>
                <h2 className="text-lg font-semibold text-white mb-3">Endpoints</h2>
                <div className="bg-gray-900 rounded-lg border border-gray-800 px-4">
                    <Endpoint method="GET" path="/api/v1/pixels" desc="List all pixels" />
                    <Endpoint method="GET" path="/api/v1/pixels/{id}" desc="Get a pixel" />
                    <Endpoint method="POST" path="/api/v1/pixels" desc="Create a pixel" />
                    <Endpoint method="PUT" path="/api/v1/pixels/{id}" desc="Update a pixel" />
                    <Endpoint method="DELETE" path="/api/v1/pixels/{id}" desc="Delete a pixel" />
                </div>
            </section>
            <section>
                <h2 className="text-lg font-semibold text-white mb-3">Create a Pixel</h2>
                <p className="text-gray-300 text-sm mb-3">Required scope: <code className="text-violet-400 bg-gray-800 px-1.5 py-0.5 rounded text-xs">pixels:write</code></p>
                <CodeBlock code={`curl -X POST "${base}/api/v1/pixels" \\\n  -H "Authorization: Bearer brev_YOUR_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "name": "Facebook Pixel",\n    "provider": "facebook",\n    "pixel_id": "123456789"\n  }'`} />
                <h3 className="text-white font-medium text-sm mt-6 mb-2">Parameters</h3>
                <ParamTable params={[
                    ['name', 'string', 'Required', 'Pixel display name'],
                    ['provider', 'string', 'Required', 'Provider: facebook, google, tiktok, etc.'],
                    ['pixel_id', 'string', 'Required', 'Your pixel/tracking ID'],
                ]} />
            </section>
        </div>
    );
}

function StatsSection() {
    const base = window.location.origin;
    return (
        <div className="space-y-8">
            <section>
                <h2 className="text-lg font-semibold text-white mb-3">About Statistics</h2>
                <p className="text-gray-300 text-sm leading-relaxed">
                    Access analytics data for your links, bio pages, QR codes, and deep links. View click counts, geographic data, browser/device breakdowns, referrer sources, and time-series data.
                </p>
            </section>
            <section>
                <h2 className="text-lg font-semibold text-white mb-3">Endpoints</h2>
                <p className="text-gray-300 text-sm mb-3">Required scope: <code className="text-violet-400 bg-gray-800 px-1.5 py-0.5 rounded text-xs">stats:read</code></p>
                <div className="bg-gray-900 rounded-lg border border-gray-800 px-4">
                    <Endpoint method="GET" path="/api/v1/stats/overview" desc="Dashboard-level overview" />
                    <Endpoint method="GET" path="/api/v1/stats/links" desc="Link click statistics" />
                    <Endpoint method="GET" path="/api/v1/stats/bio" desc="Bio page view statistics" />
                    <Endpoint method="GET" path="/api/v1/stats/qr-codes" desc="QR code scan statistics" />
                    <Endpoint method="GET" path="/api/v1/stats/deep-links" desc="Deep link click statistics" />
                </div>
            </section>
            <section>
                <h2 className="text-lg font-semibold text-white mb-3">Example: Get Overview Stats</h2>
                <CodeBlock code={`curl "${base}/api/v1/stats/overview" \\\n  -H "Authorization: Bearer brev_YOUR_API_KEY" \\\n  -H "Accept: application/json"`} />
                <h3 className="text-white font-medium text-sm mt-6 mb-2">Response</h3>
                <CodeBlock code={`{\n  "data": {\n    "total_links": 142,\n    "total_clicks": 8459,\n    "total_bio_views": 1230,\n    "total_qr_scans": 567,\n    "total_deep_link_clicks": 234,\n    "clicks_today": 85,\n    "top_countries": [\n      { "name": "US", "count": 3200 },\n      { "name": "GB", "count": 1800 }\n    ],\n    "top_referrers": [\n      { "name": "twitter.com", "count": 980 },\n      { "name": "direct", "count": 750 }\n    ]\n  }\n}`} />
            </section>
            <section>
                <h2 className="text-lg font-semibold text-white mb-3">Query Parameters</h2>
                <ParamTable params={[
                    ['period', 'string', 'Optional', 'Time period: 7d, 30d, 90d, 1y (default: 30d)'],
                    ['group_by', 'string', 'Optional', 'Group by: day, week, month'],
                ]} />
            </section>
        </div>
    );
}

function ErrorsSection() {
    return (
        <div className="space-y-8">
            <section>
                <h2 className="text-lg font-semibold text-white mb-3">HTTP Status Codes</h2>
                <div className="bg-gray-900 rounded-lg border border-gray-800 divide-y divide-gray-800">
                    {[
                        ['200', 'OK', 'Request was successful', 'text-emerald-400'],
                        ['201', 'Created', 'Resource was created successfully', 'text-emerald-400'],
                        ['400', 'Bad Request', 'Invalid request parameters', 'text-amber-400'],
                        ['401', 'Unauthorized', 'Missing, invalid, or expired API key', 'text-red-400'],
                        ['403', 'Forbidden', 'API key disabled or lacks required scope', 'text-red-400'],
                        ['404', 'Not Found', 'Resource does not exist', 'text-amber-400'],
                        ['422', 'Validation Error', 'Request body failed validation', 'text-amber-400'],
                        ['429', 'Too Many Requests', 'Rate limit exceeded', 'text-red-400'],
                        ['500', 'Server Error', 'Internal server error', 'text-red-400'],
                    ].map(([code, name, desc, color]) => (
                        <div key={code} className="flex items-center gap-4 px-4 py-3 text-sm">
                            <span className={`font-mono font-bold ${color}`}>{code}</span>
                            <span className="text-white font-medium w-36">{name}</span>
                            <span className="text-gray-400">{desc}</span>
                        </div>
                    ))}
                </div>
            </section>
            <section>
                <h2 className="text-lg font-semibold text-white mb-3">Error Response Format</h2>
                <CodeBlock code={`{\n  "message": "The url field is required.",\n  "errors": {\n    "url": ["The url field is required."]\n  }\n}`} />
            </section>
            <section>
                <h2 className="text-lg font-semibold text-white mb-3">Common Errors</h2>
                <div className="space-y-4">
                    {[
                        ['Invalid API Key', '401 Unauthorized', '{\n  "message": "Invalid API key."\n}'],
                        ['Key Disabled', '403 Forbidden', '{\n  "message": "API key is disabled."\n}'],
                        ['Missing Scope', '403 Forbidden', '{\n  "message": "Missing required scope: links:write"\n}'],
                        ['Key Expired', '401 Unauthorized', '{\n  "message": "API key has expired."\n}'],
                    ].map(([title, status, body]) => (
                        <div key={title} className="bg-gray-900 rounded-lg border border-gray-800 p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <h4 className="text-white font-medium text-sm">{title}</h4>
                                <span className="text-xs text-gray-500">({status})</span>
                            </div>
                            <CodeBlock code={body} />
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
