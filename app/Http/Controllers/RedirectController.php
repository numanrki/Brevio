<?php

namespace App\Http\Controllers;

use App\Models\Click;
use App\Models\Setting;
use App\Models\Url;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Stevebauman\Location\Facades\Location;

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
            return Inertia::render('LinkExpired', [
                'alias' => $alias,
                'expired_at' => $url->expiry_date?->toIso8601String(),
            ]);
        }

        // Check password protection
        if ($url->password && $request->session()->get("url_password_{$url->id}") !== true) {
            return Inertia::render('PasswordProtect', [
                'alias' => $alias,
                'expiry_date' => $url->expiry_date?->toIso8601String(),
            ]);
        }

        // Parse User-Agent
        $userAgent = $request->userAgent() ?? '';

        // Skip tracking for bots
        if (!$this->isBot($userAgent)) {
            $this->trackClick($request, $url, $userAgent);
        }

        // Resolve final destination URL (geo/device/language targeting)
        $destinationUrl = $this->resolveDestination($request, $url, $userAgent);

        // Check if interstitial page should be shown (timer or button)
        $meta = $url->meta ?? [];
        $applyTimer = !empty($meta['apply_timer']);
        $showButton = !empty($meta['show_button']);

        if ($applyTimer || $showButton) {
            $timerDuration = (int) ($meta['timer_duration'] ?? 10);
            if ($timerDuration < 1) $timerDuration = 10;

            // Load ad codes from settings
            $settings = $this->getAdSettings();

            return Inertia::render('Interstitial', [
                'destination' => $destinationUrl,
                'title' => $url->title,
                'timer_duration' => $applyTimer ? $timerDuration : 0,
                'show_button' => $showButton,
                'ad_above' => $settings['interstitial_ad_above'] ?? null,
                'ad_below' => $settings['interstitial_ad_below'] ?? null,
                'ad_sidebar' => $settings['interstitial_ad_sidebar'] ?? null,
                'expiry_date' => $url->expiry_date?->toIso8601String(),
            ]);
        }

        return redirect()->away($destinationUrl);
    }

    /**
     * Verify password for a protected link.
     */
    public function verifyPassword(Request $request, string $alias)
    {
        $url = Url::where('alias', $alias)
            ->where('is_active', true)
            ->where('is_archived', false)
            ->first();

        if (!$url || !$url->password) {
            abort(404);
        }

        if ($request->input('password') === $url->password) {
            $request->session()->put("url_password_{$url->id}", true);
            return redirect("/{$alias}");
        }

        return Inertia::render('PasswordProtect', [
            'alias' => $alias,
            'error' => 'Incorrect password. Please try again.',
            'expiry_date' => $url->expiry_date?->toIso8601String(),
        ]);
    }

    /**
     * Track a click for the URL.
     */
    private function trackClick(Request $request, Url $url, string $userAgent): void
    {
        $url->increment('total_clicks');

        $browser = $this->parseBrowser($userAgent);
        $os = $this->parseOs($userAgent);
        $device = $this->parseDevice($userAgent);

        $country = null;
        $city = null;
        $ip = $request->ip();

        try {
            if (in_array($ip, ['127.0.0.1', '::1', 'localhost'])) {
                $externalIp = @file_get_contents('https://api.ipify.org?format=text');
                if ($externalIp && filter_var(trim($externalIp), FILTER_VALIDATE_IP)) {
                    $ip = trim($externalIp);
                }
            }

            $position = Location::get($ip);
            if ($position) {
                $country = $position->countryCode;
                $city = $position->cityName;
            }
        } catch (\Throwable) {
            // GeoIP resolution failed
        }

        $isUnique = !Click::where('url_id', $url->id)
            ->where('ip', $request->ip())
            ->where('created_at', '>=', now()->subDay())
            ->exists();

        Click::create([
            'url_id' => $url->id,
            'ip' => $request->ip(),
            'browser' => $browser,
            'os' => $os,
            'device' => $device,
            'referrer' => $request->header('referer'),
            'language' => $request->getPreferredLanguage(),
            'country' => $country,
            'city' => $city,
            'utm_source' => $request->query('utm_source'),
            'utm_medium' => $request->query('utm_medium'),
            'utm_campaign' => $request->query('utm_campaign'),
            'is_unique' => $isUnique,
        ]);
    }

    /**
     * Resolve final destination considering geo/device/language targeting.
     */
    private function resolveDestination(Request $request, Url $url, string $userAgent): string
    {
        // Handle geo targets
        if (!empty($url->geo_targets) && is_array($url->geo_targets)) {
            try {
                $position = Location::get($request->ip());
                if ($position && $position->countryCode) {
                    foreach ($url->geo_targets as $target) {
                        if (isset($target['country'], $target['url'])) {
                            if (strtoupper($target['country']) === strtoupper($position->countryCode)) {
                                return $target['url'];
                            }
                        }
                    }
                }
            } catch (\Throwable) {}
        }

        // Handle device targets
        if (!empty($url->device_targets) && is_array($url->device_targets)) {
            $device = $this->parseDevice($userAgent);
            foreach ($url->device_targets as $target) {
                if (isset($target['device'], $target['url'])) {
                    if (strtolower($target['device']) === strtolower($device)) {
                        return $target['url'];
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
                        return $target['url'];
                    }
                }
            }
        }

        return $url->url;
    }

    /**
     * Get ad settings from the database.
     */
    private function getAdSettings(): array
    {
        try {
            $keys = ['interstitial_ad_above', 'interstitial_ad_below', 'interstitial_ad_sidebar'];
            return Setting::whereIn('key', $keys)->pluck('value', 'key')->toArray();
        } catch (\Throwable) {
            return [];
        }
    }

    private function isBot(string $userAgent): bool
    {
        $bots = [
            'Googlebot', 'Bingbot', 'Slurp', 'DuckDuckBot', 'Baiduspider',
            'YandexBot', 'Sogou', 'facebookexternalhit', 'Twitterbot',
            'LinkedInBot', 'WhatsApp', 'TelegramBot', 'Discordbot',
            'Applebot', 'PinterestBot', 'Screaming Frog', 'AhrefsBot',
            'SemrushBot', 'MJ12bot', 'DotBot', 'PetalBot', 'bytespider',
            'curl/', 'wget/', 'python-requests', 'httpx', 'Go-http-client',
            'Java/', 'libwww-perl', 'Apache-HttpClient', 'node-fetch',
        ];

        $ua = strtolower($userAgent);
        foreach ($bots as $bot) {
            if (str_contains($ua, strtolower($bot))) {
                return true;
            }
        }

        return false;
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
