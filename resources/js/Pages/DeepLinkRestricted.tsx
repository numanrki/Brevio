import { Head } from '@inertiajs/react';

interface Props {
    name: string;
    allowed_devices: string[];
    noindex?: boolean;
}

const deviceLabels: Record<string, string> = {
    android: 'Android',
    ios: 'iOS',
    windows: 'Windows',
    macos: 'macOS',
    linux: 'Linux',
    mobile: 'Mobile Devices',
    tablet: 'Tablets',
    desktop: 'Desktop',
};

export default function DeepLinkRestricted({ name, allowed_devices, noindex }: Props) {
    return (
        <>
            <Head title="Link Not Available">
                {noindex && <meta name="robots" content="noindex, nofollow" />}
            </Head>
            <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
                <div className="max-w-md w-full text-center">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-red-500/10 flex items-center justify-center">
                        <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                    </div>

                    <h1 className="text-2xl font-bold text-white mb-3">Link Not Available</h1>
                    <p className="text-gray-400 mb-6">
                        <span className="text-white font-medium">{name}</span> is only available on:
                    </p>

                    <div className="flex flex-wrap justify-center gap-2 mb-8">
                        {allowed_devices.map((d) => (
                            <span key={d} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-300">
                                <DeviceIcon device={d} />
                                {deviceLabels[d.toLowerCase()] || d}
                            </span>
                        ))}
                    </div>

                    <p className="text-sm text-gray-500">
                        Please open this link on a supported device to continue.
                    </p>
                </div>
            </div>
        </>
    );
}

function DeviceIcon({ device }: { device: string }) {
    const d = device.toLowerCase();
    if (d === 'android') return <svg className="w-4 h-4 text-green-400" viewBox="0 0 24 24" fill="currentColor"><path d="M17.523 2.3a.5.5 0 01.016.707l-1.5 1.6A6.972 6.972 0 0119 9h-14a6.972 6.972 0 012.961-4.393l-1.5-1.6a.5.5 0 11.724-.691l1.585 1.69A6.933 6.933 0 0112 3c1.257 0 2.44.346 3.472.945l1.585-1.69a.5.5 0 01.466-.155zM7 10v7a1 1 0 001 1h1v3a1.5 1.5 0 003 0v-3h2v3a1.5 1.5 0 003 0v-3h1a1 1 0 001-1v-7H7zm-2.5 0a1.5 1.5 0 00-1.5 1.5v4a1.5 1.5 0 003 0v-4A1.5 1.5 0 004.5 10zm15 0a1.5 1.5 0 00-1.5 1.5v4a1.5 1.5 0 003 0v-4a1.5 1.5 0 00-1.5-1.5zM10 7a1 1 0 110-2 1 1 0 010 2zm4 0a1 1 0 110-2 1 1 0 010 2z" /></svg>;
    if (d === 'ios') return <svg className="w-4 h-4 text-gray-300" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" /></svg>;
    if (d === 'mobile') return <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
    if (d === 'desktop' || d === 'windows' || d === 'macos' || d === 'linux') return <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
    return <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
}
