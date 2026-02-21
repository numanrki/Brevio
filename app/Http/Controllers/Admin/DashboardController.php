<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Report;
use App\Models\Url;
use App\Models\User;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'total_links' => Url::count(),
                'total_clicks' => Url::sum('total_clicks'),
                'total_users' => User::count(),
                'total_revenue' => Payment::where('status', 'completed')->sum('amount'),
            ],
            'recent_links' => Url::with('user')->latest()->take(10)->get(),
            'recent_users' => User::latest()->take(10)->get(),
            'pending_reports' => Report::where('status', 'pending')->count(),
        ]);
    }
}
