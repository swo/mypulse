export type Platform = { stopId: string; description: string };

export type Station = {
  name: string;
  platforms: Platform[];
  directionLabel?: string;
  directionFilter?: [routeId: string, directionId: number][];
};

export type Arrival = { routeId: string; directionId: number; arrivalTime: number };
