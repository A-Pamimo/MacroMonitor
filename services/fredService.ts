import { fetchUSData } from './usService';
import { fetchCanadaData } from './canadaService';

export type Region = 'US' | 'CA';

export const fetchAllIndicators = async (region: Region = 'US') => {
  if (region === 'US') {
      return fetchUSData();
  } else {
      return fetchCanadaData();
  }
};