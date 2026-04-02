<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Change provider from enum to varchar so any value (including 'brevio') is accepted
        if (Schema::hasTable('pixels') && Schema::hasColumn('pixels', 'provider')) {
            DB::statement("ALTER TABLE `pixels` MODIFY `provider` VARCHAR(50) NOT NULL DEFAULT 'brevio'");
        }
    }

    public function down(): void
    {
        // Revert to original enum if needed
        if (Schema::hasTable('pixels') && Schema::hasColumn('pixels', 'provider')) {
            DB::statement("ALTER TABLE `pixels` MODIFY `provider` ENUM('facebook','google_ads','linkedin','twitter','adroll','quora','gtm','ga','snapchat','pinterest','reddit','bing','tiktok') NOT NULL");
        }
    }
};
