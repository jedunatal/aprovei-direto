<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('question_import_errors', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('import_batch_id')->constrained('question_import_batches')->cascadeOnDelete();
            $table->unsignedInteger('line_number')->default(0);
            $table->string('external_id', 100)->nullable()->index();
            $table->json('payload')->nullable();
            $table->text('error_message');
            $table->timestamps();

            $table->index(['import_batch_id', 'line_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('question_import_errors');
    }
};
