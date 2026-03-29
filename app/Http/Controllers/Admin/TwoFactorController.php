<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use PragmaRX\Google2FA\Google2FA;

class TwoFactorController extends Controller
{
    /**
     * Generate a new 2FA secret and return setup data.
     */
    public function setup(Request $request)
    {
        try {
            $google2fa = new Google2FA();
            $secret = $google2fa->generateSecretKey();

            // Store temporarily in session until confirmed
            $request->session()->put('2fa_setup_secret', $secret);

            $qrUrl = $google2fa->getQRCodeUrl(
                config('app.name', 'Brevio'),
                $request->user()->email,
                $secret
            );

            return response()->json([
                'success' => true,
                'secret'  => $secret,
                'qr_url'  => $qrUrl,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to initialize 2FA: ' . $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Confirm 2FA setup by verifying the first TOTP code.
     */
    public function confirm(Request $request)
    {
        $request->validate([
            'code' => 'required|string|digits:6',
        ]);

        $secret = $request->session()->get('2fa_setup_secret');

        if (!$secret) {
            return response()->json([
                'success' => false,
                'message' => 'No 2FA setup in progress. Please start again.',
            ], 422);
        }

        $google2fa = new Google2FA();

        if (!$google2fa->verifyKey($secret, $request->input('code'))) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid verification code. Please try again.',
            ], 422);
        }

        // Save encrypted secret to user
        $user = $request->user();
        $user->secret_2fa = Crypt::encryptString($secret);
        $user->save();

        $request->session()->forget('2fa_setup_secret');

        return response()->json([
            'success' => true,
            'message' => 'Two-factor authentication enabled successfully.',
        ]);
    }

    /**
     * Disable 2FA for the current user.
     */
    public function disable(Request $request)
    {
        $request->validate([
            'password' => 'required|string',
        ]);

        if (!password_verify($request->input('password'), $request->user()->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Incorrect password.',
            ], 422);
        }

        $user = $request->user();
        $user->secret_2fa = null;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Two-factor authentication disabled.',
        ]);
    }

    /**
     * Show the 2FA challenge page (during login).
     */
    public function challenge(Request $request)
    {
        if (!$request->session()->has('2fa_user_id')) {
            return redirect()->route('login');
        }

        return inertia('Auth/TwoFactorChallenge');
    }

    /**
     * Verify the 2FA code during login.
     */
    public function verify(Request $request)
    {
        $request->validate([
            'code' => 'required|string|digits:6',
        ]);

        $userId = $request->session()->get('2fa_user_id');
        if (!$userId) {
            return redirect()->route('login');
        }

        $user = \App\Models\User::findOrFail($userId);

        if (!$user->secret_2fa) {
            return redirect()->route('login');
        }

        $google2fa = new Google2FA();
        $decryptedSecret = Crypt::decryptString($user->secret_2fa);

        if (!$google2fa->verifyKey($decryptedSecret, $request->input('code'))) {
            return back()->withErrors(['code' => 'Invalid verification code.']);
        }

        // Login the user
        auth()->login($user, $request->session()->get('2fa_remember', false));
        $request->session()->forget(['2fa_user_id', '2fa_remember']);
        $request->session()->regenerate();

        return redirect()->intended(route('admin.dashboard', absolute: false));
    }
}
