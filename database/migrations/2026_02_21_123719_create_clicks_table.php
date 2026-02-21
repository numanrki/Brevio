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
        Schema::create('clicks', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('url_id')->constrained()->cascadeOnDelete();
            $table->string('ip', 45)->nullable();
            $table->string('country', 2)->nullable();
            $table->string('city')->nullable();
            $table->string('browser')->nullable();
            $table->string('os')->nullable();
            $table->string('device')->nullable();
            $table->text('referrer')->nullable();
            $table->string('language', 10)->nullable();
            $table->boolean('is_unique')->default(false);
            $table->timestamp('created_at')->nullable();

            $table->index(['url_id', 'created_at']);
            $table->index('country');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clicks');
    }
};
