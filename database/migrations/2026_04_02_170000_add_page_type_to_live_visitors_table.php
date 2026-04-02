<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('live_visitors')) return;
        if (Schema::hasColumn('live_visitors', 'page_type')) return;

        Schema::table('live_visitors', function (Blueprint $table) {
            $table->string('page_type', 20)->nullable()->after('page')->index();
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('live_visitors')) return;
        if (!Schema::hasColumn('live_visitors', 'page_type')) return;

        Schema::table('live_visitors', function (Blueprint $table) {
            $table->dropColumn('page_type');
        });
    }
};
