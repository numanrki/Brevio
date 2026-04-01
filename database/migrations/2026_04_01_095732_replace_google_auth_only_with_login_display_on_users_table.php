<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'login_display')) {
                $table->string('login_display', 20)->default('both')->after('google_id');
            }
            if (Schema::hasColumn('users', 'google_auth_only')) {
                $table->dropColumn('google_auth_only');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'google_auth_only')) {
                $table->boolean('google_auth_only')->default(false)->after('google_id');
            }
            if (Schema::hasColumn('users', 'login_display')) {
                $table->dropColumn('login_display');
            }
        });
    }
};
