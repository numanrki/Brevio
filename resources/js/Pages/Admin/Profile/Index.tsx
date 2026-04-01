import { Head, useForm, router } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { User } from '@/types';
import { url } from '@/utils';

interface Props {
    user: User;
    googleEnabled: boolean;
}

export default function ProfileIndex({ user, googleEnabled }: Props) {
    const avatarInput = useRef<HTMLInputElement>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const profileForm = useForm({
        name: user.name,
        email: user.email,
        password: '',
        password_confirmation: '',
    });

    const googleForm = useForm({
        google_auth_only: user.google_auth_only,
    });

    const submitProfile: FormEventHandler = (e) => {
        e.preventDefault();
        profileForm.post(url('/admin/profile'), {
            preserveScroll: true,
            onSuccess: () => {
                profileForm.reset('password', 'password_confirmation');
            },
        });
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setAvatarPreview(URL.createObjectURL(file));

        const formData = new FormData();
        formData.append('avatar', file);
        router.post(url('/admin/profile/avatar'), formData, {
            preserveScroll: true,
            onSuccess: () => setAvatarPreview(null),
        });
    };

    const removeAvatar = () => {
        router.delete(url('/admin/profile/avatar'), { preserveScroll: true });
        setAvatarPreview(null);
    };

    const submitGoogleAuth: FormEventHandler = (e) => {
        e.preventDefault();
        googleForm.post(url('/admin/profile/google-auth'), { preserveScroll: true });
    };

    const disconnectGoogle = () => {
        if (confirm('Are you sure you want to disconnect your Google account?')) {
            router.delete(url('/admin/profile/google'), { preserveScroll: true });
        }
    };

    const avatarSrc = avatarPreview || (user.avatar ? (user.avatar.startsWith('http') ? user.avatar : url('/' + user.avatar)) : null);

    return (
        <AdminLayout header="Profile">
            <Head title="Profile" />

            <div className="max-w-3xl space-y-6">
                {/* Avatar Section */}
                <div className="rounded-2xl bg-gray-900 border border-gray-800 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Avatar</h3>
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            {avatarSrc ? (
                                <img
                                    src={avatarSrc}
                                    alt={user.name}
                                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-700"
                                />
                            ) : (
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-2xl font-bold">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={() => avatarInput.current?.click()}
                                className="absolute inset-0 w-20 h-20 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                            >
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </button>
                        </div>
                        <div>
                            <input
                                ref={avatarInput}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleAvatarChange}
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={() => avatarInput.current?.click()}
                                className="px-4 py-2 text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl transition-colors"
                            >
                                Upload Photo
                            </button>
                            {user.avatar && (
                                <button
                                    type="button"
                                    onClick={removeAvatar}
                                    className="ml-3 px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 rounded-xl transition-colors"
                                >
                                    Remove
                                </button>
                            )}
                            <p className="mt-2 text-xs text-gray-500">JPG, PNG, or WebP. Max 2MB.</p>
                        </div>
                    </div>
                </div>

                {/* Profile Information */}
                <div className="rounded-2xl bg-gray-900 border border-gray-800 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Profile Information</h3>
                    <form onSubmit={submitProfile} className="space-y-5">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                            <input
                                id="name"
                                type="text"
                                value={profileForm.data.name}
                                onChange={(e) => profileForm.setData('name', e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
                                required
                            />
                            {profileForm.errors.name && <p className="mt-1.5 text-xs text-red-400">{profileForm.errors.name}</p>}
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                            <input
                                id="email"
                                type="email"
                                value={profileForm.data.email}
                                onChange={(e) => profileForm.setData('email', e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
                                required
                            />
                            {profileForm.errors.email && <p className="mt-1.5 text-xs text-red-400">{profileForm.errors.email}</p>}
                        </div>

                        <div className="border-t border-gray-800 pt-5">
                            <h4 className="text-sm font-medium text-gray-300 mb-4">Change Password</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-2">New Password</label>
                                    <input
                                        id="password"
                                        type="password"
                                        value={profileForm.data.password}
                                        onChange={(e) => profileForm.setData('password', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
                                        placeholder="Leave blank to keep current"
                                    />
                                    {profileForm.errors.password && <p className="mt-1.5 text-xs text-red-400">{profileForm.errors.password}</p>}
                                </div>
                                <div>
                                    <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-400 mb-2">Confirm Password</label>
                                    <input
                                        id="password_confirmation"
                                        type="password"
                                        value={profileForm.data.password_confirmation}
                                        onChange={(e) => profileForm.setData('password_confirmation', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
                                        placeholder="Confirm new password"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={profileForm.processing}
                                className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-sm font-medium rounded-xl transition-all duration-200 disabled:opacity-50"
                            >
                                {profileForm.processing ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Google Authentication */}
                {googleEnabled && (
                    <div className="rounded-2xl bg-gray-900 border border-gray-800 p-6">
                        <h3 className="text-lg font-semibold text-white mb-1">Google Authentication</h3>
                        <p className="text-sm text-gray-500 mb-5">Link your Google account for quick sign-in.</p>

                        {user.google_id ? (
                            <div className="space-y-5">
                                <div className="flex items-center gap-3 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                    <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-sm text-emerald-400 font-medium">Google account connected</span>
                                </div>

                                <form onSubmit={submitGoogleAuth}>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={googleForm.data.google_auth_only}
                                            onChange={(e) => {
                                                googleForm.setData('google_auth_only', e.target.checked);
                                                // Auto-submit on change
                                                googleForm.post(url('/admin/profile/google-auth'), { preserveScroll: true });
                                            }}
                                            className="w-4 h-4 rounded border-gray-700 bg-gray-950 text-violet-500 focus:ring-violet-500/40 focus:ring-offset-0"
                                        />
                                        <div>
                                            <span className="text-sm text-gray-300 font-medium">Hide login form</span>
                                            <p className="text-xs text-gray-500">When enabled, the email/password form will be hidden and only Google sign-in will be shown.</p>
                                        </div>
                                    </label>
                                </form>

                                <button
                                    type="button"
                                    onClick={disconnectGoogle}
                                    className="px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 rounded-xl transition-colors"
                                >
                                    Disconnect Google
                                </button>
                            </div>
                        ) : (
                            <a
                                href={url('/auth/google/redirect')}
                                className="inline-flex items-center gap-3 px-5 py-2.5 bg-white hover:bg-gray-100 text-gray-800 text-sm font-medium rounded-xl transition-colors"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Connect Google Account
                            </a>
                        )}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
