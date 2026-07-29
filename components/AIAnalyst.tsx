import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { analyzeEconomy, EconomicSummary } from '../services/geminiService';

interface AIAnalystProps {
  data: EconomicSummary | null;
  region: string;
}

const AIAnalyst: React.FC<AIAnalystProps> = ({ data, region }) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  // Reset analysis when region changes
  useEffect(() => {
    setAnalysis('');
    setHasRun(false);
  }, [region]);

  const handleAnalyze = async () => {
    if (!data) return;
    setLoading(true);
    const result = await analyzeEconomy(data, region);
    setAnalysis(result);
    setLoading(false);
    setHasRun(true);
  };

  if (!data) return null;

  const regionName = region === 'US' ? 'US' : 'Canadian';

  return (
    <div className="w-full rounded-2xl border border-gold/30 bg-card p-6 shadow-[0_1px_2px_rgba(11,31,59,.04),0_16px_40px_-28px_rgba(11,31,59,.3)] relative overflow-hidden">
      {/* Subtle gold accent glow — this is the brand, keep it */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gold-bright/10 rounded-full blur-3xl -mr-8 -mt-8 pointer-events-none" />

      <div className="flex justify-between items-center mb-4 relative z-10 gap-3">
        <h3 className="text-lg font-semibold text-ink flex items-center gap-2 tracking-tight">
          <Sparkles className="text-gold-bright" size={20} />
          AI Macro Analyst ({region})
        </h3>
        {!loading && (
          <button
            type="button"
            onClick={handleAnalyze}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-ink bg-paper hover:bg-paper-2 border border-line rounded-lg transition-colors
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          >
            {hasRun ? (
              <>
                <RefreshCw size={12} /> Refresh
              </>
            ) : (
              'Generate insights'
            )}
          </button>
        )}
      </div>

      <div className="relative z-10 min-h-[88px]">
        {loading ? (
          // Skeleton that reads as "an answer is forming"
          <div className="space-y-2.5 py-1" aria-live="polite" aria-busy="true">
            <span className="sr-only">Analyzing {regionName} indicators…</span>
            {[100, 94, 97, 72].map((w, i) => (
              <div
                key={i}
                style={{ width: `${w}%`, animationDelay: `${i * 90}ms` }}
                className="h-3 rounded-full bg-gradient-to-r from-paper-2 via-paper to-paper-2 bg-[length:200%_100%] animate-shimmer"
              />
            ))}
          </div>
        ) : hasRun ? (
          <div>
            <p className="text-ink-2 leading-relaxed">{analysis}</p>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-muted">
              <Sparkles size={12} className="text-gold" />
              <span>Powered by Gemini 2.5 Flash</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <p className="text-muted text-sm mb-4 max-w-xs">
              Generate a real-time read on the {regionName} economy from current
              yields, CPI, and labor data.
            </p>
            <button
              type="button"
              onClick={handleAnalyze}
              className="inline-flex items-center gap-2 rounded-lg bg-ink px-5 py-2.5 text-sm font-medium text-paper shadow-[0_8px_20px_-8px_rgba(11,31,59,.5)]
                transition-transform duration-200 ease-spring hover:-translate-y-0.5 active:translate-y-0 active:scale-[.98]
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-card"
            >
              <Sparkles size={16} className="text-gold-bright" />
              Analyze economy
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAnalyst;
