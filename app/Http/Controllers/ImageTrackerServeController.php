<?php

namespace App\Http\Controllers;

use App\Models\ImageTracker;
use App\Models\ImageTrackerView;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class ImageTrackerServeController extends Controller
{
    /**
     * Social media / messenger bot user-agent patterns.
     */
    private const BOT_PATTERNS = [
        'WhatsApp', 'facebookexternalhit', 'Facebot', 'Twitterbot',
        'TelegramBot', 'LinkedInBot', 'Slackbot', 'Discordbot',
        'Googlebot', 'bingbot', 'Pinterestbot', 'Viber',
    ];

    public function serve(Request $request, string $token, ?string $ext = null)
    {
        // Check if table exists
        if (!Schema::hasTable('image_trackers')) {
            Log::error('Image Tracker: image_trackers table does not exist. Run migrations.');
            abort(404);
        }

        $tracker = ImageTracker::where('token', $token)->where('is_active', true)->first();

        if (!$tracker) {
            Log::warning("Image Tracker: no active tracker found for token={$token}");
            abort(404);
        }

        // Resolve image file path (new public/ location or old storage/ location)
        $path = $this->resolveFilePath($tracker);
        if (!$path) {
            Log::warning("Image Tracker: file not found for token={$token}, filename={$tracker->filename}");
            abort(404);
        }

        // Record the view
        $this->recordView($request, $tracker);

        // If a social media bot is fetching, return HTML with Open Graph tags for rich preview
        if ($this->isSocialBot($request->userAgent() ?? '')) {
            $imageUrl = asset('content/tracked-images/' . $tracker->filename);
            return response($this->buildOgHtml($tracker, $imageUrl), 200)
                ->header('Content-Type', 'text/html; charset=UTF-8');
        }

        // For regular users, serve the raw image
        return response()->file($path, [
            'Content-Type' => $tracker->mime_type,
            'Cache-Control' => 'no-store, no-cache, must-revalidate, max-age=0',
            'Pragma' => 'no-cache',
        ]);
    }

    private function resolveFilePath(ImageTracker $tracker): ?string
    {
        $newPath = public_path('content/tracked-images/' . $tracker->filename);
        $oldPath = storage_path('app/public/tracked-images/' . $tracker->filename);

        if (file_exists($newPath)) {
            return $newPath;
        }

        if (file_exists($oldPath)) {
            $destDir = public_path('content/tracked-images');
            if (!is_dir($destDir)) {
                @mkdir($destDir, 0755, true);
            }
            @copy($oldPath, $newPath);
            return file_exists($newPath) ? $newPath : $oldPath;
        }

        return null;
    }

    private function isSocialBot(string $ua): bool
    {
        foreach (self::BOT_PATTERNS as $bot) {
            if (stripos($ua, $bot) !== false) {
                return true;
            }
        }
        return false;
    }

    private function buildOgHtml(ImageTracker $tracker, string $imageUrl): string
    {
        $name = htmlspecialchars($tracker->name, ENT_QUOTES, 'UTF-8');
        return <<<HTML
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta property="og:title" content="{$name}" />
<meta property="og:image" content="{$imageUrl}" />
<meta property="og:image:type" content="{$tracker->mime_type}" />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="{$imageUrl}" />
</head>
<body><img src="{$imageUrl}" alt="{$name}" style="max-width:100%"></body>
</html>
HTML;
    }

    private function recordView(Request $request, ImageTracker $tracker): void
    {
        $userAgent = $request->userAgent() ?? '';
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
            $position = \Stevebauman\Location\Facades\Location::get($ip);
            if ($position) {
                $country = $position->countryCode;
                $city = $position->cityName;
            }
        } catch (\Throwable) {}

        $isUnique = !ImageTrackerView::where('image_tracker_id', $tracker->id)
            ->where('ip', $request->ip())
            ->where('created_at', '>=', now()->subDay())
            ->exists();

        $tracker->increment('total_views');

        ImageTrackerView::create([
            'image_tracker_id' => $tracker->id,
            'ip' => $request->ip(),
            'country' => $country,
            'city' => $city,
            'browser' => $this->parseBrowser($userAgent),
            'os' => $this->parseOs($userAgent),
            'device' => $this->parseDevice($userAgent),
            'device_model' => $this->parseDeviceModel($userAgent),
            'referrer' => $request->header('referer'),
            'user_agent' => $userAgent,
            'is_unique' => $isUnique,
            'created_at' => now(),
        ]);
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

    private function parseDeviceModel(string $ua): ?string
    {
        // iPhone models
        if (str_contains($ua, 'iPhone')) return 'iPhone';
        if (str_contains($ua, 'iPad')) return 'iPad';

        // Samsung (SM-A546B, SM-G998B, SM-S928U, etc.)
        if (preg_match('/SM-[A-Z]\d{2,4}[A-Z]?\b/i', $ua, $m)) return 'Samsung ' . strtoupper($m[0]);
        if (preg_match('/Samsung\s+(Galaxy\s+\S+)/i', $ua, $m)) return 'Samsung ' . $m[1];

        // Google Pixel
        if (preg_match('/Pixel\s*\d*\s*\w*/i', $ua, $m)) return 'Google ' . trim($m[0]);

        // OnePlus
        if (preg_match('/(?:ONEPLUS\s*)?(?:A\d{4}|IN\d{4}|KB\d{4}|CPH\d{4})/i', $ua, $m)) return 'OnePlus ' . trim($m[0]);
        if (preg_match('/OnePlus\s*\S+/i', $ua, $m)) return trim($m[0]);

        // Xiaomi / Redmi / POCO
        if (preg_match('/(Redmi\s+Note\s+\S+|Redmi\s+\S+|POCO\s+\S+|Mi\s+\d\S*)/i', $ua, $m)) return 'Xiaomi ' . trim($m[1]);
        if (preg_match('/Xiaomi\s+(\S+)/i', $ua, $m)) return 'Xiaomi ' . $m[1];

        // Huawei
        if (preg_match('/HUAWEI\s+(\S+)/i', $ua, $m)) return 'Huawei ' . $m[1];

        // Oppo / Vivo / Realme
        if (preg_match('/(?:CPH|RMX)\d{4}/i', $ua, $m)) return trim($m[0]);
        if (preg_match('/(OPPO|Vivo|Realme)\s+(\S+)/i', $ua, $m)) return $m[1] . ' ' . $m[2];

        // Generic Android model: "Build/..." preceded by model name
        if (preg_match('/;\s*([^;)]{2,40})\s+Build\//i', $ua, $m)) {
            $model = trim($m[1]);
            if (strlen($model) > 2 && !in_array($model, ['Linux', 'Android', 'wv'])) return $model;
        }

        // Mac
        if (str_contains($ua, 'Macintosh')) return 'Mac';

        // Windows
        if (preg_match('/Windows NT (\d+\.\d+)/', $ua, $m)) {
            return match ($m[1]) {
                '10.0' => 'Windows 10/11',
                '6.3' => 'Windows 8.1',
                '6.1' => 'Windows 7',
                default => 'Windows',
            };
        }

        return null;
    }
}
