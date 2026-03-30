<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('deep_link_clicks')) return;

        Schema::create('deep_link_clicks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('deep_link_id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('rule_id')->nullable();
            $table->string('ip', 45)->nullable();
            $table->string('country', 5)->nullable();
            $table->string('city', 100)->nullable();
            $table->string('browser', 30)->nullable();
            $table->string('os', 20)->nullable();
            $table->string('device', 10)->nullable();
            $table->string('referrer', 500)->nullable();
            $table->string('language', 20)->nullable();
            $table->string('utm_source', 100)->nullable();
            $table->string('utm_medium', 100)->nullable();
            $table->string('utm_campaign', 100)->nullable();
            $table->boolean('is_unique')->default(false);
            $table->string('destination_url', 2048)->nullable();
            $table->timestamp('created_at')->nullable();

            $table->index(['deep_link_id', 'created_at']);
            $table->index('country');
            $table->index('device');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deep_link_clicks');
    }
};
