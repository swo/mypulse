export type LineInfo = { name: string };

export type Platform = { stopId: string; description: string };

export type Station = {
  name: string;
  platforms: Platform[];
  directionLabel?: string;
  directionFilter?: [routeId: string, directionId: number][];
};

export type StationData = {
  lines: Record<string, LineInfo>;
  stations: Station[];
};

export type Arrival = { routeId: string; directionId: number; arrivalTime: number };
