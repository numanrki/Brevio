<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Bio;
use App\Services\AnalyticsService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BioAnalyticsController extends Controller
{
    public function show(Request $request, Bio $bio)
    {
        $range = $request->input('range', '30d');
        $analytics = new AnalyticsService();
        [$from, $to] = $analytics->parseDateRange($range, $request->input('from'), $request->input('to'));

        $type = Bio::class;

        return Inertia::render('Admin/Bio/Analytics', [
            'bio' => $bio,
            'range' => $range,
            'ranges' => ['today', '7d', '15d', '30d', '3m', '12m', 'all', 'custom'],
            'custom_from' => $from->toDateString(),
            'custom_to' => $to->toDateString(),
            'summary' => $analytics->getVisitSummary($type, $bio->id, 'page_view', $from, $to),
            'visits_over_time' => $analytics->getVisitsOverTime($type, $bio->id, 'page_view', $from, $to),
            'top_countries' => $analytics->getVisitTopItems($type, $bio->id, 'page_view', $from, $to, 'country'),
            'top_cities' => $analytics->getVisitTopItems($type, $bio->id, 'page_view', $from, $to, 'city'),
            'top_browsers' => $analytics->getVisitTopItems($type, $bio->id, 'page_view', $from, $to, 'browser'),
            'top_os' => $analytics->getVisitTopItems($type, $bio->id, 'page_view', $from, $to, 'os'),
            'devices' => $analytics->getVisitTopItems($type, $bio->id, 'page_view', $from, $to, 'device'),
            'top_referrers' => $analytics->getVisitTopReferrersParsed($type, $bio->id, 'page_view', $from, $to),
            'link_clicks' => $analytics->getVisitSummary($type, $bio->id, 'link_click', $from, $to),
            'visitor_log' => $analytics->getVisitorLog($type, $bio->id, null, $from, $to),
        ]);
    }
}
