import React, { useEffect, useState, useMemo } from 'react';
import { fetchAllIndicators, Region } from './services/fredService';
import { EconomicIndicator } from './types';
import { deriveVerdict } from './services/verdictService';
import MetricCard from './components/MetricCard';
import MainChart from './components/MainChart';
import AIAnalyst from './components/AIAnalyst';
import VerdictBanner from './components/VerdictBanner';
import MacroDictionary from './components/MacroDictionary';
import { Activity, AlertOctagon, RefreshCw } from 'lucide-react';

// Palette Reference (see tailwind.config in index.html):
// ink #0B1F3B · gold #B8912E/#D4AF37 · good #15803D · watch #B45309 · risk #B91C1C

const getMetadata = (region: Region): Record<string, Partial<EconomicIndicator>> => ({
  yieldCurve: {
    title: region === 'US' ? 'Yield Curve (10Y-2Y)' : '10Y Gov Bond Yield',
    unit: '%',
    description: region === 'US'
      ? 'A negative value here has predicted every recent recession.'
      : 'The interest rate the government pays to borrow for 10 years.',
    color: '#B8912E',
    frequency: region === 'US' ? 'Daily' : 'Monthly'
  },
  unemployment: {
    title: 'Unemployment Rate',
    unit: '%',
    description: 'The percentage of the total workforce that cannot find a job.',
    color: '#334155',
    frequency: 'Monthly'
  },
  cpi: {
    title: 'Inflation (CPI)',
    unit: '%',
    description: 'How much prices for goods and services have risen over the last year.',
    color: '#B91C1C',
    frequency: 'Monthly'
  },
  fedFunds: {
    title: region === 'US' ? 'Fed Interest Rate' : 'BoC Policy Rate',
    unit: '%',
    description: region === 'US'
      ? 'The base interest rate set by the Fed. High rates cool the economy.'
      : 'The base interest rate set by the Bank of Canada.',
    color: '#0B1F3B',
    frequency: region === 'US' ? 'Monthly' : 'Daily/Monthly'
  },
  gdp: {
    title: 'GDP Growth',
    unit: '%',
    description: 'The overall speed at which the economy is growing (or shrinking).',
    color: '#15803D',
    frequency: 'Quarterly'
  },
  retailSales: {
    title: 'Retail Sales',
    unit: '%',
    description: 'Year-over-year change in consumer spending on retail goods.',
    color: '#B45309',
    frequency: 'Monthly'
  },
  housing: {
    title: 'Housing Starts',
    unit: region === 'US' ? 'k' : '',
    description: 'New residential construction projects started. A leading indicator.',
    color: '#7C3AED',
    frequency: 'Monthly'
  }
});

// Order the cards deliberately: recession-relevant leads.
const CARD_ORDER = ['yieldCurve', 'cpi', 'unemployment', 'gdp', 'retailSales', 'housing'];
const INVERSE_KEYS = new Set(['yieldCurve', 'cpi', 'unemployment']);

const timeAgo = (d: Date | null): string => {
  if (!d) return 'just now';
  const secs = Math.floor((Date.now() - d.getTime()) / 1000);
  if (secs < 60) return 'just now';
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs} hr ago`;
};

// Skeleton mirrors the real MetricCard shape so data resolves in place.
const SkeletonCard: React.FC = () => (
  <div className="rounded-2xl border border-line bg-card p-5">
    <div className="h-2.5 w-24 rounded-full bg-paper-2 animate-pulse" />
    <div className="h-9 w-28 rounded-lg bg-paper-2 animate-pulse mt-5" />
    <div className="h-14 rounded-lg bg-gradient-to-t from-paper-2 to-transparent animate-pulse mt-4" />
  </div>
);

const App: React.FC = () => {
  const [region, setRegion] = useState<Region>('US');
  const [data, setData] = useState<Record<string, EconomicIndicator>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedChart, setSelectedChart] = useState<string>('yieldCurve');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [nowTick, setNowTick] = useState(0); // re-render the "x min ago" label

  const currentMetadata = useMemo(() => getMetadata(region), [region]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const results = await fetchAllIndicators(region);
        const processedData: Record<string, EconomicIndicator> = {};

        results.forEach(({ id, observations }) => {
          const cleanData = observations
            .map(obs => ({
              date: obs.date,
              value: parseFloat(obs.value)
            }))
            .filter(d => !isNaN(d.value));

          if (cleanData.length === 0) return;
          const latest = cleanData[cleanData.length - 1];
          const previous = cleanData[cleanData.length - 2];

          processedData[id] = {
            id,
            title: currentMetadata[id]?.title || id,
            value: latest.value,
            unit: currentMetadata[id]?.unit || '',
            change: previous ? ((latest.value - previous.value) / Math.abs(previous.value)) * 100 : 0,
            data: cleanData,
            description: currentMetadata[id]?.description || '',
            frequency: currentMetadata[id]?.frequency || '',
            color: currentMetadata[id]?.color || '#0B1F3B',
            seriesId: ''
          };
        });
        setData(processedData);
        setLastUpdated(new Date());
      } catch (e) {
        console.error("Failed to load dashboard data", e);
        setError("We couldn't reach the economic data source. It may be temporarily unavailable, or this region isn't supported right now.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [region, currentMetadata, refreshTrigger]);

  // Keep the "updated x min ago" label fresh without refetching.
  useEffect(() => {
    const t = setInterval(() => setNowTick(n => n + 1), 60000);
    return () => clearInterval(t);
  }, []);

  const summaryData = useMemo(() => {
    if (Object.keys(data).length === 0) return null;
    return {
      yieldCurve: data.yieldCurve?.value || 0,
      cpi: data.cpi?.value || 0,
      unemployment: data.unemployment?.value || 0,
      gdp: data.gdp?.value || 0,
      fedFunds: data.fedFunds?.value || 0
    };
  }, [data]);

  const verdict = useMemo(() => deriveVerdict(data, region), [data, region]);
  const activeChartData = data[selectedChart];
  const orderedKeys = CARD_ORDER.filter(k => data[k]);

  const handleRetry = () => setRefreshTrigger(prev => prev + 1);

  return (
    <div className="min-h-screen bg-paper text-ink pb-16 font-sans">
      {/* Header */}
      <header className="border-b border-line bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-ink rounded-lg shadow-sm">
              <Activity className="text-gold-bright" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-ink tracking-tight leading-none">Macro Monitor</h1>
              <p className="text-xs text-muted mt-0.5">Real-Time Economic Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Freshness chip — backs the "real-time" claim + manual refresh */}
            {!loading && !error && (
              <button
                type="button"
                onClick={handleRetry}
                aria-label="Refresh data"
                className="group hidden sm:inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-3 py-1.5 text-xs text-muted hover:text-ink hover:border-gold/50 transition-colors
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-good animate-pulse" aria-hidden="true" />
                <span className="tabular-nums" key={nowTick}>Updated {timeAgo(lastUpdated)}</span>
                <RefreshCw size={12} className="group-hover:rotate-180 transition-transform duration-500" />
              </button>
            )}

            <div className="flex items-center rounded-lg bg-paper-2 p-1 shadow-[inset_0_1px_2px_rgba(11,31,59,.08)]">
              {(['US', 'CA'] as const).map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRegion(r)}
                  aria-pressed={region === r}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-[background,color,box-shadow] duration-300 ease-spring
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-1 focus-visible:ring-offset-paper-2
                    ${region === r ? 'bg-card text-ink shadow-sm' : 'text-muted hover:text-ink'}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {loading ? (
          <div className="space-y-6">
            {/* Verdict skeleton */}
            <div className="rounded-2xl border border-line bg-card p-7">
              <div className="h-2.5 w-40 rounded-full bg-paper-2 animate-pulse" />
              <div className="h-7 w-2/3 rounded-lg bg-paper-2 animate-pulse mt-3" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
            <p className="text-center text-sm text-muted pt-2">Fetching {region} economic data…</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center p-4">
            <div className="p-4 bg-risk/10 rounded-full mb-4">
              <AlertOctagon className="text-risk" size={40} />
            </div>
            <h3 className="text-xl font-semibold text-ink mb-2 tracking-tight">Data temporarily unavailable</h3>
            <p className="text-muted max-w-md mb-8">{error}</p>
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-ink hover:bg-[#07162D] text-paper font-medium rounded-lg transition-transform duration-200 ease-spring hover:-translate-y-0.5 shadow-lg shadow-ink/20
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
            >
              <RefreshCw size={16} />
              Try again
            </button>
          </div>
        ) : (
          <div className="space-y-6">

            {/* 1 — Verdict: lead with the answer */}
            {verdict && <VerdictBanner verdict={verdict} region={region} />}

            {/* 2 — Evidence: the metric cards (now the chart selector) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
              {orderedKeys.map((key, i) => (
                <div
                  key={key}
                  className="h-full animate-fade-up"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <MetricCard
                    {...data[key]}
                    inverse={INVERSE_KEYS.has(key)}
                    isWarning={region === 'US' && key === 'yieldCurve' && data[key].value < 0}
                    selected={selectedChart === key}
                    onSelect={() => setSelectedChart(key)}
                  />
                </div>
              ))}
            </div>

            {/* 3 — Deep dive: selected chart + AI analyst */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                {activeChartData && (
                  <MainChart
                    title={activeChartData.title}
                    data={activeChartData.data}
                    color={activeChartData.color}
                    unit={activeChartData.unit}
                    isYieldCurve={region === 'US' && selectedChart === 'yieldCurve'}
                  />
                )}
              </div>

              <div className="space-y-6">
                <AIAnalyst data={summaryData} region={region} />
              </div>
            </div>

            {/* 4 — Learn: reference material, collapsed by default */}
            <MacroDictionary />

          </div>
        )}
      </main>
    </div>
  );
};

export default App;
