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
- **Authentication** - JWT-based auth with user registration, login, and refresh tokens
- **Dashboard Example** - Protected page demonstrating authenticated GraphQL calls
- **Input Validation** - Consistent input validation for both REST and GraphQL APIs
- **Error Codes** - Standardized error codes across REST and GraphQL endpoints
- **API Security** - Rate limiting, query depth limiting, and complexity analysis
- **Utility-First CSS** - TailwindCSS 3 for rapid UI development
- **Code Quality** - ESLint 9 (flat config), Prettier, and Ruff pre-configured
- **Git Hooks** - Husky and lint-staged for automated code quality checks
- **Testing Ready** - pytest for backend, Vitest with React Testing Library for frontend
- **Developer Experience** - Hot reload, path aliases, and consistent tooling

## Tech Stack

### Backend

- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [SQLAlchemy](https://www.sqlalchemy.org/) 2 - Async ORM with SQLite and PostgreSQL support
- [Strawberry GraphQL](https://strawberry.rocks/) - Python GraphQL library
- [Uvicorn](https://www.uvicorn.org/) - ASGI server
- [pydantic-settings](https://docs.pydantic.dev/latest/concepts/pydantic_settings/) - Settings management
- [uv](https://github.com/astral-sh/uv) - Fast Python package manager
- [Ruff](https://docs.astral.sh/ruff/) - Python linter and formatter
- [pytest](https://docs.pytest.org/) - Testing framework

### Frontend

- [Next.js](https://nextjs.org/) 16 - React framework with Turbopack
- [React](https://react.dev/) 19 - UI library
- [TailwindCSS](https://tailwindcss.com/) 3 - Utility-first CSS framework
- [urql](https://commerce.nearform.com/open-source/urql/) - GraphQL client
- [GraphQL Codegen](https://the-guild.dev/graphql/codegen) - TypeScript types from schema
- [Zod](https://zod.dev/) - TypeScript-first schema validation
- [Vitest](https://vitest.dev/) 4 - Testing framework
- [React Testing Library](https://testing-library.com/react) - Component testing

### Development Tools

- [pnpm](https://pnpm.io/) - Fast, disk space efficient package manager
- [ESLint](https://eslint.org/) 9 - Code linting with flat config
- [Prettier](https://prettier.io/) 3 - Code formatting
- [Husky](https://typicode.github.io/husky/) - Git hooks
- [lint-staged](https://github.com/lint-staged/lint-staged) - Run linters on staged files
- [commitlint](https://commitlint.js.org/) - Lint commit messages
- [@hey-api/openapi-ts](https://heyapi.dev/) - OpenAPI TypeScript client generator

## Project Structure

```
fastapi-nextjs-tailwindcss-starter/
├── apps/
│   ├── backend/                    # FastAPI backend application
│   │   ├── src/
│   │   │   └── app/
│   │   │       ├── core/
│   │   │       │   └── config.py   # Application settings
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
│       │   │   ├── layout.tsx      # Root layout
│       │   │   ├── page.tsx        # Home page
│       │   │   ├── page.test.tsx   # Page tests
│       │   │   └── globals.css     # Global styles with Tailwind
│       │   ├── config/
│       │   │   └── env.ts          # Environment validation
│       │   ├── lib/
│       │   │   └── api.ts          # API client wrapper
│       │   └── test/
│       │       └── setup.ts        # Vitest setup
│       ├── .env.example            # Environment variables template
│       ├── vitest.config.ts        # Vitest configuration
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
- **REST API Docs**: <http://localhost:8000/docs>
- **GraphiQL**: <http://localhost:8000/graphql>

## Available Scripts

### Root Level

| Command              | Description                             |
| -------------------- | --------------------------------------- |
| `pnpm dev`           | Start frontend in development mode      |
| `pnpm dev:backend`   | Start backend in development mode       |
| `pnpm dev:frontend`  | Start frontend in development mode      |
| `pnpm build`         | Build frontend for production           |
| `pnpm test`          | Run tests in all apps                   |
| `pnpm test:backend`  | Run backend tests                       |
| `pnpm test:frontend` | Run frontend tests                      |
| `pnpm test:cov`      | Run tests with coverage in all apps     |
| `pnpm lint`          | Run ESLint across the workspace         |
| `pnpm lint:fix`      | Fix ESLint issues automatically         |
| `pnpm lint:backend`  | Run Ruff linter on backend              |
| `pnpm format`        | Format code with Prettier and Ruff      |
| `pnpm format:check`  | Check code formatting without modifying |
| `pnpm generate:api`  | Generate TypeScript API client          |

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

| Command                             | Description             |
| ----------------------------------- | ----------------------- |
| `pnpm --filter frontend dev`        | Start with Turbopack    |
| `pnpm --filter frontend build`      | Build for production    |
| `pnpm --filter frontend start`      | Run production build    |
| `pnpm --filter frontend test`       | Run tests               |
| `pnpm --filter frontend test:watch` | Run tests in watch mode |
| `pnpm --filter frontend test:cov`   | Run tests with coverage |

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

The GraphQL endpoint is available at `/graphql` with an interactive GraphiQL IDE.

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

The GraphQL API includes security protection:

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

### Frontend (Vitest)

```bash
# Run all tests
pnpm --filter frontend test

# Run with coverage
pnpm --filter frontend test:cov

# Watch mode
pnpm --filter frontend test:watch
```

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

## Adding Shared Packages

The `packages/` directory is ready for shared code:

1. Create a new package in `packages/your-package`.
2. Add a `package.json` with `"name": "@repo/your-package"`.
3. Reference it in apps: `"@repo/your-package": "workspace:*"`.
