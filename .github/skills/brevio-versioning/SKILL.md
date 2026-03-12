---
name: brevio-versioning
description: "Bump and manage Brevio app version numbers. USE WHEN: releasing changes, fixing bugs, adding features, making breaking changes. Handles MAJOR.MINOR.PATCH format with auto-rollover (patch 99→minor bump, minor 99→major bump). Updates config/app.php version key."
---

# Brevio Versioning

## When to Use
- After any code change that will be committed
- When releasing a bug fix → bump **patch**
- When releasing a new feature → bump **minor**
- When making a breaking change or major milestone → bump **major**

## Version Format

`MAJOR.MINOR.PATCH` — e.g., `1.2.15`

## Bumping Rules

| Change Type | Action | Example |
|:------------|:-------|:--------|
| Bug fix, typo, small tweak | Bump patch | `1.2.15` → `1.2.16` |
| New feature, improvement | Bump minor | `1.2.99` → `1.3.0` |
| Breaking change, major milestone | Bump major | `1.99.99` → `2.0.0` |

### Rollover Rules
- When **patch** reaches **99**: reset patch to `0`, bump minor by 1
  - `1.2.99` + patch fix → `1.3.0`
- When **minor** reaches **99**: reset minor to `0`, bump major by 1
  - `1.99.99` + minor feature → `2.0.0`
- When bumping **minor**: always reset patch to `0`
- When bumping **major**: always reset minor and patch to `0`

## Procedure

1. **Read current version** from `config/app.php` — look for the `'version'` key
2. **Parse** into MAJOR, MINOR, PATCH integers
3. **Determine bump type** based on the change:
   - Bug fix / small tweak → patch
   - New feature / improvement → minor
   - Breaking change → major
4. **Apply rollover rules** (see table above)
5. **Update** the `'version'` value in `config/app.php`
6. **Verify** the version displays correctly in the admin panel footer

## Where Version Lives

- **Backend**: `config/app.php` → `'version' => '1.0.0'`
- **Frontend**: The `AdminLayout.tsx` reads it from shared Inertia props (`usePage().props.app_version`)
- **Display**: Bottom-right corner of the admin panel sidebar footer

## Example

```php
// config/app.php
'version' => '1.3.42',
```

After a bug fix:
```php
'version' => '1.3.43',
```

After a new feature when patch is at 99:
```php
// Was: '1.3.99'
'version' => '1.4.0',
```
