<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('clicks', function (Blueprint $table) {
            try { $table->index('browser'); } catch (\Throwable $e) {}
            try { $table->index('os'); } catch (\Throwable $e) {}
            try { $table->index('device'); } catch (\Throwable $e) {}
            try { $table->index('language'); } catch (\Throwable $e) {}
        });
    }

    public function down(): void
    {
        Schema::table('clicks', function (Blueprint $table) {
            $table->dropIndex(['browser']);
            $table->dropIndex(['os']);
            $table->dropIndex(['device']);
            $table->dropIndex(['language']);
        });
    }
};
