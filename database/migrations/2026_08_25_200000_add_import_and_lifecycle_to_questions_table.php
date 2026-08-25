<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('questions', function (Blueprint $table): void {
            $table->string('external_id', 100)->nullable()->unique()->after('id');
            $table->string('status', 20)->default('published')->index()->after('difficulty');
            $table->foreignId('created_by')->nullable()->after('is_active')->constrained('users')->nullOnDelete();
            $table->foreignId('reviewed_by')->nullable()->after('created_by')->constrained('users')->nullOnDelete();
            $table->timestamp('published_at')->nullable()->index()->after('reviewed_by');

            $table->index(['status', 'is_active', 'discipline_id', 'year'], 'questions_catalog_idx');
        });
    }

    public function down(): void
    {
        Schema::table('questions', function (Blueprint $table): void {
            $table->dropIndex('questions_catalog_idx');
            $table->dropForeign(['created_by']);
            $table->dropForeign(['reviewed_by']);
            $table->dropColumn(['external_id', 'status', 'created_by', 'reviewed_by', 'published_at']);
        });
    }
};
