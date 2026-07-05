import type { Arrival, LineInfo, Station } from "../types";

function minutesUntil(epochSeconds: number): number {
  return Math.max(0, Math.round((epochSeconds * 1000 - Date.now()) / 60_000));
}

// Groups by live terminus rather than by physical platform: some stations (e.g.
// Columbia Heights) use one shared platform for both directions, so platform ID
// alone can't tell them apart.
function groupByTerminus(arrivals: Arrival[], directions: Record<string, string>): Map<string, Arrival[]> {
  const groups = new Map<string, Arrival[]>();
  for (const arrival of arrivals) {
    const terminus = directions[`${arrival.routeId}:${arrival.directionId}`] ?? arrival.routeId;
    const group = groups.get(terminus) ?? [];
    group.push(arrival);
    groups.set(terminus, group);
  }
  for (const group of groups.values()) {
    group.sort((a, b) => a.arrivalTime - b.arrivalTime);
  }
  return groups;
}

function TerminusRow({ terminus, arrivals, lines }: { terminus: string; arrivals: Arrival[]; lines: Record<string, LineInfo> }) {
  return (
    <div className="platform-row">
      <div className="platform-description">to {terminus}</div>
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
  directions,
}: {
  station: Station;
  arrivalsByPlatform: Map<string, Arrival[]>;
  lines: Record<string, LineInfo>;
  directions: Record<string, string>;
}) {
  const arrivals = station.platformIds.flatMap((stopId) => arrivalsByPlatform.get(stopId) ?? []);
  const groups = groupByTerminus(arrivals, directions);
  const termini = station.direction
    ? [...groups.keys()].filter((t) => t.toLowerCase().includes(station.direction!.toLowerCase()))
    : [...groups.keys()];

  return (
    <section className="station-panel">
      <h2>{station.name}</h2>
      {termini.map((terminus) => (
        <TerminusRow key={terminus} terminus={terminus} arrivals={groups.get(terminus) ?? []} lines={lines} />
      ))}
    </section>
  );
}
