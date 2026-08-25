<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\Permission as AppPermission;
use App\Enums\Role as AppRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Limpa o cache de permissões do Spatie
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // 1. Criação de todas as permissões do catálogo
        foreach (AppPermission::cases() as $permission) {
            Permission::firstOrCreate([
                'name' => $permission->value,
            ]);
        }

        // 2. Criação das Roles e Associação de Permissões

        // Super Admin: Acesso total
        $superAdminRole = Role::firstOrCreate(['name' => AppRole::SuperAdmin->value]);
        $superAdminRole->syncPermissions(Permission::all());

        // Admin: Gestão de conteúdo, usuários e relatórios
        $adminRole = Role::firstOrCreate(['name' => AppRole::Admin->value]);
        $adminRole->syncPermissions([
            AppPermission::QuestionsView->value,
            AppPermission::QuestionsCreate->value,
            AppPermission::QuestionsUpdate->value,
            AppPermission::QuestionsDelete->value,
            AppPermission::DisciplinesView->value,
            AppPermission::DisciplinesCreate->value,
            AppPermission::DisciplinesUpdate->value,
            AppPermission::DisciplinesDelete->value,
            AppPermission::TopicsView->value,
            AppPermission::TopicsCreate->value,
            AppPermission::TopicsUpdate->value,
            AppPermission::TopicsDelete->value,
            AppPermission::InstitutionsView->value,
            AppPermission::InstitutionsCreate->value,
            AppPermission::InstitutionsUpdate->value,
            AppPermission::InstitutionsDelete->value,
            AppPermission::UsersView->value,
            AppPermission::UsersCreate->value,
            AppPermission::UsersUpdate->value,
            AppPermission::SubscriptionsView->value,
            AppPermission::SubscriptionsManage->value,
            AppPermission::PaymentsView->value,
            AppPermission::PaymentsManage->value,
            AppPermission::DashboardView->value,
        ]);

        // Teacher: Gestão de questões, tópicos e disciplinas
        $teacherRole = Role::firstOrCreate(['name' => AppRole::Teacher->value]);
        $teacherRole->syncPermissions([
            AppPermission::QuestionsView->value,
            AppPermission::QuestionsCreate->value,
            AppPermission::QuestionsUpdate->value,
            AppPermission::DisciplinesView->value,
            AppPermission::TopicsView->value,
            AppPermission::InstitutionsView->value,
        ]);

        // Student: Acesso a questões, disciplinas, dashboard e assinatura
        $studentRole = Role::firstOrCreate(['name' => AppRole::Student->value]);
        $studentRole->syncPermissions([
            AppPermission::QuestionsView->value,
            AppPermission::DisciplinesView->value,
            AppPermission::TopicsView->value,
            AppPermission::InstitutionsView->value,
            AppPermission::DashboardView->value,
            AppPermission::SubscriptionsView->value,
        ]);

        // Support: Acesso a usuários e pagamentos
        $supportRole = Role::firstOrCreate(['name' => AppRole::Support->value]);
        $supportRole->syncPermissions([
            AppPermission::UsersView->value,
            AppPermission::SubscriptionsView->value,
            AppPermission::PaymentsView->value,
        ]);

        // 3. Usuário Super Admin padrão para desenvolvimento
        $superAdminUser = User::firstOrCreate(
            ['email' => 'admin@aproveidireto.com.br'],
            [
                'name' => 'Super Administrador',
                'password' => Hash::make('Admin@Aprovei2026'),
                'email_verified_at' => now(),
            ],
        );

        $superAdminUser->assignRole($superAdminRole);
    }
}
