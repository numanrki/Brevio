<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Url;
use App\Services\AnalyticsService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LinkAnalyticsController extends Controller
{
    public function show(Request $request, Url $link)
    {
        if ($link->user_id !== auth()->id()) {
            abort(403);
        }

        $range = $request->input('range', '30d');
        $analytics = new AnalyticsService();
        [$from, $to] = $analytics->parseDateRange($range);

        return Inertia::render('Dashboard/Links/Analytics', [
            'url' => $link->load('domain', 'campaign'),
            'range' => $range,
            'ranges' => ['today', '7d', '15d', '30d', '3m', '12m'],
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
