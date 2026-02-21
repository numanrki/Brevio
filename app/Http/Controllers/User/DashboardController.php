<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        return Inertia::render('Dashboard', [
            'total_links' => $user->urls()->count(),
            'total_clicks' => $user->urls()->sum('total_clicks'),
            'recent_links' => $user->urls()->latest()->take(10)->get(),
            'plan' => $user->load('plan')->plan,
        ]);
    }
}
