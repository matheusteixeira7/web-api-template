# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**HealthSync** - SaaS platform for scheduling and management for small/medium clinics in Brazil.

Key features:
- Multi-professional appointment scheduling
- Patient management
- Automatic WhatsApp confirmations
- Public booking link
- Real-time dashboard
- Subscription and billing management
- Analytics and ROI dashboard

See `docs/business-plan.md` for detailed requirements and user stories.

**IMPORTANT**: Before writing or modifying code, read `docs/ARCHITECTURE.md` for detailed architectural patterns and design principles. Always follow:
- Facade Pattern for inter-module communication
- Repository Pattern for data access abstraction
- Use Case Pattern for business logic (one operation per class)
- Entity Pattern for domain models
- Application Service Pattern for cross-module transactional operations

## Code Standards

**NEVER use `any` type** - This project strictly forbids the use of `any`. ESLint is configured with:
- `@typescript-eslint/no-explicit-any: error`
- `@typescript-eslint/no-unsafe-assignment: error`
- `@typescript-eslint/no-unsafe-member-access: error`
- `@typescript-eslint/no-unsafe-call: error`
- `@typescript-eslint/no-unsafe-return: error`
- `@typescript-eslint/no-unsafe-argument: error`

Always use proper types. For external API responses, create interfaces and cast with `as Type`.

## Build & Development Commands

```bash
# Install dependencies
pnpm install

# Start all apps in development mode
pnpm dev

# Build all apps
pnpm build

# Lint all apps
pnpm lint

# Format code
pnpm format
```

### API (NestJS + Fastify)
```bash
# Run API in development mode
pnpm --filter api dev

# Run tests
pnpm --filter api test

# Run single test file
pnpm --filter api test path/to/file.spec.ts

# Run e2e tests
pnpm --filter api test:e2e

# Build API
pnpm --filter api build
```

### Web (Next.js)
```bash
# Run web in development mode
pnpm --filter web dev

# Build web
pnpm --filter web build

# Type check
pnpm --filter web typecheck
```

### Database (Prisma ORM)
```bash
# Generate Prisma client
pnpm --filter @workspace/database db:generate

# Run migrations (dev)
pnpm --filter @workspace/database db:migrate

# Push schema changes (dev only)
pnpm --filter @workspace/database db:push

# Open Prisma Studio
pnpm --filter @workspace/database studio

# Build database package
pnpm --filter @workspace/database build
```

### Docker
```bash
# Start PostgreSQL with pgvector
docker compose up -d
```

## Architecture

This is a **pnpm monorepo** using **Turborepo** for orchestration.

### Apps
- **`apps/api`**: NestJS API using Fastify adapter, runs on port 3333
- **`apps/web`**: Next.js 15 with React 19, Turbopack, and shadcn/ui

### Packages
- **`packages/database`**: Prisma ORM with PostgreSQL, exports database client and generated types
- **`packages/ui`**: Shared shadcn/ui components (import as `@workspace/ui/components/...`)
- **`packages/eslint-config`**: Shared ESLint configuration
- **`packages/typescript-config`**: Shared TypeScript configuration

### Key Patterns

**API Module Structure** (`apps/api/src/modules/`):
- `controllers/` - HTTP controllers
- `use-cases/` - Business logic services
- `dto/` - Data transfer objects
- `entities/` - Entity definitions

**Database** (`packages/database/`):
- Schema defined in `prisma/schema.prisma`
- Import client and types: `import { prisma, User } from '@workspace/database'`
- Generated Prisma client in `generated/prisma/` (gitignored, run `db:generate`)

**Authentication** (`apps/api/src/infra/auth/` and `apps/api/src/modules/auth/`):
- Custom JWT-based authentication with Passport.js
- RS256 algorithm with RSA key pairs
- Access token (15min) + Refresh token (7 days) stored in httpOnly cookies
- CSRF protection for mutating requests
- Google OAuth integration

Key endpoints:
- `POST /sessions` - Login with email/password
- `DELETE /sessions` - Logout
- `POST /auth/refresh` - Refresh access token
- `GET /auth/google/url` - Get Google OAuth URL
- `POST /auth/google/callback` - Handle OAuth callback
- `GET /me` - Get current user (protected)

**Frontend Authentication** (`apps/web/`):
- `hooks/use-session.ts` - Session management with React Query
- `hooks/use-login.ts` - Login mutation
- `lib/api.ts` - HTTP client with automatic token refresh and CSRF handling

**User Roles**:
- `ADMIN` - Clinic administrator (can manage subscription, billing)
- `USER` - Regular staff (receptionist, etc.)

## Environment Variables

The API requires these environment variables:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/db
JWT_PRIVATE_KEY=<RSA private key base64>
JWT_PUBLIC_KEY=<RSA public key base64>
GOOGLE_CLIENT_ID=<Google OAuth client ID>
GOOGLE_CLIENT_SECRET=<Google OAuth client secret>
FRONTEND_URL=http://localhost:3000
```

The Web app requires:

```env
NEXT_PUBLIC_API_URL=http://localhost:3333
```
- Always use descriptive variable names