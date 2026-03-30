<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Url;
use App\Services\AnalyticsService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LinkAnalyticsController extends Controller
{
    public function show(Request $request, Url $link)
    {
        $range = $request->input('range', '30d');
        $analytics = new AnalyticsService();
        [$from, $to] = $analytics->parseDateRange($range, $request->input('from'), $request->input('to'));

        return Inertia::render('Admin/Links/Analytics', [
            'url' => $link->load('domain'),
            'range' => $range,
            'ranges' => ['today', '7d', '15d', '30d', '3m', '12m', 'all', 'custom'],
            'custom_from' => $from->toDateString(),
            'custom_to' => $to->toDateString(),
            'summary' => $analytics->getSummary($link->id, $from, $to),
            'clicks_over_time' => $analytics->getClicksOverTime($link->id, $from, $to),
            'top_countries' => $analytics->getTopCountries($link->id, $from, $to),
            'top_cities' => $analytics->getTopCities($link->id, $from, $to),
            'top_referrers' => $analytics->getTopReferrersParsed($link->id, $from, $to),
            'top_browsers' => $analytics->getTopBrowsers($link->id, $from, $to),
            'top_os' => $analytics->getTopOS($link->id, $from, $to),
            'devices' => $analytics->getDeviceBreakdown($link->id, $from, $to),
            'top_languages' => $analytics->getTopLanguages($link->id, $from, $to),
            'visitor_log' => $analytics->getClickVisitorLog($link->id, $from, $to),
        ]);
    }
}
