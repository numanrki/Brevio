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

        return Inertia::render('Admin/Settings/Index', [
            'settings'    => $settings,
            'has2fa'      => (bool) (auth()->user()->two_factor_secret && auth()->user()->two_factor_confirmed_at),
        ]);
    }

    public function update(Request $request)
    {
        $allowedKeys = [
            'site_name', 'site_description', 'site_url',
            'mail_driver', 'mail_host', 'mail_port', 'mail_username', 'mail_password', 'mail_from',
            'facebook_url', 'twitter_url',
            'google_analytics_id', 'custom_head_code', 'custom_footer_code',
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
