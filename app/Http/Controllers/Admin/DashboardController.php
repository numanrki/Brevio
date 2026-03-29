<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Bio;
use App\Models\QrCode;
use App\Models\Report;
use App\Models\Url;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'total_links' => Url::count(),
                'total_clicks' => Url::sum('total_clicks'),
                'total_bio_pages' => Bio::count(),
                'total_qr_codes' => QrCode::count(),
            ],
            'recent_links' => Url::latest()->take(10)->get(),
            'pending_reports' => Report::where('status', 'pending')->count(),
        ]);
    }
}
