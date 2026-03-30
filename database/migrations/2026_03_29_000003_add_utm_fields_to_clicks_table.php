<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('clicks', function (Blueprint $table) {
            if (!Schema::hasColumn('clicks', 'utm_source')) {
                $table->string('utm_source', 100)->nullable()->after('language');
            }
            if (!Schema::hasColumn('clicks', 'utm_medium')) {
                $table->string('utm_medium', 100)->nullable()->after('utm_source');
            }
            if (!Schema::hasColumn('clicks', 'utm_campaign')) {
                $table->string('utm_campaign', 100)->nullable()->after('utm_medium');
            }
        });
    }

    public function down(): void
    {
        Schema::table('clicks', function (Blueprint $table) {
            $table->dropColumn(['utm_source', 'utm_medium', 'utm_campaign']);
        });
    }
};
