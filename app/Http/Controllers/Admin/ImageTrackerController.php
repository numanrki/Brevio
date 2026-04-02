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

        // Store in public/content/tracked-images/ (same pattern as avatars, bio images)
        $destDir = public_path('content/tracked-images');
        if (!is_dir($destDir)) {
            mkdir($destDir, 0755, true);
        }
        $file->move($destDir, $filename);

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

        $trackingUrl = url("/t/{$imageTracker->token}");
        $previewUrl = asset('content/tracked-images/' . $imageTracker->filename);

        $recentViews = $imageTracker->views()
            ->latest('created_at')
            ->limit(20)
            ->get(['id', 'country', 'city', 'browser', 'os', 'device', 'is_unique', 'created_at']);

        return Inertia::render('Admin/Pixels/ImageTrackers/Show', [
            'tracker' => $imageTracker,
            'views_stats' => $viewsStats,
            'tracking_url' => $trackingUrl,
            'preview_url' => $previewUrl,
            'recent_views' => $recentViews,
        ]);
    }

    public function destroy(ImageTracker $imageTracker)
    {
        // Check both new and old storage locations
        $newPath = public_path('content/tracked-images/' . $imageTracker->filename);
        $oldPath = storage_path('app/public/tracked-images/' . $imageTracker->filename);
        if (file_exists($newPath)) {
            @unlink($newPath);
        } elseif (file_exists($oldPath)) {
            @unlink($oldPath);
        }

        $imageTracker->delete();

        return redirect()->route('admin.image-trackers.index')->with('success', 'Image tracker deleted.');
    }
}
