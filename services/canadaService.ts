import { FredSeriesResponse } from '../types';

const FRED_API_KEY = 'f78c612c602685f87c4471e00ec28ce1';
const FRED_BASE_URL = 'https://api.stlouisfed.org/fred/series/observations';

const CA_CONFIGS = [
    { id: 'yieldCurve', seriesId: 'IRLTLT01CAM156N', units: 'lin' },
    { id: 'unemployment', seriesId: 'LRHUTTTTCAM156S', units: 'lin' },
    { id: 'cpi', seriesId: 'CANCPIALLMINMEI', units: 'pc1' },
    { id: 'fedFunds', seriesId: 'IRSTCB01CAM156N', units: 'lin' },
    { id: 'gdp', seriesId: 'NAEXKP01CAQ652S', units: 'pc1' },
    { id: 'retailSales', seriesId: 'CANSARTLMINMEI', units: 'pc1' },
    { id: 'housing', seriesId: 'CANHSTTOTDSMEI', units: 'lin' }
];

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
        const response = await fetch(url);
        if (!response.ok) {
          console.warn(`FRED ${config.id} returned ${response.status}`);
          return { id: config.id, observations: [] };
        }
        const data: FredSeriesResponse = await response.json();
        return { id: config.id, observations: data.observations || [] };
      } catch (error) {
        console.warn(`Failed to fetch Canada series ${config.id}:`, error);
        return { id: config.id, observations: [] };
      }
    });

    return Promise.all(promises);
};
