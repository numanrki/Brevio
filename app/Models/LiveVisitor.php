<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class LiveVisitor extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'session_id',
        'ip',
        'country',
        'city',
        'page',
        'page_type',
        'browser',
        'os',
        'device',
        'last_seen_at',
    ];

    protected function casts(): array
    {
        return [
            'last_seen_at' => 'datetime',
        ];
    }

    /**
     * Record a live visitor from a server-side controller.
     * Call this from any public-facing controller (redirect, bio, QR, etc.).
     */
    public static function recordVisit(Request $request, string $pageType, ?string $page = null): void
    {
        try {
            if (!\Illuminate\Support\Facades\Schema::hasTable('live_visitors')) return;

            $userAgent = $request->userAgent() ?? '';

            // Skip bots
            if (self::isBot($userAgent)) return;

            $ip = $request->ip();
            $pagePath = $page ?: $request->path();
            $sessionId = hash('sha256', $ip . '|' . $userAgent . '|' . $pagePath);

            $country = null;
            $city = null;

            try {
                if (in_array($ip, ['127.0.0.1', '::1', 'localhost'])) {
                    $externalIp = @file_get_contents('https://api.ipify.org?format=text');
                    if ($externalIp && filter_var(trim($externalIp), FILTER_VALIDATE_IP)) {
                        $ip = trim($externalIp);
                    }
                }
                $position = \Stevebauman\Location\Facades\Location::get($ip);
                if ($position) {
                    $country = $position->countryCode;
                    $city = $position->cityName;
                }
            } catch (\Throwable) {}

            static::updateOrCreate(
                ['session_id' => $sessionId],
                [
                    'ip' => $request->ip(),
                    'country' => $country,
                    'city' => $city,
                    'page' => $page ? mb_substr($page, 0, 500) : $request->path(),
                    'page_type' => $pageType,
                    'browser' => self::parseBrowser($userAgent),
                    'os' => self::parseOs($userAgent),
                    'device' => self::parseDevice($userAgent),
                    'last_seen_at' => now(),
                ]
            );

            // Cleanup stale entries ~5% of the time
            if (random_int(1, 20) === 1) {
                static::cleanup();
            }
        } catch (\Throwable) {
            // Never let live tracking break the actual page
        }
    }

    /**
     * Clean up stale visitors (older than 5 minutes).
     */
    public static function cleanup(): int
    {
        return static::where('last_seen_at', '<', now()->subMinutes(5))->delete();
    }

    /**
     * Count currently active visitors.
     */
    public static function activeCount(): int
    {
        return static::where('last_seen_at', '>=', now()->subMinutes(5))->count();
    }

    /**
     * Get active visitors grouped by country.
     */
    public static function byCountry(): array
    {
        return static::where('last_seen_at', '>=', now()->subMinutes(5))
            ->whereNotNull('country')
            ->where('country', '!=', '')
            ->selectRaw('country, COUNT(*) as count')
            ->groupBy('country')
            ->orderByDesc('count')
            ->get()
            ->toArray();
    }

    private static function isBot(string $ua): bool
    {
        $bots = [
            'Googlebot', 'Bingbot', 'Slurp', 'DuckDuckBot', 'Baiduspider',
            'YandexBot', 'facebookexternalhit', 'Twitterbot', 'LinkedInBot',
            'WhatsApp', 'TelegramBot', 'Discordbot', 'Applebot', 'PinterestBot',
            'AhrefsBot', 'SemrushBot', 'MJ12bot', 'DotBot', 'PetalBot', 'bytespider',
            'curl/', 'wget/', 'python-requests', 'httpx', 'Go-http-client',
        ];
        $lower = strtolower($ua);
        foreach ($bots as $bot) {
            if (str_contains($lower, strtolower($bot))) return true;
        }
        return false;
    }

    private static function parseBrowser(string $ua): string
    {
        if (str_contains($ua, 'Edg')) return 'Edge';
        if (str_contains($ua, 'OPR') || str_contains($ua, 'Opera')) return 'Opera';
        if (str_contains($ua, 'Chrome')) return 'Chrome';
        if (str_contains($ua, 'Safari')) return 'Safari';
        if (str_contains($ua, 'Firefox')) return 'Firefox';
        return 'Other';
    }

    private static function parseOs(string $ua): string
    {
        if (str_contains($ua, 'Windows')) return 'Windows';
        if (str_contains($ua, 'Mac OS')) return 'macOS';
        if (str_contains($ua, 'Android')) return 'Android';
        if (str_contains($ua, 'iPhone') || str_contains($ua, 'iPad')) return 'iOS';
        if (str_contains($ua, 'Linux')) return 'Linux';
        return 'Other';
    }

    private static function parseDevice(string $ua): string
    {
        if (str_contains($ua, 'Tablet') || str_contains($ua, 'iPad')) return 'tablet';
        if (str_contains($ua, 'Mobile') || str_contains($ua, 'iPhone') || str_contains($ua, 'Android')) return 'mobile';
        return 'desktop';
    }
}
