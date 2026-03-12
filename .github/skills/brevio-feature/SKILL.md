---
name: brevio-feature
description: "Add a new feature to Brevio. USE WHEN: building new dashboard pages, admin features, API endpoints, or frontend components. Covers full-stack: migration, model, controller, route, Inertia page, and version bump."
---

# Brevio Feature Development

## When to Use
- Adding a new resource/module (e.g., new dashboard feature)
- Building a new admin panel section
- Adding a new API endpoint
- Creating new Inertia pages

## Procedure

### 1. Database Layer
- Create migration: `php artisan make:migration create_<table>_table`
- Add JSON columns using `$table->json('column')` for flexible data
- Add `$table->foreignId('user_id')->constrained()->cascadeOnDelete()` for user-owned resources
- Run: `php artisan migrate`

### 2. Model
- Create in `app/Models/`
- Add `$fillable` array with all mass-assignable fields
- Add `$casts` for JSON columns: `'data' => 'array'`
- Add relationships: `belongsTo(User::class)`, etc.
- Use soft deletes if deletions should be recoverable

### 3. Controller
- **User feature**: `app/Http/Controllers/User/<Name>Controller.php`
- **Admin feature**: `app/Http/Controllers/Admin/<Name>Controller.php`
- **API feature**: `app/Http/Controllers/Api/<Name>Controller.php`
- Always `json_decode()` JSON string inputs before validation:
  ```php
  $data = is_string($request->input('data'))
      ? json_decode($request->input('data'), true)
      : $request->input('data');
  ```
- Use `Inertia::render()` for page responses
- Scope user resources: `auth()->user()->things()`

### 4. Routes
- Add to `routes/web.php` or `routes/api.php`
- User routes: inside the `dashboard` group with `dashboard.` prefix
- Admin routes: inside the `admin` group with `admin.` prefix
- Use `Route::resource()` for full CRUD

### 5. Frontend Pages
- Create in `resources/js/Pages/Dashboard/<Feature>/` (user) or `resources/js/Pages/Admin/<Feature>/` (admin)
- Standard pages: `Index.tsx`, `Create.tsx`, `Edit.tsx`, `Show.tsx`
- Always import and use `url()` from `@/utils` for all paths
- Use `DashboardLayout` or `AdminLayout` as the page wrapper
- Follow dark theme: `bg-gray-950` base, `bg-gray-900` cards, `border-gray-800` borders
- Accent colors: `violet-500/400` primary, `fuchsia-500` gradient partner
- Use `JSON.stringify()` before sending array/object fields via Inertia forms

### 6. Version Bump
- Bump the version in `config/app.php` using `/brevio-versioning` rules
- New feature = **minor** bump (or patch if it's a small enhancement)

### 7. Build & Verify
- Run `npm run build` to compile frontend
- Test the feature in browser at `http://localhost/welink/`

## Checklist

- [ ] Migration created and run
- [ ] Model with fillable, casts, relationships
- [ ] Controller with json_decode for JSON inputs
- [ ] Routes registered with correct prefix
- [ ] Frontend pages with url() helper, correct layout
- [ ] Version bumped in config/app.php
- [ ] Frontend built with `npm run build`
