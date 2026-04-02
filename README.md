<p align="center">
  <img src="https://img.shields.io/badge/Brevio-Open%20Source%20Link%20Shortener-7c3aed?style=for-the-badge&logo=link&logoColor=white" alt="Brevio - Open Source Link Shortener" />
</p>

<h1 align="center">Brevio</h1>

<p align="center">
  <strong>The open-source, self-hosted URL shortener and link management platform.<br />Shorten links, generate QR codes, build bio pages, set up smart deep links, and track everything with real-time analytics - all on your own server.</strong>
</p>

<p align="center">
  <a href="http://go.numanrki.com/GitHub"><img src="https://img.shields.io/badge/Sponsor_the_Project-💜-7c3aed?style=for-the-badge" alt="Sponsor the Project" /></a>
</p>

<p align="center">
  <a href="https://github.com/numanrki/Brevio/releases"><img src="https://img.shields.io/github/downloads/numanrki/Brevio/total?style=flat-square&label=Downloads&color=7c3aed" alt="Total Downloads" /></a>
  <a href="https://github.com/numanrki/Brevio/releases/latest"><img src="https://img.shields.io/github/v/release/numanrki/Brevio?style=flat-square&label=Latest&color=22c55e" alt="Latest Release" /></a>
  <a href="https://github.com/numanrki/Brevio/stargazers"><img src="https://img.shields.io/github/stars/numanrki/Brevio?style=flat-square&color=f59e0b" alt="Stars" /></a>
  <a href="https://github.com/numanrki/Brevio/network/members"><img src="https://img.shields.io/github/forks/numanrki/Brevio?style=flat-square&color=3b82f6" alt="Forks" /></a>
  <img src="https://img.shields.io/badge/Laravel-12-FF2D20?style=flat-square&logo=laravel&logoColor=white" alt="Laravel 12" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 18" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript 5" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS 3" />
  <a href="LICENSE"><img src="https://img.shields.io/github/license/numanrki/Brevio?style=flat-square&color=10b981" alt="MIT License" /></a>
</p>

<p align="center">
  <a href="#-screenshot-gallery">Screenshots</a> •
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-requirements">Requirements</a> •
  <a href="#-installation">Installation</a> •
  <a href="#-deployment">Deployment</a> •
  <a href="#-update-system">Updates</a> •
  <a href="#-rest-api">API Docs</a> •
  <a href="#-license">License</a>
</p>

---

## Why Brevio?

Most link shorteners are either expensive SaaS tools or outdated PHP scripts from 2015. Brevio is different - it's a **modern, full-stack application** built with the same technologies used by top startups: Laravel 12, React 18, TypeScript, and Tailwind CSS.

You get complete control over your data, your domain, and your branding. No monthly fees. No tracking limits. No vendor lock-in. Deploy it on a $5/month VPS or your enterprise infrastructure - it scales with you.

**Who is Brevio for?**

- **Marketers** who need branded short links with deep analytics
- **Developers** who want a self-hosted API they can integrate into their stack
- **Agencies** managing links for multiple campaigns and clients
- **Businesses** that require data privacy and on-premise hosting
- **Open-source enthusiasts** who prefer owning their tools

---

## 📸 Screenshot Gallery

<details open>
<summary><strong>Click to expand / collapse</strong></summary>

<br />

| | |
|:-:|:-:|
| ![Dashboard](https://i.postimg.cc/bqzcVGR5/Screenshot-4.png) | ![Links](https://i.postimg.cc/y7V4pJTb/Screenshot-5.png) |
| ![Analytics](https://i.postimg.cc/jRs03Wh3/Screenshot-6.png) | ![Deep Links](https://i.postimg.cc/vGQF21vq/Screenshot-7.png) |
| ![Deep Link Analytics](https://i.postimg.cc/QjXGYBbh/Screenshot-8.png) | ![QR Codes](https://i.postimg.cc/YtpKD437/Screenshot-9.png) |
| ![Bio Pages](https://i.postimg.cc/QjXGYBbN/Screenshot-10.png) | ![Stats](https://i.postimg.cc/rq8XZdJw/Screenshot-11.png) |
| ![Settings](https://i.postimg.cc/ZJTts9cb/Screenshot-12.png) | ![Login](https://i.postimg.cc/D7BV92jz/Screenshot-13.png) |

</details>

---

## ✨ Features

### 🔗 URL Shortening & Link Management

Create short, branded links in seconds. Every link comes with full control and tracking.

- **Custom aliases** - Choose your own short slug (e.g., `yourdomain.com/sale`) or let Brevio auto-generate one
- **Password protection** - Require a password before redirecting visitors
- **Expiry dates** - Automatically disable links after a set date and time
- **Geo-targeting** - Route visitors to different destinations based on their country
- **Device targeting** - Send mobile users to an app store and desktop users to a website
- **Language targeting** - Redirect based on the visitor's browser language
- **Interstitial pages** - Show a countdown page or click-through confirmation before redirecting
- **Soft deletes** - Accidentally deleted a link? Restore it from the trash

### 🚀 Smart Deep Links

Go beyond simple redirects with conditional routing powered by a priority-based rule engine.

- **Conditional routing** - Route visitors based on their **device**, **operating system**, **browser**, or **country**
- **Platform restrictions** - Create links that only work on Android, iOS, mobile, or desktop
- **Fallback URL** - Define a default destination when no rules match
- **UTM injection** - Automatically append UTM parameters (source, medium, campaign) to each rule's destination
- **Unlimited rules** - Stack as many routing rules as you need with drag-and-drop priority ordering
- **Per-rule analytics** - See exactly which rules are getting triggered and how often

### 📊 Analytics & Tracking

Know exactly who clicks your links, when, where, and from which platform.

- **Real-time click tracking** - Country, city, browser, OS, device type, referrer, language
- **Smart referrer detection** - Identifies traffic from **Telegram, WhatsApp, Instagram, Facebook, Twitter/X, TikTok, Discord, Slack, LinkedIn, Pinterest,** and 6+ more platforms via User-Agent parsing - even when the Referer header is stripped
- **UTM tracking** - Capture and report on source, medium, and campaign parameters
- **Global stats dashboard** - Filter analytics across Links, Bio Pages, QR Codes, and Deep Links
- **Interactive charts** - Line, bar, and pie charts powered by Recharts with hover tooltips
- **Referrer normalization** - Raw URLs are automatically mapped to friendly platform names

### 📱 QR Code Generator

Generate scannable QR codes for any link, deep link, or standalone content.

- **Custom colors** - Set foreground and background colors with a live preview
- **Multiple content types** - URLs, text, vCards, Wi-Fi configs, and more
- **Scan tracking** - Every scan is tracked through a redirect route with full analytics
- **Per-QR analytics** - View scans over time, top countries, browsers, devices, and referrers

### 🌐 Bio Pages (Link-in-Bio)

Build beautiful, mobile-optimized landing pages with a drag-and-drop editor.

- **9 widget types** - Link, Heading, Text, Divider, Image, Social Links, Video, Spotify, Map
- **Live preview** - See changes in real-time inside a phone-frame preview panel
- **Custom themes** - Choose from built-in themes or write your own CSS
- **SEO fields** - Custom title, description, and Open Graph image for each bio page
- **View & click tracking** - Full analytics for page views and individual link clicks

### 🔐 Security & Authentication

Enterprise-grade security with two-factor authentication and encrypted storage.

- **Two-factor authentication (2FA)** - TOTP-based with support for Google Authenticator, Authy, and all TOTP apps
- **QR code setup** - Scan a QR code or manually enter the secret key to set up 2FA
- **AES-256 encryption** - All sensitive data (secrets, API keys) is encrypted at rest
- **Password-protected 2FA disable** - Prevents unauthorized users from turning off 2FA
- **API key management** - Create, revoke, and scope API keys with granular permissions

### 🖥️ Admin Dashboard

A clean, modern admin panel with a dark theme designed for productivity.

- **6 real-time stat cards** - Links, Deep Links, QR Codes, Bio Pages, Total Clicks, Total Scans
- **7-day activity chart** - Visual comparison of link vs. deep link creation over the past week
- **Top widgets** - Most-used referrers, top countries, and popular browsers at a glance
- **Recent activity** - Quick-access panels showing your latest links and deep links
- **Pending migration detection** - An amber banner appears when database updates are available, with a one-click "Run Migrations" button

### 🔄 Built-in Update System

Keep Brevio up to date without SSH access or command-line knowledge.

- **One-click updates** - Check for new versions and install directly from the admin panel
- **Automatic process** - Download → Extract → Apply files → Run migrations → Clear caches
- **Release channels** - Choose between stable releases and beta commits
- **Git-pull support** - If you deploy via Git, pending migrations are auto-detected
- **Release notes** - View what changed before you update

### 🔌 REST API with Scoped Permissions

Integrate Brevio into your own applications, scripts, or automation workflows.

- **Full CRUD** - Create, read, update, and delete links and QR codes programmatically
- **Scoped API keys** - Grant only the permissions each key needs (e.g., read-only links, write QR codes)
- **Bearer token auth** - Standard `Authorization: Bearer <key>` authentication
- **JSON responses** - Clean, consistent JSON output with proper HTTP status codes and validation errors
- **Health check endpoint** - Public `/api/v1/ping` endpoint for uptime monitoring

> See the full [REST API documentation](#-rest-api) below.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|:------|:-----------|:--------|
| **Backend** | Laravel 12 (PHP 8.2+) | Routing, ORM, validation, queue, caching |
| **Frontend** | React 18 + TypeScript 5 | Interactive UI with type safety |
| **Bridge** | Inertia.js 2 | Server-driven SPA without a separate API layer |
| **Styling** | Tailwind CSS 3 | Utility-first CSS with dark theme |
| **Build** | Vite 7 | Fast dev server and optimized production builds |
| **Auth** | Laravel Breeze + Sanctum | Session auth (web) + token auth (API) |
| **Charts** | Recharts | Interactive line, bar, and pie charts |
| **QR** | qrcode.react + endroid/qr-code | Client-side preview + server-side generation |
| **2FA** | pragmarx/google2fa | TOTP two-factor authentication |
| **GeoIP** | MaxMind GeoLite2 | Country and city detection from IP addresses |
| **Database** | MySQL 8.0+ | Primary data store |

---

## 📋 Requirements

Before installing Brevio, make sure your server meets these requirements:

| Requirement | Minimum Version | Notes |
|:------------|:----------------|:------|
| **PHP** | 8.2+ | With extensions: `mbstring`, `openssl`, `pdo_mysql`, `tokenizer`, `xml`, `ctype`, `json`, `bcmath`, `gd` or `imagick` |
| **Composer** | 2.x | PHP dependency manager |
| **Node.js** | 18+ | With npm (for building frontend assets) |
| **MySQL** | 8.0+ | MariaDB 10.3+ also works |
| **Web Server** | Apache 2.4+ or Nginx 1.18+ | With `mod_rewrite` (Apache) or `try_files` (Nginx) |

---

## 📦 Installation

### Option 1 - Clone from GitHub (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/numanrki/Brevio.git
cd Brevio

# 2. Install PHP dependencies
composer install

# 3. Install JavaScript dependencies
npm install

# 4. Create your environment file
cp .env.example .env

# 5. Generate the application encryption key
php artisan key:generate
```

### Option 2 - Download a Release

1. Go to the [Releases](https://github.com/numanrki/Brevio/releases) page
2. Download the latest `.zip` file
3. Extract it to your web server's document root
4. Run `composer install` and `npm install` inside the extracted folder
5. Copy `.env.example` to `.env` and run `php artisan key:generate`

### Configure the Database

Open the `.env` file and fill in your MySQL credentials:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=brevio
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
```

Then run the database migrations:

```bash
php artisan migrate
```

### Build the Frontend

```bash
npm run build
```

### Launch

Open your browser and navigate to your domain. Brevio will display an **installation wizard** that walks you through the initial setup (admin account, site name, etc.).

Once complete, your admin panel is available at `/admin`.

> **Local development tip:** Run `php artisan serve` and `npm run dev` in separate terminals for hot-reloading during development.

---

## 🚀 Deployment

### Deploying with Git (Recommended)

If your server has Git access, this is the simplest way to deploy and update:

```bash
cd /path/to/brevio
git pull origin main
composer install --no-dev --optimize-autoloader
npm install && npm run build
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

After deploying, visit **Admin → Updates** in the admin panel. If there are pending database migrations, an amber banner will appear with a **Run Migrations** button - click it to apply them.

### Deploying Manually (FTP / File Manager)

1. Download the latest release from [GitHub Releases](https://github.com/numanrki/Brevio/releases)
2. Upload and extract the files to your server's web root
3. Run `composer install --no-dev --optimize-autoloader`
4. Run `npm install && npm run build`
5. Make sure `.env` is configured, then run `php artisan migrate`

### Web Server Configuration

<details>
<summary><strong>Apache</strong></summary>

Laravel ships with a `public/.htaccess` file that handles URL rewriting. Make sure `mod_rewrite` is enabled:

```bash
sudo a2enmod rewrite
sudo systemctl restart apache2
```

Point your virtual host's `DocumentRoot` to the `public/` directory:

```apache
<VirtualHost *:80>
    ServerName yourdomain.com
    DocumentRoot /path/to/brevio/public

    <Directory /path/to/brevio/public>
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

</details>

<details>
<summary><strong>Nginx</strong></summary>

```nginx
server {
    listen 80;
    server_name yourdomain.com;
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

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

</details>

<details>
<summary><strong>Shared Hosting (cPanel / Hostinger / etc.)</strong></summary>

If you can't change your document root to `public/`, Brevio includes a root-level `index.php` that automatically proxies requests to `public/index.php`. Simply upload all files to your web root and it will work out of the box.

Make sure the root `.htaccess` and `public/.htaccess` files are both present on the server.

</details>

---

## 🔄 Update System

Brevio has a built-in update system so you never need SSH access to stay current.

### One-Click Updates (Admin Panel)

1. Navigate to **Admin → Updates**
2. Click **Check for Updates**
3. If a new version is available, review the release notes and click **Install Update**
4. Brevio will automatically: **download → extract → apply files → run migrations → clear caches**

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

### Version Scheme

Brevio follows **Semantic Versioning** (`MAJOR.MINOR.PATCH`):

| Change | Bump | Example |
|:-------|:-----|:--------|
| Bug fix, minor tweak | Patch | `2.8.3` → `2.8.4` |
| New feature, improvement | Minor | `2.8.0` → `2.9.0` |
| Breaking change, major milestone | Major | `2.0.0` → `3.0.0` |

See all versions on the [Releases](https://github.com/numanrki/Brevio/releases) page.

---

## 🔌 REST API

Brevio provides a fully-featured REST API that lets you manage links, QR codes, and bio pages programmatically. Use it to integrate short link creation into your own apps, automate campaigns, or build custom dashboards.

### Getting Started

#### 1. Create an API Key

1. Log in to your Brevio admin panel
2. Go to **Admin → API Keys**
3. Click **Create API Key**
4. Give it a name (e.g., "My App") and select the permission scopes it needs
5. Click **Create** - your API key will be displayed **once**. Copy it and store it securely.

#### 2. Authenticate Your Requests

Include the API key as a `Bearer` token in the `Authorization` header of every request:

```
Authorization: Bearer brev_your_api_key_here
Accept: application/json
Content-Type: application/json
```

#### 3. Base URL

All API endpoints are prefixed with `/api/v1/`. For example, if your Brevio installation is at `https://yourdomain.com`, the full base URL is:

```
https://yourdomain.com/api/v1/
```

### Permission Scopes

When creating an API key, you choose which scopes (permissions) it has. Only grant what is needed.

| Scope | Permission |
|:------|:-----------|
| `links:read` | View links |
| `links:write` | Create, update, and delete links |
| `qr:read` | View QR codes |
| `qr:write` | Create, update, and delete QR codes |
| `bio:read` | View bio pages |
| `bio:write` | Create, update, and delete bio pages |
| `deep-links:read` | View deep links |
| `deep-links:write` | Create, update, and delete deep links |
| `pixels:read` | View tracking pixels |
| `pixels:write` | Create, update, and delete pixels |
| `stats:read` | View statistics and analytics |
| `account:read` | View account information |

### Health Check

A public endpoint that requires no authentication. Use it for uptime monitoring.

```
GET /api/v1/ping
```

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2026-04-01T12:00:00+00:00"
}
```

### Links

#### List All Links

```
GET /api/v1/links
```

**Query Parameters:**

| Parameter | Type | Description |
|:----------|:-----|:------------|
| `search` | string | Filter links by alias or URL |
| `per_page` | integer | Results per page (default: 15) |
| `page` | integer | Page number |

**Required scope:** `links:read`

**Example Response:**

```json
{
  "data": [
    {
      "id": 1,
      "alias": "my-link",
      "url": "https://example.com/very-long-url",
      "short_url": "https://yourdomain.com/my-link",
      "title": "My Link",
      "description": "A short description",
      "is_active": true,
      "total_clicks": 142,
      "expiry_date": null,
      "created_at": "2026-03-15T10:30:00+00:00"
    }
  ],
  "current_page": 1,
  "last_page": 3,
  "per_page": 15,
  "total": 42
}
```

#### Create a Link

```
POST /api/v1/links
```

**Required scope:** `links:write`

**Request Body:**

| Field | Type | Required | Description |
|:------|:-----|:---------|:------------|
| `url` | string | Yes | The destination URL (max 2048 chars) |
| `alias` | string | No | Custom short slug. Auto-generated if omitted |
| `title` | string | No | Link title (max 255 chars) |
| `description` | string | No | Link description (max 500 chars) |
| `is_active` | boolean | No | Whether the link is active (default: true) |
| `expiry_date` | datetime | No | Auto-disable after this date (must be in the future) |

**Example Request:**

```bash
curl -X POST https://yourdomain.com/api/v1/links \
  -H "Authorization: Bearer brev_your_api_key_here" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "url": "https://example.com/my-product",
    "alias": "product",
    "title": "Product Page"
  }'
```

**Example Response (201 Created):**

```json
{
  "data": {
    "id": 43,
    "alias": "product",
    "url": "https://example.com/my-product",
    "short_url": "https://yourdomain.com/product",
    "title": "Product Page",
    "is_active": true,
    "total_clicks": 0,
    "created_at": "2026-04-01T12:00:00+00:00"
  }
}
```

#### Get a Link

```
GET /api/v1/links/{id}
```

**Required scope:** `links:read`

#### Update a Link

```
PUT /api/v1/links/{id}
```

**Required scope:** `links:write`

**Request Body:** Same fields as Create (all optional).

#### Delete a Link

```
DELETE /api/v1/links/{id}
```

**Required scope:** `links:write`

**Response:**

```json
{
  "message": "Link deleted successfully."
}
```

### QR Codes

#### List All QR Codes

```
GET /api/v1/qr-codes
```

**Required scope:** `qr:read`

**Query Parameters:**

| Parameter | Type | Description |
|:----------|:-----|:------------|
| `per_page` | integer | Results per page (default: 15) |
| `page` | integer | Page number |

#### Create a QR Code

```
POST /api/v1/qr-codes
```

**Required scope:** `qr:write`

**Request Body:**

| Field | Type | Required | Description |
|:------|:-----|:---------|:------------|
| `name` | string | Yes | QR code name (max 255 chars) |
| `type` | string | No | Content type (e.g., `url`, `text`, `vcard`) |
| `data` | object | Yes | QR code content data |
| `style` | object | No | Color and style customization |

**Example Request:**

```bash
curl -X POST https://yourdomain.com/api/v1/qr-codes \
  -H "Authorization: Bearer brev_your_api_key_here" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "name": "Website QR",
    "type": "url",
    "data": { "url": "https://example.com" },
    "style": { "foreground": "#7c3aed", "background": "#ffffff" }
  }'
```

#### Get a QR Code

```
GET /api/v1/qr-codes/{id}
```

**Required scope:** `qr:read`

#### Update a QR Code

```
PUT /api/v1/qr-codes/{id}
```

**Required scope:** `qr:write`

#### Delete a QR Code

```
DELETE /api/v1/qr-codes/{id}
```

**Required scope:** `qr:write`

### Bio Pages

#### List All Bio Pages

```
GET /api/v1/bio
```

**Required scope:** `bio:read`

**Query Parameters:**

| Parameter | Type | Description |
|:----------|:-----|:------------|
| `per_page` | integer | Results per page (default: 15) |
| `page` | integer | Page number |

**Example Response:**

```json
{
  "data": [
    {
      "id": 1,
      "name": "My Links",
      "alias": "john",
      "bio_url": "https://yourdomain.com/bio/john",
      "avatar": null,
      "seo_title": "John's Links",
      "seo_description": "All my links in one place",
      "is_active": true,
      "views": 324,
      "widgets_count": 5,
      "created_at": "2026-03-15T10:30:00+00:00"
    }
  ],
  "current_page": 1,
  "last_page": 1,
  "per_page": 15,
  "total": 1
}
```

#### Create a Bio Page

```
POST /api/v1/bio
```

**Required scope:** `bio:write`

**Request Body:**

| Field | Type | Required | Description |
|:------|:-----|:---------|:------------|
| `name` | string | Yes | Display name shown on the bio page (max 255 chars) |
| `alias` | string | Yes | URL slug - the page will be at `/bio/{alias}` (max 255 chars, must be unique) |
| `avatar` | string | No | URL to an avatar image |
| `theme` | object | No | Theme customization (colors, fonts, etc.) |
| `custom_css` | string | No | Custom CSS to apply to the bio page |
| `seo_title` | string | No | Custom page title for SEO (max 255 chars) |
| `seo_description` | string | No | Meta description for SEO |
| `is_active` | boolean | No | Whether the page is publicly visible (default: true) |
| `widgets` | array | No | Array of widgets to add to the page (see widget format below) |

**Widget format:**

Each widget in the `widgets` array should have:

| Field | Type | Required | Description |
|:------|:-----|:---------|:------------|
| `type` | string | Yes | Widget type: `link`, `heading`, `text`, `divider`, `image`, `social`, `video`, `spotify`, `map` |
| `content` | object | Yes | Widget content (varies by type - see examples below) |
| `position` | integer | No | Display order (0 = first). Auto-assigned if omitted |
| `is_active` | boolean | No | Whether this widget is visible (default: true) |

**Widget content examples:**

```json
// Link widget
{ "type": "link", "content": { "url": "https://example.com", "label": "My Website" } }

// Heading widget
{ "type": "heading", "content": { "text": "Welcome!" } }

// Text widget
{ "type": "text", "content": { "text": "This is my bio page." } }

// Social widget
{ "type": "social", "content": { "twitter": "https://twitter.com/you", "github": "https://github.com/you" } }
```

**Example Request:**

```bash
curl -X POST https://yourdomain.com/api/v1/bio \
  -H "Authorization: Bearer brev_your_api_key_here" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "name": "My Links",
    "alias": "john",
    "seo_title": "John - All My Links",
    "widgets": [
      { "type": "heading", "content": { "text": "Welcome!" }, "position": 0 },
      { "type": "link", "content": { "url": "https://example.com", "label": "My Website" }, "position": 1 },
      { "type": "link", "content": { "url": "https://github.com/you", "label": "GitHub" }, "position": 2 }
    ]
  }'
```

**Example Response (201 Created):**

```json
{
  "data": {
    "id": 2,
    "name": "My Links",
    "alias": "john",
    "bio_url": "https://yourdomain.com/bio/john",
    "is_active": true,
    "views": 0,
    "created_at": "2026-04-01T12:00:00+00:00"
  }
}
```

#### Get a Bio Page

```
GET /api/v1/bio/{id}
```

**Required scope:** `bio:read`

Returns the full bio page with all widgets.

#### Update a Bio Page

```
PUT /api/v1/bio/{id}
```

**Required scope:** `bio:write`

**Request Body:** Same fields as Create (all optional). If you include `widgets`, the existing widgets will be **replaced** with the new ones.

#### Delete a Bio Page

```
DELETE /api/v1/bio/{id}
```

**Required scope:** `bio:write`

**Response:**

```json
{
  "message": "Bio page deleted successfully."
}
```

### Deep Links

Smart routing links that redirect visitors to different destinations based on their device, OS, browser, or country.

#### List All Deep Links

```
GET /api/v1/deep-links
```

**Required scope:** `deep-links:read`

**Query Parameters:**

| Parameter | Type | Description |
|:----------|:-----|:------------|
| `search` | string | Filter by name or alias |
| `per_page` | integer | Results per page (default: 15) |
| `page` | integer | Page number |

**Example Response:**

```json
{
  "data": [
    {
      "id": 1,
      "name": "App Download",
      "alias": "get-app",
      "short_url": "https://yourdomain.com/dl/get-app",
      "fallback_url": "https://example.com/app",
      "is_active": true,
      "allowed_devices": ["mobile"],
      "total_clicks": 87,
      "rules_count": 3,
      "expiry_date": null,
      "created_at": "2026-03-20T10:00:00+00:00"
    }
  ]
}
```

#### Create a Deep Link

```
POST /api/v1/deep-links
```

**Required scope:** `deep-links:write`

**Request Body:**

| Field | Type | Required | Description |
|:------|:-----|:---------|:------------|
| `name` | string | Yes | Deep link name (max 255 chars) |
| `alias` | string | No | Custom slug. Auto-generated if omitted |
| `fallback_url` | string | Yes | Default destination when no rules match |
| `is_active` | boolean | No | Whether the deep link is active (default: true) |
| `allowed_devices` | array | No | Restrict to specific devices: `mobile`, `desktop`, `tablet` |
| `expiry_date` | datetime | No | Auto-disable after this date |
| `utm_source` | string | No | UTM source parameter |
| `utm_medium` | string | No | UTM medium parameter |
| `utm_campaign` | string | No | UTM campaign parameter |
| `rules` | array | No | Routing rules (see rule format below) |

**Rule format:**

Each rule in the `rules` array should have:

| Field | Type | Required | Description |
|:------|:-----|:---------|:------------|
| `type` | string | Yes | Rule type: `device`, `country`, `os`, `browser` |
| `value` | string | Yes | Value to match (e.g., `android`, `US`, `Chrome`) |
| `destination_url` | string | Yes | Where to redirect when this rule matches |
| `priority` | integer | No | Higher priority rules are checked first. Auto-assigned if omitted |

**Example Request:**

```bash
curl -X POST https://yourdomain.com/api/v1/deep-links \
  -H "Authorization: Bearer brev_your_api_key_here" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "name": "App Download",
    "fallback_url": "https://example.com/app",
    "utm_source": "website",
    "rules": [
      { "type": "os", "value": "android", "destination_url": "https://play.google.com/store/apps/details?id=com.example", "priority": 2 },
      { "type": "os", "value": "ios", "destination_url": "https://apps.apple.com/app/example/id123456", "priority": 1 }
    ]
  }'
```

**Example Response (201 Created):**

```json
{
  "data": {
    "id": 5,
    "name": "App Download",
    "alias": "aB3xKm",
    "short_url": "https://yourdomain.com/dl/aB3xKm",
    "fallback_url": "https://example.com/app",
    "is_active": true,
    "total_clicks": 0,
    "rules_count": 2,
    "created_at": "2026-04-01T12:00:00+00:00"
  }
}
```

#### Get a Deep Link

```
GET /api/v1/deep-links/{id}
```

**Required scope:** `deep-links:read`

Returns the full deep link including all routing rules.

#### Update a Deep Link

```
PUT /api/v1/deep-links/{id}
```

**Required scope:** `deep-links:write`

**Request Body:** Same fields as Create (all optional). If you include `rules`, the existing rules will be **replaced** with the new ones.

#### Delete a Deep Link

```
DELETE /api/v1/deep-links/{id}
```

**Required scope:** `deep-links:write`

**Response:**

```json
{
  "message": "Deep link deleted successfully."
}
```

### Pixels

Manage tracking pixels that fire when your deep links are visited.

#### List All Pixels

```
GET /api/v1/pixels
```

**Required scope:** `pixels:read`

**Example Response:**

```json
{
  "data": [
    {
      "id": 1,
      "name": "Facebook Pixel",
      "provider": "facebook",
      "pixel_id": "123456789",
      "type": "page_view",
      "is_active": true,
      "total_fires": 542,
      "created_at": "2026-03-10T08:00:00+00:00"
    }
  ]
}
```

#### Create a Pixel

```
POST /api/v1/pixels
```

**Required scope:** `pixels:write`

**Request Body:**

| Field | Type | Required | Description |
|:------|:-----|:---------|:------------|
| `name` | string | Yes | Pixel name (max 255 chars) |
| `provider` | string | Yes | Provider name: `facebook`, `google`, `tiktok`, `twitter`, etc. |
| `pixel_id` | string | Yes | Your pixel/tag ID from the provider |
| `type` | string | No | Pixel type: `page_view`, `conversion`, or `custom` (default: page_view) |
| `token` | string | No | API token for server-side tracking (some providers require this) |
| `is_active` | boolean | No | Whether the pixel is active (default: true) |

**Example Request:**

```bash
curl -X POST https://yourdomain.com/api/v1/pixels \
  -H "Authorization: Bearer brev_your_api_key_here" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "name": "Facebook Pixel",
    "provider": "facebook",
    "pixel_id": "123456789",
    "type": "page_view"
  }'
```

#### Get a Pixel

```
GET /api/v1/pixels/{id}
```

**Required scope:** `pixels:read`

#### Update a Pixel

```
PUT /api/v1/pixels/{id}
```

**Required scope:** `pixels:write`

#### Delete a Pixel

```
DELETE /api/v1/pixels/{id}
```

**Required scope:** `pixels:write`

### Statistics

Access analytics and statistics for your links and deep links.

#### Account Overview

Get a summary of all your resources and their total engagement.

```
GET /api/v1/stats/overview
```

**Required scope:** `stats:read`

**Example Response:**

```json
{
  "data": {
    "links": { "total": 42, "total_clicks": 1580 },
    "bio_pages": { "total": 3, "total_views": 892 },
    "deep_links": { "total": 8, "total_clicks": 324 },
    "qr_codes": { "total": 12 },
    "pixels": { "total": 4 }
  }
}
```

#### Link Analytics

Get detailed analytics for a specific short link.

```
GET /api/v1/stats/links/{id}
```

**Required scope:** `stats:read`

**Query Parameters:**

| Parameter | Type | Description |
|:----------|:-----|:------------|
| `range` | string | Date range: `today`, `7d`, `15d`, `30d`, `3m`, `12m`, `all`, `custom` (default: 30d) |
| `from` | date | Start date for custom range (format: `YYYY-MM-DD`) |
| `to` | date | End date for custom range (format: `YYYY-MM-DD`) |

**Example Response:**

```json
{
  "data": {
    "link_id": 1,
    "range": "30d",
    "from": "2026-03-02",
    "to": "2026-04-01",
    "summary": {
      "total_clicks": 142,
      "unique_clicks": 98,
      "avg_daily": 4.7
    },
    "clicks_over_time": [
      { "date": "2026-03-15", "count": 12 },
      { "date": "2026-03-16", "count": 8 }
    ],
    "top_countries": [
      { "name": "United States", "count": 45 },
      { "name": "Germany", "count": 23 }
    ],
    "top_browsers": [
      { "name": "Chrome", "count": 67 },
      { "name": "Safari", "count": 34 }
    ],
    "devices": [
      { "name": "mobile", "count": 82 },
      { "name": "desktop", "count": 60 }
    ]
  }
}
```

#### Deep Link Analytics

Get detailed analytics for a specific deep link, including rule performance.

```
GET /api/v1/stats/deep-links/{id}
```

**Required scope:** `stats:read`

**Query Parameters:** Same as Link Analytics (`range`, `from`, `to`).

**Example Response:**

```json
{
  "data": {
    "deep_link_id": 5,
    "range": "30d",
    "summary": {
      "total_clicks": 87,
      "unique_clicks": 64,
      "avg_daily": 2.9
    },
    "clicks_over_time": [...],
    "top_countries": [...],
    "rule_performance": [
      { "rule_id": 1, "destination_url": "https://play.google.com/...", "count": 45 },
      { "rule_id": 2, "destination_url": "https://apps.apple.com/...", "count": 32 }
    ]
  }
}
```

### Error Responses

All errors follow a consistent format:

| HTTP Status | Meaning |
|:------------|:--------|
| `401 Unauthorized` | Missing or invalid API key |
| `403 Forbidden` | API key is disabled, expired, or missing the required scope |
| `404 Not Found` | Resource does not exist or belongs to another user |
| `422 Unprocessable Entity` | Validation failed - check the `errors` object in the response |

**Example error response:**

```json
{
  "message": "Missing required scope: links:write",
}
```

### Rate Limiting

API requests are subject to rate limiting. If you exceed the limit, you'll receive a `429 Too Many Requests` response. Wait for the `Retry-After` header value (in seconds) before making another request.

### Tips & Best Practices

- **Store your API key securely.** Treat it like a password. Never commit it to version control or expose it in client-side code.
- **Use the minimum scopes required.** If your integration only reads links, don't grant write permissions.
- **Set an expiry date** on API keys used for temporary integrations or testing.
- **Always send `Accept: application/json`** to ensure you receive JSON error messages instead of HTML.
- **Use the health check** (`/api/v1/ping`) in your monitoring to verify API availability.

---

## 📄 License

Brevio is open-source software licensed under the **[MIT License](LICENSE)**. You are free to use, modify, and distribute it for personal or commercial projects.

---

## ⭐ Support the Project

If Brevio helps you, consider giving it a **star** on GitHub - it helps others discover the project.

<p align="center">
  <a href="https://github.com/numanrki/Brevio"><img src="https://img.shields.io/github/stars/numanrki/Brevio?style=social" alt="Star on GitHub" /></a>
</p>

<p align="center">
  <a href="mailto:numanrki@gmail.com"><img src="https://img.shields.io/badge/Email-numanrki%40gmail.com-EA4335?style=flat-square&logo=gmail&logoColor=white" alt="Email" /></a>
  <a href="https://github.com/numanrki"><img src="https://img.shields.io/badge/GitHub-numanrki-181717?style=flat-square&logo=github&logoColor=white" alt="GitHub" /></a>
</p>

<p align="center">
  <sub>Built with ❤️ using Laravel, React, and TypeScript</sub>
</p>
