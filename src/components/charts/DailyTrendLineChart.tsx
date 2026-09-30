import React, { useState } from 'react';
import { formatCurrency } from '../../utils/dateUtils';

interface DailyTrendLineChartProps {
  data: { date: string; dayLabel: string; amount: number }[];
}

export const DailyTrendLineChart: React.FC<DailyTrendLineChartProps> = ({ data }) => {
  const [hoveredPoint, setHoveredPoint] = useState<{
    date: string;
    amount: number;
    x: number;
    y: number;
  } | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-44 text-slate-400 text-sm">
        <p>No trend data yet for this month.</p>
      </div>
    );
  }

  const width = 600;
  const height = 180;
  const paddingX = 40;
  const paddingY = 24;

  const maxAmount = Math.max(...data.map(d => d.amount), 500);

  // Compute points
  const points = data.map((item, idx) => {
    const x = paddingX + (idx / Math.max(data.length - 1, 1)) * (width - paddingX * 2);
    const y = height - paddingY - (item.amount / maxAmount) * (height - paddingY * 2);
    return { x, y, item };
  });

  const pathD = points.reduce((acc, curr, idx) => {
    return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  const areaD =
    points.length > 0
      ? `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`
      : '';

  return (
    <div className="w-full relative">
      {hoveredPoint && (
        <div
          className="absolute z-10 bg-slate-900 text-white text-xs font-mono py-1 px-2.5 rounded shadow pointer-events-none transform -translate-x-1/2 -translate-y-full -mt-2"
          style={{
            left: `${(hoveredPoint.x / width) * 100}%`,
            top: `${(hoveredPoint.y / height) * 100}%`
          }}
        >
          <div className="text-[10px] text-slate-300 font-sans">{hoveredPoint.date}</div>
          <div className="font-semibold">{formatCurrency(hoveredPoint.amount)}</div>
        </div>
      )}

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-44 overflow-visible"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0, 0.5, 1].map((pct, i) => {
          const y = height - paddingY - pct * (height - paddingY * 2);
          return (
            <g key={i}>
              <line
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="#E2E8F0"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text
                x={paddingX - 8}
                y={y + 3}
                fill="#94A3B8"
                fontSize="10"
                textAnchor="end"
                className="font-mono tabular-nums"
              >
                {formatCurrency(maxAmount * pct)}
              </text>
            </g>
          );
        })}

        {/* Area */}
        {areaD && <path d={areaD} fill="url(#trendGradient)" />}

        {/* Line */}
        {pathD && (
          <path
            d={pathD}
            fill="none"
            stroke="#2563EB"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Points */}
        {points.map((pt, idx) => (
          <circle
            key={idx}
            cx={pt.x}
            cy={pt.y}
            r="4.5"
            fill="#FFFFFF"
            stroke="#2563EB"
            strokeWidth="2"
            className="cursor-pointer transition-transform hover:scale-150"
            onMouseEnter={() =>
              setHoveredPoint({
                date: pt.item.date,
                amount: pt.item.amount,
                x: pt.x,
                y: pt.y
              })
            }
            onMouseLeave={() => setHoveredPoint(null)}
          />
        ))}
      </svg>
    </div>
  );
};
