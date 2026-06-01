import React, { useState } from 'react';
import SkeuoCard from './SkeuoCard';

export default function Heatmap({ history = [] }) {
  const [interval, setIntervalDays] = useState(90); // default to 90 days
  const [hoveredCell, setHoveredCell] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });

  // Generate last N days including today
  const getPastDays = (count) => {
    const list = [];
    const today = new Date();
    for (let i = count; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      list.push(date.toISOString().split('T')[0]);
    }
    return list;
  };

  const days = getPastDays(interval - 1);

  // Map history array into a dictionary for quick lookups
  const historyMap = history.reduce((acc, curr) => {
    acc[curr.date] = curr;
    return acc;
  }, {});

  const getIntensityClass = (count) => {
    if (!count || count === 0) {
      return 'bg-slate-200/50 dark:bg-skeuo-dark hover:bg-slate-200 dark:hover:bg-skeuo-bg border border-slate-300/40 dark:border-white/5';
    }
    if (count === 1) {
      return 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/20 hover:bg-emerald-200 dark:hover:bg-emerald-950/70';
    }
    if (count <= 2) {
      return 'bg-emerald-200 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300/50 dark:border-emerald-800/30 hover:bg-emerald-300 dark:hover:bg-emerald-900/70';
    }
    if (count <= 4) {
      return 'bg-emerald-300/80 dark:bg-emerald-700/40 text-emerald-900 dark:text-emerald-200 border border-emerald-400/50 dark:border-emerald-650/30 hover:bg-emerald-300 dark:hover:bg-emerald-700/70';
    }
    return 'bg-emerald-500 text-white border border-emerald-400 hover:bg-emerald-400'; // High intensity
  };

  const formatDate = (dateStr) => {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  };

  const handleMouseEnter = (e, dateStr, item, count) => {
    const cellEl = e.currentTarget;
    const cellRect = cellEl.getBoundingClientRect();
    const heatmapCardEl = cellEl.closest('.skeuo-raised');
    if (!heatmapCardEl) return;
    const cardRect = heatmapCardEl.getBoundingClientRect();
    
    // Position tooltip above the cell
    const left = cellRect.left - cardRect.left + (cellRect.width / 2);
    const top = cellRect.top - cardRect.top - 125;
    
    setTooltipPos({ top, left });
    setHoveredCell({ dateStr, item, count });
  };

  const handleMouseLeave = () => {
    setHoveredCell(null);
  };

  return (
    <SkeuoCard className="p-6 relative">
      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Submission Activity Heatmap</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Combined submissions history over the selected period
          </p>
        </div>

        {/* Interval Selector Controls */}
        <div className="flex p-1 rounded-xl skeuo-sunken max-w-sm self-start lg:self-auto">
          {[
            { label: '30 Days', val: 30 },
            { label: '90 Days', val: 90 },
            { label: '6 Months', val: 180 },
            { label: '1 Year', val: 365 }
          ].map((opt) => (
            <button
              key={opt.val}
              onClick={() => setIntervalDays(opt.val)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wide transition-all duration-200 ${
                interval === opt.val
                  ? 'skeuo-raised text-emerald-600 dark:text-emerald-400 border border-white/5 font-extrabold shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono self-end lg:self-auto">
          <span>Less</span>
          <div className="w-3.5 h-3.5 rounded-md bg-slate-200/50 dark:bg-skeuo-dark border border-slate-300/40 dark:border-white/5"></div>
          <div className="w-3.5 h-3.5 rounded-md bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-900/20"></div>
          <div className="w-3.5 h-3.5 rounded-md bg-emerald-200 dark:bg-emerald-900/40 border border-emerald-300/50 dark:border-emerald-800/30"></div>
          <div className="w-3.5 h-3.5 rounded-md bg-emerald-300/80 dark:bg-emerald-700/40 border border-emerald-400/50 dark:border-emerald-650/30"></div>
          <div className="w-3.5 h-3.5 rounded-md bg-emerald-500 border border-emerald-400"></div>
          <span>More</span>
        </div>
      </div>

      {/* 3-Row Horizontal Scrolling Heatmap Grid */}
      <div className="rounded-2xl skeuo-sunken p-4">
        <div className="grid grid-rows-3 grid-flow-col gap-2 overflow-x-auto py-2 pr-2 scrollbar-thin">
          {days.map((dateStr) => {
            const item = historyMap[dateStr] || { count: 0, platforms: { leetcode: 0, codechef: 0, codeforces: 0 } };
            const count = item.count;
            
            return (
              <div
                key={dateStr}
                onMouseEnter={(e) => handleMouseEnter(e, dateStr, item, count)}
                onMouseLeave={handleMouseLeave}
                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg cursor-pointer transition-all duration-150 flex items-center justify-center ${getIntensityClass(count)}`}
              />
            );
          })}
        </div>
      </div>

      {/* Floating Tooltip positioned relative to the parent card */}
      {hoveredCell && (
        <div 
          style={{ 
            top: `${tooltipPos.top}px`, 
            left: `${tooltipPos.left}px`,
            transform: 'translateX(-50%)'
          }}
          className="absolute w-44 p-3 bg-slate-900 text-[10px] text-slate-300 rounded-xl shadow-2xl border border-white/10 z-30 pointer-events-none font-mono leading-relaxed transition-all duration-100"
        >
          <p className="font-bold text-white mb-1.5 border-b border-white/10 pb-1">
            {formatDate(hoveredCell.dateStr)}
          </p>
          <div className="flex justify-between py-0.5">
            <span>LeetCode</span>
            <span className="text-yellow-500 font-bold">{hoveredCell.item.platforms?.leetcode || 0}</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span>CodeChef</span>
            <span className="text-orange-500 font-bold">{hoveredCell.item.platforms?.codechef || 0}</span>
          </div>
          <div className="flex justify-between py-0.5 mb-1.5">
            <span>Codeforces</span>
            <span className="text-blue-400 font-bold">{hoveredCell.item.platforms?.codeforces || 0}</span>
          </div>
          <div className="flex justify-between border-t border-white/5 pt-1.5 font-bold text-emerald-400">
            <span>Total</span>
            <span>{hoveredCell.count} Solves</span>
          </div>
        </div>
      )}
    </SkeuoCard>
  );
}
