import { FredObservation, FredSeriesResponse } from '../types';

const FRED_API_KEY = 'f78c612c602685f87c4471e00ec28ce1';
const FRED_BASE_URL = 'https://api.stlouisfed.org/fred/series/observations';
// Using AllOrigins as a reliable CORS proxy for FRED
const PROXY_URL = 'https://api.allorigins.win/raw?url=';

interface SeriesConfig {
  id: string;
  seriesId: string;
  units?: string; // 'lin' = levels, 'pc1' = percent change from year ago
}

// Expanded US Configuration
const US_CONFIGS: SeriesConfig[] = [
  { id: 'yieldCurve', seriesId: 'T10Y2Y', units: 'lin' },
  { id: 'unemployment', seriesId: 'UNRATE', units: 'lin' },
  { id: 'cpi', seriesId: 'CPIAUCSL', units: 'pc1' },
  { id: 'fedFunds', seriesId: 'FEDFUNDS', units: 'lin' },
  { id: 'gdp', seriesId: 'GDPC1', units: 'pc1' },
  // Expanded Metrics
  { id: 'retailSales', seriesId: 'RSXFS', units: 'pc1' }, // Advance Retail Sales (YoY)
  { id: 'housing', seriesId: 'HOUST', units: 'lin' }      // Housing Starts (New Residential Construction)
];

const smartFetch = async (url: string): Promise<Response> => {
  try {
    const response = await fetch(url);
    if (response.ok) return response;
    throw new Error(`Direct fetch failed: ${response.status}`);
  } catch (e) {
    const proxyTarget = `${PROXY_URL}${encodeURIComponent(url)}`;
    const proxyResponse = await fetch(proxyTarget);
    if (!proxyResponse.ok) {
       throw new Error(`Proxy fetch failed: ${proxyResponse.statusText}`);
    }
    return proxyResponse;
  }
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
      const response = await smartFetch(url);
      const data: FredSeriesResponse = await response.json();
      
      if (!data.observations) {
        // Fallback for empty responses
        console.warn(`No observations for ${config.id}`);
        return { id: config.id, observations: [] };
      }

      return { id: config.id, observations: data.observations };
    } catch (error) {
      console.warn(`Failed to fetch US series ${config.id}:`, error);
      return { id: config.id, observations: [] };
    }
  });

  return Promise.all(promises);
};