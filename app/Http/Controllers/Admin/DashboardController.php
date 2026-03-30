<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Bio;
use App\Models\Click;
use App\Models\DeepLink;
use App\Models\DeepLinkClick;
use App\Models\QrCode;
use App\Models\Report;
use App\Models\Url;
use App\Services\AnalyticsService;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $from = now()->subDays(7)->startOfDay();
        $to = now();

        // Clicks over last 7 days (links + deep links merged)
        $linkClicks = Click::whereBetween('created_at', [$from, $to])
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as count'))
            ->groupBy('date')
            ->pluck('count', 'date');

        $dlClicks = DeepLinkClick::whereBetween('created_at', [$from, $to])
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as count'))
            ->groupBy('date')
            ->pluck('count', 'date');

        $clicksOverTime = [];
        for ($d = $from->copy(); $d->lte($to); $d->addDay()) {
            $date = $d->format('Y-m-d');
            $clicksOverTime[] = [
                'date' => $date,
                'links' => (int) ($linkClicks[$date] ?? 0),
                'deep_links' => (int) ($dlClicks[$date] ?? 0),
            ];
        }

        // Top referrers (last 7 days, links)
        $topReferrers = Click::whereBetween('created_at', [$from, $to])
            ->whereNotNull('referrer')
            ->where('referrer', '!=', '')
            ->select('referrer', DB::raw('COUNT(*) as count'))
            ->groupBy('referrer')
            ->get()
            ->groupBy(fn($item) => AnalyticsService::normalizeReferrer($item->referrer))
            ->map(fn($group, $name) => ['name' => $name, 'count' => $group->sum('count')])
            ->sortByDesc('count')
            ->take(5)
            ->values();

        // Top countries (last 7 days)
        $topCountries = Click::whereBetween('created_at', [$from, $to])
            ->whereNotNull('country')
            ->where('country', '!=', '')
            ->select('country as name', DB::raw('COUNT(*) as count'))
            ->groupBy('country')
            ->orderByDesc('count')
            ->limit(5)
            ->get();

        // Top browsers (last 7 days)
        $topBrowsers = Click::whereBetween('created_at', [$from, $to])
            ->whereNotNull('browser')
            ->where('browser', '!=', '')
            ->select('browser as name', DB::raw('COUNT(*) as count'))
            ->groupBy('browser')
            ->orderByDesc('count')
            ->limit(5)
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'total_links' => Url::count(),
                'total_clicks' => (int) Url::sum('total_clicks'),
                'total_bio_pages' => Bio::count(),
                'total_qr_codes' => QrCode::count(),
                'total_deep_links' => DeepLink::count(),
                'total_dl_clicks' => (int) DeepLink::sum('total_clicks'),
            ],
            'clicks_over_time' => $clicksOverTime,
            'top_referrers' => $topReferrers,
            'top_countries' => $topCountries,
            'top_browsers' => $topBrowsers,
            'recent_links' => Url::latest()->take(5)->get(),
            'recent_deep_links' => DeepLink::latest()->take(5)->get(['id', 'name', 'alias', 'total_clicks', 'is_active', 'created_at']),
            'pending_reports' => Report::where('status', 'pending')->count(),
        ]);
    }
}
