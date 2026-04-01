<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DeepLink;
use App\Models\DeepLinkRule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class DeepLinkController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $deepLinks = DeepLink::where('user_id', $request->user()->id)
            ->withCount('rules')
            ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%")->orWhere('alias', 'like', "%{$s}%"))
            ->latest()
            ->paginate($request->integer('per_page', 15));

        $deepLinks->getCollection()->transform(fn (DeepLink $dl) => [
            'id'              => $dl->id,
            'name'            => $dl->name,
            'alias'           => $dl->alias,
            'short_url'       => url('/dl/' . $dl->alias),
            'fallback_url'    => $dl->fallback_url,
            'is_active'       => $dl->is_active,
            'allowed_devices' => $dl->allowed_devices,
            'total_clicks'    => $dl->total_clicks,
            'rules_count'     => $dl->rules_count,
            'expiry_date'     => $dl->expiry_date?->toIso8601String(),
            'created_at'      => $dl->created_at->toIso8601String(),
        ]);

        return response()->json($deepLinks);
    }

    public function show(Request $request, DeepLink $deepLink): JsonResponse
    {
        if ($deepLink->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        $deepLink->load(['rules' => fn ($q) => $q->orderByDesc('priority')]);

        return response()->json([
            'data' => [
                'id'              => $deepLink->id,
                'name'            => $deepLink->name,
                'alias'           => $deepLink->alias,
                'short_url'       => url('/dl/' . $deepLink->alias),
                'fallback_url'    => $deepLink->fallback_url,
                'is_active'       => $deepLink->is_active,
                'allowed_devices' => $deepLink->allowed_devices,
                'total_clicks'    => $deepLink->total_clicks,
                'utm_source'      => $deepLink->utm_source,
                'utm_medium'      => $deepLink->utm_medium,
                'utm_campaign'    => $deepLink->utm_campaign,
                'expiry_date'     => $deepLink->expiry_date?->toIso8601String(),
                'rules'           => $deepLink->rules->map(fn (DeepLinkRule $r) => [
                    'id'              => $r->id,
                    'priority'        => $r->priority,
                    'type'            => $r->type,
                    'value'           => $r->value,
                    'destination_url' => $r->destination_url,
                ]),
                'created_at'      => $deepLink->created_at->toIso8601String(),
                'updated_at'      => $deepLink->updated_at->toIso8601String(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        foreach (['allowed_devices', 'meta'] as $field) {
            if (is_string($request->$field)) {
                $request->merge([$field => json_decode($request->$field, true) ?: []]);
            }
        }

        $validated = $request->validate([
            'name'              => 'required|string|max:255',
            'alias'             => 'nullable|string|max:255|unique:deep_links,alias',
            'fallback_url'      => 'required|url|max:2048',
            'is_active'         => 'nullable|boolean',
            'allowed_devices'   => 'nullable|array',
            'expiry_date'       => 'nullable|date|after:now',
            'utm_source'        => 'nullable|string|max:255',
            'utm_medium'        => 'nullable|string|max:255',
            'utm_campaign'      => 'nullable|string|max:255',
            'rules'             => 'nullable|array',
            'rules.*.type'            => 'required_with:rules|string|in:device,country,os,browser',
            'rules.*.value'           => 'required_with:rules|string|max:255',
            'rules.*.destination_url' => 'required_with:rules|url|max:2048',
            'rules.*.priority'        => 'nullable|integer',
        ]);

        if (empty($validated['alias'])) {
            do {
                $alias = Str::random(6);
            } while (DeepLink::where('alias', $alias)->exists());
            $validated['alias'] = $alias;
        }

        $rules = $validated['rules'] ?? [];
        unset($validated['rules']);

        $validated['user_id'] = $request->user()->id;

        $deepLink = DeepLink::create($validated);

        foreach ($rules as $index => $rule) {
            $deepLink->rules()->create([
                'type'            => $rule['type'],
                'value'           => $rule['value'],
                'destination_url' => $rule['destination_url'],
                'priority'        => $rule['priority'] ?? ($index + 1),
            ]);
        }

        return response()->json([
            'data' => [
                'id'           => $deepLink->id,
                'name'         => $deepLink->name,
                'alias'        => $deepLink->alias,
                'short_url'    => url('/dl/' . $deepLink->alias),
                'fallback_url' => $deepLink->fallback_url,
                'is_active'    => $deepLink->is_active,
                'total_clicks' => 0,
                'rules_count'  => count($rules),
                'created_at'   => $deepLink->created_at->toIso8601String(),
            ],
        ], 201);
    }

    public function update(Request $request, DeepLink $deepLink): JsonResponse
    {
        if ($deepLink->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        foreach (['allowed_devices', 'meta'] as $field) {
            if (is_string($request->$field)) {
                $request->merge([$field => json_decode($request->$field, true) ?: []]);
            }
        }

        $validated = $request->validate([
            'name'              => 'sometimes|string|max:255',
            'fallback_url'      => 'sometimes|url|max:2048',
            'is_active'         => 'nullable|boolean',
            'allowed_devices'   => 'nullable|array',
            'expiry_date'       => 'nullable|date|after:now',
            'utm_source'        => 'nullable|string|max:255',
            'utm_medium'        => 'nullable|string|max:255',
            'utm_campaign'      => 'nullable|string|max:255',
            'rules'             => 'nullable|array',
            'rules.*.type'            => 'required_with:rules|string|in:device,country,os,browser',
            'rules.*.value'           => 'required_with:rules|string|max:255',
            'rules.*.destination_url' => 'required_with:rules|url|max:2048',
            'rules.*.priority'        => 'nullable|integer',
        ]);

        $rules = $validated['rules'] ?? null;
        unset($validated['rules']);

        $deepLink->update($validated);

        if ($rules !== null) {
            $deepLink->rules()->delete();
            foreach ($rules as $index => $rule) {
                $deepLink->rules()->create([
                    'type'            => $rule['type'],
                    'value'           => $rule['value'],
                    'destination_url' => $rule['destination_url'],
                    'priority'        => $rule['priority'] ?? ($index + 1),
                ]);
            }
        }

        return response()->json([
            'data' => [
                'id'           => $deepLink->id,
                'name'         => $deepLink->name,
                'alias'        => $deepLink->alias,
                'short_url'    => url('/dl/' . $deepLink->alias),
                'fallback_url' => $deepLink->fallback_url,
                'is_active'    => $deepLink->is_active,
                'total_clicks' => $deepLink->total_clicks,
                'rules_count'  => $rules !== null ? count($rules) : $deepLink->rules()->count(),
                'updated_at'   => $deepLink->updated_at->toIso8601String(),
            ],
        ]);
    }

    public function destroy(Request $request, DeepLink $deepLink): JsonResponse
    {
        if ($deepLink->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        $deepLink->rules()->delete();
        $deepLink->delete();

        return response()->json(['message' => 'Deep link deleted successfully.']);
    }
}
