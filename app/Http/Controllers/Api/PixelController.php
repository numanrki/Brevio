<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pixel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PixelController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $pixels = Pixel::where('user_id', $request->user()->id)
            ->latest()
            ->paginate($request->integer('per_page', 15));

        $pixels->getCollection()->transform(fn (Pixel $pixel) => [
            'id'          => $pixel->id,
            'name'        => $pixel->name,
            'provider'    => $pixel->provider,
            'pixel_id'    => $pixel->pixel_id,
            'type'        => $pixel->type,
            'is_active'   => $pixel->is_active,
            'total_fires' => $pixel->total_fires,
            'created_at'  => $pixel->created_at->toIso8601String(),
        ]);

        return response()->json($pixels);
    }

    public function show(Request $request, Pixel $pixel): JsonResponse
    {
        if ($pixel->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        return response()->json([
            'data' => [
                'id'          => $pixel->id,
                'name'        => $pixel->name,
                'provider'    => $pixel->provider,
                'pixel_id'    => $pixel->pixel_id,
                'type'        => $pixel->type,
                'token'       => $pixel->token,
                'is_active'   => $pixel->is_active,
                'total_fires' => $pixel->total_fires,
                'created_at'  => $pixel->created_at->toIso8601String(),
                'updated_at'  => $pixel->updated_at->toIso8601String(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'      => 'required|string|max:255',
            'provider'  => 'required|string|max:255',
            'pixel_id'  => 'required|string|max:255',
            'type'      => 'nullable|string|in:page_view,conversion,custom',
            'token'     => 'nullable|string|max:255',
            'is_active' => 'nullable|boolean',
        ]);

        $validated['user_id'] = $request->user()->id;

        $pixel = Pixel::create($validated);

        return response()->json([
            'data' => [
                'id'          => $pixel->id,
                'name'        => $pixel->name,
                'provider'    => $pixel->provider,
                'pixel_id'    => $pixel->pixel_id,
                'type'        => $pixel->type,
                'is_active'   => $pixel->is_active,
                'total_fires' => 0,
                'created_at'  => $pixel->created_at->toIso8601String(),
            ],
        ], 201);
    }

    public function update(Request $request, Pixel $pixel): JsonResponse
    {
        if ($pixel->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        $validated = $request->validate([
            'name'      => 'sometimes|string|max:255',
            'provider'  => 'sometimes|string|max:255',
            'pixel_id'  => 'sometimes|string|max:255',
            'type'      => 'nullable|string|in:page_view,conversion,custom',
            'token'     => 'nullable|string|max:255',
            'is_active' => 'nullable|boolean',
        ]);

        $pixel->update($validated);

        return response()->json([
            'data' => [
                'id'          => $pixel->id,
                'name'        => $pixel->name,
                'provider'    => $pixel->provider,
                'pixel_id'    => $pixel->pixel_id,
                'type'        => $pixel->type,
                'is_active'   => $pixel->is_active,
                'total_fires' => $pixel->total_fires,
                'updated_at'  => $pixel->updated_at->toIso8601String(),
            ],
        ]);
    }

    public function destroy(Request $request, Pixel $pixel): JsonResponse
    {
        if ($pixel->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        $pixel->delete();

        return response()->json(['message' => 'Pixel deleted successfully.']);
    }
}
