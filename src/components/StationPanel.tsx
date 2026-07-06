import type { Arrival, LineInfo, Station } from "../types";

function minutesUntil(epochSeconds: number): number {
  return Math.max(0, Math.round((epochSeconds * 1000 - Date.now()) / 60_000));
}

function QuerySection({
  heading,
  arrivals,
  lines,
}: {
  heading: string;
  arrivals: Arrival[];
  lines: Record<string, LineInfo>;
}) {
  return (
    <>
      <h2>{heading}</h2>
      <ul>
        {arrivals.length === 0 && <li>no predictions</li>}
        {arrivals.slice(0, 3).map((arrival, i) => (
          <li key={i}>
            {minutesUntil(arrival.arrivalTime)} min ({lines[arrival.routeId]?.name ?? arrival.routeId})
          </li>
        ))}
      </ul>
    </>
  );
}

export function StationPanel({
  station,
  arrivalsByPlatform,
  lines,
}: {
  station: Station;
  arrivalsByPlatform: Map<string, Arrival[]>;
  lines: Record<string, LineInfo>;
}) {
  if (station.directionFilter) {
    const arrivals = station.platforms
      .flatMap((platform) => arrivalsByPlatform.get(platform.stopId) ?? [])
      .filter((arrival) =>
        station.directionFilter!.some(
          ([routeId, directionId]) => routeId === arrival.routeId && directionId === arrival.directionId,
        ),
      )
      .sort((a, b) => a.arrivalTime - b.arrivalTime);
    return <QuerySection heading={`${station.name} to ${station.directionLabel}`} arrivals={arrivals} lines={lines} />;
  }

  return (
    <>
      {station.platforms.map((platform) => (
        <QuerySection
          key={platform.stopId}
          heading={`${station.name} ${platform.description}`}
          arrivals={arrivalsByPlatform.get(platform.stopId) ?? []}
          lines={lines}
        />
      ))}
    </>
  );
}
