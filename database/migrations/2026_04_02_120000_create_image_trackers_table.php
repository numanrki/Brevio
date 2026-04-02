<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('image_trackers')) return;

        Schema::create('image_trackers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('filename');
            $table->string('original_name');
            $table->string('mime_type', 50);
            $table->string('token', 32)->unique();
            $table->unsignedInteger('total_views')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('token');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('image_trackers');
    }
};
