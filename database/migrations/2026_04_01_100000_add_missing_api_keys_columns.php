<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('api_keys')) {
            return;
        }

        Schema::table('api_keys', function (Blueprint $table) {
            if (!Schema::hasColumn('api_keys', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('scopes');
            }
            if (!Schema::hasColumn('api_keys', 'last_used_at')) {
                $table->timestamp('last_used_at')->nullable()->after(
                    Schema::hasColumn('api_keys', 'is_active') ? 'is_active' : 'scopes'
                );
            }
            if (!Schema::hasColumn('api_keys', 'expires_at')) {
                $table->timestamp('expires_at')->nullable()->after(
                    Schema::hasColumn('api_keys', 'last_used_at') ? 'last_used_at' : 'scopes'
                );
            }
            if (!Schema::hasColumn('api_keys', 'key_encrypted')) {
                $table->text('key_encrypted')->nullable()->after('key');
            }
        });
    }

    public function down(): void
    {
        // Intentionally empty — these columns should not be removed
    }
};
