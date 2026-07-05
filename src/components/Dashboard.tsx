import stationData from "../data/stations.json";
import { usePredictions } from "../hooks/usePredictions";
import { StationPanel } from "./StationPanel";
import type { StationData } from "../types";

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
      {typedStationData.stations.map((station) => (
        <StationPanel
          key={station.name}
          station={station}
          arrivalsByPlatform={arrivalsByPlatform}
          lines={typedStationData.lines}
          directions={typedStationData.directions}
        />
      ))}
    </main>
  );
}
