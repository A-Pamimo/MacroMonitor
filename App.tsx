import React, { useEffect, useState, useMemo } from 'react';
import { fetchAllIndicators, Region } from './services/fredService';
import { EconomicIndicator } from './types';
import MetricCard from './components/MetricCard';
import MainChart from './components/MainChart';
import AIAnalyst from './components/AIAnalyst';
import { Activity, BarChart3, AlertOctagon, Globe, BookOpen, RefreshCw } from 'lucide-react';

// Weg Palette Reference:
// navy: "#0B1F3B", gold: "#D4AF37", positive: "#16A34A", risk: "#DC2626", slate: "#334155"

const getMetadata = (region: Region): Record<string, Partial<EconomicIndicator>> => ({
  yieldCurve: {
    title: region === 'US' ? 'Yield Curve (10Y-2Y)' : '10Y Gov Bond Yield',
    unit: '%',
    description: region === 'US' 
      ? 'A negative value here has predicted every recent recession.'
      : 'The interest rate the government pays to borrow for 10 years.',
    color: '#D4AF37', 
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
    color: '#DC2626', 
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
    color: '#16A34A', 
    frequency: 'Quarterly'
  },
  retailSales: {
    title: 'Retail Sales',
    unit: '%',
    description: 'Year-over-year change in consumer spending on retail goods.',
    color: '#F59E0B',
    frequency: 'Monthly'
  },
  housing: {
    title: 'Housing Starts',
    unit: region === 'US' ? 'k' : '', // US is in thousands, Canada is raw units or index
    description: 'New residential construction projects started. A leading indicator.',
    color: '#8B5CF6',
    frequency: 'Monthly'
  }
});

const App: React.FC = () => {
  const [region, setRegion] = useState<Region>('US');
  const [data, setData] = useState<Record<string, EconomicIndicator>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedChart, setSelectedChart] = useState<string>('yieldCurve');

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
      } catch (e) {
        console.error("Failed to load dashboard data", e);
        setError("Unable to retrieve economic data. The source may be unavailable or the region is not supported at this time.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [region, currentMetadata, refreshTrigger]);

  // Prepare data for AI summary
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

  const activeChartData = data[selectedChart];

  const handleRetry = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-[#0B1F3B] pb-12 font-sans">
      {/* Header */}
      <header className="border-b border-[#E5E7EB] bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0B1F3B] rounded-lg shadow-sm">
              <Activity className="text-[#D4AF37]" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0B1F3B] tracking-tight">Macro Monitor</h1>
              <p className="text-xs text-[#64748B]">Real-Time Economic Dashboard</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center bg-[#F7F6F2] rounded-lg p-1 border border-[#E5E7EB]">
              <button 
                onClick={() => setRegion('US')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${region === 'US' ? 'bg-white text-[#0B1F3B] shadow-sm' : 'text-[#64748B] hover:text-[#0B1F3B]'}`}
              >
                US
              </button>
              <button 
                onClick={() => setRegion('CA')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${region === 'CA' ? 'bg-white text-[#0B1F3B] shadow-sm' : 'text-[#64748B] hover:text-[#0B1F3B]'}`}
              >
                CA
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-[#0B1F3B] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-[#64748B]">Fetching {region} Economic Data...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center p-4">
             <div className="p-4 bg-red-50 rounded-full mb-4">
               <AlertOctagon className="text-red-500" size={40} />
             </div>
             <h3 className="text-xl font-bold text-[#0B1F3B] mb-2">Connection Failed</h3>
             <p className="text-[#64748B] max-w-md mb-8">
               {error}
             </p>
             <button 
               onClick={handleRetry}
               className="flex items-center gap-2 px-5 py-2.5 bg-[#0B1F3B] hover:bg-[#1e2f4a] text-white font-medium rounded-lg transition-colors shadow-lg shadow-[#0B1F3B]/20"
             >
               <RefreshCw size={16} />
               Retry Connection
             </button>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Top Grid: Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
               {data.yieldCurve && (
                 <div onClick={() => setSelectedChart('yieldCurve')} className="cursor-pointer group h-full">
                   <MetricCard 
                     {...data.yieldCurve} 
                     isWarning={region === 'US' && data.yieldCurve.value < 0}
                     inverse={true} 
                   />
                 </div>
               )}
               {data.cpi && (
                 <div onClick={() => setSelectedChart('cpi')} className="cursor-pointer group h-full">
                   <MetricCard {...data.cpi} inverse={true} /> 
                 </div>
               )}
               {data.unemployment && (
                 <div onClick={() => setSelectedChart('unemployment')} className="cursor-pointer group h-full">
                    <MetricCard {...data.unemployment} inverse={true} /> 
                 </div>
               )}
               {data.gdp && (
                 <div onClick={() => setSelectedChart('gdp')} className="cursor-pointer group h-full">
                    <MetricCard {...data.gdp} inverse={false} /> 
                 </div>
               )}
               {/* Expanded Data Rows */}
               {data.retailSales && (
                 <div onClick={() => setSelectedChart('retailSales')} className="cursor-pointer group h-full">
                    <MetricCard {...data.retailSales} inverse={false} /> 
                 </div>
               )}
               {data.housing && (
                 <div onClick={() => setSelectedChart('housing')} className="cursor-pointer group h-full">
                    <MetricCard {...data.housing} inverse={false} /> 
                 </div>
               )}
            </div>

            {/* Middle Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Main Chart Column */}
              <div className="lg:col-span-2 space-y-4">
                {activeChartData && (
                  <MainChart 
                    title={activeChartData.title}
                    data={activeChartData.data} 
                    color={activeChartData.color}
                    isYieldCurve={region === 'US' && selectedChart === 'yieldCurve'}
                  />
                )}
                {/* Metric Selector Buttons */}
                <div className="flex flex-wrap gap-2">
                   {Object.keys(data).map(key => (
                     <button
                       key={key}
                       onClick={() => setSelectedChart(key)}
                       className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
                         selectedChart === key 
                         ? 'bg-[#0B1F3B] border-[#0B1F3B] text-white shadow-md' 
                         : 'bg-white border-[#E5E7EB] text-[#64748B] hover:border-[#D4AF37] hover:text-[#0B1F3B]'
                       }`}
                     >
                       {data[key].title}
                     </button>
                   ))}
                </div>
              </div>

              {/* Sidebar: AI, Risks, and Macro Guide */}
              <div className="space-y-6">
                <AIAnalyst data={summaryData} region={region} />
                
                {/* Simplified Risk Analysis */}
                <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
                  <h4 className="text-sm font-bold text-[#0B1F3B] mb-3 flex items-center gap-2">
                    <AlertOctagon size={16} className="text-[#DC2626]"/>
                    Is a recession likely?
                  </h4>
                  <ul className="space-y-3">
                    {region === 'US' ? (
                       <li className="flex items-start gap-3 text-xs text-[#64748B]">
                        <div className={`mt-0.5 w-2 h-2 rounded-full ${data.yieldCurve?.value < 0 ? 'bg-[#DC2626] animate-pulse' : 'bg-[#16A34A]'}`}></div>
                        <div>
                          <span className="block font-semibold text-[#334155]">Yield Curve Signal</span>
                          {data.yieldCurve?.value < 0 
                            ? "Red Light: The curve is inverted. This is the single most reliable predictor of a future recession."
                            : "Green Light: The curve is positive. Financial markets expect normal growth."}
                        </div>
                      </li>
                    ) : (
                      <li className="flex items-start gap-3 text-xs text-[#64748B]">
                         <div className={`mt-0.5 w-2 h-2 rounded-full ${data.yieldCurve?.value < 2.5 ? 'bg-[#F59E0B]' : 'bg-[#16A34A]'}`}></div>
                         <div>
                           <span className="block font-semibold text-[#334155]">Bond Market Signal</span>
                           {data.yieldCurve?.value < 2.5 
                             ? "Caution: Low bond yields suggest investors are worried about long-term growth."
                             : "Healthy: Bond yields reflect a stable economic outlook."}
                         </div>
                      </li>
                    )}
                   
                    <li className="flex items-start gap-3 text-xs text-[#64748B]">
                      <div className={`mt-0.5 w-2 h-2 rounded-full ${data.cpi?.value > 3 ? 'bg-[#F59E0B]' : 'bg-[#16A34A]'}`}></div>
                      <div>
                        <span className="block font-semibold text-[#334155]">Inflation Check</span>
                        {data.cpi?.value > 2.5 
                          ? `Prices are rising faster than the target (2%). This hurts purchasing power.`
                          : "Prices are stable and near the target level."}
                      </div>
                    </li>
                  </ul>
                </div>

                {/* Macro Dictionary / Guide */}
                <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
                   <h4 className="text-sm font-bold text-[#0B1F3B] mb-3 flex items-center gap-2">
                    <BookOpen size={16} className="text-[#2563EB]"/>
                    Macro Dictionary
                  </h4>
                  <div className="space-y-3">
                    <div className="text-xs">
                      <span className="font-semibold text-[#334155] block">What is the "Yield Curve"?</span>
                      <span className="text-[#64748B]">Normally, borrowing money for 10 years costs more than for 2 years. When it's cheaper to borrow for 10 years (an "inverted curve"), it means investors expect the economy to crash soon.</span>
                    </div>
                    <div className="text-xs">
                      <span className="font-semibold text-[#334155] block">Why does the Fed Rate matter?</span>
                      <span className="text-[#64748B]">It controls the price of money. High rates make loans (mortgages, credit cards) expensive to slow down spending. Low rates make loans cheap to encourage spending.</span>
                    </div>
                    <div className="text-xs">
                      <span className="font-semibold text-[#334155] block">What is "Real" GDP?</span>
                      <span className="text-[#64748B]">"Real" means adjusted for inflation. If the economy grows 5% but prices rise 5%, you actually grew 0%. Real GDP removes the price increase to show true growth.</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
};

export default App;