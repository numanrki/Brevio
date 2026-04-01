<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        $googleEnabled = Setting::get('google_login_enabled') === '1'
            && !empty(Setting::get('google_client_id', config('services.google.client_id')));

        // Check if any admin has google_auth_only enabled
        $googleAuthOnly = false;
        if ($googleEnabled) {
            $googleAuthOnly = \App\Models\User::where('role', 'admin')
                ->where('google_auth_only', true)
                ->exists();
        }

        return Inertia::render('Auth/Login', [
            'status' => session('status'),
            'googleEnabled' => $googleEnabled,
            'googleAuthOnly' => $googleAuthOnly,
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        // Only allow admin users
        if ($request->user()->role !== 'admin') {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return back()->withErrors(['email' => 'Access denied.']);
        }

        // Check if 2FA is enabled (Fortify: confirmed 2FA)
        $has2fa = false;
        try {
            $has2fa = $request->user()->two_factor_secret && $request->user()->two_factor_confirmed_at;
        } catch (\Throwable $e) {
            // 2FA columns may not exist yet
        }

        if ($has2fa) {
            $userId = $request->user()->id;
            $remember = $request->boolean('remember');

            Auth::guard('web')->logout();

            $request->session()->put('2fa_user_id', $userId);
            $request->session()->put('2fa_remember', $remember);

            return redirect()->route('2fa.challenge');
        }

        $request->session()->regenerate();

        return redirect()->intended(route('admin.dashboard', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}
