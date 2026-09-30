import React, { useState } from 'react';
import { CATEGORIES } from '../../utils/categories';
import { Category } from '../../types';
import { formatCurrency } from '../../utils/dateUtils';

interface DonutChartProps {
  data: { category: Category; amount: number; percentage: number }[];
  totalAmount: number;
}

export const DonutChart: React.FC<DonutChartProps> = ({ data, totalAmount }) => {
  const [hoveredCategory, setHoveredCategory] = useState<Category | null>(null);

  if (!data || data.length === 0 || totalAmount === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400 text-sm">
        <p>No category spending recorded yet.</p>
      </div>
    );
  }

  const size = 200;
  const strokeWidth = 28;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 justify-between">
      {/* SVG Donut */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
          {data.map((item) => {
            const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
            const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
            accumulatedPercent += item.percentage;

            const color = CATEGORIES[item.category]?.chartColor || '#94A3B8';
            const isHovered = hoveredCategory === item.category;

            return (
              <circle
                key={item.category}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredCategory(item.category)}
                onMouseLeave={() => setHoveredCategory(null)}
              />
            );
          })}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
          {hoveredCategory ? (
            <>
              <span className="text-xs text-slate-500 font-medium truncate max-w-[110px]">
                {hoveredCategory}
              </span>
              <span className="text-base font-semibold font-mono tabular-nums text-slate-900">
                {formatCurrency(data.find(d => d.category === hoveredCategory)?.amount || 0)}
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {data.find(d => d.category === hoveredCategory)?.percentage.toFixed(1)}%
              </span>
            </>
          ) : (
            <>
              <span className="text-xs text-slate-500 font-medium">Total Spent</span>
              <span className="text-base font-semibold font-mono tabular-nums text-slate-900">
                {formatCurrency(totalAmount)}
              </span>
              <span className="text-[11px] text-slate-400">
                {data.length} categories
              </span>
            </>
          )}
        </div>
      </div>

      {/* Legend list */}
      <div className="flex-1 w-full space-y-2 max-h-56 overflow-y-auto pr-1">
        {data.map((item) => {
          const meta = CATEGORIES[item.category];
          const isHovered = hoveredCategory === item.category;

          return (
            <div
              key={item.category}
              onMouseEnter={() => setHoveredCategory(item.category)}
              onMouseLeave={() => setHoveredCategory(null)}
              className={`flex items-center justify-between py-1.5 px-2 rounded-md transition-colors cursor-pointer text-xs ${
                isHovered ? 'bg-slate-100' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: meta?.chartColor || '#64748B' }}
                />
                <span className="font-medium text-slate-700 truncate">
                  {meta?.emoji} {item.category}
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-mono tabular-nums text-slate-900 font-medium">
                  {formatCurrency(item.amount)}
                </span>
                <span className="font-mono tabular-nums text-slate-400 w-10 text-right">
                  {item.percentage.toFixed(0)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
