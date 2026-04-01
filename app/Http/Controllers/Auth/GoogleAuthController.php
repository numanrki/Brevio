<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    public function redirect(): RedirectResponse
    {
        return Socialite::driver('google')->redirect();
    }

    public function callback(Request $request): RedirectResponse
    {
        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (\Throwable $e) {
            return redirect()->route('login')->withErrors(['email' => 'Google authentication failed.']);
        }

        // Find admin user whose email matches the Google account email
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

        Auth::login($user, true);
        $request->session()->regenerate();

        $user->update(['last_login_at' => now()]);

        return redirect()->intended(route('admin.dashboard'));
    }
}
