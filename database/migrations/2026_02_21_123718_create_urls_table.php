<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('urls', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->unsignedBigInteger('domain_id')->nullable();
            $table->unsignedBigInteger('campaign_id')->nullable();
            $table->text('url');
            $table->string('alias')->unique();
            $table->boolean('custom_alias')->default(false);
            $table->string('title')->nullable();
            $table->string('description')->nullable();
            $table->string('og_image')->nullable();
            $table->string('password')->nullable();
            $table->timestamp('expiry_date')->nullable();
            $table->json('geo_targets')->nullable();
            $table->json('device_targets')->nullable();
            $table->json('language_targets')->nullable();
            $table->json('ab_tests')->nullable();
            $table->json('pixels')->nullable();
            $table->unsignedBigInteger('overlay_id')->nullable();
            $table->unsignedBigInteger('splash_id')->nullable();
            $table->boolean('is_archived')->default(false);
            $table->boolean('is_active')->default(true);
            $table->bigInteger('total_clicks')->unsigned()->default(0);
            $table->json('meta')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
            $table->index('user_id');
            $table->index('domain_id');
            $table->index('campaign_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('urls');
    }
};
