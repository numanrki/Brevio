<p align="center">
  <img src="https://img.shields.io/badge/Brevio-URL%20Shortener-7c3aed?style=for-the-badge&logo=link&logoColor=white" alt="Brevio" />
</p>

<h1 align="center">Brevio</h1>

<p align="center">
  <strong>A modern, full-featured URL shortener & link management platform</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Laravel-12-FF2D20?style=flat-square&logo=laravel&logoColor=white" alt="Laravel 12" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 18" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Inertia.js-2-9553E9?style=flat-square&logo=inertia&logoColor=white" alt="Inertia.js" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License" />
</p>

<p align="center">
  Built with Laravel 12, Inertia.js, React 18 & TypeScript.<br/>
  Shorten links, generate QR codes, build bio pages, track analytics — all from one dashboard.
</p>

---

## ✨ Features

### Core
- **URL Shortening** — Custom aliases, password protection, expiry dates, and soft deletes
- **Click Analytics** — Real-time tracking with country, city, browser, OS, device, referrer & language detection
- **QR Code Generator** — Styled QR codes with 5 types (URL, Text, Email, Phone, WiFi), custom colors, and multi-format downloads (SVG, PNG, Transparent PNG, JPG)
- **Bio Pages** — Linktree-style link-in-bio builder with theme presets, custom CSS, ordered widgets (links, social, text, headings), and view tracking

### Advanced Link Targeting
- **Geo Targeting** — Redirect users based on country
- **Device Targeting** — Separate destinations for mobile, tablet, desktop
- **Language Targeting** — Redirect by browser language
- **A/B Testing** — Split traffic across multiple destination URLs

### Marketing Tools
- **Custom Domains** — Brand your short links with your own domain
- **Campaigns** — Organize links into campaign groups
- **Channels** — Polymorphic tagging system with color labels
- **CTA Overlays** — 6 overlay types (contact form, image, message, poll, newsletter, coupon) on destination pages
- **Splash Pages** — Interstitial pages before redirect
- **Retargeting Pixels** — 13 ad platform integrations (Facebook, Google Ads, LinkedIn, Twitter, TikTok, Snapchat, Pinterest, Reddit, Bing, AdRoll, Quora, GA, GTM)

### Platform
- **Team Collaboration** — Workspaces with role-based permissions and email invitations
- **SaaS Billing** — Subscription plans (free/monthly/yearly/lifetime) with Stripe & Paddle integration, coupons
- **Admin Panel** — Full management of users, links, plans, domains, pages, reports & settings
- **REST API** — Sanctum-authenticated endpoints for account, links, and QR codes
- **Two-Factor Auth** — TOTP-based 2FA support
- **CMS** — Admin-managed static pages with SEO and menu support
- **FAQ System** — Categorized FAQ management
- **Abuse Reporting** — URL reporting with admin review workflow

---

## 🛠 Tech Stack

| Layer | Technology | Version |
|:------|:-----------|:--------|
| Backend | Laravel | 12 |
| Frontend | React | 18 |
| Language | TypeScript | 5 |
| Bridge | Inertia.js | 2 |
| Styling | Tailwind CSS | 3 |
| UI Components | Headless UI | 2 |
| Build Tool | Vite | 7 |
| Auth Scaffold | Laravel Breeze | — |
| API Auth | Laravel Sanctum | 4 |
| JS Routing | Ziggy | 2 |
| QR Rendering | qrcode.react | 4 |
| PHP | PHP | 8.2+ |
| Database | MySQL / SQLite | — |

---

## 📦 Installation

### Prerequisites

- PHP 8.2+
- Composer
- Node.js 18+ & npm
- MySQL 8.0+ (or SQLite)

### Setup

```bash
# Clone the repository
git clone https://github.com/numanrki/Brevio.git
cd Brevio

# Install PHP dependencies
composer install

# Install Node dependencies
npm install

# Environment setup
cp .env.example .env
php artisan key:generate
```

### Database Configuration

Edit `.env` with your database credentials:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=brevio
DB_USERNAME=root
DB_PASSWORD=
```

Run migrations:

```bash
php artisan migrate
```

### Build Frontend

```bash
# Development (with hot reload)
npm run dev

# Production build
npm run build
```

### Start the Server

```bash
# Using the built-in dev command (starts server, queue, logs & Vite)
composer dev

# Or manually
php artisan serve
```

Visit `http://localhost:8000` in your browser.

---

## 🚀 Quick Start

1. Register a new account at `/register`
2. Create your first short link from the dashboard
3. Share the short URL — clicks are tracked automatically
4. Generate QR codes for any link with one click
5. Build a bio page at `/dashboard/bio`

### Default Admin Access

After seeding or manual setup, use admin credentials to access `/admin`.

---

## 📁 Project Structure

```
├── app/
│   ├── Http/Controllers/
│   │   ├── Admin/          # Admin panel controllers
│   │   ├── Api/            # REST API controllers
│   │   └── User/           # User dashboard controllers
│   ├── Models/             # 23 Eloquent models
│   └── ...
├── database/
│   └── migrations/         # 23+ migration files
├── resources/
│   └── js/
│       ├── Components/     # Reusable React components
│       ├── Layouts/        # Dashboard & admin layouts
│       ├── Pages/          # Inertia page components
│       │   ├── Admin/      # Admin panel pages
│       │   ├── Auth/       # Authentication pages
│       │   ├── Bio/        # Public bio pages
│       │   ├── Dashboard/  # User dashboard pages
│       │   └── Profile/    # Profile management
│       ├── types/          # TypeScript type definitions
│       └── utils.ts        # URL helper utilities
├── routes/
│   ├── web.php             # Web routes
│   ├── api.php             # API routes
│   └── auth.php            # Auth routes
└── public/                 # Compiled assets
```

---

## 🗄 Database Schema

Brevio uses **23+ database tables** covering:

| Category | Tables |
|:---------|:-------|
| **Core** | `urls`, `clicks`, `qr_codes` |
| **Bio Pages** | `bios`, `bio_widgets` |
| **Marketing** | `campaigns`, `channels`, `overlays`, `splash_pages`, `pixels` |
| **Domains** | `domains` |
| **Teams** | `teams`, `team_members` |
| **Billing** | `plans`, `subscriptions`, `payments`, `coupons` |
| **CMS** | `pages`, `faqs`, `faq_categories` |
| **Admin** | `settings`, `reports` |
| **Auth** | `users`, `sessions`, `password_reset_tokens` |

---

## 🔌 API

Brevio includes a RESTful API authenticated via Laravel Sanctum (Bearer token).

### Endpoints

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

### Authentication

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
     https://your-domain.com/api/links
```

---

## 🎨 Screenshots

> Coming soon — screenshots of the dashboard, bio builder, QR code generator, and admin panel.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Numan** — [@numanrki](https://github.com/numanrki)

---

<p align="center">
  <sub>Built with ❤️ using Laravel, React & TypeScript</sub>
</p>
