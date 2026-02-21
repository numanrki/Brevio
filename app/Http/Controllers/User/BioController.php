<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Bio;
use App\Models\BioWidget;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BioController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $bios = auth()->user()->bios()
            ->withCount('widgets')
            ->latest()
            ->paginate(15);

        return Inertia::render('Dashboard/Bio/Index', [
            'bios' => $bios,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Dashboard/Bio/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Merge theme from JSON string to array before validation
        if (is_string($request->theme)) {
            $request->merge(['theme' => json_decode($request->theme, true)]);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'alias' => 'required|string|max:255|unique:bios,alias',
            'avatar' => 'nullable|string',
            'theme' => 'nullable|array',
            'theme.background' => 'nullable|string',
            'theme.textColor' => 'nullable|string',
            'theme.buttonStyle' => 'nullable|string',
            'theme.buttonColor' => 'nullable|string',
            'theme.buttonTextColor' => 'nullable|string',
            'theme.buttonRadius' => 'nullable|string',
            'theme.fontFamily' => 'nullable|string',
            'theme.backgroundImage' => 'nullable|string',
            'theme.backgroundType' => 'nullable|string',
            'theme.gradientFrom' => 'nullable|string',
            'theme.gradientTo' => 'nullable|string',
            'seo_title' => 'nullable|string|max:255',
            'seo_description' => 'nullable|string',
        ]);

        $validated['user_id'] = auth()->id();

        $bio = Bio::create($validated);

        return redirect()->route('dashboard.bio.edit', $bio)->with('success', 'Bio page created! Now add your links and customize the design.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Bio $bio)
    {
        if ($bio->user_id !== auth()->id()) {
            abort(403);
        }

        return Inertia::render('Dashboard/Bio/Show', [
            'bio' => $bio->load(['widgets' => fn($q) => $q->orderBy('position')]),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Bio $bio)
    {
        if ($bio->user_id !== auth()->id()) {
            abort(403);
        }

        return Inertia::render('Dashboard/Bio/Edit', [
            'bio' => $bio->load(['widgets' => fn($q) => $q->orderBy('position')]),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Bio $bio)
    {
        if ($bio->user_id !== auth()->id()) {
            abort(403);
        }

        // Merge theme from JSON string to array before validation
        if (is_string($request->theme)) {
            $request->merge(['theme' => json_decode($request->theme, true)]);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'alias' => "required|string|max:255|unique:bios,alias,{$bio->id}",
            'avatar' => 'nullable|string',
            'theme' => 'nullable|array',
            'custom_css' => 'nullable|string',
            'seo_title' => 'nullable|string|max:255',
            'seo_description' => 'nullable|string',
            'is_active' => 'boolean',
            'widgets' => 'nullable|array',
            'widgets.*.id' => 'nullable|integer',
            'widgets.*.type' => 'required_with:widgets|string',
            'widgets.*.content' => 'required_with:widgets|array',
            'widgets.*.position' => 'required_with:widgets|integer',
            'widgets.*.is_active' => 'boolean',
        ]);

        $widgets = $validated['widgets'] ?? null;
        unset($validated['widgets']);

        $bio->update($validated);

        // Sync widgets if provided
        if ($widgets !== null) {
            $bio->widgets()->delete();
            foreach ($widgets as $index => $widget) {
                $bio->widgets()->create([
                    'type' => $widget['type'],
                    'content' => $widget['content'],
                    'position' => $widget['position'] ?? $index,
                    'is_active' => $widget['is_active'] ?? true,
                ]);
            }
        }

        return back()->with('success', 'Bio page updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Bio $bio)
    {
        if ($bio->user_id !== auth()->id()) {
            abort(403);
        }

        $bio->delete();

        return redirect()->route('dashboard.bio.index')->with('success', 'Bio page deleted successfully.');
    }
}
