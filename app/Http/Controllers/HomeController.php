<?php

namespace App\Http\Controllers;

use App\Models\Url;
use App\Models\User;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index()
    {
        return Inertia::render('Welcome', [
            'stats' => [
                'total_links' => Url::count(),
                'total_clicks' => Url::sum('total_clicks'),
                'total_users' => User::count(),
            ],
        ]);
    }
}
