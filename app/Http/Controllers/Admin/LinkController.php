<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Url;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LinkController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $urls = Url::with('user')
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('alias', 'like', "%{$search}%")
                      ->orWhere('url', 'like', "%{$search}%");
                });
            })
            ->when($request->status, function ($query, $status) {
                match ($status) {
                    'active' => $query->where('is_active', true)->where('is_archived', false),
                    'archived' => $query->where('is_archived', true),
                    'expired' => $query->whereNotNull('expiry_date')->where('expiry_date', '<', now()),
                    default => null,
                };
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Links/Index', [
            'links' => $urls,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Url $link)
    {
        return Inertia::render('Admin/Links/Show', [
            'url' => $link->load('user', 'domain', 'campaign'),
            'recent_clicks' => $link->clicks()->latest()->take(50)->get(),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Url $link)
    {
        return Inertia::render('Admin/Links/Edit', [
            'url' => $link,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Url $link)
    {
        $validated = $request->validate([
            'url' => 'required|url',
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'is_archived' => 'boolean',
            'expiry_date' => 'nullable|date',
            'password' => 'nullable|string',
        ]);

        $link->update($validated);

        return redirect()->route('admin.links.index')->with('success', 'Link updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Url $link)
    {
        $link->delete();

        return redirect()->route('admin.links.index')->with('success', 'Link deleted successfully.');
    }
}
