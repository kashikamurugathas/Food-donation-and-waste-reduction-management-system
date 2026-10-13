<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name', 150);
            $table->string('email', 150)->unique();
            $table->string('phone', 25);
            $table->string('password', 255);
            $table->enum('role', ['donor', 'institution', 'admin'])->default('donor');
            $table->boolean('is_verified')->default(false);
            $table->timestamp('email_verified_at')->nullable();
            $table->rememberToken();
            $table->timestamps();

            $table->index('role');
            $table->index('is_verified');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
