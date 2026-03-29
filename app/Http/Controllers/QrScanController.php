<?php

namespace App\Http\Controllers;

use App\Models\QrCode;
use App\Services\VisitorTracker;
use Illuminate\Http\Request;

class QrScanController extends Controller
{
    public function handle(Request $request, int $id)
    {
        $qrCode = QrCode::findOrFail($id);

        // Track the scan
        VisitorTracker::track(
            QrCode::class,
            $qrCode->id,
            'qr_scan',
            $request
        );

        // Increment the scans counter
        $qrCode->increment('scans');

        // Redirect to the QR code content URL
        $content = $qrCode->data['content'] ?? null;

        if ($content && filter_var($content, FILTER_VALIDATE_URL)) {
            return redirect()->away($content);
        }

        // If no valid URL content, redirect to home
        return redirect('/');
    }
}
