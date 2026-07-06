// Resolves the stations listed in src/queries.json against WMATA's GTFS
// static feed, and writes the small, app-facing src/stations.json.
//
//   pnpm build-stations         regenerate the file locally after editing queries.json
//   pnpm check-stations         (or --check) verify the committed file still matches
//                               the live feed, without writing — used in CI so a drift
//                               (e.g. WMATA renaming/removing a station) fails loudly
//                               instead of being silently auto-committed.
//
// If a query's stationName or direction doesn't match anything, this exits non-zero
// in both modes — use `pnpm list-stations` to find the correct station name.
//
// Direction filtering resolves to a set of (route_id, direction_id) pairs, not a single
// headsign: several lines (Red, Orange, Silver, Yellow) have short-turn or rush-hour-
// extension trips that give the *same* route+direction more than one real terminus (e.g.
// Yellow Line direction 0 normally ends at "Mt Vernon Sq" but rush-hour trips continue to
// "Greenbelt"). Picking just one headsign per pair would silently misfilter the other.
// It also can't rely on platform IDs alone: some stations (e.g. Columbia Heights) use a
// single shared platform for both directions.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { fetchStaticGtfs, requireApiKey } from "./gtfsStatic.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const queriesPath = path.join(root, "src/queries.json");
const outputPath = path.join(root, "src/stations.json");
const isCheck = process.argv.includes("--check");

function buildLines(routes) {
  const lines = {};
  for (const route of routes) {
    lines[route.route_id] = { name: route.route_long_name };
  }
  return lines;
}

// Every (route_id, direction_id) pair that has at least one trip terminating somewhere
// matching `text` (case-insensitive substring of trip_headsign).
function findDirectionPairs(trips, text) {
  const pairs = new Map();
  const needle = text.trim().toLowerCase();
  for (const trip of trips) {
    if (trip.trip_headsign?.toLowerCase().includes(needle)) {
      pairs.set(`${trip.route_id}:${trip.direction_id}`, [trip.route_id, Number(trip.direction_id)]);
    }
  }
  return [...pairs.values()];
}

// `direction` may be a single terminus name or an array (for a shared trunk where
// different lines end at different names in the same physical direction). Resolves to
// one combined set of (route, direction_id) pairs and a ready-to-display label, so
// nothing downstream has to know it could have been an array.
function resolveDirection(trips, direction) {
  const terms = Array.isArray(direction) ? direction : [direction];
  const pairs = new Map();
  for (const term of terms) {
    const found = findDirectionPairs(trips, term);
    if (found.length === 0) return { error: `No direction matching "${term}"` };
    found.forEach(([routeId, directionId]) => pairs.set(`${routeId}:${directionId}`, [routeId, directionId]));
  }
  return { directionFilter: [...pairs.values()], directionLabel: terms.join(" / ") };
}

function buildStations(queries, stops, trips) {
  const stations = [];
  const unresolved = [];

  for (const query of queries) {
    const parents = stops.filter(
      (s) => s.location_type === "1" && s.stop_name.trim().toLowerCase() === query.stationName.trim().toLowerCase(),
    );
    if (parents.length === 0) {
      unresolved.push(`No station found matching "${query.stationName}"`);
      continue;
    }

    const station = { name: query.stationName };
    if (query.direction) {
      const resolved = resolveDirection(trips, query.direction);
      if (resolved.error) {
        unresolved.push(`${resolved.error} for "${query.stationName}"`);
        continue;
      }
      station.directionFilter = resolved.directionFilter;
      station.directionLabel = resolved.directionLabel;
    }

    const parentIds = new Set(parents.map((p) => p.stop_id));
    station.platforms = stops
      .filter((s) => s.location_type === "0" && parentIds.has(s.parent_station))
      .map((s) => ({ stopId: s.stop_id, description: s.stop_desc }));
    stations.push(station);
  }
  return { stations, unresolved };
}

async function main() {
  const queries = JSON.parse(readFileSync(queriesPath, "utf-8"));
  const { stops, routes, trips } = await fetchStaticGtfs(requireApiKey());
  const { stations, unresolved } = buildStations(queries, stops, trips);

  if (unresolved.length > 0) {
    unresolved.forEach((message) => console.error(message));
    console.error("Run `pnpm list-stations` to find the correct GTFS station name.");
    process.exitCode = 1;
    return;
  }

  const next = { lines: buildLines(routes), stations };
  const current = existsSync(outputPath) ? JSON.parse(readFileSync(outputPath, "utf-8")) : null;
  const upToDate = current != null && JSON.stringify(current) === JSON.stringify(next);

  if (isCheck) {
    if (upToDate) {
      console.log("stations.json matches WMATA's current GTFS static feed.");
    } else {
      console.error("stations.json is out of date with WMATA's GTFS static feed.");
      console.error("Run `pnpm build-stations` locally and commit the result.");
      process.exitCode = 1;
    }
    return;
  }

  if (upToDate) {
    console.log("stations.json unchanged");
  } else {
    writeFileSync(outputPath, JSON.stringify(next, null, 2) + "\n");
    console.log(`Wrote ${outputPath}`);
  }
}

main();
