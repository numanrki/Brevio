<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('api_keys') && !Schema::hasColumn('api_keys', 'key_encrypted')) {
            Schema::table('api_keys', function (Blueprint $table) {
                $table->text('key_encrypted')->nullable()->after('key');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('api_keys', 'key_encrypted')) {
            Schema::table('api_keys', function (Blueprint $table) {
                $table->dropColumn('key_encrypted');
            });
        }
    }
};
