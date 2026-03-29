<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Bio;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BioController extends Controller
{
    public function index()
    {
        $bios = Bio::withCount('widgets')
            ->latest()
            ->paginate(15);

        return Inertia::render('Admin/Bio/Index', [
            'bios' => $bios,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Bio/Create');
    }

    public function store(Request $request)
    {
        if (is_string($request->theme)) {
            $request->merge(['theme' => json_decode($request->theme, true)]);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'alias' => 'required|string|max:255|unique:bios,alias',
            'avatar' => 'nullable|string',
            'theme' => 'nullable|array',
            'seo_title' => 'nullable|string|max:255',
            'seo_description' => 'nullable|string',
        ]);

        $validated['user_id'] = auth()->id();

        $bio = Bio::create($validated);

        return redirect()->route('admin.bio.edit', $bio)->with('success', 'Bio page created!');
    }

    public function show(Bio $bio)
    {
        return Inertia::render('Admin/Bio/Show', [
            'bio' => $bio->load(['widgets' => fn($q) => $q->orderBy('position')]),
        ]);
    }

    public function edit(Bio $bio)
    {
        return Inertia::render('Admin/Bio/Edit', [
            'bio' => $bio->load(['widgets' => fn($q) => $q->orderBy('position')]),
        ]);
    }

    public function update(Request $request, Bio $bio)
    {
        if (is_string($request->theme)) {
            $request->merge(['theme' => json_decode($request->theme, true)]);
        }

        // Widgets arrive as JSON string from the frontend
        if (is_string($request->widgets)) {
            $request->merge(['widgets' => json_decode($request->widgets, true)]);
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

    public function destroy(Bio $bio)
    {
        $bio->delete();

        return redirect()->route('admin.bio.index')->with('success', 'Bio page deleted successfully.');
    }
}
