# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

### Database (Drizzle ORM)
```bash
# Generate migrations
pnpm --filter @workspace/db db:generate

# Run migrations
pnpm --filter @workspace/db db:migrate

# Push schema changes (dev only)
pnpm --filter @workspace/db db:push

# Open Drizzle Studio
pnpm --filter @workspace/db db:studio

# Build db package
pnpm --filter @workspace/db build
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
- **`packages/db`**: Drizzle ORM with PostgreSQL, exports database client and schema
- **`packages/ui`**: Shared shadcn/ui components (import as `@workspace/ui/components/...`)
- **`packages/eslint-config`**: Shared ESLint configuration
- **`packages/typescript-config`**: Shared TypeScript configuration

### Key Patterns

**API Module Structure** (`apps/api/src/modules/`):
- `controller/` - HTTP controllers
- `use-cases/` - Business logic services
- `dto/` - Data transfer objects
- `entities/` - Entity definitions

**Database Schema** (`packages/db/src/schema/`):
- Uses better-auth tables (user, session, account, verification)
- Import schema from `@workspace/db/schema`
- Import db client from `@workspace/db`

**Authentication**: Uses `better-auth` with `@thallesp/nestjs-better-auth` integration.

## Environment Variables

The API requires `DATABASE_URL` for PostgreSQL connection. Default docker-compose database URL:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/db
```
