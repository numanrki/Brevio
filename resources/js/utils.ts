/**
 * Prepend the application base path to a given path.
 * Reads the base path from the global Ziggy config so links
 * work correctly when the app is served from a subdirectory
 * (e.g. /welink/).
 */

declare global {
    const Ziggy: { url: string; [key: string]: any } | undefined;
}

let _basePath: string | null = null;

function getBasePath(): string {
    if (_basePath !== null) return _basePath;
    try {
        if (typeof Ziggy !== 'undefined' && Ziggy?.url) {
            _basePath = new URL(Ziggy.url).pathname.replace(/\/+$/, '');
            return _basePath;
        }
    } catch {}
    _basePath = '';
    return _basePath;
}

export function url(path: string): string {
    const base = getBasePath();
    if (!base) return path;
    if (path === '/') return base || '/';
    return base + path;
}
