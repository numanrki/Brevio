<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Inertia\Inertia;

class SettingController extends Controller
{
    public function index()
    {
        $settings = Setting::all()->pluck('value', 'key');

        $has2fa = false;
        try {
            $user = auth()->user();
            $has2fa = (bool) ($user->two_factor_secret && $user->two_factor_confirmed_at);
        } catch (\Throwable $e) {
            // 2FA columns may not exist yet
        }

        return Inertia::render('Admin/Settings/Index', [
            'settings'    => $settings,
            'has2fa'      => $has2fa,
            'callbackUrl' => url('/auth/google/callback'),
        ]);
    }

    public function update(Request $request)
    {
        $allowedKeys = [
            'site_name', 'site_description', 'site_url',
            'mail_driver', 'mail_host', 'mail_port', 'mail_username', 'mail_password', 'mail_from',
            'facebook_url', 'twitter_url',
            'google_analytics_id', 'custom_head_code', 'custom_footer_code',
            'google_client_id', 'google_client_secret', 'google_login_enabled',
            'noindex_bio_pages', 'noindex_short_links', 'noindex_interstitial',
            'noindex_password_pages', 'noindex_expired_pages', 'noindex_deep_links',
        ];

        foreach ($allowedKeys as $key) {
            if ($request->has($key)) {
                Setting::set($key, $request->input($key, ''));
            }
        }

        return redirect()->back()->with('success', 'Settings updated successfully.');
    }

    public function clearCache()
    {
        Artisan::call('cache:clear');
        Artisan::call('config:clear');
        Artisan::call('route:clear');
        Artisan::call('view:clear');

        return response()->json(['success' => true, 'message' => 'All caches cleared successfully.']);
    }
}
