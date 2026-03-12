---
name: brevio-bugfix
description: "Debug and fix bugs in Brevio. USE WHEN: fixing validation errors, 403/404/500 errors, blank pages, redirect issues, JSON field problems, route mismatches, or broken UI. Includes common patterns for Inertia + Laravel issues."
---

# Brevio Bug Fixing

## When to Use
- Fixing validation errors (especially JSON field issues)
- Resolving 403 Forbidden / 404 Not Found / 500 errors
- Fixing blank pages or rendering issues
- Correcting route name mismatches
- Fixing redirect loops or wrong redirects

## Common Bug Patterns

### 1. "field must be an array" Validation Error
**Cause**: Frontend sends JSON fields as strings, but Laravel validates them as arrays.
**Fix**: Add `json_decode()` in the controller before validation:
```php
$data = is_string($request->input('data'))
    ? json_decode($request->input('data'), true)
    : $request->input('data');
$request->merge(['data' => $data]);
```
**Affected fields**: `data`, `style`, `theme`, `content`, `settings`, `limits`, `features`

### 2. 403 Forbidden on Edit/Delete
**Cause**: Route model binding parameter name doesn't match the resource route convention.
**Fix**: Ensure controller method parameter matches the route:
- `Route::resource('links', LinkController::class)` → `public function edit(Url $link)`
- Check `php artisan route:list` for the actual parameter name

### 3. Blank Page / No Rendering
**Cause**: Inertia page component name doesn't match the controller's `Inertia::render()` path.
**Fix**: Verify the render path matches the file path under `resources/js/Pages/`:
```php
return Inertia::render('Dashboard/Links/Index', [...]);
// Must match: resources/js/Pages/Dashboard/Links/Index.tsx
```

### 4. Wrong Route Names
**Cause**: Using `links.index` instead of `dashboard.links.index`.
**Fix**: Always include the group prefix:
- User routes: `dashboard.<resource>.<action>`
- Admin routes: `admin.<resource>.<action>`

### 5. Hardcoded Paths in Frontend
**Cause**: Using `/dashboard/links` instead of `url('/dashboard/links')`.
**Fix**: Import and use the url helper:
```ts
import { url } from '@/utils';
// or in Links/Show.tsx: import { url as urlHelper } from '@/utils';
```

## Procedure

1. **Reproduce** the bug — identify the exact error message or behavior
2. **Check the controller** — verify json_decode for JSON fields, correct Inertia render path, proper route names
3. **Check the routes** — run `php artisan route:list | grep <resource>` to verify route names and parameters
4. **Check the frontend** — verify url() helper usage, correct prop names, proper layout component
5. **Fix** the issue following the patterns above
6. **Build** — run `npm run build` if frontend was changed
7. **Bump version** — patch bump in `config/app.php` for bug fixes
8. **Test** — verify the fix in browser

## Debugging Commands

```bash
# Check route names and parameters
php artisan route:list --name=dashboard
php artisan route:list --name=admin

# Clear caches after config changes
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Check for TypeScript errors
npx tsc --noEmit
```
