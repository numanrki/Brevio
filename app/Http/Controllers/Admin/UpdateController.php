<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;

class UpdateController extends Controller
{
    /**
     * GitHub repository owner/name.
     */
    private const GITHUB_REPO = 'numanrki/Brevio';

    /**
     * GitHub API base URL.
     */
    private const GITHUB_API = 'https://api.github.com';

    /**
     * Show the update management page.
     */
    public function index()
    {
        return Inertia::render('Admin/Updates/Index', [
            'currentVersion'    => config('app.version'),
            'lastCheck'         => $this->getLastCheckTime(),
            'pendingMigrations' => $this->getPendingMigrationCount(),
        ]);
    }

    /**
     * Check for stable updates (GitHub Tags — always gets the latest pushed tag).
     */
    public function checkStable()
    {
        try {
            // Always use tags API — this catches both Releases and plain tags
            $tagsResponse = Http::withHeaders($this->githubHeaders())
                ->timeout(15)
                ->get(self::GITHUB_API . '/repos/' . self::GITHUB_REPO . '/tags', [
                    'per_page' => 20,
                ]);

            if ($tagsResponse->failed()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to check for updates. GitHub API returned status ' . $tagsResponse->status(),
                ], 422);
            }

            $tags = collect($tagsResponse->json())
                ->map(fn($t) => [
                    'name'    => $t['name'],
                    'version' => ltrim($t['name'], 'vV'),
                    'sha'     => $t['commit']['sha'] ?? '',
                    'zipball' => $t['zipball_url'] ?? '',
                ])
                ->filter(fn($t) => preg_match('/^\d+\.\d+\.\d+$/', $t['version']))
                ->sortBy(fn($t) => version_compare($t['version'], '0.0.0'))
                ->reverse()
                ->values();

            $latest = $tags->first();
            $currentVersion = config('app.version');
            $this->saveLastCheckTime();

            if (!$latest) {
                return response()->json([
                    'success'         => true,
                    'current_version' => $currentVersion,
                    'has_update'      => false,
                    'release'         => null,
                ]);
            }

            // Try to get release notes from the GitHub Release (if one exists)
            $releaseBody = '';
            $publishedAt = null;
            try {
                $releaseResponse = Http::withHeaders($this->githubHeaders())
                    ->timeout(10)
                    ->get(self::GITHUB_API . '/repos/' . self::GITHUB_REPO . '/releases/tags/' . $latest['name']);
                if ($releaseResponse->successful()) {
                    $releaseData = $releaseResponse->json();
                    $releaseBody = $releaseData['body'] ?? '';
                    $publishedAt = $releaseData['published_at'] ?? null;
                }
            } catch (\Throwable) {}

            return response()->json([
                'success'         => true,
                'current_version' => $currentVersion,
                'latest_version'  => $latest['version'],
                'has_update'      => version_compare($latest['version'], $currentVersion, '>'),
                'release'         => [
                    'version'      => $latest['version'],
                    'name'         => $latest['name'],
                    'body'         => $releaseBody,
                    'published_at' => $publishedAt,
                    'html_url'     => 'https://github.com/' . self::GITHUB_REPO . '/releases/tag/' . $latest['name'],
                    'zipball_url'  => $latest['zipball'],
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Update check failed: ' . $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Fetch recent commits for beta channel.
     */
    public function checkBeta()
    {
        try {
            $response = Http::withHeaders($this->githubHeaders())
                ->timeout(15)
                ->get(self::GITHUB_API . '/repos/' . self::GITHUB_REPO . '/commits', [
                    'per_page' => 20,
                    'sha'      => 'main',
                ]);

            if ($response->failed()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to fetch commits. GitHub API returned status ' . $response->status(),
                ], 422);
            }

            $commits = collect($response->json())->map(fn($c) => [
                'sha'        => $c['sha'],
                'short_sha'  => substr($c['sha'], 0, 7),
                'message'    => $c['commit']['message'] ?? '',
                'author'     => $c['commit']['author']['name'] ?? 'Unknown',
                'date'       => $c['commit']['author']['date'] ?? null,
                'html_url'   => $c['html_url'] ?? '',
            ]);

            // Resolve the commit SHA for the current installed version tag
            $currentVersionSha = $this->getTagCommitSha(config('app.version'));

            return response()->json([
                'success'              => true,
                'current_version'      => config('app.version'),
                'commits'              => $commits,
                'last_installed_sha'   => $this->getLastBetaSha(),
                'current_version_sha'  => $currentVersionSha,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch beta updates: ' . $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Install a stable release by version tag.
     */
    public function installStable(Request $request)
    {
        $request->validate([
            'version' => 'required|string|max:20',
            'zipball_url' => 'nullable|url|max:500',
        ]);

        $version = $request->input('version');

        // Use the zipball_url from the API response if provided, otherwise construct it
        $zipUrl = $request->input('zipball_url');
        if (!$zipUrl) {
            // Try without v prefix first (our tags don't use v), then with v
            $zipUrl = self::GITHUB_API . '/repos/' . self::GITHUB_REPO . '/zipball/' . $version;
        }

        $result = $this->performUpdate($zipUrl, 'stable', $version);

        // Sync beta SHA so beta channel also shows up to date
        $data = json_decode($result->getContent(), true);
        if (!empty($data['success'])) {
            $tagSha = $this->getTagCommitSha($version);
            if ($tagSha) {
                file_put_contents(storage_path('app/last_beta_sha'), $tagSha);
            }
        }

        return $result;
    }

    /**
     * Install a beta commit by SHA.
     */
    public function installBeta(Request $request)
    {
        $request->validate([
            'sha' => 'required|string|size:40',
        ]);

        $sha = $request->input('sha');
        $zipUrl = self::GITHUB_API . '/repos/' . self::GITHUB_REPO . '/zipball/' . $sha;

        $result = $this->performUpdate($zipUrl, 'beta', substr($sha, 0, 7));

        // Save installed SHA on success
        $data = json_decode($result->getContent(), true);
        if (!empty($data['success'])) {
            file_put_contents(storage_path('app/last_beta_sha'), $sha);
        }

        return $result;
    }

    /**
     * Download, extract, and apply an update from GitHub.
     */
    private function performUpdate(string $zipUrl, string $channel, string $label): \Illuminate\Http\JsonResponse
    {
        $steps = [];

        try {
            // Step 1: Download
            $steps[] = ['step' => 'download', 'status' => 'running'];

            $response = Http::withHeaders($this->githubHeaders())
                ->timeout(120)
                ->withOptions(['sink' => storage_path('app/update.zip')])
                ->get($zipUrl);

            if ($response->failed()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to download update package.',
                    'step'    => 'download',
                ], 422);
            }

            $steps[0]['status'] = 'done';

            // Step 2: Extract
            $steps[] = ['step' => 'extract', 'status' => 'running'];

            $extractPath = storage_path('app/update-temp');
            if (File::isDirectory($extractPath)) {
                File::deleteDirectory($extractPath);
            }
            File::makeDirectory($extractPath, 0755, true);

            $zip = new \ZipArchive();
            if ($zip->open(storage_path('app/update.zip')) !== true) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to open update package.',
                    'step'    => 'extract',
                ], 422);
            }

            $zip->extractTo($extractPath);
            $zip->close();

            // GitHub zipballs have a root folder like "owner-repo-sha/"
            $extractedDirs = File::directories($extractPath);
            $sourceDir = $extractedDirs[0] ?? $extractPath;

            $steps[1]['status'] = 'done';

            // Step 3: Apply files
            $steps[] = ['step' => 'apply', 'status' => 'running'];

            $this->applyFiles($sourceDir, base_path());

            // Reset OPcache so PHP serves the new files
            if (function_exists('opcache_reset')) {
                opcache_reset();
            }

            $steps[2]['status'] = 'done';

            // Step 4: Install dependencies
            $steps[] = ['step' => 'composer', 'status' => 'running'];

            $composerOutput = $this->runComposerInstall();

            $steps[3]['status'] = 'done';

            // Step 5: Run migrations
            $steps[] = ['step' => 'migrate', 'status' => 'running'];

            $migrateOutput = '';
            try {
                Artisan::call('migrate', ['--force' => true]);
                $migrateOutput = trim(Artisan::output());
            } catch (\Throwable $e) {
                $migrateOutput = 'Migration warning: ' . $e->getMessage();
            }

            $steps[4]['status'] = 'done';

            // Step 6: Clear caches
            $steps[] = ['step' => 'cache', 'status' => 'running'];

            try {
                Artisan::call('config:clear');
                Artisan::call('cache:clear');
                Artisan::call('view:clear');
                Artisan::call('route:clear');
            } catch (\Throwable $e) {
                // Cache clearing is non-critical
            }

            $steps[5]['status'] = 'done';

            // Cleanup
            File::delete(storage_path('app/update.zip'));
            File::deleteDirectory($extractPath);

            // Read the new version from the freshly applied config
            $newConfig = @include base_path('config/app.php');
            $newVersion = $newConfig['version'] ?? $label;

            return response()->json([
                'success'     => true,
                'message'     => "Update to {$label} ({$channel}) installed successfully!",
                'new_version' => $newVersion,
                'steps'       => $steps,
                'migrate'     => $migrateOutput,
            ]);
        } catch (\Throwable $e) {
            // Cleanup on failure
            File::delete(storage_path('app/update.zip'));
            if (File::isDirectory(storage_path('app/update-temp'))) {
                File::deleteDirectory(storage_path('app/update-temp'));
            }

            return response()->json([
                'success' => false,
                'message' => 'Update failed: ' . $e->getMessage(),
                'steps'   => $steps,
            ], 422);
        }
    }

    /**
     * Run composer install to ensure all dependencies are available.
     */
    private function runComposerInstall(): string
    {
        // Since vendor/ is bundled in the repo and copied during updates,
        // composer install is only needed if exec() is available.
        if (!function_exists('exec') || !is_callable('exec')) {
            return 'Skipped — vendor dependencies were included in the update package.';
        }

        $composerPaths = [
            base_path('composer.phar'),
            '/usr/local/bin/composer',
            '/usr/bin/composer',
            'composer',
        ];

        // On Windows, also check common locations
        if (PHP_OS_FAMILY === 'Windows') {
            $phpDir = dirname(PHP_BINARY);
            array_unshift($composerPaths, $phpDir . DIRECTORY_SEPARATOR . 'composer.phar');
        }

        $composerBin = null;
        foreach ($composerPaths as $path) {
            if (str_ends_with($path, '.phar')) {
                if (file_exists($path)) {
                    $composerBin = PHP_BINARY . ' ' . escapeshellarg($path);
                    break;
                }
            } else {
                // Check if the command is available
                $which = PHP_OS_FAMILY === 'Windows' ? 'where' : 'which';
                \exec("{$which} {$path} 2>&1", $output, $code);
                if ($code === 0) {
                    $composerBin = escapeshellarg($path);
                    break;
                }
            }
        }

        if (!$composerBin) {
            return 'Composer not found — run "composer install" manually on the server.';
        }

        $cmd = "cd " . escapeshellarg(base_path()) . " && {$composerBin} install --no-dev --optimize-autoloader --no-interaction 2>&1";
        \exec($cmd, $output, $exitCode);

        return implode("\n", $output);
    }

    /**
     * Recursively copy files from source to destination, skipping protected paths.
     */
    private function applyFiles(string $source, string $destination): void
    {
        $protectedPaths = [
            '.env',
            'storage/installed.lock',
            'storage/logs',
            'storage/framework/sessions',
            'storage/framework/cache',
            'storage/app/update.zip',
            'storage/app/update-temp',
            'node_modules',
            '.git',
        ];

        $files = File::allFiles($source);

        foreach ($files as $file) {
            $relativePath = $file->getRelativePathname();

            // Skip protected paths
            $skip = false;
            foreach ($protectedPaths as $protected) {
                if (str_starts_with($relativePath, $protected)) {
                    $skip = true;
                    break;
                }
            }
            if ($skip) continue;

            $destPath = $destination . DIRECTORY_SEPARATOR . $relativePath;
            $destDir = dirname($destPath);

            if (!File::isDirectory($destDir)) {
                File::makeDirectory($destDir, 0755, true);
            }

            File::copy($file->getRealPath(), $destPath);
        }
    }

    /**
     * Build GitHub API headers (uses token if configured).
     */
    private function githubHeaders(): array
    {
        $headers = [
            'Accept'     => 'application/vnd.github.v3+json',
            'User-Agent' => 'Brevio-Updater/' . config('app.version'),
        ];

        $token = config('services.github.token');
        if ($token) {
            $headers['Authorization'] = 'Bearer ' . $token;
        }

        return $headers;
    }

    /**
     * Save the last update check timestamp.
     */
    private function saveLastCheckTime(): void
    {
        file_put_contents(storage_path('app/last_update_check'), now()->toIso8601String());
    }

    /**
     * Get the last update check timestamp.
     */
    private function getLastCheckTime(): ?string
    {
        $file = storage_path('app/last_update_check');
        return file_exists($file) ? trim(file_get_contents($file)) : null;
    }

    /**
     * Get the last installed beta commit SHA.
     */
    private function getLastBetaSha(): ?string
    {
        $file = storage_path('app/last_beta_sha');
        return file_exists($file) ? trim(file_get_contents($file)) : null;
    }

    /**
     * Get the commit SHA for a given version tag from GitHub.
     */
    private function getTagCommitSha(string $version): ?string
    {
        try {
            // Try tag without v prefix first, then with v
            foreach ([$version, 'v' . $version] as $tag) {
                $response = Http::withHeaders($this->githubHeaders())
                    ->timeout(10)
                    ->get(self::GITHUB_API . '/repos/' . self::GITHUB_REPO . '/git/ref/tags/' . $tag);

                if ($response->successful()) {
                    $data = $response->json();
                    $sha = $data['object']['sha'] ?? null;

                    // If it's an annotated tag, resolve to the commit
                    if (($data['object']['type'] ?? '') === 'tag' && $sha) {
                        $tagResponse = Http::withHeaders($this->githubHeaders())
                            ->timeout(10)
                            ->get(self::GITHUB_API . '/repos/' . self::GITHUB_REPO . '/git/tags/' . $sha);
                        if ($tagResponse->successful()) {
                            $sha = $tagResponse->json()['object']['sha'] ?? $sha;
                        }
                    }

                    return $sha;
                }
            }
        } catch (\Throwable) {
            // Silently fail — tag lookup is best-effort
        }

        return null;
    }

    /**
     * Get the count of pending (not yet run) migrations.
     */
    private function getPendingMigrationCount(): int
    {
        try {
            $ran = DB::table('migrations')->pluck('migration')->all();
            $files = collect(File::files(database_path('migrations')))
                ->map(fn($f) => pathinfo($f->getFilename(), PATHINFO_FILENAME))
                ->all();

            return count(array_diff($files, $ran));
        } catch (\Throwable) {
            return 0;
        }
    }

    /**
     * Run pending database migrations only (no file update).
     */
    public function runMigrations()
    {
        try {
            Artisan::call('migrate', ['--force' => true]);
            $output = trim(Artisan::output());

            Artisan::call('config:clear');
            Artisan::call('cache:clear');

            return response()->json([
                'success'            => true,
                'message'            => 'Migrations completed successfully.',
                'output'             => $output,
                'pending_migrations' => $this->getPendingMigrationCount(),
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Migration failed: ' . $e->getMessage(),
            ], 422);
        }
    }
}
