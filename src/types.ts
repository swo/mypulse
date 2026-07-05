export type LineInfo = { name: string; color: string };

export type Platform = { stopId: string; description: string };

export type Station = {
  name: string;
  platforms: Platform[];
  direction?: string | string[];
  directionFilter?: [routeId: string, directionId: number][];
};

export type StationData = {
  lines: Record<string, LineInfo>;
  stations: Station[];
};

export type Arrival = { routeId: string; directionId: number; arrivalTime: number };
