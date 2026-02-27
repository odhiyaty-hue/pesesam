# Tournament Management App

## Overview
A full-stack tournament management application for organizing and tracking gaming tournaments. Players can register, view brackets or group stages, and upload match result screenshots. Admins can create tournaments, generate brackets, and validate match winners.

## Architecture

### Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express 5
- **Database**: PostgreSQL via Drizzle ORM
- **Auth**: Supabase Auth (client-side) synced to internal user DB
- **UI**: Radix UI primitives + Tailwind CSS (Shadcn pattern)
- **State**: TanStack Query (React Query)
- **Routing**: Wouter

### Project Structure
```
client/src/        - React frontend
server/            - Express backend (API + Vite dev middleware)
shared/            - Shared types, schema, and API contracts (Zod)
script/            - Build scripts
```

### Key Files
- `server/index.ts` - Express app entry point, serves on PORT (default 5000)
- `server/routes.ts` - All API routes and tournament logic
- `server/storage.ts` - Database access layer (interface pattern)
- `server/db.ts` - Drizzle ORM + pg Pool setup
- `shared/schema.ts` - Drizzle schema (users, tournaments, participants, matches, results)
- `client/src/App.tsx` - Frontend routes
- `client/src/hooks/use-auth.tsx` - Supabase auth hook + client

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (required)
- `PORT` - Server port (default: 5000)
- `IMGBB_API_KEY` - ImgBB API key for image hosting (optional, falls back to mock URL)
- `VITE_SUPABASE_URL` - Supabase project URL (client-side)
- `VITE_SUPABASE_ANON_KEY` - Supabase anon key (client-side)

## Development
- `npm run dev` - Start dev server with Vite HMR on port 5000
- `npm run build` - Build for production
- `npm run start` - Run production build
- `npm run db:push` - Push schema changes to database

## Security Notes
- No hardcoded secrets; all credentials via environment variables
- Supabase anon key is intentionally public (safe for client-side use)
- IMGBB_API_KEY kept server-side only (proxied through Express)
- Database URL never exposed to client
