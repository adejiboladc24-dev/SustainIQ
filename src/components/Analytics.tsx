import React, { useMemo } from 'react';
import {
  AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, Cell,
} from 'recharts';
import { useSustainIQ } from '../context/SustainIQContext';
import { TrendingUp, Activity, PieChart } from 'lucide-react';

const card = 'bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl backdrop-blur-md transition-colors duration-300';

const mkTooltip = (isDark: boolean) => ({
  contentStyle: {
    backgroundColor: isDark ? '#0f172a' : '#ffffff',
    border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
    borderRadius: '0.75rem',
    fontSize: '12px',
    color: isDark ? '#e2e8f0' : '#1e293b',
  },
  labelStyle: { color: isDark ? '#94a3b8' : '#64748b' },
  itemStyle: { color: isDark ? '#e2e8f0' : '#1e293b' },
});

interface InspectProps {
  text: string;
  active: boolean;
  children: React.ReactNode;
}

const InspectWrap: React.FC<InspectProps> = ({ text, active, children }) => (
  <div className="relative group">
    {children}
    {active && (
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-amber-400 text-slate-900 text-[10px] font-semibold px-2 py-1 rounded-md whitespace-nowrap z-50 pointer-events-none shadow-lg">
        {text}
      </div>
    )}
  </div>
);

export const Analytics: React.FC = () => {
  const { stats, portfolioMode, isDark } = useSustainIQ();
  const tooltip = mkTooltip(isDark);

  const gridColor = isDark ? '#1e293b' : '#f1f5f9';
  const axisColor = isDark ? '#475569' : '#94a3b8';

  const weeklyData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const now = new Date();
    return days.map((day, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() - (6 - i));
      const dayStr = d.toISOString().split('T')[0];
      const dayEntries = stats.habitLog.filter((e) => e.loggedAt.startsWith(dayStr));
      const impact = dayEntries.reduce(
        (sum, e) => sum + e.co2 * 10 + e.water * 0.1 + e.waste * 0.01 + e.xp,
        0
      );
      return {
        day,
        impact: parseFloat(impact.toFixed(1)),
        habits: dayEntries.length,
        xp: dayEntries.reduce((s, e) => s + e.xp, 0),
      };
    });
  }, [stats.habitLog]);

  const categoryData = useMemo(() => {
    const cats = ['Transport', 'Energy', 'Waste', 'Diet'];
    return cats.map((cat) => {
      const entries = stats.habitLog.filter((e) => e.category === cat);
      return { category: cat, count: entries.length };
    });
  }, [stats.habitLog]);

  const radarData = useMemo(() => [
    { subject: 'Carbon',     A: Math.min(stats.co2Averted * 5, 100) },
    { subject: 'Water',      A: Math.min(stats.waterConserved * 0.2, 100) },
    { subject: 'Waste',      A: Math.min(stats.wasteAverted * 0.05, 100) },
    { subject: 'Streak',     A: Math.min(stats.currentStreak * 10, 100) },
    { subject: 'Engagement', A: Math.min(stats.totalHabits * 5, 100) },
  ], [stats]);

  const totalWeeklyImpact = weeklyData.reduce((s, d) => s + d.impact, 0);
  const avgDaily = totalWeeklyImpact > 0 ? (totalWeeklyImpact / 7).toFixed(1) : '0.0';
  const bestCat = [...categoryData].sort((a, b) => b.count - a.count)[0]?.category ?? '—';
  const BAR_COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#f43f5e'];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
          Analytics Center
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Chronological efficiency gains and categorical performance
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Weekly Impact', value: totalWeeklyImpact.toFixed(0), unit: 'pts', color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Daily Average',  value: avgDaily,                     unit: 'pts', color: 'text-teal-600 dark:text-teal-400' },
          { label: 'Best Category',  value: bestCat,                      unit: '',    color: 'text-blue-600 dark:text-blue-400' },
          { label: 'Total Logged',   value: stats.totalHabits.toString(), unit: 'habits', color: 'text-purple-600 dark:text-purple-400' },
        ].map((s) => (
          <div key={s.label} className={`${card} p-4`}>
            <p className="text-slate-400 dark:text-slate-500 text-xs uppercase tracking-wider mb-2">
              {s.label}
            </p>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            {s.unit && <p className="text-xs text-slate-400 dark:text-slate-600 mt-0.5">{s.unit}</p>}
          </div>
        ))}
      </div>

      {/* Area chart */}
      <InspectWrap text="Recharts AreaChart — weekly habit impact timeline" active={portfolioMode}>
        <div className={`${card} p-5`}>
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <h3 className="text-slate-900 dark:text-white font-semibold text-sm">
              Weekly Efficiency Gains
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={weeklyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="impactGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="xpGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="day" stroke={axisColor} tick={{ fontSize: 11 }} />
              <YAxis stroke={axisColor} tick={{ fontSize: 11 }} />
              <Tooltip {...tooltip} />
              <Legend wrapperStyle={{ fontSize: '11px', color: axisColor }} />
              <Area type="monotone" dataKey="impact" stroke="#10b981" strokeWidth={2} fill="url(#impactGrad)" name="Impact Score" />
              <Area type="monotone" dataKey="xp"     stroke="#f59e0b" strokeWidth={2} fill="url(#xpGrad)"     name="XP Earned" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </InspectWrap>

      <div className="grid grid-cols-1 gap-4">
        {/* Radar chart */}
        <InspectWrap text="Recharts RadarChart — eco-discipline performance" active={portfolioMode}>
          <div className={`${card} p-5`}>
            <div className="flex items-center gap-2 mb-5">
              <Activity className="w-4 h-4 text-blue-500" />
              <h3 className="text-slate-900 dark:text-white font-semibold text-sm">
                Eco-Discipline Radar
              </h3>
            </div>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                <PolarGrid stroke={gridColor} />
                <PolarAngleAxis dataKey="subject" stroke={axisColor} tick={{ fontSize: 11 }} />
                <PolarRadiusAxis stroke={gridColor} tick={{ fontSize: 9 }} domain={[0, 100]} />
                <Radar name="Performance" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.25} strokeWidth={2} />
                <Tooltip {...tooltip} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </InspectWrap>

        {/* Bar chart */}
        <InspectWrap text="Recharts BarChart — category breakdown" active={portfolioMode}>
          <div className={`${card} p-5`}>
            <div className="flex items-center gap-2 mb-5">
              <PieChart className="w-4 h-4 text-purple-500" />
              <h3 className="text-slate-900 dark:text-white font-semibold text-sm">
                Category Breakdown
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={categoryData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="category" stroke={axisColor} tick={{ fontSize: 11 }} />
                <YAxis stroke={axisColor} tick={{ fontSize: 11 }} />
                <Tooltip {...tooltip} />
                <Bar dataKey="count" name="Habits Logged" radius={[4, 4, 0, 0]}>
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </InspectWrap>
      </div>
    </div>
  );
};
