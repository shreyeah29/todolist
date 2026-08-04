# Toso

Personal productivity operating system — Planner + Knowledge Hub.

## Stack

- Next.js 15 · React 19 · TypeScript
- Tailwind CSS · shadcn/ui · Framer Motion
- Supabase (Auth, Postgres, Storage, Realtime)
- TanStack Query · Zustand · TipTap · Recharts

## Getting started

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Configure Supabase keys in `.env.local` before enabling auth-protected flows.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Turbopack dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
| `npm run typecheck` | TypeScript check |

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for system design.
See [DEPLOY.md](./DEPLOY.md) for Vercel + Supabase setup.

## Build status

| Step | Status |
|---|---|
| 1. Architecture | Done |
| 2. Folder structure + scaffold | Done |
| 3. UI design system + shell | Done |
| 4–7. Components, Planner, Knowledge, Supabase | In progress (core live) |
| 8. Animations | Partial |
| 9. Performance | Partial |
