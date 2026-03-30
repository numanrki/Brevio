<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Bio;
use App\Models\QrCode;
use App\Services\AnalyticsService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StatsController extends Controller
{
    public function index(Request $request)
    {
        $urlIds = \App\Models\Url::pluck('id')->toArray();

        $range = $request->input('range', '30d');
        $filter = $request->input('filter', 'all');
        $customFrom = $request->input('from');
        $customTo = $request->input('to');
        $analytics = new AnalyticsService();
        [$from, $to] = $analytics->parseDateRange($range, $customFrom, $customTo);

        $emptySummary = ['total_clicks' => 0, 'unique_clicks' => 0, 'avg_daily' => 0];

        $data = [
            'range' => $range,
            'ranges' => ['today', '7d', '15d', '30d', '3m', '12m', 'all', 'custom'],
            'custom_from' => $customFrom ?? $from->format('Y-m-d'),
            'custom_to' => $customTo ?? $to->format('Y-m-d'),
            'filter' => $filter,
        ];

        // Summaries
        $data['summary'] = in_array($filter, ['all', 'links'])
            ? $analytics->getGlobalSummary($urlIds, $from, $to)
            : $emptySummary;
        $data['bio_summary'] = in_array($filter, ['all', 'bio'])
            ? $analytics->getGlobalVisitSummary(Bio::class, 'page_view', $from, $to)
            : $emptySummary;
        $data['qr_summary'] = in_array($filter, ['all', 'qr'])
            ? $analytics->getGlobalVisitSummary(QrCode::class, 'qr_scan', $from, $to)
            : $emptySummary;

        // Chart data
        $data['clicks_over_time'] = in_array($filter, ['all', 'links'])
            ? $analytics->getGlobalClicksOverTime($urlIds, $from, $to) : [];
        $data['bio_visits_over_time'] = in_array($filter, ['all', 'bio'])
            ? $analytics->getGlobalVisitsOverTime(Bio::class, 'page_view', $from, $to) : [];
        $data['qr_scans_over_time'] = in_array($filter, ['all', 'qr'])
            ? $analytics->getGlobalVisitsOverTime(QrCode::class, 'qr_scan', $from, $to) : [];

        // Breakdowns based on filter type
        if ($filter === 'qr') {
            $data['top_countries'] = $analytics->getGlobalVisitTopItems(QrCode::class, 'qr_scan', $from, $to, 'country');
            $data['top_referrers'] = $analytics->getGlobalVisitTopReferrersParsed(QrCode::class, 'qr_scan', $from, $to);
            $data['top_browsers'] = $analytics->getGlobalVisitTopItems(QrCode::class, 'qr_scan', $from, $to, 'browser');
            $data['top_os'] = $analytics->getGlobalVisitTopItems(QrCode::class, 'qr_scan', $from, $to, 'os');
            $data['devices'] = $analytics->getGlobalVisitTopItems(QrCode::class, 'qr_scan', $from, $to, 'device');
            $data['top_languages'] = $analytics->getGlobalVisitTopItems(QrCode::class, 'qr_scan', $from, $to, 'language');
        } elseif ($filter === 'bio') {
            $data['top_countries'] = $analytics->getGlobalVisitTopItems(Bio::class, 'page_view', $from, $to, 'country');
            $data['top_referrers'] = $analytics->getGlobalVisitTopReferrersParsed(Bio::class, 'page_view', $from, $to);
            $data['top_browsers'] = $analytics->getGlobalVisitTopItems(Bio::class, 'page_view', $from, $to, 'browser');
            $data['top_os'] = $analytics->getGlobalVisitTopItems(Bio::class, 'page_view', $from, $to, 'os');
            $data['devices'] = $analytics->getGlobalVisitTopItems(Bio::class, 'page_view', $from, $to, 'device');
            $data['top_languages'] = $analytics->getGlobalVisitTopItems(Bio::class, 'page_view', $from, $to, 'language');
        } else {
            $data['top_countries'] = $analytics->getGlobalTopItems($urlIds, $from, $to, 'country');
            $data['top_referrers'] = $analytics->getGlobalTopReferrersParsed($urlIds, $from, $to);
            $data['top_browsers'] = $analytics->getGlobalTopItems($urlIds, $from, $to, 'browser');
            $data['top_os'] = $analytics->getGlobalTopItems($urlIds, $from, $to, 'os');
            $data['devices'] = $analytics->getGlobalTopItems($urlIds, $from, $to, 'device');
            $data['top_languages'] = $analytics->getGlobalTopItems($urlIds, $from, $to, 'language');
        }

        return Inertia::render('Admin/Stats', $data);
    }
}
