import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart
} from 'recharts';

interface ChartProps {
  title: string;
  data: { date: string; value: number }[];
  color: string;
  isYieldCurve?: boolean;
}

const MainChart: React.FC<ChartProps> = ({ title, data, color, isYieldCurve = false }) => {
  const formattedData = data.map(d => ({
    ...d,
    dateStr: new Date(d.date).toLocaleDateString(undefined, { year: '2-digit', month: 'short' })
  }));

  return (
    <div className="w-full h-[400px] rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
      <h3 className="text-lg font-bold text-[#0B1F3B] mb-6 flex items-center gap-2">
        {title}
        {isYieldCurve && (
          <span className="text-xs font-normal text-[#DC2626] bg-[#DC2626]/10 px-2 py-0.5 rounded border border-[#DC2626]/20">
            Recession Signal: &lt; 0
          </span>
        )}
      </h3>
      
      <ResponsiveContainer width="100%" height="85%">
        {isYieldCurve ? (
           <AreaChart data={formattedData}>
           <defs>
             <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
               <stop offset="0" stopColor={color} stopOpacity={0.1} />
               <stop offset="1" stopColor={color} stopOpacity={0} />
             </linearGradient>
           </defs>
           <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
           <XAxis 
             dataKey="dateStr" 
             stroke="#64748b" 
             tick={{fontSize: 12}}
             tickMargin={10}
             minTickGap={30}
           />
           <YAxis 
             stroke="#64748b" 
             tick={{fontSize: 12}}
             domain={['auto', 'auto']}
           />
           <Tooltip 
             contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', color: '#0B1F3B', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
             itemStyle={{ color: '#0B1F3B' }}
           />
           <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
           <Area 
             type="monotone" 
             dataKey="value" 
             stroke={color} 
             fill="url(#splitColor)" 
             strokeWidth={2} 
           />
         </AreaChart>
        ) : (
          <LineChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis 
              dataKey="dateStr" 
              stroke="#64748b" 
              tick={{fontSize: 12}}
              tickMargin={10}
              minTickGap={30}
            />
            <YAxis 
              stroke="#64748b" 
              tick={{fontSize: 12}}
              domain={['auto', 'auto']}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', color: '#0B1F3B', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ color: '#0B1F3B' }}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={color} 
              strokeWidth={2} 
              dot={false}
              activeDot={{ r: 6, fill: color }}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default MainChart;