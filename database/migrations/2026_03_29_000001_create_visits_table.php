<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('visits', function (Blueprint $table) {
            $table->id();
            $table->string('visitable_type', 60);  // App\Models\Bio, App\Models\QrCode
            $table->unsignedBigInteger('visitable_id');
            $table->string('event_type', 20)->default('page_view'); // page_view, link_click, qr_scan
            $table->string('ip', 45)->nullable();
            $table->string('country', 5)->nullable();
            $table->string('city', 100)->nullable();
            $table->string('browser', 30)->nullable();
            $table->string('os', 20)->nullable();
            $table->string('device', 10)->nullable();
            $table->string('referrer', 500)->nullable();
            $table->string('language', 20)->nullable();
            $table->boolean('is_unique')->default(false);
            $table->json('meta')->nullable(); // Extra data like widget_id, clicked URL
            $table->timestamp('created_at')->nullable();

            $table->index(['visitable_type', 'visitable_id', 'created_at'], 'visits_visitable_date');
            $table->index('event_type');
            $table->index('country');
            $table->index('browser');
            $table->index('os');
            $table->index('device');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('visits');
    }
};
