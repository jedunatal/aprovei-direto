<?php

declare(strict_types=1);

namespace Tests\Feature\Api;

use App\Enums\Permission as AppPermission;
use App\Enums\Role as AppRole;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HierarchyTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
    }

    public function test_registered_user_automatically_receives_student_role(): void
    {
        $payload = [
            'name' => 'Concurseiro Focado',
            'email' => 'aluno@concurso.com',
            'password' => 'SenhaSegura#2026',
            'password_confirmation' => 'SenhaSegura#2026',
        ];

        $response = $this->postJson('/api/auth/register', $payload);

        $response->assertStatus(201)
            ->assertJsonFragment([
                'roles' => [AppRole::Student->value],
            ]);

        $user = User::where('email', 'aluno@concurso.com')->first();

        $this->assertNotNull($user);
        $this->assertTrue($user->hasRole(AppRole::Student->value));
        $this->assertTrue($user->hasPermissionTo(AppPermission::QuestionsView->value));
        $this->assertFalse($user->hasPermissionTo(AppPermission::QuestionsDelete->value));
    }

    public function test_super_admin_has_all_system_permissions(): void
    {
        $admin = User::where('email', 'admin@aproveidireto.com.br')->first();

        $this->assertNotNull($admin);
        $this->assertTrue($admin->hasRole(AppRole::SuperAdmin->value));
        $this->assertTrue($admin->hasPermissionTo(AppPermission::QuestionsDelete->value));
        $this->assertTrue($admin->hasPermissionTo(AppPermission::UsersDelete->value));
        $this->assertTrue($admin->hasPermissionTo(AppPermission::SubscriptionsManage->value));
    }
}
