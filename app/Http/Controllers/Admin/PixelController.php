<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pixel;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PixelController extends Controller
{
    public function index(Request $request)
    {
        $pixels = Pixel::query()
            ->withCount('fires')
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('token', 'like', "%{$search}%");
                });
            })
            ->when($request->type, function ($query, $type) {
                $query->where('type', $type);
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Pixels/Index', [
            'pixels' => $pixels,
            'filters' => $request->only(['search', 'type']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Pixels/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:page_view,conversion,custom',
            'is_active' => 'boolean',
        ]);

        $validated['user_id'] = auth()->id();
        $validated['provider'] = 'brevio';
        $validated['pixel_id'] = 'brevio_' . Str::random(8);
        $validated['token'] = Str::random(32);

        Pixel::create($validated);

        return redirect()->route('admin.pixels.index')->with('success', 'Pixel created successfully.');
    }

    public function show(Pixel $pixel)
    {
        $pixel->loadCount('fires');

        $firesStats = $pixel->fires()
            ->where('created_at', '>=', now()->subDays(30))
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $base = rtrim(config('app.url'), '/');
        $embedCodes = [
            'image' => '<img src="' . $base . '/pixel/' . $pixel->token . '.gif" width="1" height="1" style="display:none" alt="" />',
            'script' => '<script src="' . $base . '/pixel/' . $pixel->token . '.js" async></script>',
        ];

        return Inertia::render('Admin/Pixels/Show', [
            'pixel' => $pixel,
            'fires_stats' => $firesStats,
            'embed_codes' => $embedCodes,
        ]);
    }

    public function edit(Pixel $pixel)
    {
        return Inertia::render('Admin/Pixels/Edit', [
            'pixel' => $pixel,
        ]);
    }

    public function update(Request $request, Pixel $pixel)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:page_view,conversion,custom',
            'is_active' => 'boolean',
        ]);

        $pixel->update($validated);

        return redirect()->route('admin.pixels.index')->with('success', 'Pixel updated successfully.');
    }

    public function destroy(Pixel $pixel)
    {
        $pixel->delete();

        return redirect()->route('admin.pixels.index')->with('success', 'Pixel deleted successfully.');
    }

    public function analytics(Request $request, Pixel $pixel)
    {
        $pixel->loadCount('fires');

        $range = $request->input('range', '30d');
        [$from, $to] = $this->parseDateRange($range, $request->input('from'), $request->input('to'));

        $firesQuery = $pixel->fires()->whereBetween('created_at', [$from, $to]);

        $totalFires = (clone $firesQuery)->count();
        $uniqueFires = (clone $firesQuery)->where('is_unique', true)->count();
        $days = max($from->diffInDays($to), 1);

        return Inertia::render('Admin/Pixels/Analytics', [
            'pixel' => $pixel,
            'range' => $range,
            'ranges' => ['today', '7d', '15d', '30d', '3m', '12m', 'all', 'custom'],
            'custom_from' => $from->toDateString(),
            'custom_to' => $to->toDateString(),
            'summary' => [
                'total_fires' => $totalFires,
                'unique_fires' => $uniqueFires,
                'avg_daily' => round($totalFires / $days, 1),
            ],
            'fires_over_time' => (clone $firesQuery)
                ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
                ->groupBy('date')->orderBy('date')->get(),
            'top_countries' => (clone $firesQuery)
                ->whereNotNull('country')->where('country', '!=', '')
                ->selectRaw('country as name, COUNT(*) as count')
                ->groupBy('country')->orderByDesc('count')->limit(10)->get(),
            'top_browsers' => (clone $firesQuery)
                ->whereNotNull('browser')->where('browser', '!=', '')
                ->selectRaw('browser as name, COUNT(*) as count')
                ->groupBy('browser')->orderByDesc('count')->limit(10)->get(),
            'devices' => (clone $firesQuery)
                ->whereNotNull('device')->where('device', '!=', '')
                ->selectRaw('device as name, COUNT(*) as count')
                ->groupBy('device')->orderByDesc('count')->get(),
            'visitor_log' => (clone $firesQuery)
                ->latest('created_at')->limit(100)
                ->get(['id', 'country', 'city', 'browser', 'os', 'device', 'referrer', 'is_unique', 'created_at']),
        ]);
    }

    private function parseDateRange(string $range, ?string $customFrom = null, ?string $customTo = null): array
    {
        $to = now();

        return match ($range) {
            'today'  => [now()->startOfDay(), $to],
            '7d'     => [now()->subDays(7)->startOfDay(), $to],
            '15d'    => [now()->subDays(15)->startOfDay(), $to],
            '30d'    => [now()->subDays(30)->startOfDay(), $to],
            '3m'     => [now()->subMonths(3)->startOfDay(), $to],
            '12m'    => [now()->subYear()->startOfDay(), $to],
            'all'    => [\Carbon\Carbon::create(2020, 1, 1), $to],
            'custom' => [
                $customFrom ? \Carbon\Carbon::parse($customFrom)->startOfDay() : now()->subDays(30)->startOfDay(),
                $customTo ? \Carbon\Carbon::parse($customTo)->endOfDay() : $to,
            ],
            default  => [now()->subDays(30)->startOfDay(), $to],
        };
    }
}
