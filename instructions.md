# WeMakeLink - Complete Feature Documentation & Project Prompt

> A comprehensive URL shortener platform with advanced analytics, bio pages, QR codes, team management, and monetization capabilities.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Architecture](#3-architecture)
4. [Authentication System](#4-authentication-system)
5. [Admin Panel Features](#5-admin-panel-features)
6. [User Features](#6-user-features)
7. [Link Management](#7-link-management)
8. [Analytics & Statistics](#8-analytics--statistics)
9. [QR Code System](#9-qr-code-system)
10. [Bio / Link-in-Bio Pages](#10-bio--link-in-bio-pages)
11. [Overlay / CTA System](#11-overlay--cta-system)
12. [Splash Pages](#12-splash-pages)
13. [Pixel / Retargeting System](#13-pixel--retargeting-system)
14. [Campaign Management](#14-campaign-management)
15. [Channel Management](#15-channel-management)
16. [Team Management](#16-team-management)
17. [Custom Domains](#17-custom-domains)
18. [API System](#18-api-system)
19. [Payment & Subscription System](#19-payment--subscription-system)
20. [Custom Pages & FAQ](#20-custom-pages--faq)
21. [Affiliate System](#21-affiliate-system)
22. [Verification System](#22-verification-system)
23. [Email Management](#23-email-management)
24. [Advertising System](#24-advertising-system)
25. [Import / Export](#25-import--export)
26. [Plugin / Extension System](#26-plugin--extension-system)
27. [Theming & Customization](#27-theming--customization)
28. [Localization / Multi-Language](#28-localization--multi-language)
29. [Integration Features](#29-integration-features)
30. [Cron Jobs & Automation](#30-cron-jobs--automation)
31. [Security Features](#31-security-features)
32. [SEO & Public Features](#32-seo--public-features)
33. [Database Structure](#33-database-structure)
34. [File Structure](#34-file-structure)
35. [Configuration](#35-configuration)

---

## 1. Project Overview

WeMakeLink is a full-featured URL shortener and link management platform. It allows users to shorten URLs, track clicks with detailed analytics, create bio/profile pages, generate dynamic QR codes, manage teams, and monetize through subscription plans. The platform includes a complete admin panel for system-wide management.

### Core Capabilities
- URL shortening with custom aliases and branded domains
- Advanced click analytics (geo, device, browser, referrer, language)
- Dynamic QR code generation with custom styling
- Bio/Link-in-Bio page builder with 36+ widget types
- CTA overlays and splash pages
- Retargeting pixel integration (Facebook, Google, TikTok, etc.)
- Campaign and channel organization
- Team collaboration with granular permissions
- RESTful API for third-party integrations
- Multi-payment gateway subscription system
- Custom pages, FAQ, and help center CMS
- Affiliate program
- Plugin/extension architecture
- Multi-language support with auto-translation
- Multiple theme support with dark mode

---

## 2. Tech Stack

| Component | Technology |
|-----------|-----------|
| **Backend** | PHP 7.4+ (GemPixel Framework - custom MVC) |
| **Database** | MySQL / MariaDB with ORM |
| **Frontend** | Bootstrap 4, JavaScript, jQuery |
| **CSS** | Custom CSS with dark mode support |
| **Icons** | Feather Icons, Font Awesome 5 |
| **QR Codes** | Endroid QR Code library + custom GD/Imagick renderers |
| **Payments** | Stripe, PayPal, Paddle, PayStack |
| **Email** | PHPMailer, Mailgun, Sendgrid, Postmark, Mailchimp |
| **Caching** | PHPFastCache |
| **Logging** | Monolog |
| **Auth** | bcrypt password hashing with AuthToken concatenation |
| **2FA** | Sonata Google Authenticator (TOTP) |
| **Social Login** | Facebook, Google, Twitter OAuth |

---

## 3. Architecture

### MVC Pattern
```
app/
├── controllers/          # Request handlers
│   ├── admin/           # Admin panel controllers (25 controllers)
│   ├── user/            # User dashboard controllers (17 controllers)
│   ├── api/             # REST API controllers (11 controllers)
│   └── *.php            # Public/auth controllers (14 controllers)
├── models/              # Database models (Plans, Settings, Url, User)
├── traits/              # Shared behaviors (Links, Overlays, Payments, Pixels)
├── helpers/             # Utility classes (App, QR, CDN, Emails, etc.)
├── middleware/          # Request middleware (Auth, CSRF, Throttle, etc.)
├── config/              # App configuration files
└── routes.php           # All route definitions

core/                    # Framework core classes
├── Auth.class.php       # Authentication
├── DB.class.php         # Database abstraction
├── View.class.php       # Template rendering
├── Request.class.php    # HTTP request handling
├── Response.class.php   # HTTP response
├── Middleware.class.php # Middleware pipeline
├── Plugin.class.php     # Plugin system
├── Localization.class.php # i18n
└── ...

storage/
├── themes/              # Theme templates (default, the23)
│   └── default/
│       ├── layouts/     # Base layouts (main.php)
│       ├── admin/       # Admin panel views
│       ├── user/        # User dashboard views
│       ├── partials/    # Shared partials
│       └── ...          # Feature-specific views
├── languages/           # Translation files
├── plugins/             # Installed plugins
├── cache/               # Application cache
└── logs/                # Application logs

public/                  # Web root (DocumentRoot)
├── static/              # CSS, JS, images
└── content/             # User uploads (avatars, images, QR codes)
```

### Request Flow
1. All requests hit `public/index.php` via `.htaccess` rewrite
2. Framework bootstraps (config, database, session, middleware)
3. Router matches URL to controller action via `app/routes.php`
4. Middleware pipeline runs (Auth, CSRF, Throttle, etc.)
5. Controller processes request, interacts with models
6. View renders template from `storage/themes/{active_theme}/`
7. Response sent to client

---

## 4. Authentication System

### Login & Registration
- Email/password login with session management
- User registration with optional email verification/activation
- Password reset via email token
- "Remember me" persistent login

### Two-Factor Authentication (2FA)
- TOTP-based 2FA using Google Authenticator protocol
- QR code scanning for easy setup
- Recovery code system for account access
- Compatible with: Google Authenticator, Microsoft Authenticator, Authy, 1Password
- Enable/disable per user from account settings
- Admin can view 2FA status of all users

### Social Login
- **Facebook OAuth** - Login/register via Facebook
- **Google OAuth** - Login/register via Google
- **Twitter OAuth** - Login/register via Twitter
- SSO (Single Sign-On) via token-based authentication

### Security Middleware
- **Auth** - Route protection for logged-in users
- **CSRF** - Cross-site request forgery protection on all forms
- **Throttle** - Rate limiting on login attempts
- **ShortenThrottle** - Rate limiting on URL shortening
- **BlockBot** - Bot detection and blocking
- **ValidateCaptcha** - CAPTCHA validation on public forms
- **ValidateLoggedCaptcha** - CAPTCHA for logged-in users
- **CheckMaintenance** - Maintenance mode gate
- **CheckPrivate** - Private mode (logged-in users only)
- **CheckDomain** - Domain validation
- **DemoProtect** - Demo mode protection (blocks destructive actions)

### Password Hashing
- bcrypt with cost factor 8
- AuthToken concatenation before hashing (password + AuthToken)
- Changing AuthToken invalidates ALL existing passwords

---

## 5. Admin Panel Features

### Dashboard
- Overview cards: total links, clicks, users, revenue
- Latest shortened links table
- Top performing links
- Recent user registrations
- Pending reports for review
- Quick stats and system health

### User Management
- List all users with filtering (active, inactive, banned, admin)
- Search users by name, email, or username
- Create new user accounts
- Edit any user's profile, plan, and permissions
- Delete individual users or bulk delete
- Ban/unban users (individual or bulk)
- Send email to individual users
- Login as any user (impersonation for support)
- Verify/unverify user accounts
- Import users from CSV
- View and manage user teams

### Settings Management
- General settings (site name, URL, timezone, etc.)
- Email configuration (SMTP, provider selection)
- Integration settings (social login, APIs)
- Theme settings (colors, hero image, dark mode)
- Security settings (CAPTCHA, blacklists)
- CDN configuration and file sync
- Slack integration manifest

### Platform Statistics
- Platform-wide click stats over time (charts)
- User registration graphs
- Geographic click heatmap (world map)
- Revenue and subscription analytics
- Membership statistics
- Date range filtering

### Admin Tools
- Database optimization (add performance indexes)
- Bulk delete old/expired URLs by date range
- Bulk delete inactive users
- Flush all URLs (mass reset)
- Export URLs, users, payments to CSV
- Clear application cache
- Edit robots.txt
- Database backup and restore
- Orphaned data cleanup

---

## 6. User Features

### User Dashboard
- Personal link overview with search and filtering
- Quick link shortening from dashboard
- Recent links table
- Click statistics summary
- Account plan info and usage

### Account Settings
- Update profile (name, email, username, avatar)
- Change password
- Enable/disable 2FA
- API key management
- Newsletter subscription toggle
- Account deletion (self-service)
- Billing and subscription management

### Tools
- Browser bookmarklet for quick shortening
- JavaScript embed code for websites
- Quick shortening tool
- Full-page shortening form with all options

---

## 7. Link Management

### URL Shortening
- Shorten any URL with auto-generated or custom alias
- Bulk shortening (paste multiple URLs at once)
- Premium alias reservation (pro feature)
- Domain selection (choose from available branded domains)
- Link preview before creation

### Link Safety & Validation
- Domain blacklist checking
- Keyword blacklist filtering
- Google Safe Browsing API integration
- Phishtank phishing URL detection
- VirusTotal malware scanning
- Executable file extension blocking
- Reserved word/slug prevention

### Advanced Link Options
- **Geo-targeting**: Redirect to different URLs based on visitor country/state
- **Device targeting**: Different destinations for mobile, tablet, desktop, iOS, Android
- **Language targeting**: Redirect based on browser language
- **Link expiration**: Set auto-expire date/time
- **Password protection**: Require password to access destination
- **Custom meta tags**: Set title, description, OG image for social sharing
- **Public/private toggle**: Control link visibility
- **A/B testing**: Split traffic between multiple destination URLs
- **Deep linking**: Smart redirects for mobile apps (YouTube, Amazon, Facebook, Instagram, Spotify, WhatsApp, Messenger, TikTok, Snapchat, Apple Music, Telegram, Pinterest, LinkedIn, Twitter, etc.)

### Link Administration
- Archive/unarchive links
- View expired links separately
- Delete single or bulk links
- Assign links to campaigns
- Assign overlays to links
- Assign pixels to links
- Reset link statistics
- Edit all link properties after creation

### Admin Link Management
- View all links across all users
- Filter: all, expired, archived, pending, anonymous
- Link reporting system (users report → admin reviews)
- Actions: approve pending, ban link + user, delete + ban
- Bulk actions: enable/disable/delete selected
- Import links via CSV

---

## 8. Analytics & Statistics

### Per-Link Analytics
- **Click tracking**: Total clicks over time (daily/weekly/monthly charts)
- **Geographic data**: Country and city-level breakdown with interactive world map
- **Operating system**: Windows, macOS, Linux, iOS, Android breakdown
- **Browser data**: Chrome, Firefox, Safari, Edge, etc.
- **Language**: Visitor browser language distribution
- **Referrer tracking**: Traffic source identification (direct, social, search, etc.)
- **A/B test results**: Performance comparison between split test URLs
- **Activity log**: Recent individual click events with details

### User-Level Statistics
- Aggregate stats across all user's links
- Total links created over time graph
- Total clicks received over time graph
- Geographic click map for all links

### Campaign Statistics
- Click tracking per campaign
- Geographic breakdown per campaign
- Browser and OS analytics per campaign

### Public Stats
- Optional public stats page (accessible via `alias+` URL)
- Simple stats view for non-logged-in visitors

### Data Export
- Export link stats to CSV
- Export campaign stats
- Export individual link data

---

## 9. QR Code System

### QR Code Creation
- Generate QR codes for any shortened URL
- Extensive customization options:
  - **Colors**: Custom foreground and background colors
  - **Gradients**: Gradient color fills
  - **Frames**: Custom frames with text labels and colors
  - **Logo overlay**: Upload and embed logo/image in center
  - **Styles/patterns**: Multiple QR dot patterns
  - **Size**: Custom dimensions

### QR Code Management
- Edit existing QR code styling
- Delete QR codes (single or bulk)
- Duplicate QR codes
- Bulk QR code creation
- Download in multiple formats (PNG, SVG) and custom sizes
- Bulk download all QR codes as ZIP

### Admin QR Management
- View all QR codes across all users
- Delete any QR code
- Reassign QR codes to different users

### Public QR Features
- Generate QR code for any short link from public interface
- Download QR from link stats page
- Server-side QR generation API endpoint

---

## 10. Bio / Link-in-Bio Pages

### Bio Page Builder
- Create unlimited bio/profile pages (plan-dependent)
- Drag-and-drop widget ordering
- Toggle individual widgets on/off
- Preview before publishing
- Set default bio page
- Duplicate bio pages
- Custom themes and colors

### Widget Types (36+ Widgets)

**Content Widgets:**
- Tagline
- Heading
- Text block
- Divider/separator
- External link
- Raw HTML embed
- Image

**Contact Widgets:**
- Phone call button
- vCard download
- WhatsApp call
- WhatsApp message
- Contact form
- Newsletter signup

**Commerce Widgets:**
- PayPal payment button
- Product listing

**Media Embed Widgets:**
- YouTube video
- YouTube playlist
- Spotify embed
- Apple Music embed
- TikTok video embed
- SoundCloud embed
- OpenSea NFT embed

**Social Embed Widgets:**
- Twitter/X post
- Facebook post
- Instagram post
- Pinterest pin
- Reddit post
- Threads post
- TikTok profile
- Snapchat profile

**Utility Widgets:**
- RSS feed display
- FAQ accordion
- Google Maps embed
- Calendly scheduling
- OpenTable reservation
- EventBrite event
- Typeform survey

### Bio Themes (Admin)
- Create custom bio themes with color pickers:
  - Text color, card background, button colors, gradient backgrounds
- Edit, update, delete themes
- Theme preview with live color updates

### Admin Bio Management
- View all bio pages across users
- Enable/disable bio pages
- Delete bio pages
- Reassign to different users

---

## 11. Overlay / CTA System

### Overlay Types
- **Contact Form Overlay**: Capture leads while displaying linked page in iframe
- **Image Overlay**: Branded image banner on linked page
- **Message Overlay**: Custom text/CTA message with button
- **Poll Overlay**: Collect user votes/opinions
- **Newsletter Overlay**: Email collection form
- **Coupon Overlay**: Display promotional discount codes

### Overlay Customization
- Custom colors (background, text, buttons)
- Custom positioning
- Custom text and call-to-action
- Logo/image upload
- Link to any URL from CTA button

### Overlay Management
- Create, edit, delete overlays
- Assign overlays to any shortened link
- View overlay performance

---

## 12. Splash Pages

- Create custom interstitial/splash pages shown before redirect
- Customization: branding, countdown timer, avatar, advertisement slots
- Edit and delete splash pages
- Toggle splash page status (active/inactive)
- Assign to links

---

## 13. Pixel / Retargeting System

### Supported Pixel Platforms
| Platform | Type |
|----------|------|
| Facebook Pixel | Retargeting |
| Google Ads / AdWords | Conversion tracking |
| LinkedIn Insight Tag | B2B retargeting |
| Twitter Pixel | Retargeting |
| AdRoll | Retargeting |
| Quora Pixel | Retargeting |
| Google Tag Manager | Tag management |
| Google Analytics | Analytics |
| Snapchat Pixel | Retargeting |
| Pinterest Tag | Retargeting |
| Reddit Pixel | Retargeting |
| Bing UET | Conversion tracking |
| TikTok Pixel | Retargeting |

### Pixel Management
- Create pixels with provider-specific IDs
- Edit and delete pixels
- Assign pixels to links in bulk
- Assign pixels to bio pages
- Fire pixel events on link click automatically

---

## 14. Campaign Management

- Create campaigns to group related links
- Edit campaign name and details
- Delete campaigns
- Assign/remove links to/from campaigns
- Campaign-level analytics:
  - Click tracking over time
  - Geographic heatmap
  - Browser breakdown
  - OS/platform breakdown
- Export campaign statistics

---

## 15. Channel Management

- Create channels (organizational folders)
- Add links, bio pages, and QR codes to channels
- Remove items from channels
- Star/favorite channels for quick access
- View channel contents with filtering
- Edit and delete channels

---

## 16. Team Management

- Invite team members by email
- Granular permission system:
  - Links (create, edit, delete)
  - Bio pages management
  - QR code management
  - Overlay management
  - Pixel management
  - Campaign management
  - Domain management
  - Stats viewing
- Edit team member roles/permissions
- Remove team members
- Toggle member active status
- Switch between team accounts
- Accept team invitations via link

---

## 17. Custom Domains

### User Domain Management
- Add custom branded domains for URL shortening
- Configure domain settings:
  - Root redirect URL
  - Custom 404 page
- Delete custom domains
- Select domain when creating short links

### Admin Domain Management
- View all custom domains with status filtering
- Add new domains system-wide
- Approve/reject user-submitted domains
- Activate, disable, or set domains to pending
- Delete domains

---

## 18. API System

### Authentication
- API key-based authentication (per-user keys)
- Rate limiting on API requests

### Available Endpoints

**Links API:**
- `GET /api/links` - List all links (with pagination)
- `POST /api/links` - Create new short link
- `GET /api/links/{id}` - Get link details
- `PUT /api/links/{id}` - Update link
- `DELETE /api/links/{id}` - Delete link

**QR Codes API:**
- `GET /api/qr` - List QR codes
- `POST /api/qr` - Create QR code
- `GET /api/qr/{id}` - Get QR details
- `PUT /api/qr/{id}` - Update QR code
- `DELETE /api/qr/{id}` - Delete QR code

**Account API:**
- `GET /api/account` - Get account info
- `PUT /api/account/update` - Update account

**Domains API:**
- `GET /api/domains` - List domains
- `POST /api/domains` - Add domain
- `PUT /api/domains/{id}` - Update domain
- `DELETE /api/domains/{id}` - Delete domain

**Campaigns API:**
- `GET /api/campaigns` - List campaigns
- `POST /api/campaigns` - Create campaign
- `PUT /api/campaigns/{id}` - Update campaign
- `DELETE /api/campaigns/{id}` - Delete campaign
- `POST /api/campaigns/{id}/assign/{linkid}` - Assign link to campaign

**Channels API:**
- `GET /api/channels` - List channels
- `POST /api/channels` - Create channel
- `PUT /api/channels/{id}` - Update channel
- `DELETE /api/channels/{id}` - Delete channel

**Pixels API:**
- `GET /api/pixels` - List pixels
- `POST /api/pixels` - Create pixel
- `PUT /api/pixels/{id}` - Update pixel
- `DELETE /api/pixels/{id}` - Delete pixel

**Splash & Overlays API:**
- `GET /api/splash` - List splash pages
- `GET /api/overlay` - List overlays

**Admin-Only API:**
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `DELETE /api/users/{id}` - Delete user
- `GET /api/plans` - List plans
- `POST /api/plans/{id}/user/{userid}` - Subscribe user to plan

---

## 19. Payment & Subscription System

### Supported Payment Gateways

| Gateway | Single Payment | Subscriptions |
|---------|:-:|:-:|
| PayPal (Standard) | Yes | No |
| PayPal API | Yes | Yes |
| Stripe | Yes | Yes |
| Paddle | Yes | Yes |
| PayStack | Yes | Yes |
| Bank Transfer | Yes (Manual) | No |

### Subscription Features
- Pricing page with plan comparison table
- Checkout flow with coupon/voucher application
- Tax calculation based on user region
- Free trial support
- Auto-renewal via subscriptions
- Subscription cancellation (self-service)
- Invoice generation and PDF viewing
- Billing portal (Stripe/Paddle)
- Plan upgrade/downgrade

### Admin Financial Management
- View/manage all subscriptions (cancel, expire, activate)
- View/manage all payments (mark paid/refunded, delete)
- Generate invoices
- **Coupon management**: Create percentage or fixed-amount discount coupons with expiry dates
- **Voucher management**: Create individual or bulk vouchers that grant plan access
- **Tax management**: Create tax rates by region/country
- **Plan management**: Create/edit/delete subscription plans with feature limits, sync with payment processors

### Plan Feature Limits (configurable per plan)
- Number of links allowed
- Number of bio pages
- Number of QR codes
- Number of custom domains
- Number of overlays/CTA
- Number of pixels
- Number of team members
- Number of splash pages
- Number of campaigns
- Click limit
- API access toggle
- Feature toggles (geo-targeting, device targeting, etc.)

---

## 20. Custom Pages & FAQ

### Custom Pages
- Create static pages (About, Terms, Privacy, etc.)
- Rich text editor for content
- Custom slugs and SEO meta tags
- Menu visibility control
- Multi-language support for pages
- Page categories

### FAQ System
- Create FAQ entries with question/answer
- FAQ categories (create, edit, delete)
- FAQ display on pricing page
- Individual FAQ management (edit, delete)

### Help Center
- Help article categories
- Help article search
- Article helpfulness voting (up/down)
- Category browsing

---

## 21. Affiliate System

- Users can join affiliate program
- Custom referral link per affiliate
- Commission tracking on referrals
- Admin management:
  - View all affiliate referrals
  - Approve/reject affiliate applications
  - Mark payments as paid
  - View payment history
  - Configure affiliate program settings (commission rate, etc.)
  - Delete affiliates

---

## 22. Verification System

- Users can submit identity verification documents
- Upload document images for review
- Admin verification queue:
  - Review submitted documents
  - Approve or reject verification requests
  - Verified badge displayed on user profile

---

## 23. Email Management

### Admin Email Tools
- Send bulk emails to user segments:
  - Newsletter subscribers
  - Active users
  - Inactive users
  - Free users
  - Paid/subscribed users
  - All users
  - Filter by country
- Email template management (create, edit, delete reusable templates)
- Rich text email editor
- Send email to individual users

### Email Providers Supported
- SMTP (PHPMailer)
- Mailgun API
- SendGrid API
- Postmark API
- Mailchimp (newsletter)

---

## 24. Advertising System

- Create ad placements with custom HTML/JavaScript
- Multiple ad slots throughout the site
- Enable/disable individual ad placements
- Support for any ad network (Google AdSense, custom ads, etc.)
- Ad display on splash pages, stats pages, etc.

---

## 25. Import / Export

### User-Level
- Import links from CSV file (background processing via cron)
- Cancel pending imports
- Export all links to CSV
- Export statistics data
- Export campaign statistics

### Admin-Level
- Import links via CSV
- Export all URLs to CSV
- Export all users to CSV
- Export all payments to CSV
- Import users from CSV

---

## 26. Plugin / Extension System

- Upload and install plugins (ZIP packages)
- Activate/disable installed plugins
- Browse plugin marketplace/directory
- Install plugins directly from marketplace
- Delete plugins
- Plugin hook system throughout application for extensibility:
  - Hooks on: link creation, link redirect, user registration, admin actions, etc.

---

## 27. Theming & Customization

### Theme System
- Multiple theme support with one-click activation
- Upload new themes (ZIP packages)
- Clone existing themes for customization
- Built-in theme file editor (edit templates directly from admin)
- Two built-in themes: `default` and `the23`

### Customization Options
- Custom CSS injection
- Custom JavaScript injection
- Custom header/footer code
- Menu management (custom navigation items, ordering)
- Dark mode toggle (user preference + admin default)
- Custom font selection
- Hero image customization
- Home page style (light/dark)
- Custom colors via theme configuration

---

## 28. Localization / Multi-Language

- Full multi-language support
- Language file management (create, edit, delete, upload language packs)
- Language sync (update translation keys when app updates)
- Automatic translation via Google Translate API integration
- Set default application language
- URL-based locale prefix routing (e.g., `/en/`, `/fr/`)
- RTL (Right-to-Left) language support

---

## 29. Integration Features

### Built-in Integrations
- **Slack**: Webhook-based link shortening directly from Slack channels
- **Zapier**: Webhook triggers for automation workflows
- **WordPress**: Plugin for shortening links from WordPress admin
- **Apple Shortcuts**: iOS/macOS shortcut for quick shortening
- **Browser Bookmarklet**: One-click shortening from any webpage
- **JavaScript Embed**: Embed shortening form on external websites

### Developer Integrations
- Full REST API (see Section 18)
- Webhook endpoints for payment callbacks
- Plugin architecture for custom integrations

---

## 30. Cron Jobs & Automation

| Cron Job | Description |
|----------|-------------|
| User Cleanup | Remove inactive/expired user accounts |
| Data Cleanup | Purge old statistics and temporary data |
| URL Maintenance | Check expired links, process scheduled changes |
| Subscription Reminders | Send emails X days before subscription expires |
| Import Processing | Background CSV import handling |

---

## 31. Security Features

### Application Security
- bcrypt password hashing with AuthToken salt
- CSRF token protection on all forms
- Rate limiting (login, API, shortening)
- Bot detection and blocking
- CAPTCHA support (on login, register, contact, shorten forms)
- Input sanitization and validation
- SQL injection protection via ORM
- XSS prevention
- Secure session management

### Link Safety
- Domain blacklist
- Keyword blacklist
- Google Safe Browsing API
- Phishtank phishing detection
- VirusTotal malware scanning
- Executable file blocking
- Link reporting system (user reports → admin review)
- Pending link moderation mode

### Account Security
- Two-Factor Authentication (TOTP)
- Password strength requirements
- Email verification
- Account lockout on failed attempts
- Maintenance mode
- Private mode (restrict to authenticated users)

---

## 32. SEO & Public Features

- XML sitemap generation (`/sitemap.xml`)
- SEO-friendly URLs for all public pages
- Custom meta tags (title, description, OG image) per link
- robots.txt editor
- Custom 404 pages
- Public user profiles (`/u/{username}`)
- Public link stats page (`/{alias}+`)
- Contact page with CAPTCHA-protected form
- Cookie/GDPR consent management
- Newsletter subscription/unsubscribe

---

## 33. Database Structure

### Core Tables (29 tables)

| Table | Purpose |
|-------|---------|
| `user` | User accounts (email, password, plan, 2FA, etc.) |
| `url` | Shortened URLs (alias, destination, settings, targeting) |
| `stats` | Click statistics (per-click data: IP, country, browser, OS, referrer) |
| `settings` | Application configuration key-value pairs |
| `plans` | Subscription plan definitions and feature limits |
| `payment` | Payment transaction records |
| `domains` | Custom branded domains |
| `splash` | Splash/interstitial page configurations |
| `overlay` | CTA overlay configurations |
| `pixels` | Retargeting pixel definitions |
| `bio` | Bio/link-in-bio page data |
| `profiles` | Bio page widget content (JSON) |
| `qrs` | QR code configurations and styling |
| `bundle` | Campaign/bundle definitions |
| `page` | Custom static pages |
| `faq` | FAQ entries |
| `faqs_categories` | FAQ categories |
| `coupon` | Discount coupons |
| `tax` | Tax rate definitions |
| `reports` | User-submitted link reports |
| `verification` | User verification submissions |
| `affiliate` | Affiliate program data |
| `affiliaterefers` | Affiliate referral tracking |
| `ads` | Advertisement placements |
| `help` | Help center articles |
| `helpcategories` | Help article categories |
| `languages` | Language/locale definitions |

---

## 34. File Structure

```
welink/
├── config.php              # Main configuration (DB, tokens, paths)
├── index.php               # Entry redirect to public/
├── composer.json            # PHP dependencies
├── wemakelink.sql           # Database schema
│
├── app/                     # Application code
│   ├── routes.php           # Route definitions
│   ├── core.php             # App bootstrap
│   ├── config/              # App config files (api, app, boot, cdn)
│   ├── controllers/
│   │   ├── admin/           # 25 admin controllers
│   │   ├── user/            # 17 user controllers
│   │   ├── api/             # 11 API controllers
│   │   └── *.php            # 14 public controllers
│   ├── models/              # 4 models (Plans, Settings, Url, User)
│   ├── traits/              # 4 traits (Links, Overlays, Payments, Pixels)
│   ├── helpers/             # Utility classes
│   │   ├── payments/        # Payment gateway implementations
│   │   └── qr/              # QR code renderers
│   └── middleware/          # 13 middleware classes
│
├── core/                    # Framework core (14 classes)
│   ├── functions/           # Core helper functions
│   └── support/             # Email provider classes
│
├── public/                  # Web root (Apache DocumentRoot)
│   ├── index.php            # Front controller
│   ├── static/              # Static assets (CSS, JS, images, fonts)
│   └── content/             # User uploads
│       ├── avatar/          # User avatars
│       ├── blog/            # Blog images
│       ├── images/          # General uploads
│       ├── profiles/        # Bio page assets
│       └── qr/              # Generated QR code images
│
├── storage/
│   ├── themes/              # Theme templates
│   │   ├── default/         # Default theme
│   │   └── the23/           # Alternative theme
│   ├── languages/           # Translation files
│   ├── plugins/             # Installed plugins
│   ├── cache/               # Application cache
│   └── logs/                # Application logs
│
└── vendor/                  # Composer dependencies
```

---

## 35. Configuration

### config.php Settings

| Setting | Description | Default |
|---------|-------------|---------|
| `DBhost` | MySQL host | `localhost` |
| `DBname` | Database name | `wemakelinks` |
| `DBuser` | Database username | `root` |
| `DBpassword` | Database password | (empty) |
| `DBprefix` | Table prefix | (empty) |
| `DBport` | MySQL port | `3306` |
| `BASEPATH` | URL base path | `AUTO` |
| `USECDN` | Use CDN for libraries | `true` |
| `CDNASSETS` | CDN URL for assets | `null` |
| `CDNUPLOADS` | CDN URL for uploads | `null` |
| `FORCEURL` | Force settings URL | `false` (dev) / `true` (prod) |
| `TIMEZONE` | Server timezone | `GMT+0` |
| `CACHE` | Enable caching | `true` |
| `DEBUG` | Debug mode | `1` (dev) / `0` (prod) |
| `AuthToken` | Password hashing salt | (unique per install) |
| `EncryptionToken` | Data encryption key | (unique per install) |
| `PublicToken` | Public API token | (unique per install) |

### Database Settings Table (key settings)
| Config Key | Description |
|------------|-------------|
| `url` | Application base URL |
| `title` | Site title |
| `description` | Site description |
| `email` | Admin notification email |
| `logo` | Site logo path |
| `lang` | Default language |
| `theme` | Active theme name |
| `cookieconsent` | Cookie consent configuration |
| `homepage_stats` | Show stats on homepage |
| `user_history` | Show user link history |
| `pro` | Pro-only shortening mode |
| `home_redir` | Homepage redirect URL |

---

## Summary Stats

| Component | Count |
|-----------|-------|
| Admin Controllers | 25 |
| User Controllers | 17 |
| API Controllers | 11 |
| Public Controllers | 14 |
| Models | 4 |
| Traits | 4 |
| Middleware | 13 |
| Database Tables | 29 |
| Bio Widget Types | 36+ |
| Pixel Integrations | 13 |
| Payment Gateways | 6 |
| Overlay Types | 6 |
| Supported Languages | Unlimited (translatable) |
| Themes | 2 built-in (extensible) |

---

*This document describes all features and capabilities of the WeMakeLink URL Shortener Platform.*
