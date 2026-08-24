# Aprovei Direto 🚀

Plataforma web moderna, robusta e escalável, construída com arquitetura híbrida de alta produtividade baseada no ecossistema **Laravel**, **Inertia.js**, **React** e **TypeScript**, complementada por **Tailwind CSS**, componentes **Filament**, **Livewire** e ambiente conteinerizado com **Docker (Laravel Sail)**.

---

## 📌 Visão Geral do Projeto

O **Aprovei Direto** combina a elegância e robustez do backend Laravel com a interatividade de uma Single Page Application (SPA) moderna impulsionada por React e Inertia.js. O projeto conta com autenticação completa (Laravel Breeze/Sanctum), controle de permissões e papéis (Spatie Laravel Permission), componentes avançados de formulários e tabelas (Filament/Livewire) e uma infraestrutura pronta para produção com MySQL, Redis e Mailpit.

---

## 🛠️ Stack Tecnológica

### 🔹 Backend & Frameworks
| Tecnologia | Versão | Finalidade |
| :--- | :--- | :--- |
| **[PHP](https://www.php.net/)** | `^8.3` | Linguagem base do backend |
| **[Laravel](https://laravel.com/)** | `^13.x` | Framework MVC robusto e de alta produtividade |
| **[Laravel Breeze](https://laravel.com/docs/starter-kits#laravel-breeze)** | `^2.4` | Scaffolding de autenticação segura e moderna |
| **[Laravel Sanctum](https://laravel.com/docs/sanctum)** | `^4.0` | Autenticação por tokens para APIs e SPAs |
| **[Inertia.js Laravel Adapter](https://inertiajs.com/)** | `^2.0` | Conexão semântica e reativa entre Laravel e React |
| **[Spatie Laravel Permission](https://spatie.be/docs/laravel-permission/)** | `^8.3` | Gestão de perfis, papéis e permissões (RBAC) |
| **[Filament](https://filamentphp.com/)** (Actions, Forms, Tables, Notifications, Support) | `^5.7` | Criação ágil de formulários, tabelas e painéis administrativos |
| **[Livewire](https://livewire.laravel.com/)** | `^4.4` | Camada de reatividade de componentes server-side |
| **[Tightenco Ziggy](https://github.com/tighten/ziggy)** | `^2.0` | Compartilhamento de rotas nomeadas do Laravel no React |

### 🔹 Frontend & UI
| Tecnologia | Versão | Finalidade |
| :--- | :--- | :--- |
| **[React](https://react.dev/)** | `^18.2` | Biblioteca declarativa para construção de interfaces de usuário |
| **[TypeScript](https://www.typescriptlang.org/)** | `^5.0` | Tipagem estática para maior segurança e previsibilidade de código |
| **[Inertia.js React Adapter](https://inertiajs.com/)** | `^2.0` | Roteamento cliente-servidor sem necessidade de API REST dedicada |
| **[Tailwind CSS](https://tailwindcss.com/)** | `^3.x / ^4.x` | Framework de CSS utilitário para estilização rápida e responsiva |
| **[Headless UI React](https://headlessui.com/)** | `^2.0` | Componentes de interface acessíveis e não-estilizados |
| **[Vite](https://vitejs.dev/)** | `^8.0` | Bundler e build tool ultra rápido com suporte a HMR |

### 🔹 Infraestrutura, Banco de Dados & Cache (Docker)
| Serviço | Versão/Imagem | Descrição |
| :--- | :--- | :--- |
| **[Laravel Sail](https://laravel.com/docs/sail)** | `^1.67` | Ambiente de desenvolvimento conteinerizado para Laravel |
| **[MySQL](https://www.mysql.com/)** | `8.4` | Banco de dados relacional principal |
| **[Redis](https://redis.io/)** | `alpine` | Cache em memória, armazenamento de sessões e filas |
| **[Mailpit](https://github.com/axllent/mailpit)** | `latest` | Servidor SMTP local e painel web para inspeção de e-mails |

### 🔹 Qualidade de Código, Ferramentas & Testes
| Ferramenta | Descrição |
| :--- | :--- |
| **[PHPUnit](https://phpunit.de/)** (`^12.5`) | Testes unitários e de integração no backend |
| **[Laravel Pint](https://laravel.com/docs/pint)** (`^1.27`) | Code style fixer e linter baseado no padrão PSR-12 |
| **[Laravel Pail](https://github.com/laravel/pail)** (`^1.2`) | Visualização e monitoramento de logs em tempo real via terminal |
| **[Laravel Tinker](https://github.com/laravel/tinker)** (`^3.0`) | REPL interativo para depuração e execução de comandos Eloquent |
| **[FakerPHP](https://fakerphp.org/)** & **[Mockery](https://packagist.org/packages/mockery/mockery)** | Geração de dados de teste (fakes) e simulação de objetos (mocks) |

---

## 📂 Estrutura do Projeto

```text
aprovei-direto/
├── app/
│   ├── Http/
│   │   ├── Api/                     # Controllers dedicados a endpoints de API (ex: HealthCheck)
│   │   ├── Controllers/
│   │   │   ├── Auth/                # Controllers de autenticação (Breeze)
│   │   │   ├── ProfileController.php# Gerenciamento de perfil do usuário
│   │   │   └── Controller.php
│   │   ├── Middleware/              # Middlewares HTTP (ex: HandleInertiaRequests)
│   │   └── Requests/                # Form Requests de validação de dados
│   ├── Models/                      # Modelos Eloquent (User, etc.)
│   └── Providers/                   # Service Providers da aplicação
├── bootstrap/                       # Inicialização e configuração da aplicação (app.php, providers.php)
├── config/                          # Configurações globais (auth, database, permission, sanctum, etc.)
├── database/
│   ├── factories/                   # Model Factories para geração de dados falsos
│   ├── migrations/                  # Migrações de esquema do banco de dados
│   └── seeders/                     # Seeders para popular o banco de dados
├── resources/
│   ├── css/                         # Arquivos de estilo Tailwind CSS
│   ├── js/
│   │   ├── Components/              # Componentes reutilizáveis em React/TypeScript
│   │   ├── Layouts/                 # Layouts de página (Authenticated, Guest)
│   │   ├── Pages/                   # Páginas e views renderizadas via Inertia.js (Auth, Dashboard, Profile, Welcome)
│   │   ├── types/                   # Definições de tipos TypeScript
│   │   └── app.tsx                  # Ponto de entrada do frontend React/Inertia
│   └── views/
│       └── app.blade.php            # Template Blade raiz carregado pelo Inertia
├── routes/
│   ├── api.php                      # Rotas de API protegidas com Sanctum
│   ├── auth.php                     # Rotas de fluxo de autenticação
│   ├── console.php                  # Comandos de terminal artisan
│   └── web.php                      # Rotas principais da aplicação web
├── tests/
│   ├── Feature/                     # Testes funcionais e de integração (Auth, Profile, etc.)
│   └── Unit/                        # Testes unitários
├── compose.yaml                     # Configuração de containers Docker (Sail, MySQL, Redis, Mailpit)
├── package.json                     # Dependências e scripts do ecossistema Node/React/Vite
├── composer.json                    # Dependências e scripts do ecossistema PHP/Laravel
└── vite.config.js                   # Configurações do Vite e plugins
```

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- **Docker** e **Docker Compose** instalados (recomendado para uso com Laravel Sail)
- *Ou*, caso prefira rodar localmente sem Docker:
  - **PHP >= 8.3**
  - **Composer >= 2.x**
  - **Node.js >= 20.x** e **NPM**
  - **MySQL >= 8.0** ou **SQLite**
  - **Redis**

---

### Opção 1: Utilizando Docker via Laravel Sail (Recomendado)

1. **Clone o repositório:**
   ```bash
   git clone <URL_DO_REPOSITORIO>
   cd aprovei-direto
   ```

2. **Configure o arquivo de ambiente:**
   ```bash
   cp .env.example .env
   ```

3. **Instale as dependências PHP (caso não tenha o composer local):**
   ```bash
   docker run --rm \
       -u "$(id -u):$(id -g)" \
       -v "$(pwd):/var/www/html" \
       -w /var/www/html \
       laravelsail/php84-composer:latest \
       composer install --ignore-platform-reqs
   ```

4. **Inicie os containers:**
   ```bash
   ./vendor/bin/sail up -d
   ```

5. **Gere a chave da aplicação e execute as migrações:**
   ```bash
   ./vendor/bin/sail artisan key:generate
   ./vendor/bin/sail artisan migrate --seed
   ```

6. **Instale as dependências do frontend e inicie o Vite:**
   ```bash
   ./vendor/bin/sail npm install
   ./vendor/bin/sail npm run dev
   ```

---

### Opção 2: Execução Local (Sem Docker)

1. **Instale as dependências do backend:**
   ```bash
   composer install
   ```

2. **Configure o arquivo `.env`:**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

3. **Execute as migrações do banco de dados:**
   ```bash
   php artisan migrate --seed
   ```

4. **Instale as dependências do frontend e execute:**
   ```bash
   npm install
   npm run dev
   ```

5. **Inicie o servidor de desenvolvimento do Laravel:**
   ```bash
   php artisan serve
   ```
   *(Ou execute tudo de uma vez com `composer run dev`)*

---

## 🌐 Portas & Serviços Disponíveis

| Serviço | Porta Padrão | URL / Descrição |
| :--- | :--- | :--- |
| **Aplicação Web (Laravel/Sail)** | `80` (Sail) / `8000` (Local) | [http://localhost:8000](http://localhost:8000) |
| **Vite Dev Server (HMR)** | `5173` | [http://localhost:5173](http://localhost:5173) |
| **Mailpit (Web Interface)** | `8025` | [http://localhost:8025](http://localhost:8025) (Visualização de e-mails locais) |
| **Mailpit (SMTP Server)** | `1025` | Conexão SMTP local para envio de e-mails |
| **MySQL** | `3306` | Conexão com o banco de dados |
| **Redis** | `6379` | Cache, sessões e mensageria |
| **Health Check Endpoint** | `/up` | Verificação de disponibilidade da aplicação |

---

## 🧪 Testes e Qualidade de Código

- **Executar a suite de testes:**
  ```bash
  # Via Sail
  ./vendor/bin/sail artisan test

  # Localmente
  php artisan test
  # ou
  composer test
  ```

- **Formatação de código (Laravel Pint):**
  ```bash
  ./vendor/bin/pint
  ```

- **Monitoramento de Logs em tempo real (Laravel Pail):**
  ```bash
  php artisan pail
  ```

---

## 📜 Licença

Este projeto está sob a licença [MIT](LICENSE).
