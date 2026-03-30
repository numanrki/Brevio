<p align="center">
  <img src="https://img.shields.io/badge/Brevio-Link%20Management%20Platform-7c3aed?style=for-the-badge&logo=link&logoColor=white" alt="Brevio" />
</p>

<h1 align="center">Brevio</h1>

<p align="center">
  <strong>A modern, self-hosted URL shortener & link management platform with deep linking, QR codes, bio pages, and real-time analytics.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Laravel-12-FF2D20?style=flat-square&logo=laravel&logoColor=white" alt="Laravel 12" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 18" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Inertia.js-2-9553E9?style=flat-square" alt="Inertia.js" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License" />
</p>

<p align="center">
  <a href="#-screenshots">Screenshots</a> •
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-installation">Installation</a> •
  <a href="#-deployment">Deployment</a> •
  <a href="#-updates">Updates</a> •
  <a href="#-api-reference">API</a> •
  <a href="#-contact">Contact</a>
</p>

---

## 📸 Screenshots

<details>
<summary><strong>Click to expand all screenshots</strong></summary>

<br />

| Dashboard | Links Management |
|:---------:|:----------------:|
| ![Dashboard](https://i.postimg.cc/bqzcVGR5/Screenshot-4.png) | ![Links](https://i.postimg.cc/y7V4pJTb/Screenshot-5.png) |

| Link Analytics | Deep Links |
|:--------------:|:----------:|
| ![Analytics](https://i.postimg.cc/jRs03Wh3/Screenshot-6.png) | ![Deep Links](https://i.postimg.cc/vGQF21vq/Screenshot-7.png) |

| Deep Link Analytics | QR Codes |
|:-------------------:|:--------:|
| ![DL Analytics](https://i.postimg.cc/QjXGYBbh/Screenshot-8.png) | ![QR Codes](https://i.postimg.cc/YtpKD437/Screenshot-9.png) |

| Bio Pages | Global Stats |
|:---------:|:------------:|
| ![Bio Pages](https://i.postimg.cc/QjXGYBbN/Screenshot-10.png) | ![Stats](https://i.postimg.cc/rq8XZdJw/Screenshot-11.png) |

| Settings | Admin Login |
|:--------:|:-----------:|
| ![Settings](https://i.postimg.cc/ZJTts9cb/Screenshot-12.png) | ![Login](https://i.postimg.cc/D7BV92jz/Screenshot-13.png) |

</details>

---

## ✨ Features

### 🔗 URL Shortening
- Custom aliases and auto-generated short links
- Password protection and expiry dates
- Geo-targeting, device-targeting, and language-targeting redirects
- Interstitial pages with countdown timer or click-through button
- Soft deletes with restore capability

### 🚀 Smart Deep Links
- Conditional routing based on **device**, **OS**, **browser**, or **country**
- Platform access restrictions (Android-only, iOS-only, mobile-only, desktop-only, etc.)
- Fallback URL when no rule matches
- UTM parameter injection per deep link
- Priority-based rule engine with unlimited rules
- Per-deep-link analytics with rule performance breakdown

### 📊 Analytics & Tracking
- Real-time click tracking: country, city, browser, OS, device, referrer, language
- **In-app referrer detection** — detects Telegram, WhatsApp, Instagram, Facebook, Twitter/X, TikTok, Discord, Slack, LinkedIn, Pinterest, and 6 more messaging platforms via User-Agent parsing (even when Referer header is stripped)
- UTM parameter tracking (source, medium, campaign)
- Referrer-to-platform normalization (raw URLs → friendly names)
- Per-link, per-deep-link, per-QR, and per-bio analytics pages
- Global stats page with multi-filter support (Links, Bio, QR, Deep Links)
- Interactive charts (line, bar, pie) powered by Recharts

### 📱 QR Codes
- Generate QR codes for links, deep links, or standalone content
- Custom foreground/background colors with live preview
- Scan tracking via redirect route
- Per-QR analytics (scans over time, countries, browsers, devices, referrers)

### 🌐 Bio Pages
- Link-in-bio builder with **9 widget types**: Link, Heading, Text, Divider, Image, Social Links, Video, Spotify, Map
- Live preview panel with phone frame (real-time updates as you edit)
- Custom themes, custom CSS, SEO meta fields
- Page view and link click tracking with full analytics

### 🔐 Security
- Two-factor authentication (TOTP) with Google Authenticator, Authy, etc.
- QR code setup + manual entry key
- Encrypted secret storage (AES-256)
- Password-protected 2FA disable
- Laravel Sanctum API authentication

### 🖥️ Admin Dashboard
- Beautiful dark theme UI (gray-950 base, violet/fuchsia accents)
- 6 stat cards with real-time counts
- 7-day activity chart (links vs deep links)
- Top referrers, countries, and browsers widgets
- Recent links and deep links panels
- Pending migration detection with one-click "Run Migrations"

### 🔄 Update System
- Check for stable releases and beta commits from GitHub
- One-click install with progress steps (download → extract → apply → migrate → cache clear)
- Git-pull deploy support with automatic pending migration detection
- Version comparison and release notes display

### 🔌 REST API
- Full CRUD API for links and QR codes
- Authenticated via Laravel Sanctum (Bearer token)
- JSON responses with proper validation

---

## 🛠️ Tech Stack

| Layer | Technology |
|:------|:-----------|
| **Backend** | Laravel 12 (PHP 8.2+) |
| **Frontend** | React 18 + TypeScript 5 |
| **Bridge** | Inertia.js 2 (SSR-ready) |
| **Styling** | Tailwind CSS 3 |
| **Build** | Vite 7 |
| **Auth** | Laravel Breeze + Sanctum |
| **Charts** | Recharts |
| **QR** | qrcode.react |
| **2FA** | pragmarx/google2fa |
| **GeoIP** | stevebauman/location |
| **Database** | MySQL 8.0+ |

---

## 📦 Installation

### Prerequisites

| Requirement | Version |
|:------------|:--------|
| PHP | 8.2 or higher |
| Composer | 2.x |
| Node.js | 18+ (with npm) |
| MySQL | 8.0+ |

### Step 1 — Clone the Repository

```bash
git clone https://github.com/numanrki/Brevio.git
cd Brevio
```

### Step 2 — Install Dependencies

```bash
composer install
npm install
```

### Step 3 — Environment Configuration

```bash
cp .env.example .env
php artisan key:generate
```

Open `.env` and configure your database:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=brevio
DB_USERNAME=root
DB_PASSWORD=your_password
```

### Step 4 — Database Setup

```bash
php artisan migrate
```

### Step 5 — Build Frontend Assets

```bash
npm run build
```

### Step 6 — Launch

Visit your site in the browser. The installation wizard will guide you through initial setup, or navigate directly to `/admin/login`.

> **Tip:** For local development, use `php artisan serve` and `npm run dev` in separate terminals.

---

## 🚀 Deployment

### Option A — Git Pull (Recommended)

If you deploy by pulling from GitHub directly on your server:

```bash
cd /path/to/brevio
git pull origin main
composer install --no-dev --optimize-autoloader
npm install && npm run build
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

Then visit **Admin → Updates** — if there are pending migrations, an amber banner will appear with a **Run Migrations** button.

### Option B — Manual Upload

1. Download the latest release from [GitHub Releases](https://github.com/numanrki/Brevio/releases)
2. Extract to your web server
3. Run `composer install --no-dev --optimize-autoloader`
4. Run `npm install && npm run build`
5. Configure `.env` and run `php artisan migrate`

### Web Server Configuration

<details>
<summary><strong>Nginx</strong></summary>

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/brevio/public;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

</details>

<details>
<summary><strong>Apache (.htaccess)</strong></summary>

Laravel includes a `public/.htaccess` by default. Ensure `mod_rewrite` is enabled:

```bash
sudo a2enmod rewrite
sudo systemctl restart apache2
```

Point your virtual host document root to the `public/` directory.

</details>

---

## 🔄 Updates

Brevio includes a built-in update system accessible from the admin panel.

### Automatic Updates (Admin Panel)

1. Go to **Admin → Updates**
2. Click **Check for Updates**
3. If a new version is available, click **Install Update**
4. The system will automatically: download → extract → apply files → run migrations → clear caches

### Manual Updates (CLI)

```bash
git pull origin main
composer install --no-dev --optimize-autoloader
npm install && npm run build
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Versioning

Brevio follows **Semantic Versioning** (`MAJOR.MINOR.PATCH`):

| Type | When | Example |
|:-----|:-----|:--------|
| **Patch** | Bug fixes, small tweaks | `2.8.3` → `2.8.4` |
| **Minor** | New features, improvements | `2.7.0` → `2.8.0` |
| **Major** | Breaking changes, major milestones | `2.0.0` → `3.0.0` |

Check the [Releases](https://github.com/numanrki/Brevio/releases) page for the latest version and changelog.

---

## 🔌 API Reference

Brevio includes a REST API authenticated via **Laravel Sanctum** (Bearer token).

### Authentication

Include your API token in the `Authorization` header:

```
Authorization: Bearer YOUR_API_TOKEN
```

### Endpoints

#### Links

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `GET` | `/api/links` | List all links |
| `POST` | `/api/links` | Create a new link |
| `GET` | `/api/links/{id}` | Get link details |
| `PUT` | `/api/links/{id}` | Update a link |
| `DELETE` | `/api/links/{id}` | Delete a link |

#### QR Codes

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `GET` | `/api/qr-codes` | List all QR codes |
| `POST` | `/api/qr-codes` | Create a QR code |
| `GET` | `/api/qr-codes/{id}` | Get QR code details |
| `PUT` | `/api/qr-codes/{id}` | Update a QR code |
| `DELETE` | `/api/qr-codes/{id}` | Delete a QR code |

#### Account

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `GET` | `/api/account` | Get account info |
| `PUT` | `/api/account` | Update account |

---

## 📁 Project Structure

```
brevio/
├── app/
│   ├── Http/Controllers/
│   │   ├── Admin/          # Admin panel controllers
│   │   ├── Api/            # REST API controllers
│   │   └── RedirectController.php
│   ├── Models/             # Eloquent models (23+)
│   └── Services/           # AnalyticsService, etc.
├── resources/js/
│   ├── Pages/
│   │   ├── Admin/          # Admin panel pages (TSX)
│   │   ├── Auth/           # Login, register, 2FA
│   │   └── Bio/            # Public bio page
│   ├── Components/         # Shared React components
│   ├── Layouts/            # AdminLayout, DashboardLayout
│   └── types/              # TypeScript definitions
├── routes/
│   ├── web.php             # Web routes
│   ├── api.php             # API routes
│   └── auth.php            # Auth routes
├── database/migrations/    # All database migrations
├── config/app.php          # App config + version
└── public/                 # Compiled assets + entry point
```

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 📬 Contact

<p align="center">
  <strong>Developed & maintained by Numan</strong>
</p>

<p align="center">
  <a href="mailto:numanrki@gmail.com"><img src="https://img.shields.io/badge/Email-numanrki%40gmail.com-EA4335?style=flat-square&logo=gmail&logoColor=white" alt="Email" /></a>
  <a href="https://github.com/numanrki"><img src="https://img.shields.io/badge/GitHub-numanrki-181717?style=flat-square&logo=github&logoColor=white" alt="GitHub" /></a>
</p>

<p align="center">
  <sub>Built with ❤️ using Laravel, React, and TypeScript</sub>
</p>
