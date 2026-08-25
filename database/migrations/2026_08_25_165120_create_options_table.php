<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('options', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('question_id')->constrained('questions')->cascadeOnDelete();
            $table->char('letter', 1);
            $table->text('text');
            $table->timestamps();

            $table->unique(['question_id', 'letter']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('options');
    }
};
