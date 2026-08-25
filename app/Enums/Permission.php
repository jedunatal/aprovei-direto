<?php

declare(strict_types=1);

namespace App\Enums;

enum Permission: string
{
    case QuestionsView = 'questions.view';
    case QuestionsCreate = 'questions.create';
    case QuestionsUpdate = 'questions.update';
    case QuestionsDelete = 'questions.delete';

    case DisciplinesView = 'disciplines.view';
    case DisciplinesCreate = 'disciplines.create';
    case DisciplinesUpdate = 'disciplines.update';
    case DisciplinesDelete = 'disciplines.delete';

    case TopicsView = 'topics.view';
    case TopicsCreate = 'topics.create';
    case TopicsUpdate = 'topics.update';
    case TopicsDelete = 'topics.delete';

    case InstitutionsView = 'institutions.view';
    case InstitutionsCreate = 'institutions.create';
    case InstitutionsUpdate = 'institutions.update';
    case InstitutionsDelete = 'institutions.delete';

    case UsersView = 'users.view';
    case UsersCreate = 'users.create';
    case UsersUpdate = 'users.update';
    case UsersDelete = 'users.delete';

    case SubscriptionsView = 'subscriptions.view';
    case SubscriptionsManage = 'subscriptions.manage';

    case PaymentsView = 'payments.view';
    case PaymentsManage = 'payments.manage';

    case DashboardView = 'dashboard.view';
}