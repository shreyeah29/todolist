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

See [ARCHITECTURE.md](./ARCHITECTURE.md) for system design, schema, and build sequence.

## Build status

| Step | Status |
|---|---|
| 1. Architecture | Done |
| 2. Folder structure + scaffold | In progress |
| 3. UI design system + shell | Pending |
| 4. Reusable components | Pending |
| 5. Planner module | Pending |
| 6. Knowledge Hub | Pending |
| 7. Supabase hardening | Pending |
| 8. Animations | Pending |
| 9. Performance | Pending |
