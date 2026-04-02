<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LiveVisitor extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'session_id',
        'ip',
        'country',
        'city',
        'page',
        'browser',
        'os',
        'device',
        'last_seen_at',
    ];

    protected function casts(): array
    {
        return [
            'last_seen_at' => 'datetime',
        ];
    }

    /**
     * Clean up stale visitors (older than 5 minutes).
     */
    public static function cleanup(): int
    {
        return static::where('last_seen_at', '<', now()->subMinutes(5))->delete();
    }

    /**
     * Count currently active visitors.
     */
    public static function activeCount(): int
    {
        return static::where('last_seen_at', '>=', now()->subMinutes(5))->count();
    }

    /**
     * Get active visitors grouped by country.
     */
    public static function byCountry(): array
    {
        return static::where('last_seen_at', '>=', now()->subMinutes(5))
            ->whereNotNull('country')
            ->where('country', '!=', '')
            ->selectRaw('country, COUNT(*) as count')
            ->groupBy('country')
            ->orderByDesc('count')
            ->get()
            ->toArray();
    }
}
