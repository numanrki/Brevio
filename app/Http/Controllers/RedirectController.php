<?php

namespace App\Http\Controllers;

use App\Models\Click;
use App\Models\Url;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RedirectController extends Controller
{
    public function handle(Request $request, string $alias)
    {
        $url = Url::where('alias', $alias)
            ->where('is_active', true)
            ->where('is_archived', false)
            ->first();

        if (!$url) {
            abort(404);
        }

        // Check if expired
        if ($url->isExpired()) {
            return Inertia::render('LinkExpired', ['alias' => $alias]);
        }

        // Check password protection
        if ($url->password && $request->session()->get("url_password_{$url->id}") !== $url->password) {
            return Inertia::render('PasswordProtect', ['alias' => $alias]);
        }

        // Increment total clicks
        $url->increment('total_clicks');

        // Parse User-Agent
        $userAgent = $request->userAgent() ?? '';
        $browser = $this->parseBrowser($userAgent);
        $os = $this->parseOs($userAgent);
        $device = $this->parseDevice($userAgent);

        // Check uniqueness (same ip + url_id in last 24h)
        $isUnique = !Click::where('url_id', $url->id)
            ->where('ip', $request->ip())
            ->where('created_at', '>=', now()->subDay())
            ->exists();

        // Create click record
        Click::create([
            'url_id' => $url->id,
            'ip' => $request->ip(),
            'browser' => $browser,
            'os' => $os,
            'device' => $device,
            'referrer' => $request->header('referer'),
            'language' => $request->getPreferredLanguage(),
            'country' => null,
            'is_unique' => $isUnique,
        ]);

        // Handle geo targets
        if (!empty($url->geo_targets) && is_array($url->geo_targets)) {
            // Geo targeting would require IP-to-country resolution
            // For now, skip geo-based redirect
        }

        // Handle device targets
        if (!empty($url->device_targets) && is_array($url->device_targets)) {
            foreach ($url->device_targets as $target) {
                if (isset($target['device'], $target['url'])) {
                    if (strtolower($target['device']) === strtolower($device)) {
                        return redirect()->away($target['url']);
                    }
                }
            }
        }

        // Handle language targets
        if (!empty($url->language_targets) && is_array($url->language_targets)) {
            $preferredLanguage = $request->getPreferredLanguage();
            foreach ($url->language_targets as $target) {
                if (isset($target['language'], $target['url'])) {
                    if (str_starts_with($preferredLanguage, $target['language'])) {
                        return redirect()->away($target['url']);
                    }
                }
            }
        }

        return redirect()->away($url->url);
    }

    private function parseBrowser(string $userAgent): string
    {
        if (str_contains($userAgent, 'Edg')) return 'Edge';
        if (str_contains($userAgent, 'OPR') || str_contains($userAgent, 'Opera')) return 'Opera';
        if (str_contains($userAgent, 'Chrome')) return 'Chrome';
        if (str_contains($userAgent, 'Safari')) return 'Safari';
        if (str_contains($userAgent, 'Firefox')) return 'Firefox';
        if (str_contains($userAgent, 'MSIE') || str_contains($userAgent, 'Trident')) return 'IE';
        return 'Other';
    }

    private function parseOs(string $userAgent): string
    {
        if (str_contains($userAgent, 'Windows')) return 'Windows';
        if (str_contains($userAgent, 'Mac OS')) return 'macOS';
        if (str_contains($userAgent, 'Linux')) return 'Linux';
        if (str_contains($userAgent, 'Android')) return 'Android';
        if (str_contains($userAgent, 'iPhone') || str_contains($userAgent, 'iPad')) return 'iOS';
        return 'Other';
    }

    private function parseDevice(string $userAgent): string
    {
        if (str_contains($userAgent, 'Mobile') || str_contains($userAgent, 'Android')) return 'mobile';
        if (str_contains($userAgent, 'Tablet') || str_contains($userAgent, 'iPad')) return 'tablet';
        return 'desktop';
    }
}
