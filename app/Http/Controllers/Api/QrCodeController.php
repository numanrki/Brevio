<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\QrCode;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class QrCodeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $qrCodes = QrCode::where('user_id', $request->user()->id)
            ->latest()
            ->paginate($request->integer('per_page', 15));

        $qrCodes->getCollection()->transform(fn (QrCode $qr) => [
            'id'         => $qr->id,
            'name'       => $qr->name,
            'type'       => $qr->type,
            'data'       => $qr->data,
            'style'      => $qr->style,
            'scans'      => $qr->scans ?? 0,
            'created_at' => $qr->created_at->toIso8601String(),
        ]);

        return response()->json($qrCodes);
    }

    public function show(Request $request, QrCode $qrCode): JsonResponse
    {
        if ($qrCode->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        return response()->json([
            'data' => [
                'id'         => $qrCode->id,
                'name'       => $qrCode->name,
                'type'       => $qrCode->type,
                'data'       => $qrCode->data,
                'style'      => $qrCode->style,
                'scans'      => $qrCode->scans ?? 0,
                'created_at' => $qrCode->created_at->toIso8601String(),
                'updated_at' => $qrCode->updated_at->toIso8601String(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        foreach (['data', 'style'] as $field) {
            if (is_string($request->$field)) {
                $request->merge([$field => json_decode($request->$field, true) ?: []]);
            }
        }

        $validated = $request->validate([
            'name'  => 'required|string|max:255',
            'type'  => 'nullable|string|max:50',
            'data'  => 'required|array',
            'style' => 'nullable|array',
        ]);

        $validated['user_id'] = $request->user()->id;

        $qrCode = QrCode::create($validated);

        return response()->json([
            'data' => [
                'id'         => $qrCode->id,
                'name'       => $qrCode->name,
                'type'       => $qrCode->type,
                'data'       => $qrCode->data,
                'style'      => $qrCode->style,
                'scans'      => 0,
                'created_at' => $qrCode->created_at->toIso8601String(),
            ],
        ], 201);
    }

    public function update(Request $request, QrCode $qrCode): JsonResponse
    {
        if ($qrCode->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        foreach (['data', 'style'] as $field) {
            if (is_string($request->$field)) {
                $request->merge([$field => json_decode($request->$field, true) ?: []]);
            }
        }

        $validated = $request->validate([
            'name'  => 'sometimes|string|max:255',
            'data'  => 'sometimes|array',
            'style' => 'nullable|array',
        ]);

        $qrCode->update($validated);

        return response()->json([
            'data' => [
                'id'         => $qrCode->id,
                'name'       => $qrCode->name,
                'type'       => $qrCode->type,
                'data'       => $qrCode->data,
                'style'      => $qrCode->style,
                'scans'      => $qrCode->scans ?? 0,
                'updated_at' => $qrCode->updated_at->toIso8601String(),
            ],
        ]);
    }

    public function destroy(Request $request, QrCode $qrCode): JsonResponse
    {
        if ($qrCode->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        $qrCode->delete();

        return response()->json(['message' => 'QR code deleted successfully.']);
    }
}
