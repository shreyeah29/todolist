# Deploy & Supabase setup

Production URL example: `https://todolist-gilt-pi.vercel.app`

## 1. Create a Supabase project

1. Create a project at [supabase.com](https://supabase.com)
2. Open **SQL Editor**
3. Paste and run `supabase/migrations/20260804120000_init_schema.sql`

## 2. Auth redirect URLs

In Supabase → Authentication → URL configuration:

- Site URL: `https://todolist-gilt-pi.vercel.app`
- Redirect URLs: 
  - `https://todolist-gilt-pi.vercel.app/callback`
  - `http://localhost:3000/callback`

## 3. Vercel environment variables

Project → Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
NEXT_PUBLIC_APP_URL=https://todolist-gilt-pi.vercel.app
```

Then **Redeploy**.

## 4. Local

```bash
cp .env.example .env.local
# fill values
npm run dev
```
