<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    /**
     * Configure Socialite Google driver from DB settings at runtime.
     */
    private function configureGoogle(): void
    {
        $clientId = Setting::get('google_client_id', config('services.google.client_id'));
        $clientSecret = Setting::get('google_client_secret', config('services.google.client_secret'));
        $redirect = config('services.google.redirect', '/auth/google/callback');

        config([
            'services.google.client_id' => $clientId,
            'services.google.client_secret' => $clientSecret,
            'services.google.redirect' => $redirect,
        ]);
    }

    public function redirect(): RedirectResponse
    {
        $this->configureGoogle();

        return Socialite::driver('google')->redirect();
    }

    public function callback(Request $request): RedirectResponse
    {
        $this->configureGoogle();

        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (\Throwable $e) {
            // If already logged in, redirect to profile with error
            if (Auth::check()) {
                return redirect()->route('admin.profile.index')->with('error', 'Google authentication failed.');
            }
            return redirect()->route('login')->withErrors(['email' => 'Google authentication failed.']);
        }

        // If user is already authenticated — this is a "Connect Google" from profile
        if (Auth::check()) {
            $user = Auth::user();
            $user->google_id = $googleUser->getId();

            // Update avatar from Google if user has no custom avatar
            if (!$user->avatar && $googleUser->getAvatar()) {
                $user->avatar = $googleUser->getAvatar();
            }

            $user->save();

            return redirect()->route('admin.profile.index')->with('success', 'Google account connected successfully.');
        }

        // Guest login flow — find admin user by email
        $user = User::where('email', $googleUser->getEmail())
            ->where('role', 'admin')
            ->first();

        if (!$user) {
            return redirect()->route('login')->withErrors([
                'email' => 'No admin account found for this Gmail address.',
            ]);
        }

        if ($user->is_banned) {
            return redirect()->route('login')->withErrors(['email' => 'Account is banned.']);
        }

        // Link Google ID if not already linked
        if (!$user->google_id) {
            $user->google_id = $googleUser->getId();
            $user->save();
        }

        // Update avatar from Google if user has no custom avatar
        if (!$user->avatar && $googleUser->getAvatar()) {
            $user->avatar = $googleUser->getAvatar();
            $user->save();
        }

        // Check if 2FA is required after Google login
        $has2fa = false;
        try {
            $has2fa = $user->two_factor_secret && $user->two_factor_confirmed_at;
        } catch (\Throwable $e) {
            // 2FA columns may not exist yet
        }

        $userRequire2fa = (bool) $user->google_require_2fa;

        if ($has2fa && $userRequire2fa) {
            $request->session()->put('2fa_user_id', $user->id);
            $request->session()->put('2fa_remember', true);

            $user->update(['last_login_at' => now()]);

            return redirect()->route('2fa.challenge');
        }

        Auth::login($user, true);
        $request->session()->regenerate();

        $user->update(['last_login_at' => now()]);

        return redirect()->intended(route('admin.dashboard'));
    }
}
