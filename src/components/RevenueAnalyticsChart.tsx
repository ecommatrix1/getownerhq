import React, { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Calendar, Award, BarChart3, ChevronDown, ChevronUp, Eye, EyeOff, Activity } from 'lucide-react';
import { Payment } from '../types';

interface RevenueAnalyticsChartProps {
  payments: Payment[];
}

type TimeframeOption = 'this_month' | '3_months' | '6_months' | '12_months';

export const RevenueAnalyticsChart: React.FC<RevenueAnalyticsChartProps> = ({ payments }) => {
  const [timeframe, setTimeframe] = useState<TimeframeOption>('12_months');
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  // Compute 12-Month Monthly Breakdown
  const monthlyData = useMemo(() => {
    const now = new Date();
    const months: { year: number; month: number; label: string; key: string; total: number; count: number }[] = [];

    // Generate last 12 months array ending at current month
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth();
      const label = d.toLocaleDateString('en-US', { month: 'short' });
      const key = `${year}-${String(month + 1).padStart(2, '0')}`;
      months.push({ year, month, label, key, total: 0, count: 0 });
    }

    // Populate sums from payment records
    (payments || []).forEach(p => {
      if (!p || !p.paid_at || !p.amount) return;
      const pDate = new Date(p.paid_at);
      if (isNaN(pDate.getTime())) return;
      const pKey = `${pDate.getFullYear()}-${String(pDate.getMonth() + 1).padStart(2, '0')}`;
      const found = months.find(m => m.key === pKey);
      if (found) {
        found.total += Number(p.amount) || 0;
        found.count += 1;
      }
    });

    return months;
  }, [payments]);

  // Filtered dataset according to selected timeframe
  const activeMonths = useMemo(() => {
    if (timeframe === 'this_month') return monthlyData.slice(-1);
    if (timeframe === '3_months') return monthlyData.slice(-3);
    if (timeframe === '6_months') return monthlyData.slice(-6);
    return monthlyData; // 12_months
  }, [monthlyData, timeframe]);

  // Calculate Metrics
  const currentMonthData = monthlyData[monthlyData.length - 1];
  const previousMonthData = monthlyData[monthlyData.length - 2];

  const currentMonthTotal = currentMonthData?.total || 0;
  const previousMonthTotal = previousMonthData?.total || 0;

  // Month-over-Month Growth Rate (%)
  const momGrowth = useMemo(() => {
    if (previousMonthTotal === 0) return currentMonthTotal > 0 ? 100 : 0;
    return Math.round(((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100);
  }, [currentMonthTotal, previousMonthTotal]);

  // Total Revenue in selected timeframe
  const timeframeTotal = useMemo(() => {
    return activeMonths.reduce((acc, m) => acc + m.total, 0);
  }, [activeMonths]);

  // Average Monthly Income
  const averageMonthly = useMemo(() => {
    if (activeMonths.length === 0) return 0;
    return Math.round(timeframeTotal / activeMonths.length);
  }, [timeframeTotal, activeMonths]);

  // Peak Revenue Month
  const peakMonth = useMemo(() => {
    let max = { label: 'N/A', total: 0 };
    activeMonths.forEach(m => {
      if (m.total > max.total) {
        max = { label: `${m.label} ${m.year}`, total: m.total };
      }
    });
    return max;
  }, [activeMonths]);

  // Max value for bar chart scaling
  const maxBarValue = useMemo(() => {
    const max = Math.max(...activeMonths.map(m => m.total), 1);
    return max * 1.15; // 15% headroom
  }, [activeMonths]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6 transition-all duration-300">
      
      {/* Top Header, Timeframe & Collapse Toggle */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isCollapsed ? '' : 'border-b border-slate-100 dark:border-slate-800 pb-4'}`}>
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
              12-Month Revenue Comparison
            </h2>
          </div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
            Month-over-month financial analytics & revenue growth trends
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* Timeframe Dropdown Pill (hidden when collapsed) */}
          {!isCollapsed && (
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
              <button
                onClick={() => setTimeframe('this_month')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  timeframe === 'this_month'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm font-extrabold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                This Month
              </button>
              <button
                onClick={() => setTimeframe('3_months')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  timeframe === '3_months'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm font-extrabold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                3 Months
              </button>
              <button
                onClick={() => setTimeframe('6_months')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  timeframe === '6_months'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm font-extrabold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                6 Months
              </button>
              <button
                onClick={() => setTimeframe('12_months')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  timeframe === '12_months'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm font-extrabold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                1 Year
              </button>
            </div>
          )}

          {/* Hide / Show Toggle Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold transition-all active:scale-95 shadow-sm"
            title={isCollapsed ? "Expand Revenue Analytics" : "Collapse Revenue Analytics"}
          >
            {isCollapsed ? (
              <>
                <Eye className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Show Analytics</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                <span>Hide Analytics</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <>

      {/* 3 Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Metric 1: Selected Timeframe Revenue & MoM Growth */}
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
            <span>Period Total</span>
            <div className={`flex items-center gap-1 font-bold text-xs px-2 py-0.5 rounded-full ${
              momGrowth >= 0 
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400' 
                : 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400'
            }`}>
              {momGrowth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{momGrowth >= 0 ? `+${momGrowth}%` : `${momGrowth}%`} MoM</span>
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
            ₹{timeframeTotal.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-slate-400 font-medium mt-1">
            Compared to previous month (₹{previousMonthTotal.toLocaleString('en-IN')})
          </div>
        </div>

        {/* Metric 2: Monthly Average */}
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
            <span>Monthly Average</span>
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
            ₹{averageMonthly.toLocaleString('en-IN')}
            <span className="text-xs font-normal text-slate-500 font-sans">/mo</span>
          </div>
          <div className="text-[10px] text-slate-400 font-medium mt-1">
            Average revenue over {activeMonths.length} active months
          </div>
        </div>

        {/* Metric 3: Peak Earning Month */}
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
            <span>Best Month Record</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-white truncate">
            ₹{peakMonth.total.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold mt-1 uppercase tracking-wider">
            🏆 Peak Month: {peakMonth.label}
          </div>
        </div>

      </div>

      {/* Visual Bar Chart Comparison Container */}
      <div className="pt-4">
        <div className="h-56 flex items-end justify-between gap-2 sm:gap-4 px-2 pb-2 border-b border-slate-200 dark:border-slate-800 relative">
          
          {/* Background Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 text-[9px] font-mono text-slate-400">
            <div className="border-b border-dashed border-slate-300 dark:border-slate-700 w-full pt-1">₹{Math.round(maxBarValue).toLocaleString('en-IN')}</div>
            <div className="border-b border-dashed border-slate-300 dark:border-slate-700 w-full pt-1">₹{Math.round(maxBarValue / 2).toLocaleString('en-IN')}</div>
            <div className="border-b border-dashed border-slate-300 dark:border-slate-700 w-full pt-1">₹0</div>
          </div>

          {/* Render Bars */}
          {activeMonths.map((m, idx) => {
            const heightPercent = maxBarValue > 0 ? Math.max(4, Math.round((m.total / maxBarValue) * 100)) : 4;
            const isCurrentMonth = idx === activeMonths.length - 1;

            return (
              <div 
                key={m.key} 
                className="flex-1 flex flex-col items-center h-full justify-end group relative z-10"
              >
                {/* Hover Tooltip Popup */}
                <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none bg-slate-900 text-white text-[10px] font-mono p-2 rounded-xl shadow-lg border border-slate-700 z-30 whitespace-nowrap text-center">
                  <div className="font-bold text-blue-300">{m.label} {m.year}</div>
                  <div>₹{m.total.toLocaleString('en-IN')} ({m.count} Payments)</div>
                </div>

                {/* Amount Bar Label Above */}
                <div className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 mb-1 tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                  ₹{m.total >= 1000 ? `${(m.total / 1000).toFixed(1)}k` : m.total}
                </div>

                {/* Bar Element */}
                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full max-w-[40px] rounded-t-xl transition-all duration-500 ease-out group-hover:scale-105 ${
                    isCurrentMonth
                      ? 'bg-gradient-to-t from-blue-600 to-indigo-500 shadow-md shadow-blue-500/30'
                      : m.total > 0
                      ? 'bg-slate-300 dark:bg-slate-700 group-hover:bg-blue-500 dark:group-hover:bg-blue-500'
                      : 'bg-slate-100 dark:bg-slate-800'
                  }`}
                />

                {/* Month X-Axis Label */}
                <div className={`mt-2 text-xs font-bold uppercase tracking-wider ${
                  isCurrentMonth ? 'text-blue-600 dark:text-blue-400 font-black' : 'text-slate-500 dark:text-slate-400'
                }`}>
                  {m.label}
                </div>
              </div>
            );
          })}

        </div>
      </div>
      </>
      )}

    </div>
  );
};
