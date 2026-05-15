import { FredSeriesResponse } from '../types';

const FRED_API_KEY = 'f78c612c602685f87c4471e00ec28ce1';
const FRED_BASE_URL = 'https://api.stlouisfed.org/fred/series/observations';

// FRED's API doesn't send CORS headers, so browser calls must go through a proxy.
// We try corsproxy.io first, then fall back to AllOrigins.
const PROXIES = [
  (url: string) => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
];

interface SeriesConfig {
  id: string;
  seriesId: string;
  units?: string;
}

const US_CONFIGS: SeriesConfig[] = [
  { id: 'yieldCurve', seriesId: 'T10Y2Y', units: 'lin' },
  { id: 'unemployment', seriesId: 'UNRATE', units: 'lin' },
  { id: 'cpi', seriesId: 'CPIAUCSL', units: 'pc1' },
  { id: 'fedFunds', seriesId: 'FEDFUNDS', units: 'lin' },
  { id: 'gdp', seriesId: 'GDPC1', units: 'pc1' },
  { id: 'retailSales', seriesId: 'RSXFS', units: 'pc1' },
  { id: 'housing', seriesId: 'HOUST', units: 'lin' }
];

const fetchViaProxy = async (url: string): Promise<Response> => {
  for (const proxy of PROXIES) {
    try {
      const response = await fetch(proxy(url));
      if (response.ok) return response;
    } catch {
      // try next proxy
    }
  }
  throw new Error('All proxies failed');
};

export const fetchUSData = async () => {
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 5);
  const dateStr = startDate.toISOString().split('T')[0];

  const promises = US_CONFIGS.map(async (config) => {
    const params = new URLSearchParams({
      series_id: config.seriesId,
      api_key: FRED_API_KEY,
      file_type: 'json',
      observation_start: dateStr,
      units: config.units || 'lin',
    });

    const url = `${FRED_BASE_URL}?${params.toString()}`;

    try {
      const response = await fetchViaProxy(url);
      const data: FredSeriesResponse = await response.json();
      return { id: config.id, observations: data.observations || [] };
    } catch (error) {
      console.warn(`Failed to fetch US series ${config.id}:`, error);
      return { id: config.id, observations: [] };
    }
  });

  return Promise.all(promises);
};
