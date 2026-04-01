<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bio;
use App\Models\BioWidget;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BioController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $bios = Bio::where('user_id', $request->user()->id)
            ->withCount('widgets')
            ->latest()
            ->paginate($request->integer('per_page', 15));

        $bios->getCollection()->transform(fn (Bio $bio) => [
            'id'              => $bio->id,
            'name'            => $bio->name,
            'alias'           => $bio->alias,
            'bio_url'         => url('/bio/' . $bio->alias),
            'avatar'          => $bio->avatar,
            'seo_title'       => $bio->seo_title,
            'seo_description' => $bio->seo_description,
            'is_active'       => $bio->is_active,
            'views'           => $bio->views ?? 0,
            'widgets_count'   => $bio->widgets_count,
            'created_at'      => $bio->created_at->toIso8601String(),
        ]);

        return response()->json($bios);
    }

    public function show(Request $request, Bio $bio): JsonResponse
    {
        if ($bio->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        $bio->load(['widgets' => fn ($q) => $q->orderBy('position')]);

        return response()->json([
            'data' => [
                'id'              => $bio->id,
                'name'            => $bio->name,
                'alias'           => $bio->alias,
                'bio_url'         => url('/bio/' . $bio->alias),
                'avatar'          => $bio->avatar,
                'theme'           => $bio->theme,
                'custom_css'      => $bio->custom_css,
                'seo_title'       => $bio->seo_title,
                'seo_description' => $bio->seo_description,
                'is_active'       => $bio->is_active,
                'views'           => $bio->views ?? 0,
                'widgets'         => $bio->widgets->map(fn (BioWidget $w) => [
                    'id'        => $w->id,
                    'type'      => $w->type,
                    'content'   => $w->content,
                    'position'  => $w->position,
                    'is_active' => $w->is_active,
                ]),
                'created_at'      => $bio->created_at->toIso8601String(),
                'updated_at'      => $bio->updated_at->toIso8601String(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        foreach (['theme'] as $field) {
            if (is_string($request->$field)) {
                $request->merge([$field => json_decode($request->$field, true) ?: []]);
            }
        }

        $validated = $request->validate([
            'name'            => 'required|string|max:255',
            'alias'           => 'required|string|max:255|unique:bios,alias',
            'avatar'          => 'nullable|string',
            'theme'           => 'nullable|array',
            'custom_css'      => 'nullable|string',
            'seo_title'       => 'nullable|string|max:255',
            'seo_description' => 'nullable|string',
            'is_active'       => 'nullable|boolean',
            'widgets'         => 'nullable|array',
            'widgets.*.type'     => 'required_with:widgets|string',
            'widgets.*.content'  => 'required_with:widgets|array',
            'widgets.*.position' => 'nullable|integer',
            'widgets.*.is_active' => 'nullable|boolean',
        ]);

        $widgets = $validated['widgets'] ?? [];
        unset($validated['widgets']);

        $validated['user_id'] = $request->user()->id;

        $bio = Bio::create($validated);

        foreach ($widgets as $index => $widget) {
            $bio->widgets()->create([
                'type'      => $widget['type'],
                'content'   => $widget['content'],
                'position'  => $widget['position'] ?? $index,
                'is_active' => $widget['is_active'] ?? true,
            ]);
        }

        return response()->json([
            'data' => [
                'id'        => $bio->id,
                'name'      => $bio->name,
                'alias'     => $bio->alias,
                'bio_url'   => url('/bio/' . $bio->alias),
                'is_active' => $bio->is_active,
                'views'     => 0,
                'created_at' => $bio->created_at->toIso8601String(),
            ],
        ], 201);
    }

    public function update(Request $request, Bio $bio): JsonResponse
    {
        if ($bio->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        foreach (['theme'] as $field) {
            if (is_string($request->$field)) {
                $request->merge([$field => json_decode($request->$field, true) ?: []]);
            }
        }

        $validated = $request->validate([
            'name'            => 'sometimes|string|max:255',
            'alias'           => "sometimes|string|max:255|unique:bios,alias,{$bio->id}",
            'avatar'          => 'nullable|string',
            'theme'           => 'nullable|array',
            'custom_css'      => 'nullable|string',
            'seo_title'       => 'nullable|string|max:255',
            'seo_description' => 'nullable|string',
            'is_active'       => 'nullable|boolean',
            'widgets'         => 'nullable|array',
            'widgets.*.type'     => 'required_with:widgets|string',
            'widgets.*.content'  => 'required_with:widgets|array',
            'widgets.*.position' => 'nullable|integer',
            'widgets.*.is_active' => 'nullable|boolean',
        ]);

        $widgets = $validated['widgets'] ?? null;
        unset($validated['widgets']);

        $bio->update($validated);

        if ($widgets !== null) {
            $bio->widgets()->delete();
            foreach ($widgets as $index => $widget) {
                $bio->widgets()->create([
                    'type'      => $widget['type'],
                    'content'   => $widget['content'],
                    'position'  => $widget['position'] ?? $index,
                    'is_active' => $widget['is_active'] ?? true,
                ]);
            }
        }

        $bio->load(['widgets' => fn ($q) => $q->orderBy('position')]);

        return response()->json([
            'data' => [
                'id'              => $bio->id,
                'name'            => $bio->name,
                'alias'           => $bio->alias,
                'bio_url'         => url('/bio/' . $bio->alias),
                'is_active'       => $bio->is_active,
                'views'           => $bio->views ?? 0,
                'widgets_count'   => $bio->widgets->count(),
                'updated_at'      => $bio->updated_at->toIso8601String(),
            ],
        ]);
    }

    public function destroy(Request $request, Bio $bio): JsonResponse
    {
        if ($bio->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        $bio->widgets()->delete();
        $bio->delete();

        return response()->json(['message' => 'Bio page deleted successfully.']);
    }
}
