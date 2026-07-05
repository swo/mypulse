import queries from "../queries/queries.json";
import stationData from "../data/stations.json";
import { usePredictions } from "../hooks/usePredictions";
import { StationPanel } from "./StationPanel";
import type { Query, StationData } from "../types";

const typedQueries = queries as Query[];
const typedStationData = stationData as StationData;

export function Dashboard() {
  const { arrivalsByPlatform, error, lastUpdated } = usePredictions();

  return (
    <main>
      <header>
        <h1>mypulse</h1>
        {lastUpdated && <p className="updated-at">updated {lastUpdated.toLocaleTimeString()}</p>}
        {error && <p className="error">{error.message}</p>}
      </header>
      {typedQueries.map((query) => {
        const station = typedStationData.stations[query.id];
        if (!station) return null;
        return (
          <StationPanel
            key={query.id}
            station={station}
            arrivalsByPlatform={arrivalsByPlatform}
            lines={typedStationData.lines}
          />
        );
      })}
    </main>
  );
}
