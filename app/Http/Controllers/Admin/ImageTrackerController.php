<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ImageTracker;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ImageTrackerController extends Controller
{
    public function index(Request $request)
    {
        $trackers = ImageTracker::query()
            ->withCount('views')
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Pixels/ImageTrackers/Index', [
            'trackers' => $trackers,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Pixels/ImageTrackers/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'image' => 'required|image|mimes:jpg,jpeg,png,gif,webp|max:10240',
        ]);

        $file = $request->file('image');
        $token = Str::random(32);
        $ext = $file->getClientOriginalExtension();
        $filename = $token . '.' . $ext;

        $file->storeAs('public/tracked-images', $filename);

        $tracker = ImageTracker::create([
            'user_id' => auth()->id(),
            'name' => $request->name,
            'filename' => $filename,
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'token' => $token,
        ]);

        return redirect()->route('admin.image-trackers.show', $tracker)->with('success', 'Image tracker created! Copy the URL below and share it.');
    }

    public function show(ImageTracker $imageTracker)
    {
        $imageTracker->loadCount('views');

        $viewsStats = $imageTracker->views()
            ->where('created_at', '>=', now()->subDays(30))
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $ext = pathinfo($imageTracker->filename, PATHINFO_EXTENSION);
        $trackingUrl = url("/img/{$imageTracker->token}.{$ext}");

        $recentViews = $imageTracker->views()
            ->latest('created_at')
            ->limit(20)
            ->get(['id', 'country', 'city', 'browser', 'os', 'device', 'is_unique', 'created_at']);

        return Inertia::render('Admin/Pixels/ImageTrackers/Show', [
            'tracker' => $imageTracker,
            'views_stats' => $viewsStats,
            'tracking_url' => $trackingUrl,
            'recent_views' => $recentViews,
        ]);
    }

    public function destroy(ImageTracker $imageTracker)
    {
        $path = storage_path('app/public/tracked-images/' . $imageTracker->filename);
        if (file_exists($path)) {
            @unlink($path);
        }

        $imageTracker->delete();

        return redirect()->route('admin.image-trackers.index')->with('success', 'Image tracker deleted.');
    }
}
