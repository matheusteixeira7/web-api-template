# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
# Generate Prisma client (required after schema changes)
pnpm db:generate

# Run migrations in development
pnpm db:migrate

# Deploy migrations to production
pnpm db:deploy

# Push schema changes directly (dev only, no migration files)
pnpm db:push

# Open Prisma Studio
pnpm studio

# Seed the database
pnpm db:seed

# Build the package (runs prisma generate first)
pnpm build

# Development mode with watch
pnpm dev
```

## Architecture

This package provides the database layer using **Prisma ORM** with PostgreSQL.

### Key Files

- `prisma/schema.prisma` - Database schema definition
- `src/client.ts` - Singleton PrismaClient instance with pg adapter
- `src/index.ts` - Package exports (prisma client + generated types)
- `generated/prisma/` - Auto-generated Prisma client (gitignored)

### Usage in Other Packages

Import from `@workspace/database`:

```typescript
import { prisma, User } from '@workspace/database';

// Use the singleton client
const user = await prisma.user.findUnique({ where: { id } });
```

### Build Output

The package uses tsup with `--shims` flag to compile TypeScript to CommonJS. The `--shims` flag provides `import.meta.url` polyfill required by Prisma 7.x generated client.

- `main` and `exports.default` point to `./dist/index.js` (compiled JS for runtime)
- `types` and `exports.types` point to `./src/index.ts` (TypeScript for type checking)

### Environment Variables

Requires `DATABASE_URL` in `.env`:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/db
```
