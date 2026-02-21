<?php

namespace App\Http\Controllers;

use App\Models\Bio;
use Inertia\Inertia;

class BioPageController extends Controller
{
    public function show(string $alias)
    {
        $bio = Bio::where('alias', $alias)
            ->where('is_active', true)
            ->with(['widgets' => fn($q) => $q->where('is_active', true)->orderBy('position')])
            ->firstOrFail();

        // Increment views
        $bio->increment('views');

        return Inertia::render('Bio/Show', [
            'bio' => $bio,
        ]);
    }
}
