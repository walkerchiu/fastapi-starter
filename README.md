# FastAPI Next.js TailwindCSS Starter

A modern, production-ready monorepo starter template for full-stack applications. Built with FastAPI for the backend, Next.js for the frontend, and TailwindCSS for styling.

![Python](https://img.shields.io/badge/Python-%3E%3D3.13-3776AB?logo=python&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20.0.0-339933?logo=node.js&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-%3E%3D10.0.0-F69220?logo=pnpm&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?logo=tailwindcss&logoColor=white)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Features

- **Monorepo Architecture** - Organized with pnpm workspaces for scalable project structure
- **Type Safety** - Full TypeScript support for frontend, Python type hints for backend
- **Type-Safe API** - Auto-generated TypeScript client from OpenAPI specification
- **GraphQL API** - Strawberry GraphQL alongside REST with type-safe urql client
- **Real-time Subscriptions** - GraphQL subscriptions with WebSocket support for live updates
- **Modern Backend** - FastAPI with async support and automatic API documentation
- **Modern Frontend** - Next.js 16 with React 19 and Turbopack for fast development
- **User Management** - Complete CRUD operations for users with pagination
- **Role-Based Access Control** - Flexible RBAC with users, roles, and permissions
- **Authentication** - JWT-based auth with user registration, login, and refresh tokens
- **Dashboard Example** - Protected page demonstrating authenticated GraphQL calls
- **Two-Factor Authentication** - TOTP-based 2FA with QR code setup and backup codes
- **Email Service** - Async SMTP email service with templates for password reset and verification
- **Password Reset** - Secure password reset flow with email verification
- **Email Verification** - Email verification for new user registrations
- **Profile Management** - Self-service profile updates and password changes
- **Input Validation** - Consistent input validation for both REST and GraphQL APIs
- **Error Codes** - Standardized error codes across REST and GraphQL endpoints
- **File Upload** - S3-compatible storage integration for file management
- **API Security** - Rate limiting, query depth limiting, and complexity analysis
- **Redis Cache** - Unified caching layer for session, rate limiting, and data caching
- **RabbitMQ Message Queue** - Async task processing with dead letter queue and retry support
- **Structured Logging** - structlog-based JSON logging with request tracing and environment-aware formatting
- **Request Tracing** - X-Request-ID propagation with request_id in error responses and GraphQL extensions
- **Audit Logging** - Comprehensive audit trail for user actions with before/after change tracking
- **Utility-First CSS** - TailwindCSS 3 for rapid UI development
- **Dark Mode** - Theme system with light/dark/system modes and persistent preference
- **Internationalization** - Multi-language support with next-intl (English and Traditional Chinese)
- **UI Component Library** - Reusable components including Table, Pagination, Tabs, and DropdownMenu
- **Storybook** - Interactive component development and documentation
- **Code Quality** - ESLint 9 (flat config), Prettier, and Ruff pre-configured
- **Git Hooks** - Husky and lint-staged for automated code quality checks
- **Testing Ready** - pytest for backend, Vitest for unit tests, Playwright for E2E tests
- **Developer Experience** - Hot reload, path aliases, and consistent tooling
- **Production Ready** - Docker Compose and Nginx configuration included

## Tech Stack

### Backend

- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [SQLAlchemy](https://www.sqlalchemy.org/) 2 - Async ORM with SQLite and PostgreSQL support
- [Strawberry GraphQL](https://strawberry.rocks/) - Python GraphQL library
- [Uvicorn](https://www.uvicorn.org/) - ASGI server
- [pydantic-settings](https://docs.pydantic.dev/latest/concepts/pydantic_settings/) - Settings management
- [uv](https://github.com/astral-sh/uv) - Fast Python package manager
- [Ruff](https://docs.astral.sh/ruff/) - Python linter and formatter
- [redis-py](https://github.com/redis/redis-py) - Redis client for caching
- [aio-pika](https://aio-pika.readthedocs.io/) - Async RabbitMQ client for message queuing
- [structlog](https://www.structlog.org/) - Structured JSON logger with request tracing
- [pytest](https://docs.pytest.org/) - Testing framework

### Frontend

- [Next.js](https://nextjs.org/) 16 - React framework with Turbopack
- [React](https://react.dev/) 19 - UI library
- [NextAuth.js](https://next-auth.js.org/) v5 - Authentication
- [TailwindCSS](https://tailwindcss.com/) 3 - Utility-first CSS framework
- [urql](https://commerce.nearform.com/open-source/urql/) - GraphQL client
- [GraphQL Codegen](https://the-guild.dev/graphql/codegen) - TypeScript types from schema
- [Zod](https://zod.dev/) - TypeScript-first schema validation
- [next-intl](https://next-intl.dev/) - Internationalization for Next.js
- [Storybook](https://storybook.js.org/) 10 - Component development and documentation
- [Vitest](https://vitest.dev/) 4 - Unit testing framework
- [React Testing Library](https://testing-library.com/react) - Component testing
- [Playwright](https://playwright.dev/) - E2E testing framework

### Development Tools

- [pnpm](https://pnpm.io/) - Fast, disk space efficient package manager
- [ESLint](https://eslint.org/) 9 - Code linting with flat config
- [Prettier](https://prettier.io/) 3 - Code formatting
- [Husky](https://typicode.github.io/husky/) - Git hooks
- [lint-staged](https://github.com/lint-staged/lint-staged) - Run linters on staged files
- [commitlint](https://commitlint.js.org/) - Lint commit messages
- [@hey-api/openapi-ts](https://heyapi.dev/) - OpenAPI TypeScript client generator

## Project Structure

```text
fastapi-nextjs-tailwindcss-starter/
├── apps/
│   ├── backend/                    # FastAPI backend application
│   │   ├── src/
│   │   │   └── app/
│   │   │       ├── core/
│   │   │       │   ├── config.py   # Application settings
│   │   │       │   ├── redis.py    # Redis connection pool
│   │   │       │   └── rabbitmq.py # RabbitMQ connection pool
│   │   │       ├── messaging/      # Message queue integration
│   │   │       │   ├── types.py    # Message type definitions
│   │   │       │   ├── producer.py # Message publisher
│   │   │       │   ├── consumer.py # Consumer base class
│   │   │       │   └── handlers/   # Message handlers
│   │   │       ├── workers/        # Background workers
│   │   │       │   ├── email_worker.py  # Email queue consumer
│   │   │       │   ├── file_worker.py   # File processing consumer
│   │   │       │   └── event_worker.py  # Event queue consumer
│   │   │       ├── __init__.py
│   │   │       └── main.py         # Application entry point
│   │   ├── tests/
│   │   │   ├── __init__.py
│   │   │   └── test_main.py        # API tests
│   │   ├── .env.example            # Environment variables template
│   │   ├── pyproject.toml          # Python project configuration
│   │   └── .python-version         # Python version lock
│   │
│   └── frontend/                   # Next.js frontend application
│       ├── src/
│       │   ├── app/
│       │   │   ├── [locale]/       # i18n dynamic routes
│       │   │   │   ├── layout.tsx  # Locale layout
│       │   │   │   ├── page.tsx    # Home page
│       │   │   │   ├── 2fa/        # 2FA pages (setup, verify)
│       │   │   │   ├── login/      # Login page
│       │   │   │   ├── register/   # Registration page
│       │   │   │   ├── dashboard/  # Protected dashboard
│       │   │   │   ├── profile/    # User profile page
│       │   │   │   ├── forgot-password/ # Password reset request
│       │   │   │   ├── reset-password/  # Password reset form
│       │   │   │   └── verify-email/    # Email verification page
│       │   │   ├── 2fa-callback/   # 2FA callback handler
│       │   │   ├── unauthorized/   # Access denied page
│       │   │   ├── api/            # API routes
│       │   │   ├── layout.tsx      # Root layout
│       │   │   └── globals.css     # Global styles with Tailwind
│       │   ├── components/
│       │   │   ├── ui/             # Reusable UI components
│       │   │   ├── nav/            # Navigation components
│       │   │   ├── auth/           # Role-based access components
│       │   │   ├── profile/        # Profile edit modals
│       │   │   └── providers/      # React context providers
│       │   ├── config/
│       │   │   └── env.ts          # Environment validation
│       │   ├── lib/
│       │   │   ├── api.ts          # API client wrapper
│       │   │   └── auth.ts         # NextAuth configuration
│       │   ├── hooks/
│       │   │   ├── api/            # REST API hooks (TanStack Query)
│       │   │   │   ├── use-users.ts  # User CRUD hooks
│       │   │   │   ├── use-files.ts  # File upload hooks
│       │   │   │   └── use-auth.ts   # Profile & password hooks
│       │   │   ├── useAuth.ts      # Authentication state hook
│       │   │   └── useRole.ts      # Role-based access hooks
│       │   ├── i18n/               # Internationalization config
│       │   └── graphql/            # GraphQL operations
│       ├── messages/               # Translation files (en, zh-TW)
│       ├── .env.example            # Environment variables template
│       ├── vitest.config.ts        # Vitest configuration
│       ├── playwright.config.ts    # Playwright E2E configuration
│       ├── e2e/                    # E2E tests
│       │   ├── specs/              # Test specifications
│       │   ├── pages/              # Page Objects
│       │   ├── components/         # Component Objects
│       │   ├── fixtures/           # Test fixtures
│       │   └── utils/              # Test utilities
│       ├── tailwind.config.ts      # TailwindCSS configuration
│       └── tsconfig.json
│
├── packages/
│   ├── api-client/                 # OpenAPI TypeScript client
│   │   ├── src/generated/          # Auto-generated API types
│   │   └── openapi-ts.config.ts    # Client generator config
│   ├── eslint-config/              # Shared ESLint configuration
│   │   ├── base.mjs                # Base rules for Node.js
│   │   └── next.mjs                # Next.js specific rules
│   └── typescript-config/          # Shared TypeScript configuration
│       ├── base.json               # Base compiler options
│       └── nextjs.json             # Next.js specific settings
│
├── .husky/                         # Git hooks
│   ├── pre-commit                  # Runs lint-staged
│   └── commit-msg                  # Runs commitlint
│
├── package.json                    # Root workspace configuration
├── pnpm-workspace.yaml             # pnpm workspace definition
├── tsconfig.base.json              # Base TypeScript configuration
├── eslint.config.mjs               # ESLint flat configuration
├── commitlint.config.mjs           # Commitlint configuration
├── .prettierrc                     # Prettier configuration
└── .editorconfig                   # Editor configuration
```

## Prerequisites

- **Python** >= 3.13
- **uv** - Python package manager ([install guide](https://docs.astral.sh/uv/getting-started/installation/))
- **Node.js** >= 20.0.0
- **pnpm** >= 10.0.0

## Getting Started

### 1. Clone the repository

```bash
git clone git@github.com:walkerchiu/fastapi-nextjs-tailwindcss-starter.git
cd fastapi-nextjs-tailwindcss-starter
```

### 2. Install dependencies

```bash
# Install frontend dependencies
pnpm install

# Install backend dependencies
cd apps/backend && uv sync --all-groups && cd ../..
```

### 3. Start development servers

```bash
# Terminal 1: Start backend
pnpm dev:backend

# Terminal 2: Start frontend
pnpm dev:frontend
```

The applications will be available at:

- **Frontend**: <http://localhost:3000>
- **Backend**: <http://localhost:8000>
- **REST API Docs**: <http://localhost:8000/api/docs>
- **Apollo Sandbox**: <http://localhost:8000/graphql>

## Configuration

### TypeScript

The project uses shared TypeScript configuration from `packages/typescript-config`:

- `base.json` - Shared compiler options (ES2022, strict mode)
- `nextjs.json` - Next.js specific settings (extends base)
- `apps/frontend/tsconfig.json` - Extends `@repo/typescript-config/nextjs.json`

### Python

The backend uses modern Python tooling:

- `pyproject.toml` - Project configuration with Ruff and pytest settings
- `.python-version` - Python version lock (3.13)

### Path Aliases

The frontend supports path aliases for cleaner imports:

```typescript
// Instead of
import { Component } from '../../../components/Component';

// Use
import { Component } from '@/components/Component';
```

## Available Scripts

### Root Level

| Command                  | Description                             |
| ------------------------ | --------------------------------------- |
| `pnpm dev`               | Start frontend in development mode      |
| `pnpm dev:backend`       | Start backend in development mode       |
| `pnpm dev:frontend`      | Start frontend in development mode      |
| `pnpm build`             | Build frontend for production           |
| `pnpm build:frontend`    | Build frontend for production (alias)   |
| `pnpm test`              | Run tests in all apps                   |
| `pnpm test:backend`      | Run backend tests                       |
| `pnpm test:frontend`     | Run frontend tests                      |
| `pnpm test:cov`          | Run tests with coverage in all apps     |
| `pnpm test:cov:backend`  | Run backend tests with coverage         |
| `pnpm test:cov:frontend` | Run frontend tests with coverage        |
| `pnpm test:integration`  | Run API integration tests               |
| `pnpm lint`              | Run ESLint across the workspace         |
| `pnpm lint:fix`          | Fix ESLint issues automatically         |
| `pnpm lint:backend`      | Run Ruff linter on backend              |
| `pnpm lint:backend:fix`  | Fix Ruff linter issues automatically    |
| `pnpm format`            | Format code with Prettier and Ruff      |
| `pnpm format:check`      | Check code formatting without modifying |
| `pnpm generate:api`      | Generate TypeScript API client          |
| `pnpm storybook`         | Start Storybook development server      |
| `pnpm build-storybook`   | Build Storybook for production          |
| `pnpm db:upgrade`        | Run database migrations                 |
| `pnpm db:downgrade`      | Revert last migration                   |
| `pnpm db:revision`       | Generate a new migration                |
| `pnpm db:history`        | Show migration history                  |
| `pnpm db:current`        | Show current migration status           |
| `pnpm db:seed`           | Seed default data (roles, permissions)  |
| `pnpm db:status`         | Show database table status              |

> **Note**: `pnpm generate:api` requires the backend server to be running (`pnpm dev:backend`).

### Backend (apps/backend)

| Command                | Description             |
| ---------------------- | ----------------------- |
| `uv run uvicorn ...`   | Start in watch mode     |
| `uv run pytest`        | Run tests               |
| `uv run pytest --cov`  | Run tests with coverage |
| `uv run ruff check .`  | Lint code               |
| `uv run ruff format .` | Format code             |

### Frontend (apps/frontend)

| Command                              | Description             |
| ------------------------------------ | ----------------------- |
| `pnpm --filter frontend dev`         | Start with Turbopack    |
| `pnpm --filter frontend build`       | Build for production    |
| `pnpm --filter frontend start`       | Run production build    |
| `pnpm --filter frontend test`        | Run unit tests          |
| `pnpm --filter frontend test:watch`  | Run tests in watch mode |
| `pnpm --filter frontend test:cov`    | Run tests with coverage |
| `pnpm --filter frontend test:e2e`    | Run E2E tests           |
| `pnpm --filter frontend test:e2e:ui` | Open E2E test UI        |

## API Endpoints

Full REST API documentation is available at:

- **Swagger UI**: <http://localhost:8000/docs>
- **ReDoc**: <http://localhost:8000/redoc>
- **OpenAPI JSON**: <http://localhost:8000/openapi.json>

### Error Responses

All REST API errors return a standardized JSON response:

```json
{
  "success": false,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User not found."
  }
}
```

For the complete list of error codes, see [`src/app/core/error_codes.py`](apps/backend/src/app/core/error_codes.py).

## GraphQL API

The GraphQL endpoint is available at `/graphql` with an interactive IDE (Apollo Sandbox by default).

### GraphQL IDE Configuration

The GraphQL IDE can be configured via the `GRAPHQL_IDE` environment variable:

| Value      | Description                                  |
| ---------- | -------------------------------------------- |
| `sandbox`  | Apollo Sandbox (default) - requires internet |
| `graphiql` | GraphiQL - requires internet                 |
| `none`     | Disable IDE landing page                     |

```bash
# Use GraphiQL instead of Apollo Sandbox
GRAPHQL_IDE=graphiql pnpm dev:backend
```

**Note**: The IDE is only available in non-production environments.

### Error Codes

All GraphQL errors include standardized error codes in the `extensions` field:

For the complete list of error codes, see [`src/app/core/error_codes.py`](apps/backend/src/app/core/error_codes.py).

#### Example Error Response

```json
{
  "errors": [
    {
      "message": "Invalid email format",
      "extensions": {
        "code": "INVALID_EMAIL",
        "field": "email"
      }
    }
  ]
}
```

### Security

The GraphQL API includes multiple security layers:

#### Rate Limiting

- **Default**: 100 requests per minute per client
- **Auth endpoints**: 20 requests per minute per client
- Response headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

#### Query Depth Limiting

- **Max depth**: 10 levels (configurable via `GRAPHQL_MAX_DEPTH`)
- Prevents deeply nested query attacks

#### Query Complexity Analysis

- **Max complexity**: 100 points (configurable via `GRAPHQL_MAX_COMPLEXITY`)
- Each field adds 1 point to the complexity score
- Prevents expensive queries from overloading the server

### Frontend GraphQL Integration

The frontend uses urql with GraphQL Codegen for type-safe queries:

```bash
# Generate TypeScript types from GraphQL schema
# Note: Requires the backend server to be running (pnpm dev:backend)
pnpm --filter frontend codegen
```

### Frontend REST API Integration

The frontend uses TanStack Query with auto-generated API client for REST API calls:

```typescript
import { useUsers, useMe, useUpdateProfile } from '@/hooks';

function UsersList() {
  // Fetch users with automatic caching and background updates
  const { data, isLoading, error } = useUsers({ limit: 10 });

  // Fetch current user
  const { data: me } = useMe();

  // Mutations with cache invalidation
  const updateProfile = useUpdateProfile();

  const handleUpdate = async (name: string) => {
    await updateProfile.mutateAsync({ name });
    // Cache is automatically invalidated
  };

  if (isLoading) return <Spinner />;
  if (error) return <Error message={error.message} />;

  return (
    <ul>
      {data?.items.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

Available REST API hooks:

| Hook                | Description                      |
| ------------------- | -------------------------------- |
| `useUsers`          | Fetch paginated user list        |
| `useUser`           | Fetch single user by ID          |
| `useCreateUser`     | Create new user                  |
| `useUpdateUser`     | Update existing user             |
| `useDeleteUser`     | Delete user                      |
| `useMe`             | Fetch current authenticated user |
| `useUpdateProfile`  | Update current user's profile    |
| `useChangePassword` | Change current user's password   |
| `useFiles`          | Fetch paginated file list        |
| `useFile`           | Fetch single file by ID          |
| `useUploadFile`     | Upload new file                  |
| `useDeleteFile`     | Delete file                      |

### Frontend Authentication

The frontend provides a `useAuth` hook for convenient authentication management:

```typescript
import { useAuth } from '@/hooks';

function MyComponent() {
  const {
    user,            // Current user { id, email, name } or null
    isAuthenticated, // Boolean - whether user is logged in
    isLoading,       // Boolean - session loading state
    accessToken,     // String - for custom API calls
    hasRefreshError, // Boolean - token refresh failed
    login,           // (email, password) => Promise<boolean>
    logout,          // (callbackUrl?) => Promise<void>
  } = useAuth();

  if (isLoading) return <Spinner />;
  if (!isAuthenticated) return <LoginPrompt />;

  return <div>Welcome, {user.name}!</div>;
}
```

The hook automatically handles:

- Session state management via NextAuth
- Token refresh errors (auto-redirects to login)
- Type-safe user data access

### Frontend Role-Based Access Control

The frontend provides components and hooks for role-based UI control:

#### useRole Hook

```typescript
import { useRole } from '@/hooks';

function MyComponent() {
  const {
    roles,              // User's roles array
    hasRole,            // (roleCode: string) => boolean
    hasAnyRole,         // (roleCodes: string[]) => boolean
    hasAllRoles,        // (roleCodes: string[]) => boolean
    isAdmin,            // Boolean - has 'admin' or 'super_admin' role
    isSuperAdmin,       // Boolean - has 'super_admin' role
    hasPermission,      // (permissionCode: string) => boolean
    hasResourcePermission, // (resource, action) => boolean
    permissions,        // All permissions from all roles
  } = useRole();

  if (!isAdmin) return <AccessDenied />;
  return <AdminPanel />;
}
```

#### RequireRole Components

```tsx
import { RequireRole, RequireAdmin, RequirePermission } from '@/components/auth';

// Render content only for users with specific roles
<RequireRole roles={['admin', 'moderator']}>
  <AdminActions />
</RequireRole>

// Require all specified roles (AND logic)
<RequireRole roles={['admin', 'auditor']} requireAll>
  <AuditPanel />
</RequireRole>

// Shortcut for admin-only content
<RequireAdmin>
  <AdminDashboard />
</RequireAdmin>

// Permission-based rendering
<RequirePermission permission="users:delete">
  <DeleteUserButton />
</RequirePermission>

// With fallback content
<RequireAdmin fallback={<UpgradePrompt />}>
  <PremiumFeature />
</RequireAdmin>
```

#### Role-Protected Routes

Routes can be protected by roles in the middleware:

```typescript
// In proxy.ts
const roleProtectedRoutes = [
  { path: '/admin', roles: ['admin', 'super_admin'] },
  { path: '/super-admin', roles: ['super_admin'] },
];
```

Unauthorized users are redirected to `/unauthorized` with the attempted path.

### Token Lifecycle

The application uses JWT-based authentication with automatic token refresh:

| Token Type    | Expiration | Purpose                    |
| ------------- | ---------- | -------------------------- |
| Access Token  | 30 minutes | API request authentication |
| Refresh Token | 7 days     | Obtain new access tokens   |

**Automatic Refresh Flow:**

1. User logs in → receives `access_token` + `refresh_token`
2. Frontend stores tokens in NextAuth session
3. Before access token expires (60 sec buffer), NextAuth automatically calls `/api/v1/auth/refresh`
4. If refresh succeeds → new tokens are stored, user continues seamlessly
5. If refresh fails → user is signed out and redirected to login

### Automatic Token Refresh

The application automatically refreshes access tokens before they expire:

- **Refresh Window**: Tokens are refreshed 60 seconds before expiration
- **Auto Sign-out**: If refresh fails, the user is automatically signed out
- **GraphQL Integration**: The urql client detects auth errors and triggers re-authentication

## Role-Based Access Control (RBAC)

The application implements a flexible RBAC system with three core entities: Users, Roles, and Permissions.

### RBAC Model

```text
User ←→ Role ←→ Permission
      (many-to-many)
```

- **Users** can have multiple roles
- **Roles** can have multiple permissions
- **Permissions** are the atomic units of access control (e.g., `users:read`, `users:create`)

### Permission Format

Permissions follow the format `resource:action`:

| Resource      | Actions                              |
| ------------- | ------------------------------------ |
| `users`       | `read`, `create`, `update`, `delete` |
| `roles`       | `read`, `create`, `update`, `delete` |
| `permissions` | `read`, `create`, `update`, `delete` |
| `files`       | `read`, `create`, `delete`           |

### Default Roles

| Role          | Description                                      |
| ------------- | ------------------------------------------------ |
| `super_admin` | Full system access, can manage roles/permissions |
| `admin`       | User management and file operations              |
| `user`        | Basic read access and file upload                |

### Default Permissions

| Role        | Permissions | Description                              |
| ----------- | :---------: | ---------------------------------------- |
| super_admin |     20      | Full system access including hard_delete |
| admin       |     10      | User management, file operations         |
| user        |      3      | Basic read and file upload               |

For the complete permission matrix, see the seed data in [`src/app/db/seed.py`](apps/backend/src/app/db/seed.py).

### Endpoint Permission Requirements

#### REST API

| Endpoint                    | Required Permission / Role |
| --------------------------- | -------------------------- |
| `GET /api/v1/users`         | `users:read`               |
| `POST /api/v1/users`        | `users:create`             |
| `GET /api/v1/users/{id}`    | `users:read`               |
| `PATCH /api/v1/users/{id}`  | `users:update`             |
| `DELETE /api/v1/users/{id}` | `users:delete`             |
| `GET /api/v1/roles`         | `roles:read`               |
| `POST /api/v1/roles`        | Superadmin only            |
| `PATCH /api/v1/roles/{id}`  | Superadmin only            |
| `DELETE /api/v1/roles/{id}` | Superadmin only            |
| `GET /api/v1/permissions`   | `permissions:read`         |
| `POST /api/v1/permissions`  | Superadmin only            |

#### GraphQL

| Operation          | Required Permission / Role |
| ------------------ | -------------------------- |
| `users` query      | `users:read`               |
| `createUser`       | `users:create`             |
| `updateUser`       | `users:update`             |
| `deleteUser`       | `users:delete`             |
| `roles` query      | `roles:read`               |
| `createRole`       | Superadmin only            |
| `updateRole`       | Superadmin only            |
| `deleteRole`       | Superadmin only            |
| `permissions`      | `permissions:read`         |
| `createPermission` | Superadmin only            |

### System Roles

System roles are protected and cannot be modified or deleted:

| Role          | Description                  |
| ------------- | ---------------------------- |
| `super_admin` | Full access to all resources |
| `admin`       | Administrative access        |
| `user`        | Basic user access            |

### Seeding Default Data

```bash
# Populate default roles and permissions
pnpm db:seed
```

This will create:

- 20 default permissions (users, roles, permissions, files CRUD + hard_delete)
- 3 default roles (super_admin, admin, user) with appropriate permissions

### Permission-Based Protection (Backend)

Use the `require_permission` dependency for fine-grained access control:

```python
from app.core.deps import require_permission

@router.get("/reports")
async def get_reports(
    _: None = Depends(require_permission("reports:read")),
):
    # Requires 'reports:read' permission
    return reports

@router.post("/reports")
async def create_report(
    _: None = Depends(require_permission("reports:create")),
):
    # Requires 'reports:create' permission
    return report
```

For GraphQL resolvers:

```python
from app.graphql.context import require_permission

@strawberry.type
class Query:
    @strawberry.field
    async def reports(self, info: Info) -> list[Report]:
        require_permission(info, "reports:read")
        # Requires 'reports:read' permission
        return reports
```

## Email Service

The application includes an async email service for transactional emails:

### Configuration

| Variable                          | Default                 | Description                   |
| --------------------------------- | ----------------------- | ----------------------------- |
| `SMTP_HOST`                       | `localhost`             | SMTP server host              |
| `SMTP_PORT`                       | `587`                   | SMTP server port              |
| `SMTP_USER`                       | -                       | SMTP username                 |
| `SMTP_PASSWORD`                   | -                       | SMTP password                 |
| `SMTP_USE_TLS`                    | `true`                  | Use TLS encryption            |
| `EMAIL_FROM_ADDRESS`              | -                       | Sender email address          |
| `EMAIL_FROM_NAME`                 | `FastAPI App`           | Sender display name           |
| `FRONTEND_URL`                    | `http://localhost:3000` | URL for email links           |
| `PASSWORD_RESET_EXPIRE_MINUTES`   | `60`                    | Password reset token validity |
| `EMAIL_VERIFICATION_EXPIRE_HOURS` | `24`                    | Email verification validity   |

### Development Mode

In development (`DEBUG=true`), emails are logged to the console instead of being sent via SMTP.

## RabbitMQ Message Queue

The application includes an optional RabbitMQ integration for async task processing:

### Configuration

| Variable                        | Default            | Description                            |
| ------------------------------- | ------------------ | -------------------------------------- |
| `RABBITMQ_ENABLED`              | `false`            | Enable RabbitMQ integration            |
| `RABBITMQ_HOST`                 | `localhost`        | RabbitMQ server host                   |
| `RABBITMQ_PORT`                 | `5672`             | RabbitMQ server port                   |
| `RABBITMQ_USER`                 | `guest`            | RabbitMQ username                      |
| `RABBITMQ_PASSWORD`             | `guest`            | RabbitMQ password                      |
| `RABBITMQ_VHOST`                | `/`                | RabbitMQ virtual host                  |
| `RABBITMQ_POOL_SIZE`            | `10`               | Connection pool size                   |
| `RABBITMQ_CONNECTION_TIMEOUT`   | `10000`            | Connection timeout in ms               |
| `RABBITMQ_HEARTBEAT`            | `60`               | Heartbeat interval in seconds          |
| `RABBITMQ_EXCHANGE_NAME`        | `starter_exchange` | Default exchange name                  |
| `RABBITMQ_EXCHANGE_TYPE`        | `topic`            | Exchange type (topic, direct, fanout)  |
| `RABBITMQ_DEAD_LETTER_EXCHANGE` | `starter_dlx`      | Dead letter exchange name              |
| `RABBITMQ_MAX_RETRIES`          | `3`                | Max retry attempts for failed messages |
| `RABBITMQ_RETRY_DELAY_BASE`     | `1000`             | Base retry delay in ms                 |
| `RABBITMQ_RETRY_DELAY_MAX`      | `60000`            | Max retry delay in ms                  |

### Queue Design

| Queue         | Routing Key    | Purpose             | DLQ         |
| ------------- | -------------- | ------------------- | ----------- |
| `email_queue` | `email.*`      | Email sending tasks | `email_dlq` |
| `file_queue`  | `file.*`       | File processing     | `file_dlq`  |
| `event_queue` | `event.*`      | Domain events       | `event_dlq` |
| `task_queue`  | `task.execute` | Scheduled task exec | `task_dlq`  |

### Starting Workers

Workers run as separate processes to consume messages:

```bash
# Start email worker
RABBITMQ_ENABLED=true python -m src.app.workers.email_worker

# Start file processing worker
RABBITMQ_ENABLED=true python -m src.app.workers.file_worker

# Start event worker
RABBITMQ_ENABLED=true python -m src.app.workers.event_worker

# Start scheduler worker (checks for due tasks)
RABBITMQ_ENABLED=true python -m src.app.workers.scheduler_worker

# Start task worker (executes scheduled tasks)
RABBITMQ_ENABLED=true python -m src.app.workers.task_worker
```

### Usage Example

```python
from src.app.messaging.producer import message_producer

# Send password reset email via queue
await message_producer.send_password_reset_email(
    to_email="user@example.com",
    reset_token="abc123",
    user_name="John Doe",
)

# Send email verification
await message_producer.send_email_verification(
    to_email="user@example.com",
    verification_token="xyz789",
    user_name="John Doe",
)

# Publish domain event
from src.app.messaging.types import UserRegisteredEvent

event = UserRegisteredEvent(
    user_id="123",
    email="user@example.com",
)
await message_producer.publish_event(event)
```

### Error Handling

- **Connection Retry**: Exponential backoff (0.5s → 5s) for connection failures
- **Message Retry**: Up to 3 attempts with exponential delay (1s, 2s, 4s)
- **Dead Letter Queue**: Failed messages are moved to DLQ after exhausting retries

### Development with Docker

```bash
# Start RabbitMQ with management UI
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management

# Access management UI at http://localhost:15672 (guest/guest)
```

### Fallback Mode

When `RABBITMQ_ENABLED=false` (default), the email service sends emails directly via SMTP instead of queueing them. This ensures backward compatibility and simplifies development without RabbitMQ.

### Scheduled Tasks

The application includes a scheduled tasks system for managing recurring or one-time tasks:

#### Configuration

| Variable                           | Default | Description                  |
| ---------------------------------- | ------- | ---------------------------- |
| `SCHEDULER_CHECK_INTERVAL_SECONDS` | `60`    | Interval between task checks |

#### REST API Endpoints

| Method | Endpoint                                  | Description                |
| ------ | ----------------------------------------- | -------------------------- |
| GET    | `/api/v1/scheduled-tasks/types`           | List available task types  |
| GET    | `/api/v1/scheduled-tasks`                 | List scheduled tasks       |
| POST   | `/api/v1/scheduled-tasks`                 | Create a scheduled task    |
| GET    | `/api/v1/scheduled-tasks/{id}`            | Get task by ID             |
| PATCH  | `/api/v1/scheduled-tasks/{id}`            | Update a task              |
| DELETE | `/api/v1/scheduled-tasks/{id}`            | Delete a task              |
| POST   | `/api/v1/scheduled-tasks/{id}/enable`     | Enable a task              |
| POST   | `/api/v1/scheduled-tasks/{id}/disable`    | Disable a task             |
| POST   | `/api/v1/scheduled-tasks/{id}/trigger`    | Manually trigger execution |
| GET    | `/api/v1/scheduled-tasks/{id}/executions` | Get execution history      |

#### Creating a Task

```python
# Via API
POST /api/v1/scheduled-tasks
{
    "name": "Daily Cleanup",
    "description": "Clean up expired tokens",
    "task_type": "cleanup",
    "cron_expression": "0 0 * * *",  # Daily at midnight
    "timezone": "UTC",
    "is_active": true,
    "context": {"max_age_days": 30}
}

# One-time task
POST /api/v1/scheduled-tasks
{
    "name": "One-time Report",
    "task_type": "report",
    "scheduled_at": "2024-12-31T23:59:59Z"
}
```

#### Creating Custom Task Executors

```python
from src.app.tasks.base import TaskExecutor, TaskContext, TaskResult
from src.app.tasks.registry import task_registry

class MyCustomExecutor(TaskExecutor):
    task_type = "my_custom_task"
    name = "My Custom Task"
    description = "Description of what this task does"
    default_cron = "0 */6 * * *"  # Every 6 hours (optional)

    async def execute(self, context: TaskContext) -> TaskResult:
        # Your task logic here
        return TaskResult(
            success=True,
            message="Task completed successfully",
            data={"processed": 100}
        )

# Register the executor
task_registry.register(MyCustomExecutor())
```

#### Built-in Task Types

| Type           | Description           |
| -------------- | --------------------- |
| `cleanup`      | Clean up expired data |
| `report`       | Generate reports      |
| `notification` | Send notifications    |

## Two-Factor Authentication (2FA)

The application supports TOTP-based two-factor authentication:

### Configuration

| Variable                        | Default       | Description                         |
| ------------------------------- | ------------- | ----------------------------------- |
| `TWO_FACTOR_ISSUER_NAME`        | `FastAPI App` | Issuer name shown in auth apps      |
| `TWO_FACTOR_TOTP_WINDOW`        | `1`           | TOTP window tolerance (30s windows) |
| `TWO_FACTOR_BACKUP_CODES_COUNT` | `10`          | Number of backup codes to generate  |

### 2FA Flow

1. **Setup**: User calls `/auth/2fa/setup` to get a QR code and secret
2. **Enable**: User scans QR code with an authenticator app and calls `/auth/2fa/enable` with the TOTP code
3. **Login**: When 2FA is enabled, login returns `requires_two_factor: true` and a `user_id`
4. **Verify**: User calls `/auth/2fa/verify` with the TOTP code to complete login
5. **Backup Codes**: Users receive 10 one-time backup codes that can be used if they lose access to their authenticator app

### Supported Authenticator Apps

- Google Authenticator
- Microsoft Authenticator
- Authy
- 1Password
- Any TOTP-compatible app

## Frontend Pages

The frontend includes the following authentication-related pages:

| Route              | Description                                    |
| ------------------ | ---------------------------------------------- |
| `/`                | Landing page                                   |
| `/login`           | User login with email/password                 |
| `/register`        | New user registration                          |
| `/forgot-password` | Request password reset email                   |
| `/reset-password`  | Reset password with token from email           |
| `/verify-email`    | Email verification with token from email       |
| `/profile`         | User profile with password and 2FA management  |
| `/2fa/setup`       | 2FA setup wizard with QR code and backup codes |
| `/2fa/verify`      | 2FA verification during login                  |
| `/2fa-callback`    | Completes sign-in after 2FA verification       |
| `/unauthorized`    | Access denied page for role-protected routes   |
| `/dashboard`       | Example protected page with GraphQL data       |

### 2FA Login Flow

When a user with 2FA enabled logs in:

1. User enters email and password on `/login`
2. Backend returns `requires_two_factor: true` with `user_id`
3. User is redirected to `/2fa/verify?user_id=X&callbackUrl=Y`
4. User enters TOTP code from authenticator app (or backup code)
5. On success, tokens are stored and user is redirected to `/2fa-callback`
6. Callback page completes the NextAuth sign-in and redirects to the original URL

## Dark Mode

The frontend includes a complete dark mode implementation with three theme options:

### Theme Options

| Theme    | Description                         |
| -------- | ----------------------------------- |
| `light`  | Light theme with white backgrounds  |
| `dark`   | Dark theme with dark backgrounds    |
| `system` | Follows operating system preference |

### Components

#### ThemeProvider

Wrap your application with `ThemeProvider` to enable theme support:

```tsx
import { ThemeProvider } from '@/components/theme';

export default function RootLayout({ children }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
```

#### ThemeToggle

A button component that cycles through themes (light → dark → system):

```tsx
import { ThemeToggle } from '@/components/ui';

<ThemeToggle />;
```

### How It Works

1. **ThemeScript** - Injects a script in `<head>` to prevent flash of unstyled content (FOUC)
2. **ThemeProvider** - React context that manages theme state and persistence
3. **localStorage** - Theme preference is persisted in `localStorage` under the key `theme`
4. **CSS class** - Theme is applied via `dark` class on `<html>` element (Tailwind's class-based dark mode)

### Tailwind Configuration

Dark mode is configured in `tailwind.config.ts`:

```typescript
export default {
  darkMode: 'class',
  // ...
};
```

### Styling for Dark Mode

Use Tailwind's `dark:` variant to style components for dark mode:

```tsx
<div className="bg-white dark:bg-gray-900">
  <p className="text-gray-900 dark:text-gray-100">
    This text adapts to the theme
  </p>
</div>
```

## Internationalization (i18n)

The frontend supports multiple languages using next-intl:

### Supported Locales

| Locale  | Language            |
| ------- | ------------------- |
| `en`    | English (default)   |
| `zh-TW` | Traditional Chinese |

### Configuration

i18n is configured in `src/i18n/`:

```text
src/i18n/
├── config.ts     # Locale configuration and types
├── request.ts    # Server-side locale detection
└── index.ts      # Exports
```

### Message Files

Translation messages are stored in `src/messages/`:

```text
src/messages/
├── en.json       # English translations
└── zh-TW.json    # Traditional Chinese translations
```

### Usage

#### In Server Components

```tsx
import { getTranslations } from 'next-intl/server';

export default async function Page() {
  const t = await getTranslations('common');
  return <h1>{t('welcome')}</h1>;
}
```

#### In Client Components

```tsx
'use client';
import { useTranslations } from 'next-intl';

export default function MyComponent() {
  const t = useTranslations('common');
  return <button>{t('submit')}</button>;
}
```

### LanguageSwitcher

A button component that cycles through available locales:

```tsx
import { LanguageSwitcher } from '@/components/ui';

<LanguageSwitcher />;
```

### Adding New Translations

1. Add translations to `src/messages/en.json`:

   ````json
   {
     "myFeature": {
       "title": "My Feature",
       "description": "Description here"
     }
   }
   ```text

   ````

2. Add corresponding translations to `src/messages/zh-TW.json`:

   ````json
   {
     "myFeature": {
       "title": "我的功能",
       "description": "描述在這裡"
     }
   }
   ```text

   ````

3. Use in components:
   ````tsx
   const t = useTranslations('myFeature');
   <h1>{t('title')}</h1>;
   ```text
   ````

## UI Components

The frontend includes a library of reusable UI components in `src/components/ui/`:

### Table

A flexible, generic table component with support for custom rendering, loading states, and row interactions:

```tsx
import { Table, type TableColumn } from '@/components/ui';

interface User {
  id: number;
  name: string;
  email: string;
}

const columns: TableColumn<User>[] = [
  { key: 'id', header: 'ID' },
  { key: 'name', header: 'Name' },
  { key: 'email', header: 'Email' },
];

<Table
  columns={columns}
  data={users}
  keyExtractor={(user) => user.id}
  striped
  hoverable
  loading={isLoading}
  emptyMessage="No users found"
  onRowClick={(user) => console.log('Clicked:', user)}
/>;
```

#### Table Props

| Prop           | Type                | Description                    |
| -------------- | ------------------- | ------------------------------ |
| `columns`      | `TableColumn<T>[]`  | Column definitions             |
| `data`         | `T[]`               | Data array                     |
| `keyExtractor` | `(item: T) => Key`  | Function to extract unique key |
| `striped`      | `boolean`           | Alternate row backgrounds      |
| `hoverable`    | `boolean`           | Highlight rows on hover        |
| `loading`      | `boolean`           | Show loading spinner           |
| `emptyMessage` | `string`            | Message when data is empty     |
| `onRowClick`   | `(item: T) => void` | Row click handler              |

### Pagination

A pagination component with first/last navigation and ellipsis for large page ranges:

```tsx
import { Pagination } from '@/components/ui';

<Pagination
  currentPage={1}
  totalPages={10}
  onPageChange={(page) => setCurrentPage(page)}
  showFirstLast={true}
/>;
```

#### Pagination Props

| Prop            | Type                     | Description                  |
| --------------- | ------------------------ | ---------------------------- |
| `currentPage`   | `number`                 | Current active page          |
| `totalPages`    | `number`                 | Total number of pages        |
| `onPageChange`  | `(page: number) => void` | Page change handler          |
| `showFirstLast` | `boolean`                | Show first/last page buttons |

### Tabs

A compound component for tabbed interfaces:

```tsx
import { Tabs, TabList, Tab, TabPanel } from '@/components/ui';

<Tabs defaultTab="tab1">
  <TabList>
    <Tab id="tab1">Account</Tab>
    <Tab id="tab2">Settings</Tab>
    <Tab id="tab3" disabled>
      Coming Soon
    </Tab>
  </TabList>
  <TabPanel id="tab1">
    <p>Account settings content</p>
  </TabPanel>
  <TabPanel id="tab2">
    <p>Settings content</p>
  </TabPanel>
  <TabPanel id="tab3">
    <p>Disabled tab content</p>
  </TabPanel>
</Tabs>;
```

### DropdownMenu

A compound component for dropdown menus with labels, separators, and destructive actions:

```tsx
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui';

<DropdownMenu>
  <DropdownMenuTrigger>
    <Button>Open Menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="left">
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuItem onClick={() => handleProfile()}>Profile</DropdownMenuItem>
    <DropdownMenuItem onClick={() => handleSettings()}>
      Settings
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem destructive onClick={() => handleLogout()}>
      Sign Out
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>;
```

#### DropdownMenuItem Props

| Prop          | Type         | Description                       |
| ------------- | ------------ | --------------------------------- |
| `onClick`     | `() => void` | Click handler                     |
| `disabled`    | `boolean`    | Disable the menu item             |
| `destructive` | `boolean`    | Style as destructive action (red) |

### Other Components

| Component | Description                                       |
| --------- | ------------------------------------------------- |
| `Button`  | Button with variants (primary, secondary, danger) |
| `Input`   | Form input with label and error state             |
| `Badge`   | Status badges with color variants                 |
| `Alert`   | Alert messages with success, error, warning, info |
| `Card`    | Container with header, content, and footer        |
| `Spinner` | Loading spinner                                   |

## Storybook

The project includes Storybook for component development and documentation:

### Running Storybook

```bash
# Start Storybook development server (port 6006)
pnpm storybook

# Build static Storybook site
pnpm build-storybook
```

### Available Stories

| Component        | Stories                                        |
| ---------------- | ---------------------------------------------- |
| Card             | Default, With Header, With Footer              |
| Checkbox         | Default, Checked, Disabled                     |
| FormField        | Default, With Error, Required                  |
| Input            | Default, With Placeholder, Disabled, With Icon |
| LanguageSwitcher | Default                                        |
| Modal            | Default, With Footer, Closable                 |
| Radio            | Default, Checked, Disabled, Group              |
| Select           | Default, With Options, Disabled                |
| Skeleton         | Default, Text, Avatar, Card                    |
| Spinner          | Default, Small, Large                          |
| StatCard         | Default, With Change, Colored                  |
| ThemeToggle      | Default                                        |
| Toast            | Success, Error, Warning, Info                  |
| Tooltip          | Default, Positions, With Delay                 |

### Writing Stories

Create story files alongside components with `.stories.tsx` extension:

```tsx
// Card.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    children: 'Card content',
  },
};

export const WithHeader: Story = {
  args: {
    header: 'Card Title',
    children: 'Card content',
  },
};
```

### Storybook Configuration

Storybook is configured in `apps/frontend/.storybook/`:

```text
.storybook/
├── main.ts      # Storybook configuration (addons, framework)
└── preview.tsx  # Global decorators and parameters
```

## Development Workflow

### Code Quality

This project enforces code quality through automated tooling:

- **ESLint** - Catches code issues and enforces consistent patterns (TypeScript/JavaScript)
- **Ruff** - Fast Python linter and formatter (replaces Black, Flake8, isort)
- **Prettier** - Ensures consistent code formatting
- **TypeScript** - Provides type safety for frontend

### Git Hooks

Git hooks automatically enforce code quality:

**Pre-commit** (runs on staged files):

1. **ESLint** fixes issues in `.js`, `.mjs`, `.ts`, `.tsx` files
2. **Prettier** formats all supported files
3. **Ruff** formats and lints Python files

**Commit-msg** (validates commit message):

- **commitlint** ensures commit messages follow the convention below

### Commit Convention

This project follows a structured commit message format.

```text
<Type>(<Scope>): <Subject>

<Optional Body>

<Optional Footer>
```

**Types**: `Build`, `Chore`, `CI`, `Deprecate`, `Docs`, `Feat`, `Fix`, `Perf`, `Refactor`, `Release`, `Test`, `Revert`, `Style`

**Scopes**: `API`, `Config`, `Framework`, `Function`, `Git`, `Infra`, `Lang`, `Module`, `Project`, `Theme`, `Vendor`, `Views`

**Example**:

```text
Feat(Module): Add user authentication module

1. Implement JWT-based authentication.
2. Add refresh token support.

Reference:
1. PJ-123.
```

## Testing

### Backend (pytest)

```bash
cd apps/backend

# Run all tests
uv run pytest

# Run with coverage
uv run pytest --cov

# Run with verbose output
uv run pytest -v
```

### RBAC Test Fixtures

The backend includes test fixtures for comprehensive RBAC testing in `tests/conftest.py`:

```python
import pytest

@pytest.fixture
async def super_admin_headers(client, db_session):
    """Create a super_admin user with all 20 permissions."""
    # Returns auth headers for super_admin user
    # Has: users/roles/permissions/files CRUD + hard_delete

@pytest.fixture
async def admin_headers(client, db_session):
    """Create an admin user with 10 permissions."""
    # Returns auth headers for admin user
    # Has: users CRUD, roles:read, permissions:read, files CRUD

@pytest.fixture
async def auth_headers(client):
    """Create a regular user with 3 permissions."""
    # Returns auth headers for regular user
    # Has: users:read, files:read, files:create
```

Usage in tests:

```python
async def test_super_admin_can_delete_user(client, super_admin_headers):
    response = await client.delete(
        "/api/v1/users/1",
        headers=super_admin_headers
    )
    assert response.status_code == 200

async def test_regular_user_cannot_delete_user(client, auth_headers):
    response = await client.delete(
        "/api/v1/users/1",
        headers=auth_headers
    )
    assert response.status_code == 403
```

### Frontend Unit Tests (Vitest)

```bash
# Run all tests
pnpm --filter frontend test

# Run with coverage
pnpm --filter frontend test:cov

# Watch mode
pnpm --filter frontend test:watch
```

### Frontend E2E Tests (Playwright)

```bash
# Run all E2E tests
pnpm --filter frontend test:e2e

# Open interactive UI mode
pnpm --filter frontend test:e2e:ui

# Run with visible browser
pnpm --filter frontend test:e2e:headed

# Debug mode
pnpm --filter frontend test:e2e:debug

# View test report
pnpm --filter frontend test:e2e:report
```

E2E tests cover 20 scenarios including:

- **Authentication** (8 tests): Registration, login, logout, password reset, email verification, 2FA.
- **Profile** (3 tests): View, update, change password.
- **Navigation** (3 tests): Authenticated/unauthenticated navigation, permission handling.
- **i18n** (1 test): Language switching.
- **Theme** (1 test): Dark mode toggle.
- **API** (1 test): REST/GraphQL mode switching.
- **Error Handling** (3 tests): Network errors, form validation, 404 pages.

## Database Engine Selection

The backend supports two database engines via Docker Compose profiles:

| Engine      | Use Case                                      |
| ----------- | --------------------------------------------- |
| PostgreSQL  | General relational data (default)             |
| TimescaleDB | Time-series data (IoT, metrics, logs, events) |

### Starting with PostgreSQL

```bash
docker compose -f docker-compose.prod.yml --profile postgres up -d
```

### Starting with TimescaleDB

```bash
docker compose -f docker-compose.prod.yml --profile timescaledb up -d
```

### Environment Configuration

Set the `DATABASE_ENGINE` environment variable to match your chosen engine:

```bash
# In apps/backend/.env
DATABASE_ENGINE=postgres  # or timescaledb
```

### TimescaleDB Settings

When using TimescaleDB, additional settings are available:

| Variable                           | Default | Description                     |
| ---------------------------------- | ------- | ------------------------------- |
| `TIMESCALE_COMPRESSION_ENABLED`    | `true`  | Enable automatic compression    |
| `TIMESCALE_COMPRESSION_AFTER_DAYS` | `7`     | Compress chunks older than days |
| `TIMESCALE_RETENTION_DAYS`         | `0`     | Drop old data (0 = disabled)    |
| `TIMESCALE_CHUNK_INTERVAL`         | `1 day` | Hypertable chunk interval       |

### TimescaleDB Module (Optional)

The backend includes an optional `timeseries` module for managing hypertables:

```python
# Use in your router or service
from src.app.modules.timeseries import TimeseriesService, get_timeseries_service

@router.post("/setup-hypertable")
async def setup_hypertable(
    service: TimeseriesService = Depends(get_timeseries_service),
):
    await service.create_hypertable("metrics")
    await service.enable_compression("metrics")
    await service.add_compression_policy("metrics")
    return {"status": "ok"}
```

The module provides:

- `TimeseriesService` for creating hypertables, compression policies, and retention policies
- Example models: `Metric`, `DeviceReading`, `AuditLog`

### Important Notes

- Only use one engine at a time (do not run both profiles simultaneously)
- Data cannot be migrated between engines directly
- TimescaleDB requires the `DATABASE_ENGINE=timescaledb` setting to enable the extension

## Docker

### Using Docker Compose

```bash
# Start all services
docker compose up

# Start in detached mode
docker compose up -d

# Stop services
docker compose down

# Rebuild images
docker compose up --build
```

### Build Individual Images

```bash
# Backend
cd apps/backend
docker build -t backend .
docker run -p 8000:8000 backend

# Frontend (from root directory)
docker build -f apps/frontend/Dockerfile -t frontend .
docker run -p 3000:3000 frontend
```

### Production Deployment with Nginx

Before deploying, you need to:

1. **Create environment files** from the examples:

```bash
cp apps/backend/.env.production.example apps/backend/.env.production
cp apps/frontend/.env.production.example apps/frontend/.env.production
```

2. **Configure SSL certificates** in `nginx/ssl/` directory:
   - `cert.pem` - SSL certificate
   - `key.pem` - SSL private key

3. **Edit the environment files** with your production values.

Then start the services:

```bash
# Start with Nginx reverse proxy (HTTPS, rate limiting, WebSocket support)
docker compose -f docker-compose.prod.yml up -d

# View logs
docker compose -f docker-compose.prod.yml logs -f

# Stop services
docker compose -f docker-compose.prod.yml down
```

## Adding Shared Packages

The `packages/` directory is ready for shared code:

1. Create a new package in `packages/your-package`.
2. Add a `package.json` with `"name": "@repo/your-package"`.
3. Reference it in apps: `"@repo/your-package": "workspace:*"`.

## Production Deployment

Before deploying to production, review the following checklist:

### Environment Variables

| Variable         | Description                                          | Required |
| ---------------- | ---------------------------------------------------- | -------- |
| `JWT_SECRET_KEY` | Strong secret key for JWT signing (min 32 chars)     | Yes      |
| `DATABASE_URL`   | Production database connection string                | Yes      |
| `CORS_ORIGINS`   | Allowed origins (e.g., `["https://yourdomain.com"]`) | Yes      |
| `ENVIRONMENT`    | Set to `production`                                  | Yes      |
| `DEBUG`          | Set to `false`                                       | Yes      |

### Security Checklist

- [ ] Change `JWT_SECRET_KEY` from default value.
- [ ] Configure `CORS_ORIGINS` with specific domains (not `*`).
- [ ] Set `DEBUG=false`.
- [ ] Set `ENVIRONMENT=production`.
- [ ] Review and adjust rate limiting settings.
- [ ] Use HTTPS in production.
- [ ] Configure proper database credentials.

### OpenAPI Documentation (Optional)

For public APIs, consider adding these settings in `apps/backend/src/app/main.py`:

```python
app = FastAPI(
    # ... existing settings ...
    contact={
        "name": "API Support",
        "url": "https://yourdomain.com/support",
        "email": "support@yourdomain.com",
    },
    terms_of_service="https://yourdomain.com/terms",
    servers=[
        {"url": "https://api.yourdomain.com", "description": "Production"},
        {"url": "https://staging-api.yourdomain.com", "description": "Staging"},
    ],
)
```

### Rate Limiting

Default rate limits can be adjusted via environment variables:

| Variable                      | Default | Description               |
| ----------------------------- | ------- | ------------------------- |
| `RATE_LIMIT_REQUESTS`         | 100     | Requests per window       |
| `RATE_LIMIT_WINDOW`           | 60      | Window in seconds         |
| `RATE_LIMIT_AUTH_REQUESTS`    | 20      | Auth endpoint requests    |
| `RATE_LIMIT_GRAPHQL_REQUESTS` | 50      | GraphQL endpoint requests |
