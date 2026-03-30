<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ApiKey;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ApiKeyController extends Controller
{
    public const AVAILABLE_SCOPES = [
        'links:read'      => 'View links',
        'links:write'     => 'Create, update, delete links',
        'qr:read'         => 'View QR codes',
        'qr:write'        => 'Create, update, delete QR codes',
        'deep-links:read' => 'View deep links',
        'deep-links:write'=> 'Create, update, delete deep links',
        'account:read'    => 'View account info',
    ];

    public function index()
    {
        $keys = auth()->user()->apiKeys()
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (ApiKey $key) => [
                'id'           => $key->id,
                'name'         => $key->name,
                'key_prefix'   => $key->key_prefix,
                'scopes'       => $key->scopes,
                'last_used_at' => $key->last_used_at?->diffForHumans(),
                'created_at'   => $key->created_at->format('M d, Y'),
            ]);

        return Inertia::render('Admin/ApiKeys/Index', [
            'apiKeys'         => $keys,
            'availableScopes' => self::AVAILABLE_SCOPES,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'   => 'required|string|max:100',
            'scopes' => 'required|array|min:1',
            'scopes.*' => 'string|in:' . implode(',', array_keys(self::AVAILABLE_SCOPES)),
        ]);

        $plainKey = 'brev_' . Str::random(48);

        $apiKey = auth()->user()->apiKeys()->create([
            'name'       => $validated['name'],
            'key'        => hash('sha256', $plainKey),
            'key_prefix' => substr($plainKey, 0, 12),
            'scopes'     => $validated['scopes'],
        ]);

        return redirect()->back()->with('success', 'API key created successfully.')
            ->with('new_key', $plainKey);
    }

    public function destroy(ApiKey $apiKey)
    {
        if ($apiKey->user_id !== auth()->id()) {
            abort(403);
        }

        $apiKey->delete();

        return redirect()->back()->with('success', 'API key revoked successfully.');
    }

    public function regenerate(ApiKey $apiKey)
    {
        if ($apiKey->user_id !== auth()->id()) {
            abort(403);
        }

        $plainKey = 'brev_' . Str::random(48);

        $apiKey->update([
            'key'        => hash('sha256', $plainKey),
            'key_prefix' => substr($plainKey, 0, 12),
        ]);

        return redirect()->back()->with('success', 'API key regenerated successfully.')
            ->with('new_key', $plainKey);
    }
}
