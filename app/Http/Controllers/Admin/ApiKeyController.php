<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ApiKey;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ApiKeyController extends Controller
{
    public const AVAILABLE_SCOPES = [
        'links:read'       => 'View links',
        'links:write'      => 'Create, update, delete links',
        'bio:read'         => 'View bio pages',
        'bio:write'        => 'Create, update, delete bio pages',
        'qr:read'          => 'View QR codes',
        'qr:write'         => 'Create, update, delete QR codes',
        'deep-links:read'  => 'View deep links',
        'deep-links:write' => 'Create, update, delete deep links',
        'pixels:read'      => 'View tracking pixels',
        'pixels:write'     => 'Create, update, delete pixels',
        'stats:read'       => 'View statistics & analytics',
        'account:read'     => 'View account info',
    ];

    public function index()
    {
        $keys = DB::table('api_keys')
            ->where('user_id', auth()->id())
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($key) => [
                'id'           => $key->id,
                'name'         => $key->name,
                'key_prefix'   => $key->key_prefix,
                'scopes'       => json_decode($key->scopes, true) ?: [],
                'is_active'    => (bool) $key->is_active,
                'last_used_at' => $key->last_used_at ? \Carbon\Carbon::parse($key->last_used_at)->diffForHumans() : null,
                'expires_at'   => $key->expires_at ? \Carbon\Carbon::parse($key->expires_at)->format('M d, Y') : null,
                'created_at'   => \Carbon\Carbon::parse($key->created_at)->format('M d, Y'),
            ]);

        return Inertia::render('Admin/ApiKeys/Index', [
            'apiKeys'         => $keys,
            'availableScopes' => self::AVAILABLE_SCOPES,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'       => 'required|string|max:100',
            'scopes'     => 'required|array|min:1',
            'scopes.*'   => 'string|in:' . implode(',', array_keys(self::AVAILABLE_SCOPES)),
            'expires_in' => 'nullable|string|in:30d,60d,90d,1y,never',
        ]);

        $expiresAt = match ($validated['expires_in'] ?? 'never') {
            '30d'   => now()->addDays(30),
            '60d'   => now()->addDays(60),
            '90d'   => now()->addDays(90),
            '1y'    => now()->addYear(),
            default => null,
        };

        $plainKey = 'brev_' . Str::random(48);

        $insertData = [
            'user_id'    => auth()->id(),
            'name'       => $validated['name'],
            'key'        => hash('sha256', $plainKey),
            'key_prefix' => substr($plainKey, 0, 12),
            'scopes'     => json_encode($validated['scopes']),
            'is_active'  => true,
            'expires_at' => $expiresAt,
            'created_at' => now(),
            'updated_at' => now(),
        ];

        try {
            $insertData['key_encrypted'] = Crypt::encryptString($plainKey);
        } catch (\Throwable) {}

        DB::table('api_keys')->insert($insertData);

        return redirect()->back()->with('success', 'API key created successfully.')
            ->with('new_key', $plainKey);
    }

    public function destroy($id)
    {
        $deleted = DB::table('api_keys')
            ->where('id', $id)
            ->where('user_id', auth()->id())
            ->delete();

        if (!$deleted) {
            return redirect()->back()->with('error', 'API key not found.');
        }

        return redirect()->back()->with('success', 'API key revoked successfully.');
    }

    public function regenerate($id)
    {
        $apiKey = DB::table('api_keys')
            ->where('id', $id)
            ->where('user_id', auth()->id())
            ->first();

        if (!$apiKey) {
            return redirect()->back()->with('error', 'API key not found.');
        }

        $plainKey = 'brev_' . Str::random(48);

        $updateData = [
            'key'        => hash('sha256', $plainKey),
            'key_prefix' => substr($plainKey, 0, 12),
            'updated_at' => now(),
        ];

        try {
            $updateData['key_encrypted'] = Crypt::encryptString($plainKey);
        } catch (\Throwable) {}

        DB::table('api_keys')->where('id', $id)->update($updateData);

        return redirect()->back()->with('success', 'API key regenerated successfully.')
            ->with('new_key', $plainKey);
    }

    public function toggle($id)
    {
        $apiKey = DB::table('api_keys')
            ->where('id', $id)
            ->where('user_id', auth()->id())
            ->first();

        if (!$apiKey) {
            return redirect()->back()->with('error', 'API key not found.');
        }

        $newStatus = $apiKey->is_active ? 0 : 1;

        DB::table('api_keys')
            ->where('id', $id)
            ->update([
                'is_active'  => $newStatus,
                'updated_at' => now(),
            ]);

        $status = $newStatus ? 'enabled' : 'disabled';

        return redirect()->back()->with('success', "API key {$status} successfully.");
    }

    public function reveal($id)
    {
        $apiKey = DB::table('api_keys')
            ->where('id', $id)
            ->where('user_id', auth()->id())
            ->first();

        if (!$apiKey) {
            return response()->json(['message' => 'API key not found.'], 404);
        }

        $encryptedKey = $apiKey->key_encrypted ?? null;

        if (empty($encryptedKey)) {
            return response()->json([
                'key' => null,
                'message' => 'Key not available. Regenerate to enable viewing.',
            ], 404);
        }

        try {
            $key = Crypt::decryptString($encryptedKey);
            return response()->json(['key' => $key]);
        } catch (\Throwable) {
            return response()->json([
                'key' => null,
                'message' => 'Key not available. Regenerate to enable viewing.',
            ], 404);
        }
    }
}
