import React, { useMemo } from 'react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  LineChart,
  Line
} from 'recharts';
import { formatCurrency, calculateRollover } from '../../lib/utils';
import type { Expense, Budget } from '../../types';

interface DashboardChartsProps {
  expenses: Expense[];
  budgets: Budget[];
  selectedMonth: string;
}

const COLORS = ['#f87171', '#60a5fa', '#34d399', '#fbbf24', '#c084fc', '#f472b6', '#22d3ee', '#fb923c', '#a3e635'];

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ expenses, budgets, selectedMonth }) => {
  // 1. Category-wise Spending Pie Data
  const categoryPieData = useMemo(() => {
    const totals: Record<string, number> = {};
    expenses
      .filter(e => e.date.startsWith(selectedMonth))
      .forEach(e => {
        totals[e.category] = (totals[e.category] || 0) + e.amount;
      });
    
    return Object.entries(totals).map(([name, value]) => ({
      name: name.toUpperCase(),
      value,
    }));
  }, [expenses, selectedMonth]);

  // 2. Budget vs Spent Bar Data (with Rollover!)
  const budgetVsSpentData = useMemo(() => {
    const monthlyExpenses = expenses.filter(e => e.date.startsWith(selectedMonth));
    const spentByCategory = monthlyExpenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {} as Record<string, number>);

    return budgets.map(b => {
      const rollover = b.rolloverEnabled !== false
        ? calculateRollover(expenses, b.category, b.limit, selectedMonth)
        : 0;
      const effectiveLimit = b.limit + rollover;
      const spent = spentByCategory[b.category] || 0;

      return {
        name: b.category.toUpperCase(),
        limit: b.limit,
        rollover,
        effectiveLimit,
        spent,
        over: spent > effectiveLimit ? spent - effectiveLimit : 0,
      };
    });
  }, [expenses, budgets, selectedMonth]);

  // 3. Daily Burn Rate Line Data
  const dailyLineData = useMemo(() => {
    const parts = selectedMonth.split('-');
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    
    if (isNaN(year) || isNaN(month)) return [];

    const daysInMonth = new Date(year, month, 0).getDate();

    const dailyMap: Record<number, number> = {};
    for (let i = 1; i <= daysInMonth; i++) dailyMap[i] = 0;

    expenses
      .filter(e => e.date.startsWith(selectedMonth))
      .forEach(e => {
        const dateParts = e.date.split('-');
        const day = parseInt(dateParts[2]);
        if (!isNaN(day)) {
          dailyMap[day] = (dailyMap[day] || 0) + e.amount;
        }
      });

    let runningTotal = 0;
    return Object.entries(dailyMap)
      .map(([dayStr, amount]) => {
        const day = parseInt(dayStr);
        runningTotal += amount;
        return {
          day: `Day ${day}`,
          spent: amount,
          cumulative: runningTotal,
        };
      })
      .filter(item => {
        const today = new Date();
        const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
        if (selectedMonth === currentMonthStr) {
          return parseInt(item.day.split(' ')[1]) <= today.getDate();
        }
        return true;
      });
  }, [expenses, selectedMonth]);

  // Custom tooltips with Brutalist styling
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border-2 border-black p-3 shadow-brutal-sm font-black uppercase text-[11px] tracking-tight text-black">
          <p className="border-b border-black pb-1 mb-1 font-extrabold">{payload[0].name || payload[0].payload.name || payload[0].payload.day}</p>
          {payload.map((p: any, idx: number) => (
            <p key={idx} style={{ color: p.color || '#000' }} className="font-extrabold">
              {p.name.toUpperCase()}: {formatCurrency(p.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const isNoData = categoryPieData.length === 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Category Spending Pie */}
      <div className="card-brutal bg-white flex flex-col justify-between min-h-[380px]">
        <div className="border-b-2 border-black pb-3 mb-4 flex justify-between items-center">
          <h3 className="font-black text-sm uppercase tracking-tight text-black">Category Breakdown</h3>
          <span className="px-2 py-0.5 border-2 border-black text-[9px] uppercase font-black tracking-wider bg-purple-300 shadow-brutal-sm">Pie Distribution</span>
        </div>

        {isNoData ? (
          <div className="h-[280px] flex items-center justify-center font-black uppercase tracking-wider text-xs text-gray-400 border-2 border-dashed border-black bg-neutral-50 p-6 text-center">
            No expenses logged in this period
          </div>
        ) : (
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryPieData.map((_entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                      stroke="#000" 
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={32} 
                  iconType="rect" 
                  formatter={(value) => <span className="text-[9px] font-black text-black uppercase tracking-wider">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Budget vs Actuals */}
      <div className="card-brutal bg-white flex flex-col justify-between min-h-[380px]">
        <div className="border-b-2 border-black pb-3 mb-4 flex justify-between items-center">
          <h3 className="font-black text-sm uppercase tracking-tight text-black">Budget vs Spent</h3>
          <span className="px-2 py-0.5 border-2 border-black text-[9px] uppercase font-black tracking-wider bg-emerald-300 shadow-brutal-sm">Including Rollovers</span>
        </div>

        {budgetVsSpentData.length === 0 ? (
          <div className="h-[280px] flex items-center justify-center font-black uppercase tracking-wider text-xs text-gray-400 border-2 border-dashed border-black bg-neutral-50 p-6 text-center">
            No budgets configured for comparison
          </div>
        ) : (
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={budgetVsSpentData}
                margin={{ top: 10, right: 10, left: -22, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="0" stroke="#000" strokeWidth={1} style={{ opacity: 0.15 }} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#000', fontSize: 8, fontWeight: 900 }} 
                />
                <YAxis 
                  tick={{ fill: '#000', fontSize: 8, fontWeight: 900 }} 
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  iconType="rect"
                  formatter={(value) => <span className="text-[9px] font-black text-black uppercase tracking-wider">{value}</span>}
                />
                <Bar name="EFFECTIVE LIMIT" dataKey="effectiveLimit" fill="#fef08a" stroke="#000" strokeWidth={2} />
                <Bar name="SPENT" dataKey="spent" fill="#60a5fa" stroke="#000" strokeWidth={2} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Cumulative Trend Chart */}
      <div className="card-brutal bg-white lg:col-span-2 flex flex-col justify-between min-h-[300px]">
        <div className="border-b-2 border-black pb-3 mb-4 flex justify-between items-center">
          <h3 className="font-black text-sm uppercase tracking-tight text-black">Cumulative Spending Curve</h3>
          <span className="px-2 py-0.5 border-2 border-black text-[9px] uppercase font-black tracking-wider bg-orange-300 shadow-brutal-sm">Burn Rate</span>
        </div>

        {isNoData ? (
          <div className="h-[200px] flex items-center justify-center font-black uppercase tracking-wider text-xs text-gray-400 border-2 border-dashed border-black bg-neutral-50 p-6 text-center">
            No expenses recorded to calculate trends
          </div>
        ) : (
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={dailyLineData}
                margin={{ top: 10, right: 15, left: -22, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="0" stroke="#000" strokeWidth={1} style={{ opacity: 0.15 }} />
                <XAxis 
                  dataKey="day" 
                  tick={{ fill: '#000', fontSize: 8, fontWeight: 900 }} 
                />
                <YAxis 
                  tick={{ fill: '#000', fontSize: 8, fontWeight: 900 }} 
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  name="CUMULATIVE EXPENSES" 
                  dataKey="cumulative" 
                  stroke="#fb923c" 
                  strokeWidth={4} 
                  dot={{ r: 4, stroke: '#000', strokeWidth: 2, fill: '#fff' }} 
                  activeDot={{ r: 6, stroke: '#000', strokeWidth: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardCharts;
