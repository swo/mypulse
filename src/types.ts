export type LineInfo = { name: string; color: string };

export type Station = { name: string; platformIds: string[]; direction?: string };

export type StationData = {
  lines: Record<string, LineInfo>;
  directions: Record<string, string>; // `${routeId}:${directionId}` -> terminus name
  stations: Station[];
};

export type Arrival = { routeId: string; directionId: number; arrivalTime: number };
