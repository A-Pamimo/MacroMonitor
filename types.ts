export interface FredObservation {
  realtime_start: string;
  realtime_end: string;
  date: string;
  value: string;
}

export interface FredSeriesResponse {
  realtime_start: string;
  realtime_end: string;
  observation_start: string;
  observation_end: string;
  count: number;
  limit: number;
  offset: number;
  sort_order: string;
  order_by: string;
  observations: FredObservation[];
}

export interface EconomicIndicator {
  id: string;
  title: string;
  value: number;
  unit: string;
  change?: number; // Change from previous period
  data: { date: string; value: number }[];
  description: string;
  frequency: string;
  color: string;
  seriesId: string;
}

export interface DashboardState {
  indicators: Record<string, EconomicIndicator>;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}