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
        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('icon')->nullable();
            $table->boolean('free')->default(false);
            $table->decimal('price_monthly', 10, 2)->default(0);
            $table->decimal('price_yearly', 10, 2)->default(0);
            $table->decimal('price_lifetime', 10, 2)->default(0);
            $table->json('limits');
            $table->json('features');
            $table->integer('position')->default(0);
            $table->boolean('is_active')->default(true);
            $table->string('stripe_monthly_id')->nullable();
            $table->string('stripe_yearly_id')->nullable();
            $table->string('paddle_monthly_id')->nullable();
            $table->string('paddle_yearly_id')->nullable();
            $table->timestamps();
        });

        // Add deferred foreign key from users -> plans
        Schema::table('users', function (Blueprint $table) {
            $table->foreign('plan_id')->references('id')->on('plans')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('plans');
    }
};
