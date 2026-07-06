import AdmZip from "adm-zip";
import Papa from "papaparse";

function parseCsv(text) {
  const { data } = Papa.parse(text, { header: true, skipEmptyLines: true });
  return data;
}

export async function fetchStaticGtfs(apiKey) {
  const res = await fetch("https://api.wmata.com/gtfs/rail-gtfs-static.zip", {
    headers: { api_key: apiKey },
  });
  if (!res.ok) {
    throw new Error(`GTFS static fetch failed: ${res.status} ${res.statusText}`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  const zip = new AdmZip(buffer);
  const readEntry = (name) => zip.getEntry(name).getData().toString("utf-8");
  return {
    stops: parseCsv(readEntry("stops.txt")),
    trips: parseCsv(readEntry("trips.txt")),
  };
}

export function requireApiKey() {
  const apiKey = process.env.VITE_WMATA_API_KEY;
  if (!apiKey) {
    throw new Error("VITE_WMATA_API_KEY is not set");
  }
  return apiKey;
}
