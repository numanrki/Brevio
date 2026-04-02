<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('live_visitors')) return;

        Schema::create('live_visitors', function (Blueprint $table) {
            $table->id();
            $table->string('session_id', 64)->unique();
            $table->string('ip', 45)->nullable();
            $table->string('country', 5)->nullable();
            $table->string('city', 100)->nullable();
            $table->string('page', 500)->nullable();
            $table->string('browser', 30)->nullable();
            $table->string('os', 20)->nullable();
            $table->string('device', 10)->nullable();
            $table->timestamp('last_seen_at')->useCurrent();

            $table->index('last_seen_at');
            $table->index('country');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('live_visitors');
    }
};
