<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DeepLink;
use App\Models\DeepLinkRule;
use App\Models\Pixel;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class DeepLinkController extends Controller
{
    public function index(Request $request)
    {
        $deepLinks = DeepLink::query()
            ->withCount(['rules', 'clicks'])
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('alias', 'like', "%{$search}%")
                      ->orWhere('fallback_url', 'like', "%{$search}%");
                });
            })
            ->when($request->status, function ($query, $status) {
                match ($status) {
                    'active' => $query->where('is_active', true),
                    'inactive' => $query->where('is_active', false),
                    'expired' => $query->whereNotNull('expiry_date')->where('expiry_date', '<', now()),
                    default => null,
                };
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/DeepLinks/Index', [
            'deepLinks' => $deepLinks,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function create()
    {
        $pixels = Pixel::where('is_active', true)->get(['id', 'name', 'type']);

        return Inertia::render('Admin/DeepLinks/Create', [
            'pixels' => $pixels,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'alias' => 'nullable|string|max:255|unique:deep_links,alias',
            'fallback_url' => 'required|url|max:2048',
            'is_active' => 'boolean',
            'expiry_date' => 'nullable|date|after:now',
            'utm_source' => 'nullable|string|max:255',
            'utm_medium' => 'nullable|string|max:255',
            'utm_campaign' => 'nullable|string|max:255',
            'rules' => 'nullable|array',
            'rules.*.type' => 'required|string|in:device,country,os,browser',
            'rules.*.value' => 'required|string|max:100',
            'rules.*.destination_url' => 'required|url|max:2048',
            'pixel_ids' => 'nullable|array',
            'pixel_ids.*' => 'exists:pixels,id',
        ]);

        if (empty($validated['alias'])) {
            do {
                $alias = Str::random(8);
            } while (DeepLink::where('alias', $alias)->exists());
            $validated['alias'] = $alias;
        }

        $validated['user_id'] = auth()->id();

        $deepLink = DeepLink::create(collect($validated)->except(['rules', 'pixel_ids'])->toArray());

        // Create rules with priority
        if (!empty($validated['rules'])) {
            foreach ($validated['rules'] as $i => $rule) {
                $deepLink->rules()->create([
                    'type' => $rule['type'],
                    'value' => $rule['value'],
                    'destination_url' => $rule['destination_url'],
                    'priority' => count($validated['rules']) - $i,
                ]);
            }
        }

        // Attach pixels
        if (!empty($validated['pixel_ids'])) {
            $deepLink->pixels()->sync($validated['pixel_ids']);
        }

        return redirect()->route('admin.deep-links.index')->with('success', 'Deep link created successfully.');
    }

    public function show(DeepLink $deepLink)
    {
        $deepLink->load(['rules', 'pixels']);

        $clicksStats = $deepLink->clicks()
            ->where('created_at', '>=', now()->subDays(30))
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return Inertia::render('Admin/DeepLinks/Show', [
            'deepLink' => $deepLink,
            'clicks_stats' => $clicksStats,
        ]);
    }

    public function edit(DeepLink $deepLink)
    {
        $deepLink->load(['rules', 'pixels']);
        $pixels = Pixel::where('is_active', true)->get(['id', 'name', 'type']);

        return Inertia::render('Admin/DeepLinks/Edit', [
            'deepLink' => $deepLink,
            'pixels' => $pixels,
        ]);
    }

    public function update(Request $request, DeepLink $deepLink)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'fallback_url' => 'required|url|max:2048',
            'is_active' => 'boolean',
            'expiry_date' => 'nullable|date',
            'utm_source' => 'nullable|string|max:255',
            'utm_medium' => 'nullable|string|max:255',
            'utm_campaign' => 'nullable|string|max:255',
            'rules' => 'nullable|array',
            'rules.*.type' => 'required|string|in:device,country,os,browser',
            'rules.*.value' => 'required|string|max:100',
            'rules.*.destination_url' => 'required|url|max:2048',
            'pixel_ids' => 'nullable|array',
            'pixel_ids.*' => 'exists:pixels,id',
        ]);

        $deepLink->update(collect($validated)->except(['rules', 'pixel_ids'])->toArray());

        // Sync rules: delete old, create new
        $deepLink->rules()->delete();
        if (!empty($validated['rules'])) {
            foreach ($validated['rules'] as $i => $rule) {
                $deepLink->rules()->create([
                    'type' => $rule['type'],
                    'value' => $rule['value'],
                    'destination_url' => $rule['destination_url'],
                    'priority' => count($validated['rules']) - $i,
                ]);
            }
        }

        // Sync pixels
        $deepLink->pixels()->sync($validated['pixel_ids'] ?? []);

        return redirect()->route('admin.deep-links.index')->with('success', 'Deep link updated successfully.');
    }

    public function destroy(DeepLink $deepLink)
    {
        $deepLink->delete();

        return redirect()->route('admin.deep-links.index')->with('success', 'Deep link deleted successfully.');
    }

    public function analytics(Request $request, DeepLink $deepLink)
    {
        $deepLink->load(['rules', 'pixels']);

        $range = $request->input('range', '30d');
        [$from, $to] = $this->parseDateRange($range, $request->input('from'), $request->input('to'));

        $clicksQuery = $deepLink->clicks()->whereBetween('created_at', [$from, $to]);

        $totalClicks = (clone $clicksQuery)->count();
        $uniqueClicks = (clone $clicksQuery)->where('is_unique', true)->count();
        $days = max($from->diffInDays($to), 1);

        return Inertia::render('Admin/DeepLinks/Analytics', [
            'deepLink' => $deepLink,
            'range' => $range,
            'ranges' => ['today', '7d', '15d', '30d', '3m', '12m', 'all', 'custom'],
            'custom_from' => $from->toDateString(),
            'custom_to' => $to->toDateString(),
            'summary' => [
                'total_clicks' => $totalClicks,
                'unique_clicks' => $uniqueClicks,
                'avg_daily' => round($totalClicks / $days, 1),
            ],
            'clicks_over_time' => (clone $clicksQuery)
                ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
                ->groupBy('date')->orderBy('date')->get(),
            'top_countries' => (clone $clicksQuery)
                ->whereNotNull('country')->where('country', '!=', '')
                ->selectRaw('country as name, COUNT(*) as count')
                ->groupBy('country')->orderByDesc('count')->limit(10)->get(),
            'top_browsers' => (clone $clicksQuery)
                ->whereNotNull('browser')->where('browser', '!=', '')
                ->selectRaw('browser as name, COUNT(*) as count')
                ->groupBy('browser')->orderByDesc('count')->limit(10)->get(),
            'top_os' => (clone $clicksQuery)
                ->whereNotNull('os')->where('os', '!=', '')
                ->selectRaw('os as name, COUNT(*) as count')
                ->groupBy('os')->orderByDesc('count')->limit(10)->get(),
            'devices' => (clone $clicksQuery)
                ->whereNotNull('device')->where('device', '!=', '')
                ->selectRaw('device as name, COUNT(*) as count')
                ->groupBy('device')->orderByDesc('count')->get(),
            'rule_performance' => $deepLink->rules->map(fn($rule) => [
                'id' => $rule->id,
                'type' => $rule->type,
                'value' => $rule->value,
                'clicks' => $deepLink->clicks()
                    ->where('rule_id', $rule->id)
                    ->whereBetween('created_at', [$from, $to])
                    ->count(),
            ]),
            'visitor_log' => (clone $clicksQuery)
                ->latest('created_at')->limit(100)
                ->get(['id', 'country', 'city', 'browser', 'os', 'device', 'referrer', 'destination_url', 'is_unique', 'created_at']),
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
