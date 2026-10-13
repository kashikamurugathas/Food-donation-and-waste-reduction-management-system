<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('donor_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('organization_type', ['Individual', 'Function Hall', 'Hotel', 'Restaurant', 'Catering Service', 'Other'])->default('Function Hall');
            $table->string('venue_name', 191)->nullable();
            $table->text('address');
            $table->string('area', 100);
            $table->string('district', 50)->default('Jaffna');
            $table->string('contact_person', 150)->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->timestamps();

            $table->index('area');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('donor_profiles');
    }
};
