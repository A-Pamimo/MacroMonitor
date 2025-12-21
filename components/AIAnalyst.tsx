import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { analyzeEconomy, EconomicSummary } from '../services/geminiService';

interface AIAnalystProps {
  data: EconomicSummary | null;
  region: string;
}

const AIAnalyst: React.FC<AIAnalystProps> = ({ data, region }) => {
  const [analysis, setAnalysis] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  // Reset analysis when region changes
  useEffect(() => {
    setAnalysis("");
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

  return (
    <div className="w-full rounded-xl border border-[#D4AF37]/30 bg-white p-6 shadow-sm relative overflow-hidden">
      {/* Subtle gold accent background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full blur-3xl -mr-8 -mt-8 pointer-events-none"></div>
      
      <div className="flex justify-between items-center mb-4 relative z-10">
        <h3 className="text-lg font-bold text-[#0B1F3B] flex items-center gap-2">
          <Sparkles className="text-[#D4AF37]" size={20} />
          AI Macro Analyst ({region})
        </h3>
        {!loading && (
          <button 
            onClick={handleAnalyze}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-[#0B1F3B] bg-[#F7F6F2] hover:bg-[#EEF2F7] border border-[#E5E7EB] rounded-lg transition-colors"
          >
            {hasRun ? <><RefreshCw size={12}/> Refresh Analysis</> : "Generate Insights"}
          </button>
        )}
      </div>

      <div className="relative z-10 min-h-[80px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-4 space-y-3">
            <div className="w-6 h-6 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-[#64748B] animate-pulse">Analyzing {region === 'US' ? 'US' : 'Canadian'} indicators...</p>
          </div>
        ) : hasRun ? (
          <div className="prose prose-sm max-w-none">
            <p className="text-[#334155] leading-relaxed font-normal">
              {analysis}
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-[#64748B]">
               <span>Powered by Gemini 3 Flash</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <p className="text-[#64748B] text-sm mb-4">
              Generate a real-time assessment of the {region === 'US' ? 'US' : 'Canadian'} economy based on current Yields, CPI, and Labor data.
            </p>
            <button 
              onClick={handleAnalyze}
              className="px-5 py-2.5 bg-[#0B1F3B] hover:bg-[#07162D] text-white text-sm font-medium rounded-lg shadow-lg shadow-[#0B1F3B]/10 transition-all hover:translate-y-[-1px]"
            >
              Analyze Economy
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAnalyst;