import { usePage } from '@inertiajs/react';
import { url as urlHelper } from '@/utils';
import { useState, useEffect } from 'react';

interface Props {
    section: string;
    token: string;
}

const SECTION_CONTENT: Record<string, { title: string; content: React.ReactNode }> = {
    overview: {
        title: 'API Overview',
        content: <OverviewSection />,
    },
    authentication: {
        title: 'Authentication',
        content: <AuthenticationSection />,
    },
    links: {
        title: 'Links API',
        content: <LinksSection />,
    },
    'qr-codes': {
        title: 'QR Codes API',
        content: <QrCodesSection />,
    },
    'deep-links': {
        title: 'Deep Links API',
        content: <DeepLinksSection />,
    },
    errors: {
        title: 'Error Handling',
        content: <ErrorsSection />,
    },
};

export default function Show() {
    const { section, token } = usePage<{ section: string; token: string; auth: any; app_version?: string }>().props;
    const [verified, setVerified] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
        fetch(urlHelper('/admin/api-docs/verify'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken,
                Accept: 'application/json',
            },
            body: JSON.stringify({ token }),
        })
            .then(res => {
                if (res.ok) setVerified(true);
            })
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
                {/* Header */}
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

                {/* Content */}
                {content.content}

                {/* Footer */}
                <div className="mt-12 pt-6 border-t border-gray-800 text-center">
                    <p className="text-xs text-gray-600">This page is protected and expires after 30 minutes. Do not share the URL.</p>
                </div>
            </div>
        </div>
    );
}

function CodeBlock({ code, language = 'bash' }: { code: string; language?: string }) {
    const [copied, setCopied] = useState(false);
    const copy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <div className="relative group">
            <pre className="bg-gray-950 border border-gray-800 rounded-lg p-4 overflow-x-auto text-sm font-mono text-gray-300">
                <code>{code}</code>
            </pre>
            <button
                onClick={copy}
                className="absolute top-2 right-2 px-2 py-1 bg-gray-800 text-gray-400 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:text-white"
            >
                {copied ? 'Copied!' : 'Copy'}
            </button>
        </div>
    );
}

function Endpoint({ method, path, desc }: { method: string; path: string; desc: string }) {
    const colors: Record<string, string> = {
        GET: 'bg-emerald-500/20 text-emerald-400',
        POST: 'bg-blue-500/20 text-blue-400',
        PUT: 'bg-amber-500/20 text-amber-400',
        DELETE: 'bg-red-500/20 text-red-400',
    };
    return (
        <div className="flex items-center gap-3 py-3 border-b border-gray-800/50 last:border-0">
            <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${colors[method] || 'bg-gray-800 text-gray-400'}`}>
                {method}
            </span>
            <code className="text-sm text-violet-400 font-mono">{path}</code>
            <span className="text-sm text-gray-400 ml-auto">{desc}</span>
        </div>
    );
}

function OverviewSection() {
    return (
        <div className="space-y-8">
            <section>
                <h2 className="text-lg font-semibold text-white mb-3">Introduction</h2>
                <p className="text-gray-300 text-sm leading-relaxed">
                    The Brevio API allows you to programmatically create and manage short links, QR codes, and deep links.
                    All API endpoints return JSON responses and use standard HTTP methods.
                </p>
            </section>

            <section>
                <h2 className="text-lg font-semibold text-white mb-3">Base URL</h2>
                <CodeBlock code={`${window.location.origin}/api/v1`} />
            </section>

            <section>
                <h2 className="text-lg font-semibold text-white mb-3">Rate Limits</h2>
                <p className="text-gray-300 text-sm leading-relaxed mb-3">
                    API requests are rate-limited to prevent abuse. Current limits:
                </p>
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
                        ['qr:read', 'View QR codes'],
                        ['qr:write', 'Create, update, and delete QR codes'],
                        ['deep-links:read', 'View deep links and their rules'],
                        ['deep-links:write', 'Create, update, and delete deep links'],
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
    return (
        <div className="space-y-8">
            <section>
                <h2 className="text-lg font-semibold text-white mb-3">API Key Authentication</h2>
                <p className="text-gray-300 text-sm leading-relaxed mb-4">
                    All API requests must include your API key in the <code className="text-violet-400 bg-gray-800 px-1.5 py-0.5 rounded text-xs">Authorization</code> header using the Bearer scheme.
                </p>
                <CodeBlock code={`curl -X GET "${window.location.origin}/api/v1/links" \\
  -H "Authorization: Bearer brev_YOUR_API_KEY" \\
  -H "Accept: application/json"`} />
            </section>

            <section>
                <h2 className="text-lg font-semibold text-white mb-3">Getting an API Key</h2>
                <ol className="space-y-3 text-sm text-gray-300">
                    <li className="flex gap-3">
                        <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center flex-shrink-0 text-xs font-bold">1</span>
                        Go to the API Management page in the admin panel
                    </li>
                    <li className="flex gap-3">
                        <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center flex-shrink-0 text-xs font-bold">2</span>
                        Click "Create API Key" and give it a descriptive name
                    </li>
                    <li className="flex gap-3">
                        <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center flex-shrink-0 text-xs font-bold">3</span>
                        Select the scopes (permissions) the key should have
                    </li>
                    <li className="flex gap-3">
                        <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center flex-shrink-0 text-xs font-bold">4</span>
                        Copy the key immediately — it's shown only once!
                    </li>
                </ol>
            </section>

            <section>
                <h2 className="text-lg font-semibold text-white mb-3">Scopes & Permissions</h2>
                <p className="text-gray-300 text-sm leading-relaxed mb-3">
                    Each API key can have specific scopes that limit what it can do. If a key tries to access an endpoint
                    that requires a scope it doesn't have, the API will return a <code className="text-red-400 bg-gray-800 px-1.5 py-0.5 rounded text-xs">403 Forbidden</code> error.
                </p>
                <CodeBlock code={`// Response when missing required scope
{
  "message": "Missing required scope: links:write"
}`} language="json" />
            </section>

            <section>
                <h2 className="text-lg font-semibold text-white mb-3">Example with JavaScript (fetch)</h2>
                <CodeBlock code={`const response = await fetch('${window.location.origin}/api/v1/links', {
  headers: {
    'Authorization': 'Bearer brev_YOUR_API_KEY',
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

const data = await response.json();
console.log(data);`} language="javascript" />
            </section>

            <section>
                <h2 className="text-lg font-semibold text-white mb-3">Example with Python (requests)</h2>
                <CodeBlock code={`import requests

headers = {
    'Authorization': 'Bearer brev_YOUR_API_KEY',
    'Accept': 'application/json',
}

response = requests.get('${window.location.origin}/api/v1/links', headers=headers)
print(response.json())`} language="python" />
            </section>
        </div>
    );
}

function LinksSection() {
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
                <CodeBlock code={`curl -X POST "${window.location.origin}/api/v1/links" \\
  -H "Authorization: Bearer brev_YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json" \\
  -d '{
    "url": "https://example.com/very-long-url",
    "alias": "my-link",
    "title": "Example Link",
    "is_active": true
  }'`} />

                <h3 className="text-white font-medium text-sm mt-6 mb-2">Request Body Parameters</h3>
                <div className="bg-gray-900 rounded-lg border border-gray-800 divide-y divide-gray-800">
                    {[
                        ['url', 'string', 'Required', 'The destination URL to shorten'],
                        ['alias', 'string', 'Optional', 'Custom alias (auto-generated if omitted)'],
                        ['title', 'string', 'Optional', 'Link title for reference'],
                        ['description', 'string', 'Optional', 'Link description'],
                        ['is_active', 'boolean', 'Optional', 'Whether the link is active (default: true)'],
                        ['expiry_date', 'string', 'Optional', 'Expiration date (ISO 8601 format)'],
                    ].map(([name, type, required, desc]) => (
                        <div key={name} className="flex items-center gap-4 px-4 py-3 text-sm">
                            <code className="text-violet-400 font-mono text-xs w-24">{name}</code>
                            <span className="text-gray-500 font-mono text-xs w-16">{type}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded w-16 text-center ${required === 'Required' ? 'bg-red-500/10 text-red-400' : 'bg-gray-800 text-gray-500'}`}>{required}</span>
                            <span className="text-gray-300">{desc}</span>
                        </div>
                    ))}
                </div>
            </section>

            <section>
                <h2 className="text-lg font-semibold text-white mb-3">Example Response</h2>
                <CodeBlock code={`{
  "data": {
    "id": 42,
    "alias": "my-link",
    "url": "https://example.com/very-long-url",
    "short_url": "${window.location.origin}/my-link",
    "title": "Example Link",
    "is_active": true,
    "total_clicks": 0,
    "created_at": "2025-03-30T10:00:00Z"
  }
}`} language="json" />
            </section>

            <section>
                <h2 className="text-lg font-semibold text-white mb-3">Get Link Analytics</h2>
                <p className="text-gray-300 text-sm mb-3">Required scope: <code className="text-violet-400 bg-gray-800 px-1.5 py-0.5 rounded text-xs">links:read</code></p>
                <CodeBlock code={`curl "${window.location.origin}/api/v1/links/42/analytics" \\
  -H "Authorization: Bearer brev_YOUR_API_KEY" \\
  -H "Accept: application/json"`} />
            </section>
        </div>
    );
}

function QrCodesSection() {
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
                <CodeBlock code={`curl -X POST "${window.location.origin}/api/v1/qr-codes" \\
  -H "Authorization: Bearer brev_YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json" \\
  -d '{
    "name": "My QR Code",
    "type": "url",
    "data": {
      "content": "https://example.com"
    },
    "style": {
      "foreground": "#000000",
      "background": "#FFFFFF",
      "size": 300
    }
  }'`} />

                <h3 className="text-white font-medium text-sm mt-6 mb-2">Request Body Parameters</h3>
                <div className="bg-gray-900 rounded-lg border border-gray-800 divide-y divide-gray-800">
                    {[
                        ['name', 'string', 'Required', 'Name for the QR code'],
                        ['type', 'string', 'Required', 'Type: url, text, email, phone, wifi, vcard'],
                        ['data', 'object', 'Required', 'QR code data (varies by type)'],
                        ['style', 'object', 'Optional', 'Style options (foreground, background, size)'],
                    ].map(([name, type, required, desc]) => (
                        <div key={name} className="flex items-center gap-4 px-4 py-3 text-sm">
                            <code className="text-violet-400 font-mono text-xs w-24">{name}</code>
                            <span className="text-gray-500 font-mono text-xs w-16">{type}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded w-16 text-center ${required === 'Required' ? 'bg-red-500/10 text-red-400' : 'bg-gray-800 text-gray-500'}`}>{required}</span>
                            <span className="text-gray-300">{desc}</span>
                        </div>
                    ))}
                </div>
            </section>

            <section>
                <h2 className="text-lg font-semibold text-white mb-3">Example Response</h2>
                <CodeBlock code={`{
  "data": {
    "id": 15,
    "name": "My QR Code",
    "type": "url",
    "data": {
      "content": "https://example.com"
    },
    "style": {
      "foreground": "#000000",
      "background": "#FFFFFF",
      "size": 300
    },
    "scans": 0,
    "created_at": "2025-03-30T10:00:00Z"
  }
}`} language="json" />
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
                    Deep links provide smart routing based on device, OS, country, and browser. They are useful for
                    directing users to the appropriate app store or platform-specific URL automatically.
                </p>
            </section>

            <section>
                <h2 className="text-lg font-semibold text-white mb-3">Endpoints</h2>
                <p className="text-gray-300 text-sm mb-3">
                    Deep link endpoints require <code className="text-violet-400 bg-gray-800 px-1.5 py-0.5 rounded text-xs">deep-links:read</code> or
                    <code className="text-violet-400 bg-gray-800 px-1.5 py-0.5 rounded text-xs ml-1">deep-links:write</code> scope.
                </p>
                <div className="bg-gray-900 rounded-lg border border-gray-800 px-4">
                    <Endpoint method="GET" path="/api/v1/deep-links" desc="List all deep links" />
                    <Endpoint method="GET" path="/api/v1/deep-links/{id}" desc="Get a deep link" />
                    <Endpoint method="POST" path="/api/v1/deep-links" desc="Create a deep link" />
                    <Endpoint method="PUT" path="/api/v1/deep-links/{id}" desc="Update a deep link" />
                    <Endpoint method="DELETE" path="/api/v1/deep-links/{id}" desc="Delete a deep link" />
                </div>
                <p className="text-amber-400/80 text-xs mt-3">
                    Note: Deep link API endpoints are coming soon. Currently you can manage deep links through the admin panel.
                </p>
            </section>

            <section>
                <h2 className="text-lg font-semibold text-white mb-3">Deep Link Rules</h2>
                <p className="text-gray-300 text-sm leading-relaxed mb-3">
                    Each deep link can have multiple routing rules. Rules are evaluated in priority order, and the first matching rule determines the redirect destination.
                </p>
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
                        ['401', 'Unauthorized', 'Missing or invalid API key', 'text-red-400'],
                        ['403', 'Forbidden', 'API key lacks required scope', 'text-red-400'],
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
                <CodeBlock code={`{
  "message": "The url field is required.",
  "errors": {
    "url": [
      "The url field is required."
    ]
  }
}`} language="json" />
            </section>

            <section>
                <h2 className="text-lg font-semibold text-white mb-3">Common Errors</h2>
                <div className="space-y-4">
                    <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
                        <h4 className="text-white font-medium text-sm mb-2">Invalid API Key</h4>
                        <CodeBlock code={`// 401 Unauthorized
{
  "message": "Invalid API key."
}`} language="json" />
                    </div>

                    <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
                        <h4 className="text-white font-medium text-sm mb-2">Insufficient Permissions</h4>
                        <CodeBlock code={`// 403 Forbidden
{
  "message": "Missing required scope: links:write"
}`} language="json" />
                    </div>

                    <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
                        <h4 className="text-white font-medium text-sm mb-2">Expired API Key</h4>
                        <CodeBlock code={`// 401 Unauthorized
{
  "message": "API key has expired."
}`} language="json" />
                    </div>
                </div>
            </section>
        </div>
    );
}
