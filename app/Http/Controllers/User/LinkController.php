<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Domain;
use App\Models\Url;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class LinkController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $urls = auth()->user()->urls()
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('alias', 'like', "%{$search}%")
                      ->orWhere('url', 'like', "%{$search}%")
                      ->orWhere('title', 'like', "%{$search}%");
                });
            })
            ->when($request->status, function ($query, $status) {
                match ($status) {
                    'active' => $query->where('is_active', true)->where('is_archived', false),
                    'archived' => $query->where('is_archived', true),
                    'expired' => $query->whereNotNull('expiry_date')->where('expiry_date', '<', now()),
                    default => null,
                };
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Dashboard/Links/Index', [
            'urls' => $urls,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $user = auth()->user();

        return Inertia::render('Dashboard/Links/Create', [
            'domains' => Domain::where('user_id', $user->id)
                ->orWhereNull('user_id')
                ->get(),
            'campaigns' => $user->campaigns()->get(),
            'overlays' => $user->overlays()->get(),
            'pixels' => $user->pixels()->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'url' => 'required|url',
            'alias' => 'nullable|string|max:255|unique:urls,alias',
            'domain_id' => 'nullable|exists:domains,id',
            'campaign_id' => 'nullable|exists:campaigns,id',
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'password' => 'nullable|string',
            'expiry_date' => 'nullable|date|after:now',
            'geo_targets' => 'nullable|array',
            'device_targets' => 'nullable|array',
            'ab_tests' => 'nullable|array',
            'pixels' => 'nullable|array',
            'overlay_id' => 'nullable|exists:overlays,id',
            'splash_id' => 'nullable|exists:splash_pages,id',
        ]);

        // Generate unique alias if not provided
        if (empty($validated['alias'])) {
            do {
                $alias = Str::random(6);
            } while (Url::where('alias', $alias)->exists());
            $validated['alias'] = $alias;
        }

        $validated['user_id'] = auth()->id();
        $validated['custom_alias'] = !empty($request->alias);

        Url::create($validated);

        return redirect()->route('dashboard.links.index')->with('success', 'Link created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Url $link)
    {
        if ($link->user_id !== auth()->id()) {
            abort(403);
        }

        $clicksStats = $link->clicks()
            ->where('created_at', '>=', now()->subDays(30))
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return Inertia::render('Dashboard/Links/Show', [
            'url' => $link->load('domain', 'campaign'),
            'clicks_stats' => $clicksStats,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Url $link)
    {
        if ($link->user_id !== auth()->id()) {
            abort(403);
        }

        return Inertia::render('Dashboard/Links/Edit', [
            'url' => $link,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Url $link)
    {
        if ($link->user_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'url' => 'required|url',
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'password' => 'nullable|string',
            'expiry_date' => 'nullable|date',
            'geo_targets' => 'nullable|array',
            'device_targets' => 'nullable|array',
            'ab_tests' => 'nullable|array',
            'pixels' => 'nullable|array',
            'overlay_id' => 'nullable|exists:overlays,id',
            'splash_id' => 'nullable|exists:splash_pages,id',
            'is_active' => 'boolean',
            'is_archived' => 'boolean',
        ]);

        $link->update($validated);

        return redirect()->route('dashboard.links.index')->with('success', 'Link updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Url $link)
    {
        if ($link->user_id !== auth()->id()) {
            abort(403);
        }

        $link->delete();

        return redirect()->route('dashboard.links.index')->with('success', 'Link deleted successfully.');
    }
}
