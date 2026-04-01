<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function index(): Response
    {
        $user = auth()->user();
        $googleEnabled = !empty(Setting::get('google_client_id', config('services.google.client_id')));

        return Inertia::render('Admin/Profile/Index', [
            'user' => $user,
            'googleEnabled' => $googleEnabled,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
        ]);

        $user->name = $validated['name'];
        $user->email = $validated['email'];

        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        return back()->with('success', 'Profile updated successfully.');
    }

    public function uploadAvatar(Request $request): RedirectResponse
    {
        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        $user = $request->user();

        // Delete old avatar if exists
        if ($user->avatar && file_exists(public_path($user->avatar))) {
            @unlink(public_path($user->avatar));
        }

        $file = $request->file('avatar');
        $filename = 'avatar_' . $user->id . '_' . time() . '.' . $file->getClientOriginalExtension();
        $file->move(public_path('content/avatar'), $filename);

        $user->avatar = 'content/avatar/' . $filename;
        $user->save();

        return back()->with('success', 'Avatar updated successfully.');
    }

    public function removeAvatar(): RedirectResponse
    {
        $user = auth()->user();

        if ($user->avatar && file_exists(public_path($user->avatar))) {
            @unlink(public_path($user->avatar));
        }

        $user->avatar = null;
        $user->save();

        return back()->with('success', 'Avatar removed.');
    }

    public function updateGoogleAuth(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'google_login_enabled' => ['sometimes', 'boolean'],
            'google_require_2fa' => ['sometimes', 'boolean'],
            'login_display' => ['sometimes', 'string', 'in:both,form_only,google_only'],
        ]);

        $user = $request->user();

        if (isset($validated['google_require_2fa'])) {
            $user->google_require_2fa = $validated['google_require_2fa'];
        }

        if (isset($validated['login_display'])) {
            // Only allow google_only if user has a google_id linked
            if ($validated['login_display'] === 'google_only' && !$user->google_id) {
                return back()->with('error', 'You must connect Google first to use Google-only login.');
            }
            $user->login_display = $validated['login_display'];
        }

        $user->save();

        return back()->with('success', 'Google authentication settings updated.');
    }

    public function disconnectGoogle(): RedirectResponse
    {
        $user = auth()->user();

        // Don't allow disconnect if password is not set
        if (!$user->password) {
            return back()->with('error', 'Set a password before disconnecting Google.');
        }

        $user->google_id = null;
        $user->login_display = 'both';
        $user->google_require_2fa = false;
        $user->save();

        return back()->with('success', 'Google account disconnected.');
    }
}
