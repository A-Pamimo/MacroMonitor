import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react';
import { Verdict, SignalState, stateWord } from '../services/verdictService';

interface VerdictBannerProps {
  verdict: Verdict;
  region: string;
}

// Icon + ring/bg tint per verdict level. Icon is a second (non-color) encoding.
const levelTheme = {
  healthy: {
    Icon: ShieldCheck,
    ring: 'ring-good/25',
    bg: 'bg-good/[0.06]',
    text: 'text-good',
  },
  watch: {
    Icon: AlertTriangle,
    ring: 'ring-watch/25',
    bg: 'bg-watch/[0.07]',
    text: 'text-watch',
  },
  risk: {
    Icon: AlertOctagon,
    ring: 'ring-risk/30',
    bg: 'bg-risk/[0.07]',
    text: 'text-risk',
  },
} as const;

// Dot color per signal state (paired with a text word — never color alone).
const stateDot: Record<SignalState, string> = {
  good: 'bg-good',
  watch: 'bg-watch',
  risk: 'bg-risk',
};

const VerdictBanner: React.FC<VerdictBannerProps> = ({ verdict, region }) => {
  const theme = levelTheme[verdict.level];
  const { Icon } = theme;

  return (
    <section
      role="status"
      aria-live="polite"
      className={`rounded-2xl ring-1 ${theme.ring} ${theme.bg} bg-card/40 p-6 sm:p-7 animate-fade-up`}
    >
      <div className="flex flex-col sm:flex-row items-start gap-4">
        <div className={`shrink-0 rounded-xl bg-card p-2.5 ring-1 ${theme.ring} ${theme.text}`}>
          <Icon size={26} strokeWidth={2.2} />
        </div>

        <div className="min-w-0">
          <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted">
            Is a recession likely? · {region}
          </p>
          <h2 className="font-serif text-2xl sm:text-[28px] font-semibold text-ink tracking-tight mt-1 text-balance">
            {verdict.label}
          </h2>

          <div className="grid grid-cols-1 sm:flex sm:flex-wrap gap-x-6 gap-y-2.5 mt-4">
            {verdict.drivers.map((d) => (
              <div
                key={d.name}
                className="flex items-baseline gap-2 text-sm text-ink-2"
                title={d.detail}
              >
                <span
                  className={`mt-1.5 shrink-0 h-2 w-2 rounded-full ${stateDot[d.state]} ${
                    d.state === 'risk' ? 'animate-pulse' : ''
                  }`}
                  aria-hidden="true"
                />
                <span>
                  {d.name}{' '}
                  <b className="font-semibold text-ink">{stateWord[d.state]}</b>
                  <span className="sr-only"> — {d.detail}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default VerdictBanner;
