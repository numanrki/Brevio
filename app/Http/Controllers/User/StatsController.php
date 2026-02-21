<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Click;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class StatsController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $urlIds = $user->urls()->pluck('id');

        $clicksOverTime = Click::whereIn('url_id', $urlIds)
            ->where('created_at', '>=', now()->subDays(30))
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as count'))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $topCountries = Click::whereIn('url_id', $urlIds)
            ->whereNotNull('country')
            ->select('country', DB::raw('COUNT(*) as count'))
            ->groupBy('country')
            ->orderByDesc('count')
            ->take(10)
            ->get();

        $topReferrers = Click::whereIn('url_id', $urlIds)
            ->whereNotNull('referrer')
            ->select('referrer', DB::raw('COUNT(*) as count'))
            ->groupBy('referrer')
            ->orderByDesc('count')
            ->take(10)
            ->get();

        $topBrowsers = Click::whereIn('url_id', $urlIds)
            ->whereNotNull('browser')
            ->select('browser', DB::raw('COUNT(*) as count'))
            ->groupBy('browser')
            ->orderByDesc('count')
            ->take(10)
            ->get();

        return Inertia::render('Dashboard/Stats', [
            'clicks_over_time' => $clicksOverTime,
            'top_countries' => $topCountries,
            'top_referrers' => $topReferrers,
            'top_browsers' => $topBrowsers,
        ]);
    }
}
