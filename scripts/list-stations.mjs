// Lists official WMATA station names, for filling in `stationName` in
// src/queries.json. Run with `pnpm list-stations`.

import { fetchStaticGtfs, requireApiKey } from "./gtfsStatic.mjs";

const { stops } = await fetchStaticGtfs(requireApiKey());
const names = [...new Set(stops.filter((s) => s.location_type === "1").map((s) => s.stop_name))].sort();

names.forEach((name) => console.log(name));
