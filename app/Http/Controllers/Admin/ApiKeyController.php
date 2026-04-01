<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
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

    private function hasEncryptedColumn(): bool
    {
        static $result = null;
        if ($result === null) {
            try {
                $result = Schema::hasColumn('api_keys', 'key_encrypted');
            } catch (\Throwable) {
                $result = false;
            }
        }
        return $result;
    }

    public function index()
    {
        try {
            $keys = DB::table('api_keys')
                ->select(['id', 'name', 'key_prefix', 'scopes', 'is_active', 'last_used_at', 'expires_at', 'created_at'])
                ->where('user_id', auth()->id())
                ->orderByDesc('created_at')
                ->get()
                ->map(function ($key) {
                    $scopes = $key->scopes;
                    if (is_string($scopes)) {
                        $scopes = json_decode($scopes, true) ?: [];
                    }
                    if (!is_array($scopes)) {
                        $scopes = [];
                    }

                    return [
                        'id'           => $key->id,
                        'name'         => $key->name ?? 'Unnamed',
                        'key_prefix'   => $key->key_prefix ?? '****',
                        'scopes'       => $scopes,
                        'is_active'    => (bool) $key->is_active,
                        'last_used_at' => $key->last_used_at ? \Carbon\Carbon::parse($key->last_used_at)->diffForHumans() : null,
                        'expires_at'   => $key->expires_at ? \Carbon\Carbon::parse($key->expires_at)->format('M d, Y') : null,
                        'created_at'   => $key->created_at ? \Carbon\Carbon::parse($key->created_at)->format('M d, Y') : 'Unknown',
                    ];
                });
        } catch (\Throwable $e) {
            Log::error('ApiKeyController@index failed: ' . $e->getMessage());
            $keys = collect([]);
        }

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
            '30d'   => now()->addDays(30)->format('Y-m-d H:i:s'),
            '60d'   => now()->addDays(60)->format('Y-m-d H:i:s'),
            '90d'   => now()->addDays(90)->format('Y-m-d H:i:s'),
            '1y'    => now()->addYear()->format('Y-m-d H:i:s'),
            default => null,
        };

        $plainKey = 'brev_' . Str::random(48);
        $nowStr = now()->format('Y-m-d H:i:s');

        $insertData = [
            'user_id'    => auth()->id(),
            'name'       => $validated['name'],
            'key'        => hash('sha256', $plainKey),
            'key_prefix' => substr($plainKey, 0, 12),
            'scopes'     => json_encode($validated['scopes']),
            'is_active'  => 1,
            'expires_at' => $expiresAt,
            'created_at' => $nowStr,
            'updated_at' => $nowStr,
        ];

        if ($this->hasEncryptedColumn()) {
            try {
                $insertData['key_encrypted'] = Crypt::encryptString($plainKey);
            } catch (\Throwable) {
                $insertData['key_encrypted'] = '';
            }
        }

        try {
            DB::table('api_keys')->insert($insertData);
        } catch (\Throwable $e) {
            Log::error('ApiKeyController@store: ' . $e->getMessage() . ' | Data keys: ' . implode(',', array_keys($insertData)));
            return redirect()->back()->with('error', 'DB Error: ' . $e->getMessage());
        }

        return redirect()->back()->with('success', 'API key created successfully.')
            ->with('new_key', $plainKey);
    }

    public function destroy($id)
    {
        try {
            DB::table('api_keys')
                ->where('id', $id)
                ->where('user_id', auth()->id())
                ->delete();
        } catch (\Throwable $e) {
            Log::error('ApiKeyController@destroy failed: ' . $e->getMessage());
        }

        return redirect()->back()->with('success', 'API key revoked successfully.');
    }

    public function regenerate($id)
    {
        $plainKey = 'brev_' . Str::random(48);

        $updateData = [
            'key'        => hash('sha256', $plainKey),
            'key_prefix' => substr($plainKey, 0, 12),
            'updated_at' => now()->format('Y-m-d H:i:s'),
        ];

        if ($this->hasEncryptedColumn()) {
            try {
                $updateData['key_encrypted'] = Crypt::encryptString($plainKey);
            } catch (\Throwable) {
                $updateData['key_encrypted'] = '';
            }
        }

        try {
            DB::table('api_keys')
                ->where('id', $id)
                ->where('user_id', auth()->id())
                ->update($updateData);
        } catch (\Throwable $e) {
            Log::error('ApiKeyController@regenerate: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Regenerate Error: ' . $e->getMessage());
        }

        return redirect()->back()->with('success', 'API key regenerated successfully.')
            ->with('new_key', $plainKey);
    }

    public function toggle($id)
    {
        try {
            $apiKey = DB::table('api_keys')
                ->where('id', $id)
                ->where('user_id', auth()->id())
                ->first(['id', 'is_active']);

            if (!$apiKey) {
                return redirect()->back()->with('error', 'API key not found.');
            }

            $newStatus = $apiKey->is_active ? 0 : 1;

            DB::table('api_keys')
                ->where('id', $id)
                ->update([
                    'is_active'  => $newStatus,
                    'updated_at' => now()->format('Y-m-d H:i:s'),
                ]);

            $status = $newStatus ? 'enabled' : 'disabled';

            return redirect()->back()->with('success', "API key {$status} successfully.");
        } catch (\Throwable $e) {
            Log::error('ApiKeyController@toggle failed: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Toggle Error: ' . $e->getMessage());
        }
    }

    public function reveal($id)
    {
        try {
            if (!$this->hasEncryptedColumn()) {
                return response()->json([
                    'key' => null,
                    'message' => 'Key viewing not supported. Regenerate to enable.',
                ], 404);
            }

            $apiKey = DB::table('api_keys')
                ->where('id', $id)
                ->where('user_id', auth()->id())
                ->first(['id', 'key_encrypted']);

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

            $key = Crypt::decryptString($encryptedKey);
            return response()->json(['key' => $key]);
        } catch (\Throwable $e) {
            Log::error('ApiKeyController@reveal failed: ' . $e->getMessage());
            return response()->json([
                'key' => null,
                'message' => 'Key not available. Regenerate to enable viewing.',
            ], 404);
        }
    }
}
