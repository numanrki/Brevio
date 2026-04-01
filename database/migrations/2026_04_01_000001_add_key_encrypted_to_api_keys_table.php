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
            if (!Schema::hasColumn('api_keys', 'key_encrypted')) {
                $table->text('key_encrypted')->nullable()->after('key');
            }
            if (!Schema::hasColumn('api_keys', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('scopes');
            }
            if (!Schema::hasColumn('api_keys', 'last_used_at')) {
                $table->timestamp('last_used_at')->nullable()->after('is_active');
            }
            if (!Schema::hasColumn('api_keys', 'expires_at')) {
                $table->timestamp('expires_at')->nullable()->after('last_used_at');
            }
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('api_keys')) {
            return;
        }

        Schema::table('api_keys', function (Blueprint $table) {
            $cols = [];
            foreach (['key_encrypted', 'is_active', 'last_used_at', 'expires_at'] as $col) {
                if (Schema::hasColumn('api_keys', $col)) {
                    $cols[] = $col;
                }
            }
            if ($cols) {
                $table->dropColumn($cols);
            }
        });
    }
};
