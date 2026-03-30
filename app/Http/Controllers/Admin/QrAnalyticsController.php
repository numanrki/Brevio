<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\QrCode;
use App\Services\AnalyticsService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class QrAnalyticsController extends Controller
{
    public function show(Request $request, QrCode $qrCode)
    {
        $range = $request->input('range', '30d');
        $analytics = new AnalyticsService();
        [$from, $to] = $analytics->parseDateRange($range, $request->input('from'), $request->input('to'));

        $type = QrCode::class;

        return Inertia::render('Admin/QrCodes/Analytics', [
            'qrCode' => $qrCode->load('url'),
            'range' => $range,
            'ranges' => ['today', '7d', '15d', '30d', '3m', '12m', 'all', 'custom'],
            'custom_from' => $from->toDateString(),
            'custom_to' => $to->toDateString(),
            'summary' => $analytics->getVisitSummary($type, $qrCode->id, 'qr_scan', $from, $to),
            'visits_over_time' => $analytics->getVisitsOverTime($type, $qrCode->id, 'qr_scan', $from, $to),
            'top_countries' => $analytics->getVisitTopItems($type, $qrCode->id, 'qr_scan', $from, $to, 'country'),
            'top_cities' => $analytics->getVisitTopItems($type, $qrCode->id, 'qr_scan', $from, $to, 'city'),
            'top_browsers' => $analytics->getVisitTopItems($type, $qrCode->id, 'qr_scan', $from, $to, 'browser'),
            'top_os' => $analytics->getVisitTopItems($type, $qrCode->id, 'qr_scan', $from, $to, 'os'),
            'devices' => $analytics->getVisitTopItems($type, $qrCode->id, 'qr_scan', $from, $to, 'device'),
            'top_referrers' => $analytics->getVisitTopReferrersParsed($type, $qrCode->id, 'qr_scan', $from, $to),
            'visitor_log' => $analytics->getVisitorLog($type, $qrCode->id, 'qr_scan', $from, $to),
        ]);
    }
}
