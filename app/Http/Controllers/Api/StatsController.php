<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bio;
use App\Models\DeepLinkClick;
use App\Models\Url;
use App\Services\AnalyticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StatsController extends Controller
{
    public function overview(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $totalLinks = Url::where('user_id', $userId)->count();
        $totalClicks = Url::where('user_id', $userId)->sum('total_clicks');
        $totalBioPages = Bio::where('user_id', $userId)->count();
        $totalBioViews = Bio::where('user_id', $userId)->sum('views');
        $totalDeepLinks = \App\Models\DeepLink::where('user_id', $userId)->count();
        $totalDeepLinkClicks = \App\Models\DeepLink::where('user_id', $userId)->sum('total_clicks');
        $totalQrCodes = \App\Models\QrCode::where('user_id', $userId)->count();
        $totalPixels = \App\Models\Pixel::where('user_id', $userId)->count();

        return response()->json([
            'data' => [
                'links' => [
                    'total' => $totalLinks,
                    'total_clicks' => (int) $totalClicks,
                ],
                'bio_pages' => [
                    'total' => $totalBioPages,
                    'total_views' => (int) $totalBioViews,
                ],
                'deep_links' => [
                    'total' => $totalDeepLinks,
                    'total_clicks' => (int) $totalDeepLinkClicks,
                ],
                'qr_codes' => [
                    'total' => $totalQrCodes,
                ],
                'pixels' => [
                    'total' => $totalPixels,
                ],
            ],
        ]);
    }

    public function link(Request $request, Url $link): JsonResponse
    {
        if ($link->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        $analytics = new AnalyticsService();
        $range = $request->input('range', '30d');
        [$from, $to] = $analytics->parseDateRange($range, $request->input('from'), $request->input('to'));

        return response()->json([
            'data' => [
                'link_id'          => $link->id,
                'range'            => $range,
                'from'             => $from->toDateString(),
                'to'               => $to->toDateString(),
                'summary'          => $analytics->getSummary($link->id, $from, $to),
                'clicks_over_time' => $analytics->getClicksOverTime($link->id, $from, $to),
                'top_countries'    => $analytics->getTopCountries($link->id, $from, $to),
                'top_cities'       => $analytics->getTopCities($link->id, $from, $to),
                'top_referrers'    => $analytics->getTopReferrers($link->id, $from, $to),
                'top_browsers'     => $analytics->getTopBrowsers($link->id, $from, $to),
                'top_os'           => $analytics->getTopOS($link->id, $from, $to),
                'devices'          => $analytics->getDeviceBreakdown($link->id, $from, $to),
                'top_languages'    => $analytics->getTopLanguages($link->id, $from, $to),
            ],
        ]);
    }

    public function deepLink(Request $request, \App\Models\DeepLink $deepLink): JsonResponse
    {
        if ($deepLink->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        $range = $request->input('range', '30d');
        $analytics = new AnalyticsService();
        [$from, $to] = $analytics->parseDateRange($range, $request->input('from'), $request->input('to'));

        $clicks = DeepLinkClick::where('deep_link_id', $deepLink->id)
            ->whereBetween('created_at', [$from, $to]);

        $total = (clone $clicks)->count();
        $unique = (clone $clicks)->where('is_unique', true)->count();
        $days = max($from->diffInDays($to), 1);

        $clicksOverTime = DeepLinkClick::where('deep_link_id', $deepLink->id)
            ->whereBetween('created_at', [$from, $to])
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $topCountries = DeepLinkClick::where('deep_link_id', $deepLink->id)
            ->whereBetween('created_at', [$from, $to])
            ->whereNotNull('country')->where('country', '!=', '')
            ->selectRaw('country as name, COUNT(*) as count')
            ->groupBy('country')
            ->orderByDesc('count')
            ->limit(10)
            ->get();

        $rulePerformance = DeepLinkClick::where('deep_link_id', $deepLink->id)
            ->whereBetween('created_at', [$from, $to])
            ->whereNotNull('rule_id')
            ->selectRaw('rule_id, destination_url, COUNT(*) as count')
            ->groupBy('rule_id', 'destination_url')
            ->orderByDesc('count')
            ->get();

        return response()->json([
            'data' => [
                'deep_link_id'     => $deepLink->id,
                'range'            => $range,
                'from'             => $from->toDateString(),
                'to'               => $to->toDateString(),
                'summary'          => [
                    'total_clicks'  => $total,
                    'unique_clicks' => $unique,
                    'avg_daily'     => round($total / $days, 1),
                ],
                'clicks_over_time' => $clicksOverTime,
                'top_countries'    => $topCountries,
                'rule_performance' => $rulePerformance,
            ],
        ]);
    }
}
