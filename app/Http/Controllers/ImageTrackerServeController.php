<?php

namespace App\Http\Controllers;

use App\Models\ImageTracker;
use App\Models\ImageTrackerView;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class ImageTrackerServeController extends Controller
{
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

        // Serve the actual image
        $path = storage_path('app/public/tracked-images/' . $tracker->filename);

        if (!file_exists($path)) {
            Log::warning("Image Tracker: file not found at {$path}");
            abort(404);
        }

        // Record the view
        $this->recordView($request, $tracker);

        return response()->file($path, [
            'Content-Type' => $tracker->mime_type,
            'Cache-Control' => 'no-store, no-cache, must-revalidate, max-age=0',
            'Pragma' => 'no-cache',
        ]);
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
        if (str_contains($ua, 'Mobile') || str_contains($ua, 'Android')) return 'mobile';
        if (str_contains($ua, 'Tablet') || str_contains($ua, 'iPad')) return 'tablet';
        return 'desktop';
    }
}
