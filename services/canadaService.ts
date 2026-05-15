import { FredSeriesResponse } from '../types';

const FRED_API_KEY = 'f78c612c602685f87c4471e00ec28ce1';
const FRED_BASE_URL = 'https://api.stlouisfed.org/fred/series/observations';

const PROXIES = [
  (url: string) => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
];

const CA_CONFIGS = [
    { id: 'yieldCurve', seriesId: 'IRLTLT01CAM156N', units: 'lin' },
    { id: 'unemployment', seriesId: 'LRHUTTTTCAM156S', units: 'lin' },
    { id: 'cpi', seriesId: 'CANCPIALLMINMEI', units: 'pc1' },
    { id: 'fedFunds', seriesId: 'IRSTCB01CAM156N', units: 'lin' },
    // GDP, retail sales, and housing starts for Canada were sourced from FRED's
    // OECD-MEI series, which FRED has been deprecating. Removed until a stable
    // alternative source (e.g. Statistics Canada API) is wired up.
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

export const fetchCanadaData = async () => {
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 5);
    const dateStr = startDate.toISOString().split('T')[0];

    const promises = CA_CONFIGS.map(async (config) => {
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
        console.warn(`Failed to fetch Canada series ${config.id}:`, error);
        return { id: config.id, observations: [] };
      }
    });

    return Promise.all(promises);
};
