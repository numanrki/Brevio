<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Domain;
use App\Models\Url;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class LinkController extends Controller
{
    public function index(Request $request)
    {
        $urls = Url::query()
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

        return Inertia::render('Admin/Links/Index', [
            'links' => $urls,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Links/Create', [
            'domains' => Domain::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'url' => 'required|url',
            'alias' => 'nullable|string|max:255|unique:urls,alias',
            'domain_id' => 'nullable|exists:domains,id',
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'password' => 'nullable|string',
            'expiry_date' => 'nullable|date|after:now',
            'apply_timer' => 'nullable|boolean',
            'show_button' => 'nullable|boolean',
            'timer_duration' => 'nullable|integer|min:1|max:60',
        ]);

        if (empty($validated['alias'])) {
            do {
                $alias = Str::random(6);
            } while (Url::where('alias', $alias)->exists());
            $validated['alias'] = $alias;
        }

        $validated['user_id'] = auth()->id();
        $validated['custom_alias'] = !empty($request->alias);

        // Store interstitial options in meta JSON
        $validated['meta'] = [
            'apply_timer' => !empty($validated['apply_timer']),
            'show_button' => !empty($validated['show_button']),
            'timer_duration' => (int) ($validated['timer_duration'] ?? 10),
        ];
        unset($validated['apply_timer'], $validated['show_button'], $validated['timer_duration']);

        Url::create($validated);

        return redirect()->route('admin.links.index')->with('success', 'Link created successfully.');
    }

    public function show(Url $link)
    {
        $clicksStats = $link->clicks()
            ->where('created_at', '>=', now()->subDays(30))
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return Inertia::render('Admin/Links/Show', [
            'url' => $link->load('domain'),
            'clicks_stats' => $clicksStats,
        ]);
    }

    public function edit(Url $link)
    {
        return Inertia::render('Admin/Links/Edit', [
            'url' => $link,
        ]);
    }

    public function update(Request $request, Url $link)
    {
        $validated = $request->validate([
            'url' => 'required|url',
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'password' => 'nullable|string',
            'expiry_date' => 'nullable|date',
            'is_active' => 'boolean',
            'is_archived' => 'boolean',
            'apply_timer' => 'nullable|boolean',
            'show_button' => 'nullable|boolean',
            'timer_duration' => 'nullable|integer|min:1|max:60',
        ]);

        // Store interstitial options in meta JSON
        $validated['meta'] = [
            'apply_timer' => !empty($validated['apply_timer']),
            'show_button' => !empty($validated['show_button']),
            'timer_duration' => (int) ($validated['timer_duration'] ?? 10),
        ];
        unset($validated['apply_timer'], $validated['show_button'], $validated['timer_duration']);

        $link->update($validated);

        return redirect()->route('admin.links.index')->with('success', 'Link updated successfully.');
    }

    public function destroy(Url $link)
    {
        $link->delete();

        return redirect()->route('admin.links.index')->with('success', 'Link deleted successfully.');
    }
}
