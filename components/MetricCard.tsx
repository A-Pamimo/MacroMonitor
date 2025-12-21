import React from 'react';
import { ArrowUp, ArrowDown, Info } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';

interface MetricCardProps {
  title: string;
  description?: string;
  value: number;
  unit: string;
  change?: number;
  data: { value: number }[];
  color: string;
  inverse?: boolean; // If true, lower is better (e.g. unemployment, inflation)
  isWarning?: boolean; // Specific override for warning state (e.g. inverted yield curve)
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  description,
  value, 
  unit, 
  change, 
  data, 
  color, 
  inverse = false,
  isWarning = false
}) => {
  // Simple trend calc if change isn't explicitly passed
  const trend = change !== undefined ? change : 0;
  
  // Weg Palette
  let trendColor = 'text-[#64748B]'; // Muted
  if (trend > 0) trendColor = inverse ? 'text-[#DC2626]' : 'text-[#16A34A]';
  if (trend < 0) trendColor = inverse ? 'text-[#16A34A]' : 'text-[#DC2626]';

  // For chart color
  const chartStroke = isWarning ? '#DC2626' : color; 
  
  return (
    <div className={`relative overflow-hidden rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm transition-all hover:shadow-md ${isWarning ? 'ring-1 ring-[#DC2626]/20' : ''} h-full flex flex-col justify-between`}>
      <div className="flex justify-between items-start mb-2 relative z-10">
        <div className="w-full">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0B1F3B] uppercase tracking-wider">{title}</h3>
            {/* Simple visual indicator for warning state */}
            {isWarning && <div className="h-2 w-2 rounded-full bg-[#DC2626] animate-pulse"></div>}
          </div>
          
          {/* Static Descriptor for Accessibility */}
          {description && (
            <p className="text-[11px] text-[#64748B] mt-0.5 leading-snug min-h-[2.25rem]">
              {description}
            </p>
          )}

          <div className="flex items-baseline gap-2 mt-2">
            <span className={`text-2xl font-bold ${isWarning ? 'text-[#DC2626]' : 'text-[#0B1F3B]'}`}>
              {value.toFixed(2)}{unit}
            </span>
            {trend !== 0 && (
              <span className={`flex items-center text-xs font-medium ${trendColor}`}>
                {trend > 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                {Math.abs(trend).toFixed(2)}%
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Mini Sparkline */}
      <div className="h-16 w-full opacity-60 mt-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartStroke} stopOpacity={0.2}/>
                <stop offset="95%" stopColor={chartStroke} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={chartStroke} 
              fill={`url(#gradient-${title})`} 
              strokeWidth={2}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MetricCard;