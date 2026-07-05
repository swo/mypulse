// Resolves the stations listed in src/queries/queries.json against WMATA's GTFS
// static feed, and writes the small, app-facing src/data/stations.json.
//
//   pnpm build-stations         regenerate the file locally after editing queries.json
//   pnpm check-stations         (or --check) verify the committed file still matches
//                               the live feed, without writing — used in CI so a drift
//                               (e.g. WMATA renaming/removing a station) fails loudly
//                               instead of being silently auto-committed.
//
// If a query's stationName doesn't match anything, this exits non-zero in both modes —
// use `pnpm list-stations <search>` to find the correct GTFS name.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { fetchStaticGtfs, requireApiKey } from "./gtfsStatic.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const queriesPath = path.join(root, "src/queries/queries.json");
const outputPath = path.join(root, "src/data/stations.json");
const isCheck = process.argv.includes("--check");

function buildLines(routes) {
  const lines = {};
  for (const route of routes) {
    lines[route.route_id] = { name: route.route_long_name, color: route.route_color };
  }
  return lines;
}

function buildStations(queries, stops) {
  const stations = {};
  const unresolved = [];
  for (const query of queries) {
    const parents = stops.filter(
      (s) => s.location_type === "1" && s.stop_name.trim().toLowerCase() === query.stationName.trim().toLowerCase(),
    );
    if (parents.length === 0) {
      unresolved.push(query);
      continue;
    }
    const parentIds = new Set(parents.map((p) => p.stop_id));
    const platforms = stops
      .filter((s) => s.location_type === "0" && parentIds.has(s.parent_station))
      .map((s) => ({ stopId: s.stop_id, description: s.stop_desc }));
    stations[query.id] = { name: query.label ?? query.stationName, platforms };
  }
  return { stations, unresolved };
}

async function main() {
  const queries = JSON.parse(readFileSync(queriesPath, "utf-8"));
  const { stops, routes } = await fetchStaticGtfs(requireApiKey());
  const { stations, unresolved } = buildStations(queries, stops);

  if (unresolved.length > 0) {
    for (const query of unresolved) {
      console.error(`No station found matching "${query.stationName}" (query id: ${query.id})`);
    }
    console.error("Run `pnpm list-stations <search>` to find the correct GTFS station name.");
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
