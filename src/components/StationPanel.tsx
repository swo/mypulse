import type { Arrival, LineInfo, Station } from "../types";

function minutesUntil(epochSeconds: number): number {
  return Math.max(0, Math.round((epochSeconds * 1000 - Date.now()) / 60_000));
}

function ArrivalRow({ label, arrivals, lines }: { label: string; arrivals: Arrival[]; lines: Record<string, LineInfo> }) {
  return (
    <div className="platform-row">
      <div className="platform-description">{label}</div>
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
      {station.directionFilter ? (
        <ArrivalRow
          label={`to ${station.directionLabel}`}
          lines={lines}
          arrivals={station.platforms
            .flatMap((platform) => arrivalsByPlatform.get(platform.stopId) ?? [])
            .filter((arrival) =>
              station.directionFilter!.some(
                ([routeId, directionId]) => routeId === arrival.routeId && directionId === arrival.directionId,
              ),
            )
            .sort((a, b) => a.arrivalTime - b.arrivalTime)}
        />
      ) : (
        station.platforms.map((platform) => (
          <ArrivalRow
            key={platform.stopId}
            label={platform.description}
            lines={lines}
            arrivals={arrivalsByPlatform.get(platform.stopId) ?? []}
          />
        ))
      )}
    </section>
  );
}
