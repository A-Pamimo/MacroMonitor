import { FredSeriesResponse } from '../types';

const FRED_API_KEY = 'f78c612c602685f87c4471e00ec28ce1';
const FRED_BASE_URL = 'https://api.stlouisfed.org/fred/series/observations';

interface SeriesConfig {
  id: string;
  seriesId: string;
  units?: string; // 'lin' = levels, 'pc1' = percent change from year ago
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
      const response = await fetch(url);
      if (!response.ok) {
        console.warn(`FRED ${config.id} returned ${response.status}`);
        return { id: config.id, observations: [] };
      }
      const data: FredSeriesResponse = await response.json();
      return { id: config.id, observations: data.observations || [] };
    } catch (error) {
      console.warn(`Failed to fetch US series ${config.id}:`, error);
      return { id: config.id, observations: [] };
    }
  });

  return Promise.all(promises);
};
