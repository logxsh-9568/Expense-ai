import React, { useState } from 'react';
import { formatCurrency } from '../../utils/dateUtils';

interface WeeklyBarChartProps {
  data: { dayName: string; shortDate: string; amount: number }[];
}

export const WeeklyBarChart: React.FC<WeeklyBarChartProps> = ({ data }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const maxAmount = Math.max(...data.map(d => d.amount), 500);

  return (
    <div className="w-full">
      <div className="flex items-end justify-between gap-2 h-44 pt-6 pb-2 border-b border-slate-200">
        {data.map((item, idx) => {
          const heightPercent = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0;
          const isHovered = hoveredIndex === idx;

          return (
            <div
              key={item.dayName}
              className="flex-1 flex flex-col items-center h-full justify-end relative group cursor-pointer"
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Tooltip */}
              {isHovered && (
                <div className="absolute -top-7 z-10 bg-slate-900 text-white text-[11px] font-mono py-1 px-2 rounded shadow whitespace-nowrap">
                  {formatCurrency(item.amount)}
                </div>
              )}

              {/* Bar */}
              <div className="w-full max-w-[32px] bg-slate-100 rounded-t-sm h-full flex items-end overflow-hidden">
                <div
                  style={{ height: `${Math.max(heightPercent, item.amount > 0 ? 8 : 2)}%` }}
                  className={`w-full rounded-t-sm transition-all duration-200 ${
                    item.amount > 0
                      ? isHovered
                        ? 'bg-blue-600'
                        : 'bg-blue-500'
                      : 'bg-slate-200'
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Day labels */}
      <div className="flex justify-between gap-2 pt-2">
        {data.map((item) => (
          <div key={item.dayName} className="flex-1 text-center">
            <span className="block text-xs font-medium text-slate-700">{item.dayName}</span>
            <span className="block text-[10px] text-slate-400">{item.shortDate.split(' ')[1]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
