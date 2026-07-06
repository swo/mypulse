import GtfsRealtimeBindings from "gtfs-realtime-bindings";
import type { Arrival } from "../types";

const TRIP_UPDATES_URL = "https://api.wmata.com/gtfs/rail-gtfsrt-tripupdates.pb";

const apiKey = import.meta.env.VITE_WMATA_API_KEY as string;

// Maps platform stop_id -> upcoming arrivals at that platform, across all trips in the feed.
export async function fetchArrivalsByPlatform(): Promise<Map<string, Arrival[]>> {
  const res = await fetch(TRIP_UPDATES_URL, { headers: { api_key: apiKey } });
  if (!res.ok) {
    throw new Error(`TripUpdates fetch failed: ${res.status} ${res.statusText}`);
  }
  const buffer = new Uint8Array(await res.arrayBuffer());
  const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(buffer);

  const nowSeconds = Date.now() / 1000;
  const byPlatform = new Map<string, Arrival[]>();
  for (const entity of feed.entity) {
    const trip = entity.tripUpdate;
    if (!trip?.trip.routeId || trip.trip.directionId == null) continue;
    const { routeId, directionId } = trip.trip;

    // A trip's stop_time_update list covers its whole route, including stops
    // already visited — skip anything that isn't still in the future.
    for (const stopTimeUpdate of trip.stopTimeUpdate ?? []) {
      const arrivalTime = stopTimeUpdate.arrival?.time;
      if (!stopTimeUpdate.stopId || arrivalTime == null) continue;
      const arrivalSeconds = Number(arrivalTime);
      if (arrivalSeconds < nowSeconds) continue;

      const arrivals = byPlatform.get(stopTimeUpdate.stopId) ?? [];
      arrivals.push({ routeId, directionId, arrivalTime: arrivalSeconds });
      byPlatform.set(stopTimeUpdate.stopId, arrivals);
    }
  }

  for (const arrivals of byPlatform.values()) {
    arrivals.sort((a, b) => a.arrivalTime - b.arrivalTime);
  }
  return byPlatform;
}
