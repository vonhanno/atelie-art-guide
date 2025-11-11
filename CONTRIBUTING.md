# Contributing Guide

## Development Workflow

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Environment

Copy `.env.example` to `.env` and fill in your credentials:

```bash
# You'll need to create .env manually with the variables from SETUP.md
```

### 3. Database Setup

```bash
# Generate Prisma client
pnpm db:generate

# Create and run migrations
pnpm db:migrate
```

### 4. Start Development Servers

Run all services in parallel:

```bash
pnpm dev
```

Or run individually:

```bash
# Terminal 1: API Server (port 3001)
cd apps/api && pnpm dev

# Terminal 2: Worker
cd apps/worker && pnpm dev

# Terminal 3: Admin Dashboard (port 3000)
cd apps/admin && pnpm dev
```

## Project Structure

- **apps/admin**: Next.js 15 dashboard with Algolia search and batch processing UI
- **apps/api**: Fastify REST API for artwork search and analysis management
- **apps/worker**: BullMQ worker that processes AI analysis jobs
- **packages/db**: Prisma schema and database client
- **packages/shared**: Shared TypeScript types and Zod schemas

## Code Style

- Use TypeScript for all new code
- Follow existing code patterns
- Use Zod for runtime validation
- Use shadcn/ui components in the admin app
- Write descriptive commit messages

## Testing

Before submitting:

1. Ensure all services start without errors
2. Test the admin dashboard workflow:
   - Search artworks
   - Select and enqueue for analysis
   - Monitor batch processing
   - View analysis results
3. Check that worker processes jobs correctly
4. Verify API endpoints return expected data

## Database Migrations

When modifying the Prisma schema:

```bash
# Create a new migration
pnpm db:migrate

# Apply migrations in production
pnpm db:migrate --name production
```

## Adding New Features

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Update documentation if needed
5. Submit a pull request

