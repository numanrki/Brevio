<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Url;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class LinkController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $links = Url::where('user_id', $request->user()->id)
            ->when($request->search, fn ($q, $s) => $q->where('alias', 'like', "%{$s}%")->orWhere('url', 'like', "%{$s}%"))
            ->latest()
            ->paginate($request->integer('per_page', 15));

        $links->getCollection()->transform(fn (Url $link) => [
            'id'           => $link->id,
            'alias'        => $link->alias,
            'url'          => $link->url,
            'short_url'    => url('/' . $link->alias),
            'title'        => $link->title,
            'description'  => $link->description,
            'is_active'    => $link->is_active,
            'total_clicks' => $link->total_clicks,
            'expiry_date'  => $link->expiry_date,
            'created_at'   => $link->created_at->toIso8601String(),
        ]);

        return response()->json($links);
    }

    public function show(Request $request, Url $link): JsonResponse
    {
        if ($link->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        return response()->json([
            'data' => [
                'id'           => $link->id,
                'alias'        => $link->alias,
                'url'          => $link->url,
                'short_url'    => url('/' . $link->alias),
                'title'        => $link->title,
                'description'  => $link->description,
                'is_active'    => $link->is_active,
                'is_archived'  => $link->is_archived,
                'total_clicks' => $link->total_clicks,
                'expiry_date'  => $link->expiry_date,
                'created_at'   => $link->created_at->toIso8601String(),
                'updated_at'   => $link->updated_at->toIso8601String(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'url'         => 'required|url|max:2048',
            'alias'       => 'nullable|string|max:255|unique:urls,alias',
            'title'       => 'nullable|string|max:255',
            'description' => 'nullable|string|max:500',
            'is_active'   => 'nullable|boolean',
            'expiry_date' => 'nullable|date|after:now',
        ]);

        if (empty($validated['alias'])) {
            do {
                $alias = Str::random(6);
            } while (Url::where('alias', $alias)->exists());
            $validated['alias'] = $alias;
        }

        $validated['user_id'] = $request->user()->id;

        $link = Url::create($validated);

        return response()->json([
            'data' => [
                'id'           => $link->id,
                'alias'        => $link->alias,
                'url'          => $link->url,
                'short_url'    => url('/' . $link->alias),
                'title'        => $link->title,
                'is_active'    => $link->is_active,
                'total_clicks' => 0,
                'created_at'   => $link->created_at->toIso8601String(),
            ],
        ], 201);
    }

    public function update(Request $request, Url $link): JsonResponse
    {
        if ($link->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        $validated = $request->validate([
            'url'         => 'sometimes|url|max:2048',
            'title'       => 'nullable|string|max:255',
            'description' => 'nullable|string|max:500',
            'is_active'   => 'nullable|boolean',
            'expiry_date' => 'nullable|date|after:now',
        ]);

        $link->update($validated);

        return response()->json([
            'data' => [
                'id'           => $link->id,
                'alias'        => $link->alias,
                'url'          => $link->url,
                'short_url'    => url('/' . $link->alias),
                'title'        => $link->title,
                'is_active'    => $link->is_active,
                'total_clicks' => $link->total_clicks,
                'updated_at'   => $link->updated_at->toIso8601String(),
            ],
        ]);
    }

    public function destroy(Request $request, Url $link): JsonResponse
    {
        if ($link->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        $link->delete();

        return response()->json(['message' => 'Link deleted successfully.']);
    }
}
