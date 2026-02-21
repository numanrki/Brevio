import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import { url } from '@/utils';

interface Props {
    settings: Record<string, string>;
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

export default function Index({ settings }: Props) {
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
