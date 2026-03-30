<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ApiDocsController extends Controller
{
    private const SECTIONS = [
        'overview',
        'authentication',
        'links',
        'qr-codes',
        'deep-links',
        'errors',
    ];

    /**
     * Generate a time-limited token and redirect to the protected doc page.
     */
    public function gate(string $section)
    {
        if (!in_array($section, self::SECTIONS, true)) {
            abort(404);
        }

        $token = Str::random(64);
        Cache::put("api_doc_token:{$token}", [
            'user_id' => auth()->id(),
            'section' => $section,
        ], now()->addMinutes(30));

        return Inertia::render('Admin/ApiDocs/Show', [
            'section' => $section,
            'token'   => $token,
        ]);
    }

    /**
     * Verify doc access token (called via AJAX from the doc page).
     */
    public function verify(Request $request)
    {
        $token = $request->input('token');
        $data = Cache::get("api_doc_token:{$token}");

        if (!$data || $data['user_id'] !== auth()->id()) {
            return response()->json(['valid' => false], 403);
        }

        return response()->json(['valid' => true]);
    }
}
