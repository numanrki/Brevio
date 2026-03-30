<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('deep_link_pixel')) return;

        Schema::create('deep_link_pixel', function (Blueprint $table) {
            $table->foreignId('deep_link_id')->constrained()->cascadeOnDelete();
            $table->foreignId('pixel_id')->constrained()->cascadeOnDelete();
            $table->primary(['deep_link_id', 'pixel_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deep_link_pixel');
    }
};
