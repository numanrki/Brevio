<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Catch-all migration: ensures all Google OAuth columns exist
     * regardless of whether previous migrations ran in the wrong order.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'google_id')) {
                $table->string('google_id')->nullable()->unique();
            }
        });

        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'login_display')) {
                $table->string('login_display', 20)->default('both');
            }
        });

        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'google_require_2fa')) {
                $table->boolean('google_require_2fa')->default(false);
            }
        });

        // Drop legacy column if it still exists
        if (Schema::hasColumn('users', 'google_auth_only')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('google_auth_only');
            });
        }
    }

    public function down(): void
    {
        // intentionally empty — columns managed by their original migrations
    }
};
