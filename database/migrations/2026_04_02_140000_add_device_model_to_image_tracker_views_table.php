<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('image_tracker_views')) return;
        if (Schema::hasColumn('image_tracker_views', 'device_model')) return;

        Schema::table('image_tracker_views', function (Blueprint $table) {
            $table->string('device_model', 80)->nullable()->after('device');
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('image_tracker_views')) return;
        if (!Schema::hasColumn('image_tracker_views', 'device_model')) return;

        Schema::table('image_tracker_views', function (Blueprint $table) {
            $table->dropColumn('device_model');
        });
    }
};
