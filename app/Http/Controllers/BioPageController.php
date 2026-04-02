<?php

namespace App\Http\Controllers;

use App\Models\Bio;
use App\Models\Setting;
use App\Services\VisitorTracker;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BioPageController extends Controller
{
    public function show(Request $request, string $alias)
    {
        $bio = Bio::where('alias', $alias)
            ->where('is_active', true)
            ->with(['widgets' => fn($q) => $q->where('is_active', true)->orderBy('position')])
            ->firstOrFail();

        // Increment views counter
        $bio->increment('views');

        // Track detailed visit
        VisitorTracker::track(Bio::class, $bio->id, 'page_view', $request);

        return Inertia::render('Bio/Show', [
            'bio' => $bio,
            'trackUrl' => url('/bio/' . $alias . '/track'),
            'noindex' => (bool) Setting::get('noindex_bio_pages'),
        ]);
    }

    public function track(Request $request, string $alias)
    {
        $bio = Bio::where('alias', $alias)->where('is_active', true)->firstOrFail();

        $widgetId = $request->input('widget_id');
        $clickedUrl = $request->input('url', '');

        VisitorTracker::track(Bio::class, $bio->id, 'link_click', $request, [
            'widget_id' => $widgetId,
            'url' => $clickedUrl,
        ]);

        return response()->json(['ok' => true]);
    }
}
