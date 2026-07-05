# mypulse

Client-side dashboard of WMATA Metrorail arrival predictions for a chosen set of stations.
Everything runs in the browser — no backend — and is designed to be hosted on GitHub Pages.

## How it works

- **Live data**: polls WMATA's [GTFS-realtime TripUpdates](https://api.wmata.com/gtfs/rail-gtfsrt-tripupdates.pb)
  feed (protobuf) directly from the browser every 30s and decodes it with `gtfs-realtime-bindings`.
- **Station metadata**: WMATA's GTFS static feed (station names, platform IDs, line colors) is
  resolved once by `scripts/build-station-data.mjs` into the small, committed `src/data/stations.json`
  — the app never fetches or parses the (30MB) static feed itself. `.github/workflows/check-station-data.yml`
  re-checks this against the live feed on every merge to main and **fails the workflow** (no auto-commit)
  if it's drifted — e.g. WMATA renamed/removed a station or platform — so it gets fixed deliberately with
  `pnpm build-stations` rather than silently patched in the background. This is expected to be rare.
- **What to watch**: edit `src/queries/queries.json` — add `{ "id": "...", "label": "...", "stationName": "..." }`
  entries, where `stationName` must exactly match a station name in WMATA's GTFS static `stops.txt`.
  Run `pnpm list-stations` to print every official station name, then `pnpm build-stations` to
  resolve it into `src/data/stations.json`.
  `build-stations` exits non-zero and lists any query it couldn't resolve, so a typo won't fail silently.

## API key

The WMATA API key is required by every request (including from the browser), so it is visible in
the deployed bundle/network requests. This is normal for client-side WMATA apps — keys are free and
rate-limited per key. It must never be committed to the repo, though:

- Local dev: put it in `.env.local` (gitignored) as `VITE_WMATA_API_KEY=...`, see `.env.example`.
- CI/deploy: add it as a repository secret named `WMATA_API_KEY` (Settings → Secrets and variables →
  Actions). Both `deploy.yml` and `check-station-data.yml` inject it as `VITE_WMATA_API_KEY` at build time.

## Commands

```sh
pnpm install
pnpm dev              # local dev server
pnpm build             # typecheck + production build to dist/
pnpm build-stations    # regenerate src/data/stations.json from GTFS static (needs .env.local)
pnpm check-stations    # verify stations.json still matches the live feed, no write (what CI runs)
pnpm list-stations      # print every official GTFS station name
```

## Deploying

Push to `main` — `.github/workflows/deploy.yml` builds and publishes to GitHub Pages automatically.
Enable Pages in the repo settings with source "GitHub Actions" first.
