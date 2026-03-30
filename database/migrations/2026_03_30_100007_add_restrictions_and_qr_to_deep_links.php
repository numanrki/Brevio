<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add allowed_devices to deep_links
        if (!Schema::hasColumn('deep_links', 'allowed_devices')) {
            Schema::table('deep_links', function (Blueprint $table) {
                $table->json('allowed_devices')->nullable()->after('is_active');
            });
        }

        // Add deep_link_id to qr_codes
        if (!Schema::hasColumn('qr_codes', 'deep_link_id')) {
            Schema::table('qr_codes', function (Blueprint $table) {
                $table->foreignId('deep_link_id')->nullable()->after('bio_id')->constrained()->nullOnDelete();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('deep_links', 'allowed_devices')) {
            Schema::table('deep_links', function (Blueprint $table) {
                $table->dropColumn('allowed_devices');
            });
        }
        if (Schema::hasColumn('qr_codes', 'deep_link_id')) {
            Schema::table('qr_codes', function (Blueprint $table) {
                $table->dropForeign(['deep_link_id']);
                $table->dropColumn('deep_link_id');
            });
        }
    }
};
