# PrognosEL Mobile

Responsive mobile web app for Swedish electricity price forecasting.

## Tech Stack

- Next.js 14 + React 18 + TypeScript
- Tailwind CSS
- Supabase Auth (Google/GitHub OAuth)
- Kimi API (Sparky AI Chat)

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
KIMI_API_KEY=your-moonshot-api-key
```

## Development

```bash
npm run dev
```

## Deployment

Deploy to Vercel:

```bash
vercel --prod
```

## Screens

1. **Login** — Google/GitHub OAuth + language toggle
2. **Zone Selection** — SE1-SE4 electricity area selection
3. **Home** — Current price, stats, 24h forecast chart, smart tips
4. **Weekly Planner** — Day selector, price heatmap, best windows
5. **Sparky** — AI chat assistant for electricity advice
6. **Tasks** — Day streak, progress, task list with savings tracking
7. **Settings** — Profile, notifications, language, sign out
