import { useEffect, useState } from "react";
import stationData from "../stations.json";
import { usePredictions } from "../usePredictions";
import { StationPanel } from "./StationPanel";
import type { StationData } from "../types";

const typedStationData = stationData as unknown as StationData;

export function Dashboard() {
  const { arrivalsByPlatform, error, lastUpdated } = usePredictions();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const secondsAgo = lastUpdated ? Math.round((now.getTime() - lastUpdated.getTime()) / 1000) : null;

  return (
    <main>
      <header>
        <h1>mypulse</h1>
        {lastUpdated && secondsAgo !== null && (
          <p className="updated-at">
            Last updated {secondsAgo} second{secondsAgo === 1 ? "" : "s"} ago ({lastUpdated.toLocaleTimeString()})
          </p>
        )}
        {error && <p className="error">{error.message}</p>}
      </header>
      {typedStationData.stations.map((station) => (
        <StationPanel
          key={station.name}
          station={station}
          arrivalsByPlatform={arrivalsByPlatform}
          lines={typedStationData.lines}
        />
      ))}
    </main>
  );
}
