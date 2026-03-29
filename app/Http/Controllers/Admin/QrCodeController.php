<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\QrCode;
use Illuminate\Http\Request;
use Inertia\Inertia;

class QrCodeController extends Controller
{
    public function index()
    {
        $qrCodes = QrCode::with('url')
            ->latest()
            ->paginate(15);

        return Inertia::render('Admin/QrCodes/Index', [
            'qrCodes' => $qrCodes,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/QrCodes/Create', [
            'urls' => \App\Models\Url::all(['id', 'alias', 'url', 'title']),
        ]);
    }

    public function store(Request $request)
    {
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

        return redirect()->route('admin.qr-codes.show', $qrCode)->with('success', 'QR Code created successfully.');
    }

    public function show(QrCode $qrCode)
    {
        return Inertia::render('Admin/QrCodes/Show', [
            'qrCode' => $qrCode->load('url'),
            'scanUrl' => url('/qr/' . $qrCode->id),
        ]);
    }

    public function edit(QrCode $qrCode)
    {
        return Inertia::render('Admin/QrCodes/Edit', [
            'qrCode' => $qrCode,
            'urls' => \App\Models\Url::all(['id', 'alias', 'url', 'title']),
        ]);
    }

    public function update(Request $request, QrCode $qrCode)
    {
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

        return redirect()->route('admin.qr-codes.show', $qrCode)->with('success', 'QR Code updated successfully.');
    }

    public function destroy(QrCode $qrCode)
    {
        $qrCode->delete();

        return redirect()->route('admin.qr-codes.index')->with('success', 'QR Code deleted successfully.');
    }
}
