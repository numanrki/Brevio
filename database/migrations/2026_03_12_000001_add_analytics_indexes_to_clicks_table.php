<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('clicks', function (Blueprint $table) {
            $table->index('browser');
            $table->index('os');
            $table->index('device');
            $table->index('language');
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
