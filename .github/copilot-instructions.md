# Brevio — Copilot Workspace Instructions

## Project Overview

Brevio is a modern URL shortener & link management SaaS platform built with **Laravel 12**, **Inertia.js**, **React 18**, **TypeScript**, and **Tailwind CSS**. It runs on PHP 8.2+ with MySQL.

## Architecture

- **Backend**: Laravel 12 with Inertia.js server-side adapter
- **Frontend**: React 18 + TypeScript, rendered via Inertia.js (no separate API calls for pages)
- **Styling**: Tailwind CSS 3 with a dark theme (gray-950 backgrounds, violet/fuchsia accents)
- **Build**: Vite 7 with `tsc && vite build`
- **Auth**: Laravel Breeze + Sanctum (API tokens)
- **Routing (JS)**: Ziggy for named routes

## Version System

**Current version**: defined in `config/app.php` under `'version'` key.

Format: `MAJOR.MINOR.PATCH` (e.g., `1.0.0`)

Bumping rules:
- **Patch** (0–99): Bug fixes, small tweaks. When patch reaches **99**, reset to 0 and bump minor.
- **Minor** (0–99): New features, improvements. When minor reaches **99**, reset to 0 and bump major.
- **Major**: Breaking changes, major milestones.

**Every code change must bump the version.** Use the versioning skill `/brevio-versioning` for guidance.

The version is displayed in the **Admin Panel footer** (bottom-right corner of `AdminLayout.tsx`).

## Key Conventions

### URL Helper
All frontend paths must use the `url()` helper from `@/utils` to prepend the base path:
```ts
import { url } from '@/utils';
// url('/dashboard/links') → '/welink/dashboard/links'
```
In `Links/Show.tsx`, use `urlHelper` alias since `url` conflicts with the `url` prop.

### Controllers
- **User controllers**: `app/Http/Controllers/User/` — Dashboard features (links, bio, QR, campaigns, etc.)
- **Admin controllers**: `app/Http/Controllers/Admin/` — Admin panel (users, plans, reports, settings, etc.)
- **API controllers**: `app/Http/Controllers/Api/` — REST API (Sanctum-authenticated)

### JSON Fields
When frontend sends JSON data (e.g., `data`, `style`, `theme`), the controller must `json_decode()` string values before validation:
```php
$data = is_string($request->input('data')) ? json_decode($request->input('data'), true) : $request->input('data');
```

### Route Names
Dashboard routes use `dashboard.` prefix: `dashboard.links.index`, `dashboard.qr-codes.show`, etc.
Admin routes use `admin.` prefix: `admin.users.index`, `admin.plans.create`, etc.

### Frontend Pages
Located in `resources/js/Pages/`:
- `Dashboard/` — User dashboard pages
- `Admin/` — Admin panel pages
- `Auth/` — Login, register, password reset
- `Bio/` — Public bio page
- `Profile/` — Profile management

### Layouts
- `DashboardLayout` — User dashboard with sidebar navigation
- `AdminLayout` — Admin panel with sidebar navigation
- Both use dark theme with `bg-gray-950` base

### Database
- Models use `$casts` for JSON columns (data, style, theme, content, etc.)
- Soft deletes on `urls` table
- All user-owned resources are scoped by `user_id`

## File Structure

```
app/Http/Controllers/{Admin,User,Api}/  — Controllers
app/Models/                              — 23 Eloquent models
resources/js/Pages/                      — Inertia React pages
resources/js/Layouts/                    — Layout components
resources/js/Components/                 — Shared components
resources/js/utils.ts                    — url() helper
routes/{web,api,auth}.php                — Route definitions
config/app.php                           — App config + version
```

## Don'ts

- Never hardcode `/welink/` in paths — always use `url()` helper
- Never send `array` fields from React without `JSON.stringify()` first
- Never use route names without the `dashboard.` or `admin.` prefix
- Never skip `json_decode()` for JSON string inputs in controllers
