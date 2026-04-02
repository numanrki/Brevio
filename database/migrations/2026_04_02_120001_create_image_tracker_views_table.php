<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('image_tracker_views')) return;

        Schema::create('image_tracker_views', function (Blueprint $table) {
            $table->id();
            $table->foreignId('image_tracker_id')->constrained()->cascadeOnDelete();
            $table->string('ip', 45)->nullable();
            $table->string('country', 5)->nullable();
            $table->string('city', 100)->nullable();
            $table->string('browser', 30)->nullable();
            $table->string('os', 20)->nullable();
            $table->string('device', 10)->nullable();
            $table->string('referrer', 500)->nullable();
            $table->string('user_agent', 500)->nullable();
            $table->boolean('is_unique')->default(false);
            $table->timestamp('created_at')->nullable();

            $table->index(['image_tracker_id', 'created_at']);
            $table->index('country');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('image_tracker_views');
    }
};
