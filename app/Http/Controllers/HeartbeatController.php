<?php

namespace App\Http\Controllers;

use App\Models\LiveVisitor;
use Illuminate\Http\Request;
use Stevebauman\Location\Facades\Location;

class HeartbeatController extends Controller
{
    /**
     * Receive a heartbeat ping from a public page visitor.
     */
    public function ping(Request $request)
    {
        $userAgent = $request->userAgent() ?? '';

        // Skip bots
        if ($this->isBot($userAgent)) {
            return response()->json(['ok' => true]);
        }

        $ip = $request->ip();
        $sessionId = hash('sha256', $ip . '|' . $userAgent);

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
        } catch (\Throwable) {}

        LiveVisitor::updateOrCreate(
            ['session_id' => $sessionId],
            [
                'ip' => $request->ip(),
                'country' => $country,
                'city' => $city,
                'page' => mb_substr($request->input('page', ''), 0, 500),
                'browser' => $this->parseBrowser($userAgent),
                'os' => $this->parseOs($userAgent),
                'device' => $this->parseDevice($userAgent),
                'last_seen_at' => now(),
            ]
        );

        // Cleanup stale entries ~5% of the time
        if (random_int(1, 20) === 1) {
            LiveVisitor::cleanup();
        }

        return response()->json(['ok' => true]);
    }

    private function isBot(string $ua): bool
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

    private function parseBrowser(string $ua): string
    {
        if (str_contains($ua, 'Edg')) return 'Edge';
        if (str_contains($ua, 'OPR') || str_contains($ua, 'Opera')) return 'Opera';
        if (str_contains($ua, 'Chrome')) return 'Chrome';
        if (str_contains($ua, 'Safari')) return 'Safari';
        if (str_contains($ua, 'Firefox')) return 'Firefox';
        return 'Other';
    }

    private function parseOs(string $ua): string
    {
        if (str_contains($ua, 'Windows')) return 'Windows';
        if (str_contains($ua, 'Mac OS')) return 'macOS';
        if (str_contains($ua, 'Android')) return 'Android';
        if (str_contains($ua, 'iPhone') || str_contains($ua, 'iPad')) return 'iOS';
        if (str_contains($ua, 'Linux')) return 'Linux';
        return 'Other';
    }

    private function parseDevice(string $ua): string
    {
        if (str_contains($ua, 'Tablet') || str_contains($ua, 'iPad')) return 'tablet';
        if (str_contains($ua, 'Mobile') || str_contains($ua, 'iPhone') || str_contains($ua, 'Android')) return 'mobile';
        return 'desktop';
    }
}
