<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Laravel\Fortify\Actions\EnableTwoFactorAuthentication;
use Laravel\Fortify\Actions\DisableTwoFactorAuthentication;
use Laravel\Fortify\Actions\ConfirmTwoFactorAuthentication;
use Laravel\Fortify\Actions\GenerateNewRecoveryCodes;

class TwoFactorController extends Controller
{
    /**
     * Enable 2FA: generate secret and return QR code + recovery codes.
     */
    public function setup(Request $request)
    {
        try {
            $user = $request->user();

            // Enable 2FA via Fortify (generates secret + recovery codes)
            app(EnableTwoFactorAuthentication::class)($user);

            $user->refresh();

            return response()->json([
                'success' => true,
                'secret' => decrypt($user->two_factor_secret),
                'qr_url' => $user->twoFactorQrCodeUrl(),
                'qr_svg' => $user->twoFactorQrCodeSvg(),
                'recovery_codes' => json_decode(decrypt($user->two_factor_recovery_codes), true),
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

        try {
            app(ConfirmTwoFactorAuthentication::class)($request->user(), $request->input('code'));

            return response()->json([
                'success' => true,
                'message' => 'Two-factor authentication enabled successfully.',
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid verification code. Please try again.',
            ], 422);
        }
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

        app(DisableTwoFactorAuthentication::class)($request->user());

        return response()->json([
            'success' => true,
            'message' => 'Two-factor authentication disabled.',
        ]);
    }

    /**
     * Regenerate recovery codes.
     */
    public function recoveryCodes(Request $request)
    {
        app(GenerateNewRecoveryCodes::class)($request->user());

        $user = $request->user()->refresh();

        return response()->json([
            'success' => true,
            'recovery_codes' => json_decode(decrypt($user->two_factor_recovery_codes), true),
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
            'code' => 'nullable|string|digits:6',
            'recovery_code' => 'nullable|string',
        ]);

        $userId = $request->session()->get('2fa_user_id');
        if (!$userId) {
            return redirect()->route('login');
        }

        $user = \App\Models\User::findOrFail($userId);

        if (!$user->two_factor_secret) {
            return redirect()->route('login');
        }

        // Try TOTP code first
        if ($request->filled('code')) {
            $google2fa = app(\PragmaRX\Google2FA\Google2FA::class);
            $valid = $google2fa->verifyKey(
                decrypt($user->two_factor_secret),
                $request->input('code')
            );

            if (!$valid) {
                return back()->withErrors(['code' => 'Invalid verification code.']);
            }
        }
        // Try recovery code
        elseif ($request->filled('recovery_code')) {
            $recoveryCodes = json_decode(decrypt($user->two_factor_recovery_codes), true);
            $recoveryCode = $request->input('recovery_code');

            if (!in_array($recoveryCode, $recoveryCodes)) {
                return back()->withErrors(['recovery_code' => 'Invalid recovery code.']);
            }

            // Remove used recovery code
            $user->forceFill([
                'two_factor_recovery_codes' => encrypt(json_encode(
                    array_values(array_diff($recoveryCodes, [$recoveryCode]))
                )),
            ])->save();
        } else {
            return back()->withErrors(['code' => 'Please enter a verification code.']);
        }

        // Login the user
        auth()->login($user, $request->session()->get('2fa_remember', false));
        $request->session()->forget(['2fa_user_id', '2fa_remember']);
        $request->session()->regenerate();

        return redirect()->intended(route('admin.dashboard', absolute: false));
    }
}
