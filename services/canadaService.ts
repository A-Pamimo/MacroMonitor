import { FredSeriesResponse } from '../types';

const FRED_API_KEY = 'f78c612c602685f87c4471e00ec28ce1';
const FRED_BASE_URL = 'https://api.stlouisfed.org/fred/series/observations';
// Using AllOrigins as a reliable CORS proxy for FRED
const PROXY_URL = 'https://api.allorigins.win/raw?url=';

// Mapping Canadian Economic Indicators to FRED Series IDs (OECD & Central Bank Data)
const CA_CONFIGS = [
    // 10-Year Government Bond Yield (Long-Term)
    // Series: Long-Term Government Bond Yields: 10-year: Main (including benchmark) for Canada
    { id: 'yieldCurve', seriesId: 'IRLTLT01CAM156N', units: 'lin' },
    
    // Unemployment Rate
    // Series: Harmonized Unemployment Rate: Total: All Persons for Canada
    { id: 'unemployment', seriesId: 'LRHUTTTTCAM156S', units: 'lin' },
    
    // CPI Inflation (Year-over-Year)
    // Series: Consumer Price Index: All Items for Canada
    // unit 'pc1' calculates Percent Change from Year Ago automatically
    { id: 'cpi', seriesId: 'CANCPIALLMINMEI', units: 'pc1' },
    
    // Policy Rate (Bank of Canada Target)
    // Series: Immediate Rates: Less than 24 Hours: Central Bank Policy Rate for Canada
    { id: 'fedFunds', seriesId: 'IRSTCB01CAM156N', units: 'lin' },
    
    // GDP Growth (Real, YoY)
    // Series: Gross Domestic Product by Expenditure in Constant Prices: Total GDP for Canada
    // unit 'pc1' for YoY growth
    { id: 'gdp', seriesId: 'NAEXKP01CAQ652S', units: 'pc1' },

    // Retail Sales (YoY)
    // Series: Sales: Retail Trade: Total for Canada
    // unit 'pc1' for YoY growth
    { id: 'retailSales', seriesId: 'CANSARTLMINMEI', units: 'pc1' },

    // Housing Starts
    // Series: Housing: Housing Starts: Total for Canada
    // unit 'lin' for levels
    { id: 'housing', seriesId: 'CANHSTTOTDSMEI', units: 'lin' }
];

const smartFetch = async (url: string): Promise<Response> => {
  try {
    // Try proxy first for FRED from browser to ensure CORS success
    const proxyTarget = `${PROXY_URL}${encodeURIComponent(url)}`;
    const response = await fetch(proxyTarget);
    if (response.ok) return response;
    
    // Fallback to direct if proxy fails
    console.warn(`Proxy fetch failed, attempting direct: ${response.status}`);
    const directResponse = await fetch(url);
    if (directResponse.ok) return directResponse;
    
    throw new Error(`All fetch attempts failed`);
  } catch (e) {
    console.warn(`Fetch error for ${url}`, e);
    throw e;
  }
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
        const response = await smartFetch(url);
        const data: FredSeriesResponse = await response.json();
        
        if (!data.observations) {
          console.warn(`No observations for ${config.id}`);
          return { id: config.id, observations: [] };
        }
  
        return { id: config.id, observations: data.observations };
      } catch (error) {
        console.warn(`Failed to fetch Canada series ${config.id}:`, error);
        return { id: config.id, observations: [] };
      }
    });
  
    return Promise.all(promises);
};