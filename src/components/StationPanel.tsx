import type { Arrival, LineInfo, Station } from "../types";

function minutesUntil(epochSeconds: number): number {
  return Math.max(0, Math.round((epochSeconds * 1000 - Date.now()) / 60_000));
}

function PlatformRow({
  description,
  arrivals,
  lines,
}: {
  description: string;
  arrivals: Arrival[];
  lines: Record<string, LineInfo>;
}) {
  return (
    <div className="platform-row">
      <div className="platform-description">{description}</div>
      <div className="arrivals">
        {arrivals.length === 0 && <span className="no-data">no predictions</span>}
        {arrivals.slice(0, 3).map((arrival, i) => (
          <span
            key={i}
            className="arrival-chip"
            style={{ backgroundColor: `#${lines[arrival.routeId]?.color ?? "999"}` }}
          >
            {minutesUntil(arrival.arrivalTime)} min
          </span>
        ))}
      </div>
    </div>
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
  return (
    <section className="station-panel">
      <h2>{station.name}</h2>
      {station.platforms.map((platform) => (
        <PlatformRow
          key={platform.stopId}
          description={platform.description}
          arrivals={arrivalsByPlatform.get(platform.stopId) ?? []}
          lines={lines}
        />
      ))}
    </section>
  );
}
