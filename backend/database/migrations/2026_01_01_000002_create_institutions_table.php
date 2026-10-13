<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('institutions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('name', 191);
            $table->enum('institution_type', ["Children's Home", "Elders' Home", "Care Centre"])->default("Children's Home");
            $table->string('registration_number', 100)->unique();
            $table->text('address');
            $table->string('area', 100);
            $table->string('district', 50)->default('Jaffna');
            $table->string('contact_person', 150);
            $table->unsignedInteger('resident_count')->default(20);
            $table->string('operating_hours', 100)->default('08:00 AM - 08:00 PM');
            $table->boolean('needs_delivery')->default(false);
            $table->decimal('latitude', 10, 8)->default(9.661500);
            $table->decimal('longitude', 11, 8)->default(80.025500);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('area');
            $table->index('institution_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('institutions');
    }
};
