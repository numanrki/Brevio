<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('deep_links')) return;

        Schema::create('deep_links', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('alias')->unique();
            $table->string('fallback_url', 2048);
            $table->boolean('is_active')->default(true);
            $table->datetime('expiry_date')->nullable();
            $table->unsignedInteger('total_clicks')->default(0);
            $table->string('utm_source', 100)->nullable();
            $table->string('utm_medium', 100)->nullable();
            $table->string('utm_campaign', 100)->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('alias');
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deep_links');
    }
};
