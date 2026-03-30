<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pixels', function (Blueprint $table) {
            if (!Schema::hasColumn('pixels', 'type')) {
                $table->string('type', 20)->default('page_view')->after('pixel_id');
            }
            if (!Schema::hasColumn('pixels', 'token')) {
                $table->string('token', 32)->unique()->nullable()->after('type');
            }
            if (!Schema::hasColumn('pixels', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('token');
            }
            if (!Schema::hasColumn('pixels', 'total_fires')) {
                $table->unsignedInteger('total_fires')->default(0)->after('is_active');
            }
        });
    }

    public function down(): void
    {
        Schema::table('pixels', function (Blueprint $table) {
            $table->dropColumn(['type', 'token', 'is_active', 'total_fires']);
        });
    }
};
