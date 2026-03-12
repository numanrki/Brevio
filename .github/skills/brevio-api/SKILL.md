---
name: brevio-api
description: "Create or modify Brevio REST API endpoints. USE WHEN: adding new API routes, creating API controllers, working with Sanctum authentication, or building API responses. Covers Laravel Sanctum + API resource patterns."
---

# Brevio API Development

## When to Use
- Adding new API endpoints
- Modifying existing API controllers
- Working with Sanctum token authentication
- Building JSON API responses

## Architecture

- **Auth**: Laravel Sanctum (Bearer token via `api_key` column on users)
- **Location**: `app/Http/Controllers/Api/`
- **Routes**: `routes/api.php` inside `auth:sanctum` middleware group
- **Format**: JSON responses with proper HTTP status codes

## Existing Endpoints

| Resource | Controller | Routes |
|:---------|:-----------|:-------|
| Account | `AccountController` | `GET/PUT /api/account` |
| Links | `LinkController` | Full apiResource at `/api/links` |
| QR Codes | `QrCodeController` | Full apiResource at `/api/qr-codes` |

## Procedure

### 1. Create Controller
```bash
# Create in app/Http/Controllers/Api/
```
```php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class NewController extends Controller
{
    public function index(Request $request)
    {
        $items = $request->user()->items()->latest()->paginate(25);
        return response()->json($items);
    }

    public function store(Request $request)
    {
        // json_decode string fields if needed
        $validated = $request->validate([...]);
        $item = $request->user()->items()->create($validated);
        return response()->json($item, 201);
    }
}
```

### 2. Register Route
```php
// routes/api.php — inside the Sanctum middleware group
Route::apiResource('new-resource', Api\NewController::class);
```

### 3. Authentication
All API routes use Sanctum middleware. Users authenticate with:
```
Authorization: Bearer {api_key}
```

### 4. Response Format
- **Success**: Return model/collection with appropriate status code
- **Created**: Return model with `201`
- **Deleted**: Return empty response with `204`
- **Error**: Return JSON with `message` key

### 5. Version Bump
- New endpoint = **minor** bump
- Bug fix to existing endpoint = **patch** bump
