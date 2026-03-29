<?php

namespace App\Services;

use App\Models\Visit;
use Illuminate\Http\Request;
use Stevebauman\Location\Facades\Location;

class VisitorTracker
{
    public static function track(
        string $visitableType,
        int $visitableId,
        string $eventType,
        Request $request,
        ?array $meta = null
    ): ?Visit {
        $userAgent = $request->userAgent() ?? '';

        if (self::isBot($userAgent)) {
            return null;
        }

        $ip = $request->ip();
        $country = null;
        $city = null;

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
        }

        $isUnique = !Visit::where('visitable_type', $visitableType)
            ->where('visitable_id', $visitableId)
            ->where('event_type', $eventType)
            ->where('ip', $request->ip())
            ->where('created_at', '>=', now()->subDay())
            ->exists();

        return Visit::create([
            'visitable_type' => $visitableType,
            'visitable_id' => $visitableId,
            'event_type' => $eventType,
            'ip' => $request->ip(),
            'country' => $country,
            'city' => $city,
            'browser' => self::parseBrowser($userAgent),
            'os' => self::parseOs($userAgent),
            'device' => self::parseDevice($userAgent),
            'referrer' => $request->header('referer'),
            'language' => $request->getPreferredLanguage(),
            'utm_source' => $request->query('utm_source'),
            'utm_medium' => $request->query('utm_medium'),
            'utm_campaign' => $request->query('utm_campaign'),
            'is_unique' => $isUnique,
            'meta' => $meta,
        ]);
    }

    private static function isBot(string $userAgent): bool
    {
        $bots = [
            'Googlebot', 'Bingbot', 'Slurp', 'DuckDuckBot', 'Baiduspider',
            'YandexBot', 'facebookexternalhit', 'Twitterbot', 'LinkedInBot',
            'WhatsApp', 'TelegramBot', 'Discordbot', 'Applebot', 'PinterestBot',
            'AhrefsBot', 'SemrushBot', 'MJ12bot', 'DotBot', 'PetalBot', 'bytespider',
            'curl/', 'wget/', 'python-requests', 'httpx', 'Go-http-client',
            'Java/', 'libwww-perl', 'node-fetch',
        ];

        $ua = strtolower($userAgent);
        foreach ($bots as $bot) {
            if (str_contains($ua, strtolower($bot))) {
                return true;
            }
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
        if (str_contains($ua, 'MSIE') || str_contains($ua, 'Trident')) return 'IE';
        return 'Other';
    }

    private static function parseOs(string $ua): string
    {
        if (str_contains($ua, 'Windows')) return 'Windows';
        if (str_contains($ua, 'Mac OS')) return 'macOS';
        if (str_contains($ua, 'Linux')) return 'Linux';
        if (str_contains($ua, 'Android')) return 'Android';
        if (str_contains($ua, 'iPhone') || str_contains($ua, 'iPad')) return 'iOS';
        return 'Other';
    }

    private static function parseDevice(string $ua): string
    {
        if (str_contains($ua, 'Mobile') || str_contains($ua, 'Android')) return 'mobile';
        if (str_contains($ua, 'Tablet') || str_contains($ua, 'iPad')) return 'tablet';
        return 'desktop';
    }
}
