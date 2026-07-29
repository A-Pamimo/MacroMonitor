import React from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
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
  isWarning?: boolean; // Specific override (e.g. inverted yield curve)
  selected?: boolean; // This card owns the main chart
  onSelect?: () => void;
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
  isWarning = false,
  selected = false,
  onSelect,
}) => {
  const trend = change !== undefined ? change : 0;

  // Trend semantics: direction (arrow) + color + accessible word — never color alone.
  const rising = trend > 0;
  const isGood = trend === 0 ? null : inverse ? !rising : rising;
  const trendColor =
    isGood === null ? 'text-muted' : isGood ? 'text-good' : 'text-risk';
  const TrendIcon = trend === 0 ? Minus : rising ? ArrowUp : ArrowDown;
  const trendWord = isGood === null ? 'flat' : isGood ? 'improving' : 'worsening';

  const chartStroke = isWarning ? '#B91C1C' : color;
  const gradientId = `spark-${title.replace(/\W/g, '')}`;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`${title}: ${value.toFixed(2)}${unit}. Show chart.`}
      className={`group relative w-full text-left overflow-hidden rounded-2xl bg-card p-5 h-full flex flex-col justify-between
        border transition-[transform,box-shadow,border-color] duration-300 ease-spring
        hover:-translate-y-0.5
        shadow-[0_1px_2px_rgba(11,31,59,.04)]
        hover:shadow-[0_1px_2px_rgba(11,31,59,.04),0_16px_32px_-20px_rgba(11,31,59,.35)]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-paper
        ${
          selected
            ? 'border-gold ring-1 ring-gold/30'
            : isWarning
            ? 'border-line ring-1 ring-risk/25'
            : 'border-line'
        }`}
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-[11px] font-semibold text-muted uppercase tracking-[0.14em]">
            {title}
          </h3>
          {isWarning && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-risk">
              <span
                className="h-1.5 w-1.5 rounded-full bg-risk animate-pulse"
                aria-hidden="true"
              />
              INVERTED
            </span>
          )}
        </div>

        {description && (
          <p className="text-[11px] text-muted mt-1 leading-snug min-h-[2.25rem]">
            {description}
          </p>
        )}

        <div className="flex items-baseline gap-2 mt-2">
          <span
            className={`text-3xl font-semibold tracking-tight tabular-nums ${
              isWarning ? 'text-risk' : 'text-ink'
            }`}
          >
            {value.toFixed(2)}
            <span className="text-lg text-muted font-normal ml-0.5">{unit}</span>
          </span>
          {trend !== 0 && (
            <span
              className={`inline-flex items-center gap-0.5 text-xs font-medium tabular-nums ${trendColor}`}
            >
              <TrendIcon size={12} aria-hidden="true" />
              {Math.abs(trend).toFixed(2)}%
              <span className="sr-only"> ({trendWord})</span>
            </span>
          )}
        </div>
      </div>

      {/* Sparkline — full opacity, grows subtly on hover */}
      <div className="h-14 w-full -mx-1 mt-2 transition-[height] duration-300 ease-spring group-hover:h-16">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartStroke} stopOpacity={0.22} />
                <stop offset="95%" stopColor={chartStroke} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke={chartStroke}
              fill={`url(#${gradientId})`}
              strokeWidth={2}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </button>
  );
};

export default MetricCard;
