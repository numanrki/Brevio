<?php

namespace Database\Seeders;

use App\Models\Plan;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create Free Plan
        $freePlan = Plan::create([
            'name' => 'Free',
            'slug' => 'free',
            'description' => 'Get started with basic URL shortening',
            'free' => true,
            'price_monthly' => 0,
            'price_yearly' => 0,
            'price_lifetime' => 0,
            'limits' => [
                'links' => 50,
                'clicks' => 10000,
                'domains' => 0,
                'bio_pages' => 1,
                'qr_codes' => 5,
                'pixels' => 0,
                'teams' => 0,
            ],
            'features' => [
                'custom_alias' => false,
                'password_protection' => false,
                'expiration' => false,
                'geo_targeting' => false,
                'device_targeting' => false,
                'api_access' => false,
                'ab_testing' => false,
                'overlays' => false,
            ],
            'is_active' => true,
            'position' => 0,
        ]);

        // Create Pro Plan
        Plan::create([
            'name' => 'Pro',
            'slug' => 'pro',
            'description' => 'For professionals and small businesses',
            'free' => false,
            'price_monthly' => 9.99,
            'price_yearly' => 99.99,
            'price_lifetime' => 199.99,
            'limits' => [
                'links' => 1000,
                'clicks' => 100000,
                'domains' => 3,
                'bio_pages' => 10,
                'qr_codes' => 50,
                'pixels' => 10,
                'teams' => 1,
            ],
            'features' => [
                'custom_alias' => true,
                'password_protection' => true,
                'expiration' => true,
                'geo_targeting' => true,
                'device_targeting' => true,
                'api_access' => true,
                'ab_testing' => false,
                'overlays' => true,
            ],
            'is_active' => true,
            'position' => 1,
        ]);

        // Create Business Plan
        Plan::create([
            'name' => 'Business',
            'slug' => 'business',
            'description' => 'For teams and growing businesses',
            'free' => false,
            'price_monthly' => 29.99,
            'price_yearly' => 299.99,
            'price_lifetime' => 599.99,
            'limits' => [
                'links' => -1,
                'clicks' => -1,
                'domains' => 10,
                'bio_pages' => -1,
                'qr_codes' => -1,
                'pixels' => -1,
                'teams' => 5,
            ],
            'features' => [
                'custom_alias' => true,
                'password_protection' => true,
                'expiration' => true,
                'geo_targeting' => true,
                'device_targeting' => true,
                'api_access' => true,
                'ab_testing' => true,
                'overlays' => true,
            ],
            'is_active' => true,
            'position' => 2,
        ]);

        // Create Admin User
        User::create([
            'name' => 'Admin',
            'email' => 'admin@brevio.app',
            'username' => 'admin',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'plan_id' => $freePlan->id,
            'is_verified' => true,
            'email_verified_at' => now(),
        ]);

        // Create Demo User
        User::create([
            'name' => 'Demo User',
            'email' => 'demo@brevio.app',
            'username' => 'demo',
            'password' => Hash::make('password'),
            'role' => 'user',
            'plan_id' => $freePlan->id,
            'is_verified' => true,
            'email_verified_at' => now(),
        ]);

        // Default Settings
        $settings = [
            'site_name' => 'Brevio',
            'site_description' => 'Modern URL Shortener & Link Management Platform',
            'site_url' => 'http://localhost/welink',
            'mail_driver' => 'smtp',
            'mail_host' => '',
            'mail_port' => '587',
            'mail_username' => '',
            'mail_password' => '',
            'mail_from' => 'noreply@brevio.app',
            'google_analytics_id' => '',
            'facebook_url' => '',
            'twitter_url' => '',
            'custom_head_code' => '',
            'custom_footer_code' => '',
        ];

        foreach ($settings as $key => $value) {
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }
    }
}
