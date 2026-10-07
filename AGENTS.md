# Working in this repository

PrognosEL's web app: Next.js 14 (App Router) and Supabase, deployed on Vercel.
It is also a shared working copy — more than one assistant session works in
`.repos/prognosel-mobile`, sometimes at the same time.

## Never work in the shared checkout

Two sessions editing one checkout has already destroyed uncommitted work once.
One session ran `git checkout -b`, which moved `HEAD` under the other session's
feet; the other session's next `git reset --hard` measured against that stale
`HEAD` and deleted its own unpushed edits. Nothing about that required two people
merging — it only required two sessions in one directory.

So for any change, get your own checkout first:

```bash
git fetch origin main
git worktree add -b <branch> /tmp/prognosel-<topic> origin/main
```

Do all editing, committing and pushing inside that worktree. Remove it once the
pull request is merged or closed:

```bash
git worktree remove /tmp/prognosel-<topic>
git branch -D <branch>
```

In the shared checkout, read-only git commands only: `status`, `log`, `show`,
`diff`, `fetch`, `ls-remote`. Never `checkout`, `switch`, `reset`, `stash`, `add`
or `commit` there — those move state that another session may be standing on.

## Branches and pull requests

Do not commit to `main`. Branch, open a pull request, squash-merge it, delete the
branch.

| Prefix | For |
|---|---|
| `content/*` | guide articles and other Swedish copy |
| `fix/*` | bug fixes |
| `feat/*` | new features |
| `chore/*` | tooling, dependencies, documentation |

**The scheduled content session writes the article and opens the pull request, and
stops there.** It does not merge. Merging is done from the main session, which runs
the checks below first. A weekly job that ends with an open pull request cannot put
something into production that nobody looked at.

## Checks

```bash
npx tsc --noEmit   # typecheck
npm test           # node:test, no framework
npm run lint       # next lint
npm run build      # needs network: it prerenders pages from live price data
```

Run all four before opening a pull request. `npm run build` fails in a sandbox
without network access, which is not a real failure — rerun it with network.

## Database changes

Schema changes belong in `supabase/migrations/<timestamp>_<name>.sql`. There is no
migration runner: **the file is the record, and a human pastes its contents into
the Supabase SQL Editor.** A migration nobody pasted is a migration that does
nothing, so state that plainly in the pull request instead of assuming the deploy
applied it.

Write them so they are safe to run twice (`create table if not exists`,
`add column if not exists`), because being pasted by hand means being pasted more
than once.

## Deployment gotchas

- `next.config.js` sets `trailingSlash: true`, so server routes live at
  `/api/thing/` — without the trailing slash the request takes a 308 first.
  Scheduled jobs in `vercel.json` must use the trailing-slash path.

- Vercel's Hobby plan runs cron jobs with **per-hour** precision (up to ±59
  minutes), so a job scheduled for `0 5 * * *` may fire anywhere inside the
  06:00–08:00 Stockholm window. Gate scheduled work on a range, never on an exact
  hour, and make one-shot work claim a slot in `push_state` instead of trusting the
  clock. See `app/api/push/tick/route.ts`.
