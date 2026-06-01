import React, { useState, useEffect, useRef } from 'react';
import {
  Cloud,
  Wind,
  Droplets,
  Thermometer,
  AlertTriangle,
  CheckCircle2,
  Wifi,
  WifiOff,
  Zap,
  Flame,
  Award,
} from 'lucide-react';
import { useSustainIQ, HABIT_INVENTORY, HabitItem } from '../context/SustainIQContext';
import { fetchTelemetry, TelemetryBundle } from '../services/api';

const CATEGORY_COLORS: Record<string, string> = {
  Transport: 'border-blue-300 dark:border-blue-400/30 bg-blue-50 dark:bg-blue-400/5',
  Energy:    'border-amber-300 dark:border-amber-400/30 bg-amber-50 dark:bg-amber-400/5',
  Waste:     'border-emerald-300 dark:border-emerald-400/30 bg-emerald-50 dark:bg-emerald-400/5',
  Diet:      'border-rose-300 dark:border-rose-400/30 bg-rose-50 dark:bg-rose-400/5',
};

const CATEGORY_BADGE: Record<string, string> = {
  Transport: 'bg-blue-100 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400',
  Energy:    'bg-amber-100 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400',
  Waste:     'bg-emerald-100 dark:bg-emerald-400/10 text-emerald-600 dark:text-emerald-400',
  Diet:      'bg-rose-100 dark:bg-rose-400/10 text-rose-600 dark:text-rose-400',
};

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  active: boolean;
}

const InspectTooltip: React.FC<TooltipProps> = ({ text, children, active }) => (
  <div className="relative group/tip">
    {children}
    {active && (
      <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-900 text-[10px] font-semibold px-2 py-1 rounded-md whitespace-nowrap z-50 pointer-events-none shadow-lg">
        {text}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-amber-400" />
      </div>
    )}
  </div>
);

interface HabitCardProps {
  habit: HabitItem;
  onLog: (h: HabitItem) => void;
  justLogged: boolean;
  portfolioMode: boolean;
}

const HabitCard: React.FC<HabitCardProps> = ({ habit, onLog, justLogged, portfolioMode }) => (
  <InspectTooltip text={`logHabit() → +${habit.xp} XP`} active={portfolioMode}>
    <button
      onClick={() => onLog(habit)}
      className={`w-full text-left p-4 rounded-xl border transition-all hover:scale-[1.01] ${
        justLogged
          ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-400/10'
          : CATEGORY_COLORS[habit.category]
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl leading-none mt-0.5">{habit.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className={`font-semibold text-sm truncate ${
              justLogged
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-slate-900 dark:text-white'
            }`}>
              {habit.title}
            </p>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${CATEGORY_BADGE[habit.category]}`}>
              {habit.category}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-500 leading-relaxed">
            {habit.description}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              +{habit.xp} XP
            </span>
            {habit.co2 > 0 && (
              <span className="text-xs text-slate-400">−{habit.co2}kg CO₂</span>
            )}
            {habit.water > 0 && (
              <span className="text-xs text-slate-400">−{habit.water}L H₂O</span>
            )}
            {habit.waste > 0 && (
              <span className="text-xs text-slate-400">+{habit.waste}g recycled</span>
            )}
          </div>
        </div>
        {justLogged && (
          <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
        )}
      </div>
    </button>
  </InspectTooltip>
);

// Shared card class
const card = 'bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl backdrop-blur-md transition-colors duration-300';

export const Dashboard: React.FC = () => {
  const { profile, stats, currentTier, logHabit, portfolioMode } = useSustainIQ();
  const [telemetry, setTelemetry] = useState<TelemetryBundle | null>(null);
  const [loadingTelemetry, setLoadingTelemetry] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [recentlyLogged, setRecentlyLogged] = useState<Set<string>>(new Set());
  const timerRefs = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    let cancelled = false;
    setLoadingTelemetry(true);
    fetchTelemetry(profile?.city ?? 'Lagos').then((data) => {
      if (!cancelled) {
        setTelemetry(data);
        setLoadingTelemetry(false);
      }
    });
    return () => { cancelled = true; };
  }, [profile?.city]);

  const handleLog = (habit: HabitItem) => {
    logHabit(habit);
    setRecentlyLogged((prev) => new Set(prev).add(habit.id));
    const existing = timerRefs.current.get(habit.id);
    if (existing) clearTimeout(existing);
    const t = setTimeout(() => {
      setRecentlyLogged((prev) => {
        const next = new Set(prev);
        next.delete(habit.id);
        return next;
      });
    }, 2500);
    timerRefs.current.set(habit.id, t);
  };

  const categories = ['All', 'Transport', 'Energy', 'Waste', 'Diet'];
  const filteredHabits =
    activeCategory === 'All'
      ? HABIT_INVENTORY
      : HABIT_INVENTORY.filter((h) => h.category === activeCategory);

  const unlockedBadges = stats.badges.filter((b) => b.unlockedAt);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Welcome back,{' '}
            <span className="text-emerald-600 dark:text-emerald-400">{profile?.name}</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {profile?.city} · Focus: {profile?.ecoFocus}
          </p>
        </div>
        {telemetry && (
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
            telemetry.simulated
              ? 'bg-blue-50 dark:bg-blue-400/10 border-blue-200 dark:border-blue-400/30 text-blue-600 dark:text-blue-400'
              : 'bg-emerald-50 dark:bg-emerald-400/10 border-emerald-200 dark:border-emerald-400/30 text-emerald-600 dark:text-emerald-400'
          }`}>
            {telemetry.simulated
              ? <WifiOff className="w-3 h-3" />
              : <Wifi className="w-3 h-3" />}
            {telemetry.simulated ? 'Simulated Feeds Active' : 'Live Telemetry'}
          </div>
        )}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <InspectTooltip text="TIERS[tierIndex] from context" active={portfolioMode}>
          <div className={`${card} p-4`}>
            <p className="text-slate-400 dark:text-slate-500 text-xs uppercase tracking-wider mb-2">
              Current Tier
            </p>
            <p className="text-xl font-bold" style={{ color: currentTier.color }}>
              {currentTier.name}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">
              {currentTier.description}
            </p>
          </div>
        </InspectTooltip>

        <div className={`${card} p-4`}>
          <p className="text-slate-400 dark:text-slate-500 text-xs uppercase tracking-wider mb-2">
            Total XP
          </p>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <p className="text-xl font-bold text-amber-500">{stats.xp}</p>
          </div>
        </div>

        <div className={`${card} p-4`}>
          <p className="text-slate-400 dark:text-slate-500 text-xs uppercase tracking-wider mb-2">
            Day Streak
          </p>
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <p className="text-xl font-bold text-orange-500">{stats.currentStreak}</p>
          </div>
        </div>

        <div className={`${card} p-4`}>
          <p className="text-slate-400 dark:text-slate-500 text-xs uppercase tracking-wider mb-2">
            Badges
          </p>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-purple-500" />
            <p className="text-xl font-bold text-purple-500">{unlockedBadges.length}</p>
          </div>
        </div>
      </div>

      {/* Telemetry cards */}
      {loadingTelemetry ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[0, 1].map((i) => (
            <div key={i} className={`${card} p-6 animate-pulse h-32`} />
          ))}
        </div>
      ) : telemetry ? (
        <InspectTooltip text="fetchTelemetry() → OpenWeatherMap API" active={portfolioMode}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`${card} p-5`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-slate-400 dark:text-slate-400 text-xs mb-1">
                    {telemetry.weather.city} Weather
                  </p>
                  <p className="text-4xl font-bold text-slate-900 dark:text-white">
                    {telemetry.weather.temp}°C
                  </p>
                  <p className="text-slate-600 dark:text-slate-300 text-sm mt-1">
                    {telemetry.weather.condition}
                  </p>
                </div>
                <Cloud className="w-10 h-10 text-slate-300 dark:text-slate-500" />
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Thermometer className="w-3 h-3" /> Feels {telemetry.weather.feelsLike}°C
                </span>
                <span className="flex items-center gap-1">
                  <Droplets className="w-3 h-3" /> {telemetry.weather.humidity}%
                </span>
                <span className="flex items-center gap-1">
                  <Wind className="w-3 h-3" /> {telemetry.weather.windSpeed} m/s
                </span>
              </div>
            </div>

            <div className={`${card} p-5`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-slate-400 text-xs mb-1">Air Quality Index</p>
                  <p className="text-4xl font-bold" style={{ color: telemetry.airQuality.aqiColor }}>
                    {telemetry.airQuality.aqi}
                  </p>
                  <p className="text-sm mt-1 font-medium" style={{ color: telemetry.airQuality.aqiColor }}>
                    {telemetry.airQuality.aqiLabel}
                  </p>
                </div>
                <AlertTriangle className="w-10 h-10" style={{ color: telemetry.airQuality.aqiColor }} />
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span>PM2.5: {telemetry.airQuality.pm2_5}</span>
                <span>PM10: {telemetry.airQuality.pm10}</span>
                <span>NO₂: {telemetry.airQuality.no2}</span>
              </div>
            </div>
          </div>
        </InspectTooltip>
      ) : null}

      {/* Badges strip */}
      {unlockedBadges.length > 0 && (
        <div className={`${card} p-5`}>
          <p className="text-slate-900 dark:text-white font-semibold text-sm mb-3">
            Recent Badges
          </p>
          <div className="flex flex-wrap gap-2">
            {unlockedBadges.map((badge) => (
              <div
                key={badge.id}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-full"
                title={badge.description}
              >
                <span className="text-base">{badge.icon}</span>
                <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  {badge.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Habit logger */}
      <div className={`${card} p-5`}>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="text-slate-900 dark:text-white font-semibold">Log a Habit</h3>
          <div className="flex gap-1.5 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  activeCategory === cat
                    ? 'bg-emerald-500 dark:bg-emerald-400 text-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredHabits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onLog={handleLog}
              justLogged={recentlyLogged.has(habit.id)}
              portfolioMode={portfolioMode}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
