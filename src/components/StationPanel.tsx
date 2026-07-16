import type { Arrival, Station } from "../types";

function minutesUntil(epochSeconds: number): number {
  return Math.max(0, Math.round((epochSeconds * 1000 - Date.now()) / 60_000));
}

// WMATA route IDs are the line name shouting, e.g. "RED" -> "Red".
function formatLine(routeId: string): string {
  return routeId.charAt(0) + routeId.slice(1).toLowerCase();
}

function QuerySection({ heading, arrivals }: { heading: string; arrivals: Arrival[] | undefined }) {
  return (
    <>
      <h2>{heading}</h2>
      <ul>
        {arrivals === undefined ? (
          <li>loading…</li>
        ) : arrivals.length === 0 ? (
          <li>no predictions</li>
        ) : (
          arrivals.slice(0, 3).map((arrival, i) => (
            <li key={i}>
              {minutesUntil(arrival.arrivalTime)} min ({formatLine(arrival.routeId)})
            </li>
          ))
        )}
      </ul>
    </>
  );
}

export function StationPanel({
  station,
  arrivalsByPlatform,
  hasLoadedOnce,
}: {
  station: Station;
  arrivalsByPlatform: Map<string, Arrival[]>;
  hasLoadedOnce: boolean;
}) {
  const { name, platforms, directionFilter, directionLabel } = station;

  if (directionFilter) {
    const arrivals = hasLoadedOnce
      ? platforms
          .flatMap((platform) => arrivalsByPlatform.get(platform.stopId) ?? [])
          .filter((arrival) =>
            directionFilter.some(
              ([routeId, directionId]) => routeId === arrival.routeId && directionId === arrival.directionId,
            ),
          )
          .sort((a, b) => a.arrivalTime - b.arrivalTime)
      : undefined;
    return <QuerySection heading={`${name} to ${directionLabel}`} arrivals={arrivals} />;
  }

  return (
    <>
      {platforms.map((platform) => (
        <QuerySection
          key={platform.stopId}
          heading={`${name} ${platform.description}`}
          arrivals={hasLoadedOnce ? (arrivalsByPlatform.get(platform.stopId) ?? []) : undefined}
        />
      ))}
    </>
  );
}
