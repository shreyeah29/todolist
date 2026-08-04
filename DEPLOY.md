# Deploy (local-first)

Toso currently runs **without Supabase**.

All tasks, notes, folders, and settings are stored in the browser with **IndexedDB**.

## Vercel

1. Deploy the GitHub repo as usual
2. No environment variables are required
3. Open the site and use Planner / Knowledge Hub immediately

Production example: `https://todolist-gilt-pi.vercel.app`

## Notes

- Data is per-browser / per-device
- Clearing site data deletes the workspace
- Use Settings → Reset local data to wipe and reseed default folders
- Cloud sync (Supabase) can be added later without changing the product UI

## Local development

```bash
npm install
npm run dev
```
