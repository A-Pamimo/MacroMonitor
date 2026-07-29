import { EconomicIndicator } from '../types';
import { Region } from './fredService';

// The single semantic scale used everywhere state is shown.
export type SignalState = 'good' | 'watch' | 'risk';
export type VerdictLevel = 'healthy' | 'watch' | 'risk';

export interface VerdictDriver {
  name: string;
  state: SignalState;
  detail: string;
}

export interface Verdict {
  level: VerdictLevel;
  label: string;      // the headline sentence
  drivers: VerdictDriver[];
}

// Plain-language word + dot color for a given signal state.
export const stateWord: Record<SignalState, string> = {
  good: 'Healthy',
  watch: 'Watch',
  risk: 'At risk',
};

const worstOf = (states: SignalState[]): VerdictLevel => {
  if (states.includes('risk')) return 'risk';
  if (states.includes('watch')) return 'watch';
  return 'healthy';
};

/**
 * Derive a single, explainable recession verdict from the indicator set.
 * Pure function — no data fetching. Mirrors the thresholds already used in
 * the old sidebar risk card so behavior is preserved, just promoted + unified.
 */
export const deriveVerdict = (
  data: Record<string, EconomicIndicator>,
  region: Region
): Verdict | null => {
  const yc = data.yieldCurve?.value;
  const cpi = data.cpi?.value;
  const unemp = data.unemployment?.value;

  if (yc === undefined && cpi === undefined) return null;

  const drivers: VerdictDriver[] = [];

  // --- Yield curve / bond market signal ---
  if (yc !== undefined) {
    if (region === 'US') {
      drivers.push({
        name: 'Yield curve',
        state: yc < 0 ? 'risk' : yc < 0.5 ? 'watch' : 'good',
        detail:
          yc < 0
            ? 'Inverted — the single most reliable recession predictor.'
            : yc < 0.5
            ? 'Flattening — worth watching, not yet inverted.'
            : 'Positive — markets expect normal growth.',
      });
    } else {
      drivers.push({
        name: 'Bond market',
        state: yc < 2.5 ? 'watch' : 'good',
        detail:
          yc < 2.5
            ? 'Low long-term yields hint at growth worries.'
            : 'Yields reflect a stable outlook.',
      });
    }
  }

  // --- Inflation signal ---
  if (cpi !== undefined) {
    drivers.push({
      name: 'Inflation',
      state: cpi > 4 ? 'risk' : cpi > 2.5 ? 'watch' : 'good',
      detail:
        cpi > 4
          ? 'Well above the 2% target — squeezing purchasing power.'
          : cpi > 2.5
          ? 'Running above the 2% target.'
          : 'Near the 2% target.',
    });
  }

  // --- Labor market signal (context, when available) ---
  if (unemp !== undefined) {
    drivers.push({
      name: 'Jobs',
      state: unemp > 6 ? 'watch' : 'good',
      detail:
        unemp > 6
          ? 'Rising unemployment can signal a slowdown.'
          : 'A resilient labor market.',
    });
  }

  const level = worstOf(drivers.map((d) => d.state));

  const label =
    level === 'risk'
      ? 'Elevated recession risk right now.'
      : level === 'watch'
      ? 'Cooling — signals worth watching, but no red flags.'
      : 'No recession warning right now.';

  return { level, label, drivers };
};
