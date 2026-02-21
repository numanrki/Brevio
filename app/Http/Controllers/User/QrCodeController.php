<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\QrCode;
use Illuminate\Http\Request;
use Inertia\Inertia;

class QrCodeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $qrCodes = auth()->user()->qrCodes()
            ->with('url')
            ->latest()
            ->paginate(15);

        return Inertia::render('Dashboard/QrCodes/Index', [
            'qrCodes' => $qrCodes,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Dashboard/QrCodes/Create', [
            'urls' => auth()->user()->urls()->get(['id', 'alias', 'url', 'title']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Decode JSON strings to arrays before validation
        foreach (['data', 'style'] as $field) {
            if (is_string($request->$field)) {
                $request->merge([$field => json_decode($request->$field, true) ?: []]);
            }
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'url_id' => 'nullable|exists:urls,id',
            'data' => 'required|array',
            'style' => 'nullable|array',
        ]);

        $validated['user_id'] = auth()->id();

        $qrCode = QrCode::create($validated);

        return redirect()->route('dashboard.qr-codes.show', $qrCode)->with('success', 'QR Code created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(QrCode $qrCode)
    {
        if ($qrCode->user_id !== auth()->id()) {
            abort(403);
        }

        return Inertia::render('Dashboard/QrCodes/Show', [
            'qrCode' => $qrCode->load('url'),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(QrCode $qrCode)
    {
        if ($qrCode->user_id !== auth()->id()) {
            abort(403);
        }

        return Inertia::render('Dashboard/QrCodes/Edit', [
            'qrCode' => $qrCode,
            'urls' => auth()->user()->urls()->get(['id', 'alias', 'url', 'title']),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, QrCode $qrCode)
    {
        if ($qrCode->user_id !== auth()->id()) {
            abort(403);
        }

        // Decode JSON strings to arrays before validation
        foreach (['data', 'style'] as $field) {
            if (is_string($request->$field)) {
                $request->merge([$field => json_decode($request->$field, true) ?: []]);
            }
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'url_id' => 'nullable|exists:urls,id',
            'data' => 'required|array',
            'style' => 'nullable|array',
        ]);

        $qrCode->update($validated);

        return redirect()->route('dashboard.qr-codes.show', $qrCode)->with('success', 'QR Code updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(QrCode $qrCode)
    {
        if ($qrCode->user_id !== auth()->id()) {
            abort(403);
        }

        $qrCode->delete();

        return redirect()->route('dashboard.qr-codes.index')->with('success', 'QR Code deleted successfully.');
    }
}
