<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('pixel_fires')) return;

        Schema::create('pixel_fires', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pixel_id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('deep_link_id')->nullable();
            $table->string('ip', 45)->nullable();
            $table->string('country', 5)->nullable();
            $table->string('city', 100)->nullable();
            $table->string('browser', 30)->nullable();
            $table->string('os', 20)->nullable();
            $table->string('device', 10)->nullable();
            $table->string('referrer', 500)->nullable();
            $table->string('user_agent', 500)->nullable();
            $table->json('params')->nullable();
            $table->boolean('is_unique')->default(false);
            $table->timestamp('created_at')->nullable();

            $table->index(['pixel_id', 'created_at']);
            $table->index('deep_link_id');
            $table->index('country');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pixel_fires');
    }
};
