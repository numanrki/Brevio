<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
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
            'currentVersion' => config('app.version'),
            'lastCheck'      => $this->getLastCheckTime(),
        ]);
    }

    /**
     * Check for stable updates (GitHub Releases).
     */
    public function checkStable()
    {
        try {
            $response = Http::withHeaders($this->githubHeaders())
                ->timeout(15)
                ->get(self::GITHUB_API . '/repos/' . self::GITHUB_REPO . '/releases/latest');

            if ($response->failed()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to check for updates. GitHub API returned status ' . $response->status(),
                ], 422);
            }

            $release = $response->json();
            $latestVersion = ltrim($release['tag_name'] ?? '', 'vV');
            $currentVersion = config('app.version');

            $this->saveLastCheckTime();

            return response()->json([
                'success'         => true,
                'current_version' => $currentVersion,
                'latest_version'  => $latestVersion,
                'has_update'      => version_compare($latestVersion, $currentVersion, '>'),
                'release'         => [
                    'version'      => $latestVersion,
                    'name'         => $release['name'] ?? $latestVersion,
                    'body'         => $release['body'] ?? '',
                    'published_at' => $release['published_at'] ?? null,
                    'html_url'     => $release['html_url'] ?? '',
                    'zipball_url'  => $release['zipball_url'] ?? '',
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

            return response()->json([
                'success'         => true,
                'current_version' => config('app.version'),
                'commits'         => $commits,
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
        ]);

        $version = $request->input('version');
        $tag = 'v' . ltrim($version, 'vV');

        $zipUrl = self::GITHUB_API . '/repos/' . self::GITHUB_REPO . '/zipball/' . $tag;

        return $this->performUpdate($zipUrl, 'stable', $version);
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

        return $this->performUpdate($zipUrl, 'beta', substr($sha, 0, 7));
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

            $steps[2]['status'] = 'done';

            // Step 4: Run migrations
            $steps[] = ['step' => 'migrate', 'status' => 'running'];

            Artisan::call('migrate', ['--force' => true]);
            $migrateOutput = trim(Artisan::output());

            $steps[3]['status'] = 'done';

            // Step 5: Clear caches
            $steps[] = ['step' => 'cache', 'status' => 'running'];

            Artisan::call('config:clear');
            Artisan::call('cache:clear');
            Artisan::call('view:clear');
            Artisan::call('route:clear');

            $steps[4]['status'] = 'done';

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
            'vendor',
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
}
