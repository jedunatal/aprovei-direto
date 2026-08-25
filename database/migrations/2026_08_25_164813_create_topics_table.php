<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('topics', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('discipline_id')->constrained('disciplines')->cascadeOnDelete();
            $table->string('name', 150);
            $table->string('slug', 150);
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();

            $table->unique(['discipline_id', 'slug']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('topics');
    }
};
