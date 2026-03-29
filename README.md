<p align="center">
  <img src="https://img.shields.io/badge/Brevio-Link%20Management-7c3aed?style=for-the-badge&logo=link&logoColor=white" alt="Brevio" />
</p>

<h1 align="center">Brevio</h1>

<p align="center">
  <strong>Personal link management &amp; analytics platform</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Laravel-12-FF2D20?style=flat-square&logo=laravel&logoColor=white" alt="Laravel 12" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 18" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Inertia.js-2-9553E9?style=flat-square" alt="Inertia.js" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License" />
</p>

---

## About

Brevio is a self-hosted link management platform built for personal use. Shorten links, generate QR codes, build bio pages, and track detailed analytics — all from a single admin dashboard.

Built with Laravel 12, Inertia.js, React 18, TypeScript, and Tailwind CSS.

---

## Features

### URL Shortening
- Custom aliases and auto-generated short links
- Password protection and expiry dates
- Soft deletes with restore capability
- Full short URL display in links list

### Analytics
- Click tracking with country, city, browser, OS, device, and referrer detection
- UTM parameter tracking (utm_source, utm_medium, utm_campaign)
- Referrer-to-platform mapping (Instagram, Facebook, Twitter/X, TikTok, YouTube, etc.)
- Per-link analytics page with time series, geographic breakdown, and visitor log
- Global stats page combining link clicks, bio views, and QR scans

### QR Codes
- Custom foreground/background colors with live preview
- Scan tracking via `/qr/{id}` redirect route
- Per-QR analytics (scans over time, countries, cities, browsers, devices, referrers)
- Linked to existing short URLs or standalone content

### Bio Pages
- Linktree-style link-in-bio builder with 9 widget types:
  Link, Heading, Text, Divider, Image, Social Links, Video, Spotify, Map
- Live preview panel in the editor (phone frame, real-time updates)
- Custom themes, custom CSS, SEO fields
- View and link click tracking with full analytics

### Security
- Two-factor authentication (TOTP) with Google Authenticator, Authy, etc.
- QR code setup + manual entry key
- Encrypted secret storage
- Password-protected 2FA disable

### Admin Dashboard
- Dark theme UI (gray-950 base, violet/fuchsia accents)
- Links, QR codes, bio pages, analytics, settings — all in one place
- Update system with GitHub integration (stable releases + beta commits)
- Pending migration detection with one-click "Run Migrations" button
- Settings page for site config, email, social links, and advanced options

### Update System
- Check for stable releases and beta commits from GitHub
- One-click install with progress steps (download, extract, apply, migrate, cache clear)
- Git-pull deploy support with automatic pending migration detection
- Version comparison and release notes display

---

## Tech Stack

| Layer | Technology |
|:------|:-----------|
| Backend | Laravel 12 (PHP 8.2+) |
| Frontend | React 18 + TypeScript 5 |
| Bridge | Inertia.js 2 |
| Styling | Tailwind CSS 3 |
| Build | Vite 7 |
| Auth | Laravel Breeze + Sanctum |
| Charts | Recharts |
| QR | qrcode.react |
| 2FA | pragmarx/google2fa |
| Geo | stevebauman/location |
| Database | MySQL |

---

## Installation

### Prerequisites

- PHP 8.2+
- Composer
- Node.js 18+ & npm
- MySQL 8.0+

### Setup

```bash
git clone https://github.com/numanrki/Brevio.git
cd Brevio

composer install
npm install

cp .env.example .env
php artisan key:generate
```

Configure your database in `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=brevio
DB_USERNAME=root
DB_PASSWORD=
```

Run the install wizard or migrate manually:

```bash
php artisan migrate
npm run build
```

Visit your site and follow the installation wizard, or go to `/admin/login`.

---

## Deployment (Git Pull)

If you deploy by pulling from GitHub directly:

```bash
git pull origin main
composer install --no-dev --optimize-autoloader
npm install && npm run build
```

Then visit **Admin > Updates** — if there are pending migrations, an amber banner will appear with a **Run Migrations** button.

---

## API

Brevio includes a REST API authenticated via Laravel Sanctum (Bearer token).

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `GET` | `/api/account` | Get account info |
| `PUT` | `/api/account` | Update account |
| `GET` | `/api/links` | List all links |
| `POST` | `/api/links` | Create a link |
| `GET` | `/api/links/{id}` | Get link details |
| `PUT` | `/api/links/{id}` | Update a link |
| `DELETE` | `/api/links/{id}` | Delete a link |
| `GET` | `/api/qr-codes` | List QR codes |
| `POST` | `/api/qr-codes` | Create a QR code |
| `GET` | `/api/qr-codes/{id}` | Get QR code details |
| `PUT` | `/api/qr-codes/{id}` | Update a QR code |
| `DELETE` | `/api/qr-codes/{id}` | Delete a QR code |

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

**Numan** — [@numanrki](https://github.com/numanrki)
