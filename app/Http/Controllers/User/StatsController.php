<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Services\AnalyticsService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StatsController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $urlIds = $user->urls()->pluck('id')->toArray();

        $range = $request->input('range', '30d');
        $analytics = new AnalyticsService();
        [$from, $to] = $analytics->parseDateRange($range);

        return Inertia::render('Dashboard/Stats', [
            'range' => $range,
            'ranges' => ['today', '7d', '15d', '30d', '3m', '12m'],
            'summary' => $analytics->getGlobalSummary($urlIds, $from, $to),
            'clicks_over_time' => $analytics->getGlobalClicksOverTime($urlIds, $from, $to),
            'top_countries' => $analytics->getGlobalTopItems($urlIds, $from, $to, 'country'),
            'top_referrers' => $analytics->getGlobalTopItems($urlIds, $from, $to, 'referrer'),
            'top_browsers' => $analytics->getGlobalTopItems($urlIds, $from, $to, 'browser'),
            'top_os' => $analytics->getGlobalTopItems($urlIds, $from, $to, 'os'),
            'devices' => $analytics->getGlobalTopItems($urlIds, $from, $to, 'device'),
            'top_languages' => $analytics->getGlobalTopItems($urlIds, $from, $to, 'language'),
        ]);
    }
}
