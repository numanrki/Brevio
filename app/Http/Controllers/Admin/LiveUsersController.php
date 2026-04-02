<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LiveVisitor;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class LiveUsersController extends Controller
{
    /**
     * Render the Live Users page.
     */
    public function index()
    {
        $data = $this->getLiveData();

        return Inertia::render('Admin/LiveUsers', $data);
    }

    /**
     * AJAX endpoint — return fresh live data as JSON.
     */
    public function poll()
    {
        return response()->json($this->getLiveData());
    }

    private function getLiveData(): array
    {
        if (!Schema::hasTable('live_visitors')) {
            return [
                'total_active' => 0,
                'by_country' => [],
                'by_browser' => [],
                'by_os' => [],
                'by_device' => [],
                'active_pages' => [],
            ];
        }

        // Clean up stale visitors first
        LiveVisitor::cleanup();

        $cutoff = now()->subMinutes(5);

        $byCountry = LiveVisitor::where('last_seen_at', '>=', $cutoff)
            ->whereNotNull('country')->where('country', '!=', '')
            ->selectRaw('country, COUNT(*) as count')
            ->groupBy('country')->orderByDesc('count')->get()->toArray();

        $byBrowser = LiveVisitor::where('last_seen_at', '>=', $cutoff)
            ->whereNotNull('browser')->where('browser', '!=', '')
            ->selectRaw('browser as name, COUNT(*) as count')
            ->groupBy('browser')->orderByDesc('count')->get()->toArray();

        $byOs = LiveVisitor::where('last_seen_at', '>=', $cutoff)
            ->whereNotNull('os')->where('os', '!=', '')
            ->selectRaw('os as name, COUNT(*) as count')
            ->groupBy('os')->orderByDesc('count')->get()->toArray();

        $byDevice = LiveVisitor::where('last_seen_at', '>=', $cutoff)
            ->whereNotNull('device')->where('device', '!=', '')
            ->selectRaw('device as name, COUNT(*) as count')
            ->groupBy('device')->orderByDesc('count')->get()->toArray();

        $activePages = LiveVisitor::where('last_seen_at', '>=', $cutoff)
            ->whereNotNull('page')->where('page', '!=', '')
            ->selectRaw('page, COUNT(*) as count')
            ->groupBy('page')->orderByDesc('count')->limit(10)->get()->toArray();

        return [
            'total_active' => LiveVisitor::where('last_seen_at', '>=', $cutoff)->count(),
            'by_country' => $byCountry,
            'by_browser' => $byBrowser,
            'by_os' => $byOs,
            'by_device' => $byDevice,
            'active_pages' => $activePages,
        ];
    }
}
