import React, { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  Area,
  AreaChart,
} from 'recharts';

interface ChartProps {
  title: string;
  data: { date: string; value: number }[];
  color: string;
  unit?: string;
  isYieldCurve?: boolean;
}

type Range = '1Y' | '5Y' | 'Max';
const RANGE_MONTHS: Record<Range, number | null> = { '1Y': 12, '5Y': 60, Max: null };

// Paper-styled tooltip so it reads on-brand instead of default Recharts white.
const ChartTooltip: React.FC<any> = ({ active, payload, label, unit }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-line bg-card px-3 py-2 shadow-[0_8px_24px_-12px_rgba(11,31,59,.4)]">
      <p className="text-[11px] font-mono uppercase tracking-wider text-muted">{label}</p>
      <p className="text-base font-semibold tabular-nums text-ink mt-0.5">
        {Number(payload[0].value).toFixed(2)}
        <span className="text-muted font-normal">{unit}</span>
      </p>
    </div>
  );
};

const MainChart: React.FC<ChartProps> = ({
  title,
  data,
  color,
  unit = '',
  isYieldCurve = false,
}) => {
  const [range, setRange] = useState<Range>('5Y');

  const ranged = useMemo(() => {
    const months = RANGE_MONTHS[range];
    const sliced =
      months === null || data.length <= months ? data : data.slice(-months);
    return sliced.map((d) => ({
      ...d,
      dateStr: new Date(d.date).toLocaleDateString(undefined, {
        year: '2-digit',
        month: 'short',
      }),
    }));
  }, [data, range]);

  const latest = data.length ? data[data.length - 1].value : 0;
  const yMin = useMemo(
    () => Math.min(0, ...ranged.map((d) => d.value)),
    [ranged]
  );

  const seriesColor = isYieldCurve ? '#B8912E' : color;

  return (
    <div className="w-full rounded-2xl border border-line bg-card p-5 sm:p-6 shadow-[0_1px_2px_rgba(11,31,59,.04),0_24px_48px_-32px_rgba(11,31,59,.3)]">
      {/* Header: title + latest value + range control */}
      <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-semibold text-ink tracking-tight">{title}</h3>
            {isYieldCurve && (
              <span className="text-[11px] font-medium text-risk bg-risk/10 px-2 py-0.5 rounded border border-risk/20">
                Recession signal: &lt; 0
              </span>
            )}
          </div>
          <p className="text-3xl font-semibold tabular-nums text-ink mt-1">
            {latest.toFixed(2)}
            <span className="text-base text-muted font-normal">{unit}</span>
          </p>
        </div>

        <div
          role="group"
          aria-label="Chart date range"
          className="flex rounded-lg bg-paper-2 p-0.5 shadow-[inset_0_1px_2px_rgba(11,31,59,.08)]"
        >
          {(Object.keys(RANGE_MONTHS) as Range[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              aria-pressed={range === r}
              className={`px-2.5 py-1 text-xs font-medium rounded-md tabular-nums transition-colors duration-300 ease-spring
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-1 focus-visible:ring-offset-paper-2
                ${
                  range === r
                    ? 'bg-card text-ink shadow-sm'
                    : 'text-muted hover:text-ink'
                }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        {isYieldCurve ? (
          <AreaChart data={ranged} margin={{ top: 4, right: 8, bottom: 0, left: -8 }}>
            <defs>
              <linearGradient id="ycFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={seriesColor} stopOpacity={0.18} />
                <stop offset="1" stopColor={seriesColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#DED8C9" vertical={false} />
            {/* Recession territory: shade below zero, not just a dashed line.
                fill/fillOpacity are valid runtime props; Recharts 3's union
                typing doesn't surface them on JSX attrs, so pass via spread. */}
            {yMin < 0 && (
              <ReferenceArea
                y1={yMin}
                y2={0}
                {...({ fill: '#B91C1C', fillOpacity: 0.05 } as any)}
              />
            )}
            <XAxis
              dataKey="dateStr"
              stroke="#6B7280"
              tick={{ fontSize: 12 }}
              tickMargin={10}
              minTickGap={30}
            />
            <YAxis
              stroke="#6B7280"
              tick={{ fontSize: 12 }}
              domain={['auto', 'auto']}
              width={44}
            />
            <Tooltip content={<ChartTooltip unit={unit} />} />
            <ReferenceLine y={0} stroke="#B91C1C" strokeDasharray="4 4" strokeOpacity={0.5} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={seriesColor}
              fill="url(#ycFill)"
              strokeWidth={2.5}
              isAnimationActive
              animationDuration={700}
              animationEasing="ease-out"
            />
          </AreaChart>
        ) : (
          <LineChart data={ranged} margin={{ top: 4, right: 8, bottom: 0, left: -8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#DED8C9" vertical={false} />
            <XAxis
              dataKey="dateStr"
              stroke="#6B7280"
              tick={{ fontSize: 12 }}
              tickMargin={10}
              minTickGap={30}
            />
            <YAxis
              stroke="#6B7280"
              tick={{ fontSize: 12 }}
              domain={['auto', 'auto']}
              width={44}
            />
            <Tooltip content={<ChartTooltip unit={unit} />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke={seriesColor}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: seriesColor, strokeWidth: 0 }}
              isAnimationActive
              animationDuration={700}
              animationEasing="ease-out"
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default MainChart;
