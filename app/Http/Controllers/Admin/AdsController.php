<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdsController extends Controller
{
    public function index()
    {
        $keys = [
            'interstitial_ad_above',
            'interstitial_ad_below',
            'interstitial_ad_sidebar',
            'interstitial_default_timer',
            'interstitial_default_show_button',
        ];

        $settings = Setting::whereIn('key', $keys)->pluck('value', 'key');

        return Inertia::render('Admin/Ads/Index', [
            'settings' => $settings,
        ]);
    }

    public function update(Request $request)
    {
        $allowedKeys = [
            'interstitial_ad_above',
            'interstitial_ad_below',
            'interstitial_ad_sidebar',
            'interstitial_default_timer',
            'interstitial_default_show_button',
        ];

        foreach ($allowedKeys as $key) {
            if ($request->has($key)) {
                Setting::set($key, $request->input($key, ''));
            }
        }

        return redirect()->back()->with('success', 'Ad settings updated successfully.');
    }
}
