# mypulse

Client-side dashboard of WMATA Rail arrival predictions for a chosen set of stations and directions. Everything runs in the browser.

## Getting started

To run locally:

1. Get a WMATA API key.
1. Put it in `.env.local`. (See `.env.example` for a template.)
1. `pnpm install`
1. `pnpm dev`

To deploy:

1. Put the API key in the repo: Settings | Secrets and variables | Actions | Repository secret | Name `WMATA_API_KEY`.

## How it works

The app polls WMATA's [GTFS-realtime TripUpdates](https://api.wmata.com/gtfs/rail-gtfsrt-tripupdates.pb) feed and decodes it. Station metadata is resolved infrequently using `scripts/build-station-data.mjs` and committed as a static file `src/data/stations.json`.

To change the displayed stations and directions, edit `src/queries/queries.json`. `stationName` must exactly match a station name in WMATA's GTFS static `stops.txt`; run `pnpm list-stations` to print every official name.

`direction` is optional and filters to arrivals heading toward a named terminus, e.g. `"Greenbelt"`. Use an array, e.g. `["Branch Av", "Huntington"]`, when a shared trunk is served by multiple lines that end at different names in the same physical direction.

Run `pnpm build-stations` after editing `queries.json` to resolve it into `src/data/stations.json`. A bad station name or a direction term that matches no trip anywhere causes a non-zero exit, so typos aren't silent.

## Dev tools

```sh
pnpm build           # typecheck + production build to dist/
pnpm build-stations  # regenerate src/data/stations.json from GTFS static (needs .env.local)
pnpm check-stations  # verify stations.json still matches the live feed, no write (what CI runs)
pnpm list-stations   # print every official GTFS station name
pnpm verify          # headless-browser smoke test: loads the app, prints it, fails on console errors
```
