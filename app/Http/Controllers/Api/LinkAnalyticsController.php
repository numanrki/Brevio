<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Url;
use App\Services\AnalyticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LinkAnalyticsController extends Controller
{
    public function show(Request $request, Url $link): JsonResponse
    {
        if ($link->user_id !== $request->user()->id) {
            abort(403);
        }

        $range = $request->input('range', '30d');
        $analytics = new AnalyticsService();
        [$from, $to] = $analytics->parseDateRange($range);

        return response()->json([
            'range' => $range,
            'summary' => $analytics->getSummary($link->id, $from, $to),
            'clicks_over_time' => $analytics->getClicksOverTime($link->id, $from, $to),
            'top_countries' => $analytics->getTopCountries($link->id, $from, $to),
            'top_cities' => $analytics->getTopCities($link->id, $from, $to),
            'top_referrers' => $analytics->getTopReferrers($link->id, $from, $to),
            'top_browsers' => $analytics->getTopBrowsers($link->id, $from, $to),
            'top_os' => $analytics->getTopOS($link->id, $from, $to),
            'devices' => $analytics->getDeviceBreakdown($link->id, $from, $to),
            'top_languages' => $analytics->getTopLanguages($link->id, $from, $to),
        ]);
    }
}
