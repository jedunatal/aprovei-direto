<?php

declare(strict_types=1);

namespace App\Policies;

use App\Enums\Permission;
use App\Enums\QuestionStatus;
use App\Models\Question;
use App\Models\User;

class QuestionPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo(Permission::QuestionsView->value);
    }

    public function view(User $user, Question $question): bool
    {
        if ($user->hasPermissionTo(Permission::QuestionsView->value)) {
            return true;
        }

        // Se for estudante, só pode ver se estiver publicada e ativa
        return $question->status === QuestionStatus::Published && $question->is_active;
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo(Permission::QuestionsCreate->value);
    }

    public function update(User $user, Question $question): bool
    {
        if ($user->hasPermissionTo(Permission::QuestionsUpdate->value)) {
            // Se o usuário for professor (sem permissão de publish), só edita rascunhos ou questões que ele mesmo criou
            if (! $user->hasPermissionTo(Permission::QuestionsPublish->value)) {
                return $question->created_by === $user->id;
            }

            return true;
        }

        return false;
    }

    public function delete(User $user, Question $question): bool
    {
        return $user->hasPermissionTo(Permission::QuestionsDelete->value);
    }

    public function publish(User $user): bool
    {
        return $user->hasPermissionTo(Permission::QuestionsPublish->value);
    }

    public function import(User $user): bool
    {
        return $user->hasPermissionTo(Permission::QuestionsImport->value);
    }
}
