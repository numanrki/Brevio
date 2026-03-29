<?php

namespace App\Services;

use App\Models\Click;
use App\Models\Visit;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class AnalyticsService
{
    public function parseDateRange(string $range): array
    {
        $to = now();

        return match ($range) {
            'today'  => [now()->startOfDay(), $to],
            '7d'     => [now()->subDays(7)->startOfDay(), $to],
            '15d'    => [now()->subDays(15)->startOfDay(), $to],
            '30d'    => [now()->subDays(30)->startOfDay(), $to],
            '3m'     => [now()->subMonths(3)->startOfDay(), $to],
            '12m'    => [now()->subYear()->startOfDay(), $to],
            default  => [now()->subDays(30)->startOfDay(), $to],
        };
    }

    public function getSummary(int $urlId, Carbon $from, Carbon $to): array
    {
        $key = "analytics:summary:{$urlId}:{$from->timestamp}:{$to->timestamp}";

        return Cache::remember($key, 300, function () use ($urlId, $from, $to) {
            $query = Click::where('url_id', $urlId)
                ->whereBetween('created_at', [$from, $to]);

            $totalClicks = (clone $query)->count();
            $uniqueClicks = (clone $query)->where('is_unique', true)->count();
            $days = max($from->diffInDays($to), 1);
            $avgDaily = round($totalClicks / $days, 1);

            return [
                'total_clicks' => $totalClicks,
                'unique_clicks' => $uniqueClicks,
                'avg_daily' => $avgDaily,
            ];
        });
    }

    public function getClicksOverTime(int $urlId, Carbon $from, Carbon $to): Collection
    {
        $key = "analytics:clicks_over_time:{$urlId}:{$from->timestamp}:{$to->timestamp}";

        return Cache::remember($key, 300, function () use ($urlId, $from, $to) {
            return Click::where('url_id', $urlId)
                ->whereBetween('created_at', [$from, $to])
                ->select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as count'))
                ->groupBy('date')
                ->orderBy('date')
                ->get();
        });
    }

    public function getTopCountries(int $urlId, Carbon $from, Carbon $to, int $limit = 10): Collection
    {
        $key = "analytics:countries:{$urlId}:{$from->timestamp}:{$to->timestamp}";

        return Cache::remember($key, 300, function () use ($urlId, $from, $to, $limit) {
            return Click::where('url_id', $urlId)
                ->whereBetween('created_at', [$from, $to])
                ->whereNotNull('country')
                ->where('country', '!=', '')
                ->select('country as name', DB::raw('COUNT(*) as count'))
                ->groupBy('country')
                ->orderByDesc('count')
                ->take($limit)
                ->get();
        });
    }

    public function getTopCities(int $urlId, Carbon $from, Carbon $to, int $limit = 10): Collection
    {
        $key = "analytics:cities:{$urlId}:{$from->timestamp}:{$to->timestamp}";

        return Cache::remember($key, 300, function () use ($urlId, $from, $to, $limit) {
            return Click::where('url_id', $urlId)
                ->whereBetween('created_at', [$from, $to])
                ->whereNotNull('city')
                ->where('city', '!=', '')
                ->select('city as name', DB::raw('COUNT(*) as count'))
                ->groupBy('city')
                ->orderByDesc('count')
                ->take($limit)
                ->get();
        });
    }

    public function getTopReferrers(int $urlId, Carbon $from, Carbon $to, int $limit = 10): Collection
    {
        $key = "analytics:referrers:{$urlId}:{$from->timestamp}:{$to->timestamp}";

        return Cache::remember($key, 300, function () use ($urlId, $from, $to, $limit) {
            return Click::where('url_id', $urlId)
                ->whereBetween('created_at', [$from, $to])
                ->whereNotNull('referrer')
                ->where('referrer', '!=', '')
                ->select('referrer as name', DB::raw('COUNT(*) as count'))
                ->groupBy('referrer')
                ->orderByDesc('count')
                ->take($limit)
                ->get();
        });
    }

    public function getTopBrowsers(int $urlId, Carbon $from, Carbon $to, int $limit = 10): Collection
    {
        $key = "analytics:browsers:{$urlId}:{$from->timestamp}:{$to->timestamp}";

        return Cache::remember($key, 300, function () use ($urlId, $from, $to, $limit) {
            return Click::where('url_id', $urlId)
                ->whereBetween('created_at', [$from, $to])
                ->whereNotNull('browser')
                ->select('browser as name', DB::raw('COUNT(*) as count'))
                ->groupBy('browser')
                ->orderByDesc('count')
                ->take($limit)
                ->get();
        });
    }

    public function getTopOS(int $urlId, Carbon $from, Carbon $to, int $limit = 10): Collection
    {
        $key = "analytics:os:{$urlId}:{$from->timestamp}:{$to->timestamp}";

        return Cache::remember($key, 300, function () use ($urlId, $from, $to, $limit) {
            return Click::where('url_id', $urlId)
                ->whereBetween('created_at', [$from, $to])
                ->whereNotNull('os')
                ->select('os as name', DB::raw('COUNT(*) as count'))
                ->groupBy('os')
                ->orderByDesc('count')
                ->take($limit)
                ->get();
        });
    }

    public function getDeviceBreakdown(int $urlId, Carbon $from, Carbon $to): Collection
    {
        $key = "analytics:devices:{$urlId}:{$from->timestamp}:{$to->timestamp}";

        return Cache::remember($key, 300, function () use ($urlId, $from, $to) {
            return Click::where('url_id', $urlId)
                ->whereBetween('created_at', [$from, $to])
                ->whereNotNull('device')
                ->select('device as name', DB::raw('COUNT(*) as count'))
                ->groupBy('device')
                ->orderByDesc('count')
                ->get();
        });
    }

    public function getTopLanguages(int $urlId, Carbon $from, Carbon $to, int $limit = 10): Collection
    {
        $key = "analytics:languages:{$urlId}:{$from->timestamp}:{$to->timestamp}";

        return Cache::remember($key, 300, function () use ($urlId, $from, $to, $limit) {
            return Click::where('url_id', $urlId)
                ->whereBetween('created_at', [$from, $to])
                ->whereNotNull('language')
                ->where('language', '!=', '')
                ->select('language as name', DB::raw('COUNT(*) as count'))
                ->groupBy('language')
                ->orderByDesc('count')
                ->take($limit)
                ->get();
        });
    }

    // ── Global analytics (across all user links) ──

    public function getGlobalSummary(array $urlIds, Carbon $from, Carbon $to): array
    {
        $key = 'analytics:global:summary:' . md5(implode(',', $urlIds)) . ":{$from->timestamp}:{$to->timestamp}";

        return Cache::remember($key, 300, function () use ($urlIds, $from, $to) {
            $query = Click::whereIn('url_id', $urlIds)
                ->whereBetween('created_at', [$from, $to]);

            $totalClicks = (clone $query)->count();
            $uniqueClicks = (clone $query)->where('is_unique', true)->count();
            $days = max($from->diffInDays($to), 1);

            return [
                'total_clicks' => $totalClicks,
                'unique_clicks' => $uniqueClicks,
                'avg_daily' => round($totalClicks / $days, 1),
            ];
        });
    }

    public function getGlobalClicksOverTime(array $urlIds, Carbon $from, Carbon $to): Collection
    {
        $key = 'analytics:global:clicks_over_time:' . md5(implode(',', $urlIds)) . ":{$from->timestamp}:{$to->timestamp}";

        return Cache::remember($key, 300, function () use ($urlIds, $from, $to) {
            return Click::whereIn('url_id', $urlIds)
                ->whereBetween('created_at', [$from, $to])
                ->select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as count'))
                ->groupBy('date')
                ->orderBy('date')
                ->get();
        });
    }

    public function getGlobalTopItems(array $urlIds, Carbon $from, Carbon $to, string $column, int $limit = 10): Collection
    {
        $key = "analytics:global:{$column}:" . md5(implode(',', $urlIds)) . ":{$from->timestamp}:{$to->timestamp}";

        return Cache::remember($key, 300, function () use ($urlIds, $from, $to, $column, $limit) {
            return Click::whereIn('url_id', $urlIds)
                ->whereBetween('created_at', [$from, $to])
                ->whereNotNull($column)
                ->where($column, '!=', '')
                ->select("{$column} as name", DB::raw('COUNT(*) as count'))
                ->groupBy($column)
                ->orderByDesc('count')
                ->take($limit)
                ->get();
        });
    }

    // ── Visit-based analytics (Bio pages, QR scans) ──

    public function getVisitSummary(string $visitableType, int $visitableId, ?string $eventType, Carbon $from, Carbon $to): array
    {
        $q = Visit::where('visitable_type', $visitableType)
            ->where('visitable_id', $visitableId)
            ->whereBetween('created_at', [$from, $to]);

        if ($eventType) {
            $q->where('event_type', $eventType);
        }

        $total = (clone $q)->count();
        $unique = (clone $q)->where('is_unique', true)->count();
        $days = max($from->diffInDays($to), 1);

        return [
            'total_clicks' => $total,
            'unique_clicks' => $unique,
            'avg_daily' => round($total / $days, 1),
        ];
    }

    public function getVisitsOverTime(string $visitableType, int $visitableId, ?string $eventType, Carbon $from, Carbon $to): Collection
    {
        $q = Visit::where('visitable_type', $visitableType)
            ->where('visitable_id', $visitableId)
            ->whereBetween('created_at', [$from, $to]);

        if ($eventType) {
            $q->where('event_type', $eventType);
        }

        return $q->select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as count'))
            ->groupBy('date')
            ->orderBy('date')
            ->get();
    }

    public function getVisitTopItems(string $visitableType, int $visitableId, ?string $eventType, Carbon $from, Carbon $to, string $column, int $limit = 10): Collection
    {
        $q = Visit::where('visitable_type', $visitableType)
            ->where('visitable_id', $visitableId)
            ->whereBetween('created_at', [$from, $to])
            ->whereNotNull($column)
            ->where($column, '!=', '');

        if ($eventType) {
            $q->where('event_type', $eventType);
        }

        return $q->select("{$column} as name", DB::raw('COUNT(*) as count'))
            ->groupBy($column)
            ->orderByDesc('count')
            ->take($limit)
            ->get();
    }

    public function getVisitorLog(string $visitableType, int $visitableId, ?string $eventType, Carbon $from, Carbon $to, int $limit = 100): Collection
    {
        $q = Visit::where('visitable_type', $visitableType)
            ->where('visitable_id', $visitableId)
            ->whereBetween('created_at', [$from, $to]);

        if ($eventType) {
            $q->where('event_type', $eventType);
        }

        return $q->select('ip', 'country', 'city', 'browser', 'os', 'device', 'referrer', 'event_type', 'meta', 'created_at')
            ->orderByDesc('created_at')
            ->take($limit)
            ->get();
    }

    public function getClickVisitorLog(int $urlId, Carbon $from, Carbon $to, int $limit = 100): Collection
    {
        return Click::where('url_id', $urlId)
            ->whereBetween('created_at', [$from, $to])
            ->select('ip', 'country', 'city', 'browser', 'os', 'device', 'referrer', 'language', 'created_at')
            ->orderByDesc('created_at')
            ->take($limit)
            ->get();
    }

    public function getBioLinkClicks(int $bioId, Carbon $from, Carbon $to): Collection
    {
        return Visit::where('visitable_type', \App\Models\Bio::class)
            ->where('visitable_id', $bioId)
            ->where('event_type', 'link_click')
            ->whereBetween('created_at', [$from, $to])
            ->get()
            ->map(function ($v) {
                $meta = $v->meta ?? [];
                return [
                    'url' => $meta['url'] ?? '',
                    'widget_id' => $meta['widget_id'] ?? null,
                    'created_at' => $v->created_at,
                ];
            });
    }

    // ── Global visit-based analytics (all bios / all QR codes) ──

    public function getGlobalVisitSummary(string $visitableType, ?string $eventType, Carbon $from, Carbon $to): array
    {
        $q = Visit::where('visitable_type', $visitableType)
            ->whereBetween('created_at', [$from, $to]);

        if ($eventType) {
            $q->where('event_type', $eventType);
        }

        $total = (clone $q)->count();
        $unique = (clone $q)->where('is_unique', true)->count();
        $days = max($from->diffInDays($to), 1);

        return [
            'total_clicks' => $total,
            'unique_clicks' => $unique,
            'avg_daily' => round($total / $days, 1),
        ];
    }

    public function getGlobalVisitsOverTime(string $visitableType, ?string $eventType, Carbon $from, Carbon $to): Collection
    {
        $q = Visit::where('visitable_type', $visitableType)
            ->whereBetween('created_at', [$from, $to]);

        if ($eventType) {
            $q->where('event_type', $eventType);
        }

        return $q->select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as count'))
            ->groupBy('date')
            ->orderBy('date')
            ->get();
    }

    // ── Referrer-to-platform mapping ──

    public static function normalizeReferrer(string $referrer): string
    {
        $map = [
            'instagram.com' => 'Instagram',
            'l.instagram.com' => 'Instagram',
            'facebook.com' => 'Facebook',
            'l.facebook.com' => 'Facebook',
            'lm.facebook.com' => 'Facebook',
            'm.facebook.com' => 'Facebook',
            'fb.com' => 'Facebook',
            'fb.me' => 'Facebook',
            't.co' => 'Twitter/X',
            'twitter.com' => 'Twitter/X',
            'x.com' => 'Twitter/X',
            'youtube.com' => 'YouTube',
            'm.youtube.com' => 'YouTube',
            'youtu.be' => 'YouTube',
            'tiktok.com' => 'TikTok',
            'vm.tiktok.com' => 'TikTok',
            'linkedin.com' => 'LinkedIn',
            'lnkd.in' => 'LinkedIn',
            'reddit.com' => 'Reddit',
            'old.reddit.com' => 'Reddit',
            'pinterest.com' => 'Pinterest',
            'pin.it' => 'Pinterest',
            'google.com' => 'Google',
            'google.co' => 'Google',
            'bing.com' => 'Bing',
            'duckduckgo.com' => 'DuckDuckGo',
            'yahoo.com' => 'Yahoo',
            'snapchat.com' => 'Snapchat',
            'whatsapp.com' => 'WhatsApp',
            'web.whatsapp.com' => 'WhatsApp',
            'telegram.org' => 'Telegram',
            't.me' => 'Telegram',
            'threads.net' => 'Threads',
            'discord.com' => 'Discord',
            'discord.gg' => 'Discord',
        ];

        try {
            $host = strtolower(parse_url($referrer, PHP_URL_HOST) ?? '');
            $host = preg_replace('/^www\./', '', $host);

            if (isset($map[$host])) {
                return $map[$host];
            }

            // Try partial matching for subdomains
            foreach ($map as $domain => $name) {
                if (str_ends_with($host, '.' . $domain)) {
                    return $name;
                }
            }

            return $host ?: $referrer;
        } catch (\Throwable) {
            return $referrer;
        }
    }

    /**
     * Get top referrers with friendly platform names for clicks.
     */
    public function getTopReferrersParsed(int $urlId, Carbon $from, Carbon $to, int $limit = 10): Collection
    {
        $raw = Click::where('url_id', $urlId)
            ->whereBetween('created_at', [$from, $to])
            ->whereNotNull('referrer')
            ->where('referrer', '!=', '')
            ->select('referrer', DB::raw('COUNT(*) as count'))
            ->groupBy('referrer')
            ->get();

        return $raw->groupBy(fn($item) => self::normalizeReferrer($item->referrer))
            ->map(fn($group, $name) => ['name' => $name, 'count' => $group->sum('count')])
            ->sortByDesc('count')
            ->take($limit)
            ->values();
    }

    /**
     * Get top referrers with friendly platform names for global clicks.
     */
    public function getGlobalTopReferrersParsed(array $urlIds, Carbon $from, Carbon $to, int $limit = 10): Collection
    {
        $raw = Click::whereIn('url_id', $urlIds)
            ->whereBetween('created_at', [$from, $to])
            ->whereNotNull('referrer')
            ->where('referrer', '!=', '')
            ->select('referrer', DB::raw('COUNT(*) as count'))
            ->groupBy('referrer')
            ->get();

        return $raw->groupBy(fn($item) => self::normalizeReferrer($item->referrer))
            ->map(fn($group, $name) => ['name' => $name, 'count' => $group->sum('count')])
            ->sortByDesc('count')
            ->take($limit)
            ->values();
    }

    /**
     * Get top referrers with friendly platform names for visits.
     */
    public function getVisitTopReferrersParsed(string $visitableType, int $visitableId, ?string $eventType, Carbon $from, Carbon $to, int $limit = 10): Collection
    {
        $q = Visit::where('visitable_type', $visitableType)
            ->where('visitable_id', $visitableId)
            ->whereBetween('created_at', [$from, $to])
            ->whereNotNull('referrer')
            ->where('referrer', '!=', '');

        if ($eventType) {
            $q->where('event_type', $eventType);
        }

        $raw = $q->select('referrer', DB::raw('COUNT(*) as count'))
            ->groupBy('referrer')
            ->get();

        return $raw->groupBy(fn($item) => self::normalizeReferrer($item->referrer))
            ->map(fn($group, $name) => ['name' => $name, 'count' => $group->sum('count')])
            ->sortByDesc('count')
            ->take($limit)
            ->values();
    }
}
