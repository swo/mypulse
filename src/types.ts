export type LineInfo = { name: string; color: string };

export type Platform = { stopId: string; description: string };

export type Station = { name: string; platforms: Platform[] };

export type StationData = {
  lines: Record<string, LineInfo>;
  stations: Record<string, Station>;
};

export type Query = { id: string; label: string; stationName: string };

export type Arrival = { routeId: string; arrivalTime: number };
