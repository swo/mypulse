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

`direction` is optional and filters to arrivals heading toward a given terminus. It resolves (via `trips.txt`) to the full set of `(route, direction_id)` pairs that ever end there, rather than to a single label, because several lines have short-turn or rush-hour-extension trips that give the _same_ route+direction more than one real terminus — e.g. Yellow Line trains signed "direction 0" normally end at Mt Vernon Sq, but rush-hour ones continue to Greenbelt. It also can't rely on platform IDs alone: some stations (e.g. Columbia Heights) use one shared platform for both directions. `direction` can be a single string or an array of strings, for a shared trunk served by lines with different termini in the same physical direction (e.g. Green ends at "Branch Av" and Yellow at "Huntington" heading the same way south) — list both, or you'll silently drop one line's trains, exactly as happened when this was first built with only `"Branch Av"`.

Run `pnpm build-stations` after editing to resolve it into `src/data/stations.json`. A bad station name or a direction term that matches no trip anywhere causes a non-zero exit, so typos aren't silent.

## Dev tools

```sh
pnpm build           # typecheck + production build to dist/
pnpm build-stations  # regenerate src/data/stations.json from GTFS static (needs .env.local)
pnpm check-stations  # verify stations.json still matches the live feed, no write (what CI runs)
pnpm list-stations   # print every official GTFS station name
pnpm verify          # headless-browser smoke test: loads the app, prints it, fails on console errors
```
