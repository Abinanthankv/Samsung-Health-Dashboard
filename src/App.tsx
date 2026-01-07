import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, ChevronRight, ChevronLeft, Activity, Moon, Zap,
  Trophy, Flame, LayoutDashboard, Dumbbell, HeartPulse,
  Sparkles, LogOut, Settings, Bell, Search, Clock, MapPin,
  TrendingUp, Navigation, Star, X, Calendar
} from 'lucide-react';
import React, { useState } from 'react';
import { parseSamsungHealthZip, transformHealthData, type ProgressCallback } from './utils/healthParser';
import {
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, Cell
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for cleaner class names
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const formatDuration = (hours: number) => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
};

type ViewType = 'overview' | 'workouts' | 'sleep' | 'wellness' | 'insights' | 'wrapped';

// Insights View Component
const InsightsView = ({ stats }: { stats: any }) => {
  const { personalRecords, weekdayStats, correlations } = stats;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold mb-2">Insights & Analytics</h2>
        <p className="text-gray-400">Discover patterns and achievements in your health data</p>
      </div>

      {/* Personal Records */}
      <div>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          Personal Records
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Most Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-blur p-6 rounded-2xl border border-blue-500/20"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <div className="text-sm text-gray-400">Most Steps</div>
                <div className="text-2xl font-bold text-blue-400">
                  {personalRecords.mostStepsDay.count.toLocaleString()}
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              {personalRecords.mostStepsDay.date ? new Date(personalRecords.mostStepsDay.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No data'}
            </div>
          </motion.div>

          {/* Longest Workout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-blur p-6 rounded-2xl border border-emerald-500/20"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <div className="text-sm text-gray-400">Longest Workout</div>
                <div className="text-2xl font-bold text-emerald-400">
                  {Math.round(personalRecords.longestWorkout.duration)}m
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              {personalRecords.longestWorkout.type || 'Workout'} • {personalRecords.longestWorkout.date ? new Date(personalRecords.longestWorkout.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No data'}
            </div>
          </motion.div>

          {/* Best Sleep Score */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card-blur p-6 rounded-2xl border border-purple-500/20"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Moon className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <div className="text-sm text-gray-400">Best Sleep Score</div>
                <div className="text-2xl font-bold text-purple-400">
                  {Math.round(personalRecords.bestSleepScore.score)}
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              {personalRecords.bestSleepScore.date ? new Date(personalRecords.bestSleepScore.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No data'}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Weekday Performance */}
      <div>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-cyan-400" />
          Performance by Day of Week
        </h3>
        <div className="card-blur p-6 rounded-2xl">
          <div className="space-y-4">
            {weekdayStats.map((day: any, idx: number) => {
              const maxSteps = Math.max(...weekdayStats.map((d: any) => d.avgSteps));
              const percentage = (day.avgSteps / maxSteps) * 100;

              return (
                <motion.div
                  key={day.day}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium w-24">{day.day}</span>
                    <span className="text-gray-400">{day.avgSteps.toLocaleString()} steps</span>
                  </div>
                  <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.8, delay: idx * 0.05 }}
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                    />
                  </div>
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span>🏋️ {day.avgWorkouts} workouts</span>
                    <span>😴 {day.avgSleep.toFixed(1)}h sleep</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Correlation Insights */}
      <div>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-pink-400" />
          Correlation Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card-blur p-6 rounded-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium">Sleep vs Activity</div>
              <div className={cn(
                "px-3 py-1 rounded-full text-xs font-bold",
                correlations.sleepVsActivity > 0.3 ? "bg-green-500/20 text-green-400" :
                  correlations.sleepVsActivity < -0.3 ? "bg-red-500/20 text-red-400" :
                    "bg-gray-500/20 text-gray-400"
              )}>
                {correlations.sleepVsActivity > 0 ? '+' : ''}{(correlations.sleepVsActivity * 100).toFixed(0)}%
              </div>
            </div>
            <p className="text-sm text-gray-400">
              {correlations.sleepVsActivity > 0.3 ? (
                <>You tend to sleep <span className="text-green-400 font-bold">better</span> on more active days</>
              ) : correlations.sleepVsActivity < -0.3 ? (
                <>More activity correlates with <span className="text-red-400 font-bold">less</span> sleep</>
              ) : (
                <>Sleep and activity show <span className="text-gray-300 font-bold">weak</span> correlation</>
              )}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="card-blur p-6 rounded-2xl opacity-50"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium">More Insights Coming Soon</div>
              <Sparkles className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-sm text-gray-400">
              Additional correlation analysis and pattern detection will be added in future updates
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [step, setStep] = useState<'upload' | 'loading' | 'dashboard'>('upload');
  const [activeView, setActiveView] = useState<ViewType>('overview');
  const [allStats, setAllStats] = useState<any>(null);
  const [selectedYear, setSelectedYear] = useState<string>('All Time');
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showSleepHeatmap, setShowSleepHeatmap] = useState(false);
  const [showSleepScoreHeatmap, setShowSleepScoreHeatmap] = useState(false);
  const [showStressHeatmap, setShowStressHeatmap] = useState(false);
  const [showWorkoutHeatmap, setShowWorkoutHeatmap] = useState(false);
  const [loadingInsights, setLoadingInsights] = useState<{
    workouts?: number;
    sleepSessions?: number;
    steps?: number;
  }>({});

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStep('loading');
    setLoadingInsights({});

    const onProgress: ProgressCallback = (_stage, _message, stats) => {
      if (stats) {
        setLoadingInsights(prev => ({ ...prev, ...stats }));
      }
    };

    try {
      const rawData = await parseSamsungHealthZip(file, onProgress);
      const transformedData = transformHealthData(rawData);
      setAllStats(transformedData);

      const availableYears = Object.keys(transformedData).filter(y => y !== 'All Time').sort().reverse();
      if (availableYears.length > 0) {
        setSelectedYear(availableYears[0]);
      } else {
        setSelectedYear('All Time');
      }

      setStep('dashboard');
    } catch (err) {
      console.error(err);
      alert('Error parsing health data. Please make sure it is a valid Samsung Health export.');
      setStep('upload');
    }
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'workouts', label: 'Workouts', icon: Dumbbell },
    { id: 'sleep', label: 'Sleep', icon: Moon },
    { id: 'wellness', label: 'Wellness', icon: HeartPulse },
    { id: 'insights', label: 'Insights', icon: TrendingUp },
    { id: 'wrapped', label: '2024 Wrapped', icon: Sparkles, highlight: true },
  ];

  if (step === 'upload') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 wrapped-gradient">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="max-w-md w-full card-blur p-10 rounded-[2.5rem] text-center"
        >
          <div className="w-20 h-20 bg-blue-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Activity className="w-10 h-10 text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Health Flow</h1>
          <p className="text-gray-400 mb-8 leading-relaxed">
            Personal health insights from your Samsung Health data.
          </p>

          <label className="cursor-pointer group">
            <input type="file" className="hidden" accept=".zip" onChange={handleFileUpload} />
            <div className="bg-white text-black py-4 px-8 rounded-2xl font-bold flex items-center justify-center gap-2 group-hover:bg-blue-50 transition-colors shadow-lg shadow-white/10">
              <Upload className="w-5 h-5" />
              Upload Export
            </div>
          </label>
        </motion.div>
      </div>
    );
  }

  if (step === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 wrapped-gradient">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="max-w-md w-full card-blur p-12 rounded-[2.5rem] text-center"
        >
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
            }}
            className="w-24 h-24 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-3xl flex items-center justify-center mx-auto mb-8 relative"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <Activity className="w-12 h-12 text-blue-400" />
            </motion.div>
            <motion.div
              className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-500/20"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>

          <h2 className="text-3xl font-bold mb-3">Extracting Data</h2>
          <motion.p
            className="text-gray-400 text-lg mb-8"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            Analyzing your health journey...
          </motion.p>

          {/* Animated Stat Cards */}
          <div className="space-y-3 mb-8">
            <AnimatePresence>
              {loadingInsights.workouts !== undefined && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3"
                >
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                    <Dumbbell className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <motion.div
                      className="text-2xl font-bold text-emerald-400"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      key={loadingInsights.workouts}
                    >
                      {loadingInsights.workouts.toLocaleString()}
                    </motion.div>
                    <div className="text-xs text-gray-400">Workouts Found</div>
                  </div>
                </motion.div>
              )}

              {loadingInsights.sleepSessions !== undefined && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-r from-purple-500/10 to-purple-500/5 border border-purple-500/20 rounded-2xl p-4 flex items-center gap-3"
                >
                  <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <Moon className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <motion.div
                      className="text-2xl font-bold text-purple-400"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      key={loadingInsights.sleepSessions}
                    >
                      {loadingInsights.sleepSessions.toLocaleString()}
                    </motion.div>
                    <div className="text-xs text-gray-400">Sleep Sessions</div>
                  </div>
                </motion.div>
              )}

              {loadingInsights.steps !== undefined && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-r from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-2xl p-4 flex items-center gap-3"
                >
                  <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Activity className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <motion.div
                      className="text-2xl font-bold text-blue-400"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      key={loadingInsights.steps}
                    >
                      {loadingInsights.steps.toLocaleString()}
                    </motion.div>
                    <div className="text-xs text-gray-400">Step Records</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex justify-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-blue-400 rounded-full"
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }
  const stats = allStats ? allStats[selectedYear] : null;
  const availableYears = allStats ? Object.keys(allStats).sort((a, b) => {
    if (a === 'All Time') return 1;
    if (b === 'All Time') return -1;
    return b.localeCompare(a);
  }) : [];

  if (!stats) return null;

  return (
    <div className="flex min-h-screen bg-[#09090b] text-white">
      {/* Sidebar */}
      <aside className="w-72 border-r border-white/5 flex flex-col p-6 fixed h-full">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-[#bef264] rounded-xl flex items-center justify-center">
            <Activity className="text-black w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight">HealthFlow</span>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as ViewType)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-left relative",
                activeView === item.id
                  ? "bg-white/10 text-white"
                  : "text-gray-500 hover:text-gray-300 hover:bg-white/5",
                item.highlight && "mt-8 text-[#bef264] hover:text-[#d9f99d]"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5",
                activeView === item.id ? "text-white" : "text-gray-500 group-hover:text-gray-300",
                item.highlight && "text-[#bef264]"
              )} />
              <span className="font-medium">
                {item.id === 'wrapped' ? `${selectedYear === 'All Time' ? '2024' : selectedYear} Wrapped` : item.label}
              </span>
              {activeView === item.id && (
                <motion.div
                  layoutId="nav-bg"
                  className={cn("ml-auto w-1.5 h-1.5 rounded-full", item.highlight ? "bg-[#bef264]" : "bg-white")}
                />
              )}
            </button>
          ))}
        </nav>

        <div className="pt-6 border-t border-white/5 space-y-4">
          <button className="flex items-center gap-3 px-4 py-2 text-gray-500 hover:text-gray-300 w-full transition-colors">
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </button>
          <div className="flex items-center gap-3 px-4 py-2 mt-4 bg-white/5 rounded-2xl">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#bef264] to-[#10b981]" />
            <div className="flex-1">
              <div className="text-sm font-bold">Abinanthan</div>
              <div className="text-xs text-gray-400">Pro Member</div>
            </div>
            <LogOut className="w-4 h-4 text-gray-500 cursor-pointer hover:text-red-400 transition-colors" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 sticky top-0 bg-[#09090b]/80 backdrop-blur-md z-30">
          <div className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-xl w-96 border border-white/5 focus-within:border-[#bef264]/50 transition-colors text-white">
            <Search className="w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search analytics..." className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-gray-500" />
          </div>

          <div className="flex items-center gap-6">
            <div className="relative group">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="appearance-none bg-[#181818] border border-white/10 rounded-xl px-5 py-2.5 pr-12 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#bef264]/50 hover:border-[#bef264]/30 cursor-pointer transition-all text-white outline-none"
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <ChevronRight className="w-4 h-4 text-gray-500 absolute right-4 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
            </div>

            <div className="relative">
              <Bell className="w-5 h-5 text-gray-400 cursor-pointer hover:text-white transition-colors" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-[#09090b]" />
            </div>
            <button
              onClick={() => setStep('upload')}
              className="bg-[#bef264] hover:bg-[#d9f99d] text-black px-5 py-2 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 shadow-lg shadow-[#bef264]/10"
            >
              <Upload className="w-4 h-4" />
              Sync Data
            </button>
          </div>
        </header>

        <div className="p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeView}-${selectedYear}`}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {activeView === 'overview' && <Overview stats={stats} setShowHeatmap={setShowHeatmap} />}
              {activeView === 'workouts' && <Workouts stats={stats} setShowWorkoutHeatmap={setShowWorkoutHeatmap} />}
              {activeView === 'wellness' && <Wellness stats={stats} setShowStressHeatmap={setShowStressHeatmap} />}
              {activeView === 'sleep' && <SleepView stats={stats} setShowSleepHeatmap={setShowSleepHeatmap} setShowSleepScoreHeatmap={setShowSleepScoreHeatmap} />}
              {activeView === 'insights' && <InsightsView stats={stats} />}
              {activeView === 'wrapped' && <WrappedView stats={stats} setShowHeatmap={setShowHeatmap} />}
            </motion.div>
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {showHeatmap && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowHeatmap(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-7xl bg-gray-900 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
              >
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-gray-900/50 backdrop-blur-xl">
                  <div>
                    <h2 className="text-2xl font-bold">Step Consistency</h2>
                    <p className="text-gray-400 text-sm">Your movement patterns over {selectedYear}</p>
                  </div>
                  <button
                    onClick={() => setShowHeatmap(false)}
                    className="p-3 hover:bg-white/5 rounded-2xl transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                  <StepHeatmap data={stats.dailyStepData} year={selectedYear === 'All Time' ? '2025' : selectedYear} />
                </div>
              </motion.div>
            </div>
          )}

          {showSleepHeatmap && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowSleepHeatmap(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-7xl bg-gray-900 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
              >
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-gray-900/50 backdrop-blur-xl">
                  <div>
                    <h2 className="text-2xl font-bold text-purple-400">Sleep Duration Heatmap</h2>
                    <p className="text-gray-400 text-sm">Sleep hours patterns over {selectedYear}</p>
                  </div>
                  <button
                    onClick={() => setShowSleepHeatmap(false)}
                    className="p-3 hover:bg-white/5 rounded-2xl transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                  <SleepHeatmap data={stats.dailySleepData} year={selectedYear === 'All Time' ? '2025' : selectedYear} />
                </div>
              </motion.div>
            </div>
          )}

          {showSleepScoreHeatmap && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowSleepScoreHeatmap(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-7xl bg-gray-900 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
              >
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-gray-900/50 backdrop-blur-xl">
                  <div>
                    <h2 className="text-2xl font-bold text-amber-500">Sleep Quality Heatmap</h2>
                    <p className="text-gray-400 text-sm">Sleep scores over {selectedYear}</p>
                  </div>
                  <button
                    onClick={() => setShowSleepScoreHeatmap(false)}
                    className="p-3 hover:bg-white/5 rounded-2xl transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                  <SleepScoreHeatmap data={stats.dailySleepScoreData} year={selectedYear === 'All Time' ? '2025' : selectedYear} />
                </div>
              </motion.div>
            </div>
          )}
          {showStressHeatmap && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowStressHeatmap(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-7xl bg-gray-900 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
              >
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-gray-900/50 backdrop-blur-xl">
                  <div>
                    <h2 className="text-2xl font-bold text-orange-500">Stress Level Heatmap</h2>
                    <p className="text-gray-400 text-sm">Stress patterns over {selectedYear}</p>
                  </div>
                  <button
                    onClick={() => setShowStressHeatmap(false)}
                    className="p-3 hover:bg-white/5 rounded-2xl transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                  <StressHeatmap data={stats.dailyStressData} year={selectedYear === 'All Time' ? '2025' : selectedYear} />
                </div>
              </motion.div>
            </div>
          )}
          {showWorkoutHeatmap && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowWorkoutHeatmap(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-7xl bg-gray-900 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
              >
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-gray-900/50 backdrop-blur-xl">
                  <div>
                    <h2 className="text-2xl font-bold text-[#bef264]">Workout Intensity Heatmap</h2>
                    <p className="text-gray-400 text-sm">Active sessions over {selectedYear}</p>
                  </div>
                  <button
                    onClick={() => setShowWorkoutHeatmap(false)}
                    className="p-3 hover:bg-white/5 rounded-2xl transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                  <WorkoutHeatmap data={stats.dailyWorkoutData} year={selectedYear === 'All Time' ? '2025' : selectedYear} />
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

const MetricCard = ({ title, value, unit, icon: Icon, color, trend, onClick }: any) => (
  <motion.div
    whileHover={{ y: -5, scale: 1.02 }}
    onClick={onClick}
    className={cn(
      "card-blur p-5 rounded-[2rem] border border-white/5 group hover:border-[#bef264]/20 transition-all cursor-pointer overflow-hidden",
      onClick && "active:scale-95"
    )}
  >
    <div className="flex justify-between items-start mb-4">
      <div className={cn("p-2.5 rounded-xl", color)}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      {trend && (
        <span className={cn("text-[10px] font-black px-2 py-0.5 rounded-full", trend > 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500")}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">{title}</div>
    <div className="flex items-baseline gap-1.5 flex-wrap">
      <span className="text-2xl font-bold tracking-tight text-white">{value}</span>
      <span className="text-gray-500 text-[10px] font-bold uppercase tracking-normal">{unit}</span>
    </div>
  </motion.div>
);

const Overview = ({ stats, setShowHeatmap }: any) => {
  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold mb-2">Good Evening, Abinanthan</h1>
          <p className="text-gray-500 font-medium">Here's what's happening with your health today.</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-[#bef264] mb-1 flex items-center gap-2 justify-end">
            <Trophy className="w-4 h-4" /> {stats.year === 'All Time' ? 'ALL TIME LEGEND' : `${stats.year} LEGEND`}
          </div>
          <div className="text-gray-400 text-xs uppercase tracking-widest font-black">Membership Active</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-5">
        <MetricCard
          title="Total Steps"
          value={stats.totalSteps.toLocaleString()}
          unit="steps"
          icon={Activity}
          color="bg-blue-500"
          trend={12}
          onClick={() => setShowHeatmap(true)}
        />
        <MetricCard title="Daily Avg" value={stats.dailyAvg.toLocaleString()} unit="steps/day" icon={Star} color="bg-yellow-500" />
        <MetricCard title="Distance" value={stats.totalDistance.toFixed(1)} unit="km" icon={Navigation} color="bg-indigo-500" />
        <MetricCard title="Energy Burned" value={stats.totalCalories.toLocaleString()} unit="kcal" icon={Flame} color="bg-orange-500" trend={8} />
        <MetricCard title="Avg Speed" value={stats.avgSpeed.toFixed(1)} unit="m/s" icon={TrendingUp} color="bg-lime-500" />
        <MetricCard title="Sleep Avg" value={stats.avgSleepDuration.toFixed(1)} unit="hours" icon={Moon} color="bg-purple-500" trend={-2} />
        <MetricCard title="Workouts" value={stats.totalWorkouts} unit="sessions" icon={Dumbbell} color="bg-emerald-500" trend={5} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 card-blur p-8 rounded-[2.5rem] border border-white/5">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold">Monthly Activity</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="font-bold text-[#bef264]">Best Month:</span> {stats.bestMonth.name}
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="month" stroke="#ffffff30" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff20" fontSize={12} tickLine={false} axisLine={false} hide />
                <Tooltip
                  cursor={{ fill: '#ffffff05' }}
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  labelStyle={{ color: '#9ca3af' }}
                  itemStyle={{ color: '#ffffff' }}
                />
                <Bar dataKey="steps" radius={[4, 4, 4, 4]}>
                  {stats.monthlyTrends.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.month === stats.bestMonth.name ? '#bef264' : '#bef26420'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-blur p-8 rounded-[2.5rem] border border-white/5">
          <h3 className="text-xl font-bold mb-6">Top Exercises</h3>
          <div className="space-y-6">
            {stats.topExercises.map((ex: any, i: number) => (
              <div key={ex.name} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center font-bold text-gray-400">
                    0{i + 1}
                  </div>
                  <div>
                    <div className="font-bold">{ex.name}</div>
                    <div className="text-xs text-gray-500">Regular routine</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-[#bef264]">{ex.count}</div>
                  <div className="text-[10px] text-gray-500 uppercase font-black uppercase tracking-tighter">Sessions</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const getActivityIcon = (type: string) => {
  const t = type.toLowerCase();
  if (t.includes('walk')) return Navigation;
  if (t.includes('run')) return Zap;
  if (t.includes('cycle')) return Activity;
  if (t.includes('hiking')) return MapPin;
  if (t.includes('yoga')) return Sparkles;
  if (t.includes('stair')) return TrendingUp;
  return Dumbbell;
};

const formatWorkoutDuration = (mins: number) => {
  if (mins < 60) return `${Math.round(mins)}m`;
  const hrs = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return m > 0 ? `${hrs}h ${m}m` : `${hrs}h`;
};

const Workouts = ({ stats, setShowWorkoutHeatmap }: any) => {
  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold mb-2">Workout History</h1>
          <p className="text-gray-500 font-medium">Your physical activity logs and performance metrics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        <MetricCard
          title="Total Sessions"
          value={stats.totalWorkouts}
          unit="workouts"
          icon={Dumbbell}
          color="bg-emerald-500"
          onClick={() => setShowWorkoutHeatmap(true)}
        />
        <MetricCard
          title="Total Duration"
          value={formatWorkoutDuration(stats.totalWorkoutDuration)}
          unit=""
          icon={Clock}
          color="bg-purple-500"
        />
        <MetricCard
          title="Total Distance"
          value={stats.totalWorkoutDistance.toFixed(1)}
          unit="km"
          icon={Navigation}
          color="bg-blue-500"
        />
        <MetricCard
          title="Calories"
          value={stats.totalWorkoutCalories.toLocaleString()}
          unit="kcal"
          icon={Flame}
          color="bg-orange-500"
        />
        <MetricCard
          title="Variety"
          value={stats.topExercises.length}
          unit="types"
          icon={Activity}
          color="bg-indigo-500"
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#bef264]" />
          Recent Sessions
        </h2>

        <div className="grid grid-cols-1 gap-4">
          {stats.workouts.length === 0 ? (
            <div className="card-blur p-12 rounded-3xl border border-dashed border-white/10 text-center">
              <div className="text-gray-500 font-bold italic">No specialized workout logs found for this period.</div>
            </div>
          ) : (
            stats.workouts.slice(0, 50).map((w: any, i: number) => {
              const Icon = getActivityIcon(w.type);
              return (
                <motion.div
                  key={`${w.startTime}-${i}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="card-blur p-6 rounded-3xl border border-white/5 flex items-center justify-between group hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-6">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center",
                      w.type === 'Walking' ? "bg-indigo-500/10" :
                        w.type === 'Running' ? "bg-orange-500/10" : "bg-[#bef264]/10"
                    )}>
                      <Icon className={cn(
                        "w-7 h-7",
                        w.type === 'Walking' ? "text-indigo-400" :
                          w.type === 'Running' ? "text-orange-400" : "text-[#bef264]"
                      )} />
                    </div>
                    <div>
                      <div className="text-lg font-bold flex items-center gap-2">
                        {w.type}
                        <span className="text-[10px] bg-white/5 text-gray-400 px-2 py-0.5 rounded-full font-black uppercase">
                          {new Date(w.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-1 font-bold italic">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-purple-400" /> {formatWorkoutDuration(w.duration)}</span>
                        <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-orange-400" /> {Math.round(w.calories)} kcal</span>
                        {w.distance && (
                          <span className="flex items-center gap-1"><Navigation className="w-3 h-3 text-blue-400" /> {w.distance.toFixed(2)} km</span>
                        )}
                        {w.avgHR && (
                          <span className="flex items-center gap-1"><HeartPulse className="w-3 h-3 text-red-400" /> {Math.round(w.avgHR)} avg bpm</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest">
                      {new Date(w.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {w.maxHR && (
                      <div className="text-[10px] text-red-500/50 font-black uppercase flex items-center gap-1">
                        Peak: {Math.round(w.maxHR)} bpm <Zap className="w-2 h-2" />
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

const Wellness = ({ stats, setShowStressHeatmap }: any) => {
  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold mb-2">Wellness Analytics</h1>
          <p className="text-gray-500 font-medium">Deep dive into your physiological resilience and vital signs.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Resting HR"
          value={stats.avgRestingHR}
          unit="bpm"
          icon={HeartPulse}
          color="bg-red-500"
          trend={-2}
        />
        <MetricCard
          title="HRV (RMSSD)"
          value={stats.avgHRV}
          unit="ms"
          icon={Activity}
          color="bg-blue-500"
          trend={8}
        />
        <MetricCard
          title="Avg Stress"
          value={stats.avgStress}
          unit="/ 100"
          icon={Sparkles}
          color="bg-orange-500"
          onClick={() => setShowStressHeatmap(true)}
        />
        <MetricCard
          title="Min SpO2"
          value={stats.minSpO2}
          unit="%"
          icon={Zap}
          color="bg-emerald-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card-blur p-8 rounded-[2.5rem] border border-white/5">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-red-400">Resting Heart Rate Trend</h3>
            <div className="text-xs text-gray-500 uppercase tracking-widest font-bold">Daily Minimums</div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.dailyHRData}>
                <defs>
                  <linearGradient id="hrGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="date" hide />
                <YAxis stroke="#ffffff20" fontSize={12} domain={['dataMin - 5', 'dataMax + 5']} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  labelStyle={{ color: '#9ca3af' }}
                  itemStyle={{ color: '#ffffff' }}
                />
                <Area type="monotone" dataKey="value" stroke="#ef4444" fillOpacity={1} fill="url(#hrGradient)" strokeWidth={3} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-blur p-8 rounded-[2.5rem] border border-white/5">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-blue-400">HRV (Recovery Index)</h3>
            <div className="text-xs text-gray-500 uppercase tracking-widest font-bold">RMSSD Trend</div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.dailyHRVData}>
                <defs>
                  <linearGradient id="hrvGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="date" hide />
                <YAxis stroke="#ffffff20" fontSize={12} domain={['dataMin - 10', 'dataMax + 10']} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  labelStyle={{ color: '#9ca3af' }}
                  itemStyle={{ color: '#ffffff' }}
                />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#hrvGradient)" strokeWidth={3} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-blur p-8 rounded-[2.5rem] border border-white/5">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-orange-400">Daily Stress Avg</h3>
            <button
              onClick={() => setShowStressHeatmap(true)}
              className="text-xs text-orange-400 hover:text-orange-300 font-bold flex items-center gap-1 transition-colors"
            >
              <Calendar className="w-3 h-3" /> View Heatmap
            </button>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.dailyStressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="date" hide />
                <YAxis stroke="#ffffff20" fontSize={12} domain={[0, 100]} />
                <Tooltip
                  cursor={{ fill: '#ffffff05' }}
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  labelStyle={{ color: '#9ca3af' }}
                  itemStyle={{ color: '#ffffff' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {stats.dailyStressData.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.value > 70 ? '#f97316' : entry.value > 40 ? '#fbbf24' : '#fbbf2440'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-blur p-8 rounded-[2.5rem] border border-white/5">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-emerald-400">Oxygen Saturation (SpO2)</h3>
            <div className="text-xs text-gray-500 uppercase tracking-widest font-bold">Daily Minimums</div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.dailySpO2Data}>
                <defs>
                  <linearGradient id="spo2Gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="date" hide />
                <YAxis stroke="#ffffff20" fontSize={12} domain={[85, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  labelStyle={{ color: '#9ca3af' }}
                  itemStyle={{ color: '#ffffff' }}
                />
                <Area type="monotone" dataKey="value" stroke="#10b981" fillOpacity={1} fill="url(#spo2Gradient)" strokeWidth={3} dot={true} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const SleepView = ({ stats, setShowSleepHeatmap, setShowSleepScoreHeatmap }: any) => (
  <div className="space-y-8">
    <h1 className="text-4xl font-bold">Sleep Insights</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="card-blur p-8 rounded-3xl text-center">
        <div className="text-gray-400 mb-2">Efficiency</div>
        <div className="text-5xl font-black text-purple-400">{stats.avgEfficiency}%</div>
      </div>
      <MetricCard
        title="Avg Duration"
        value={formatDuration(stats.avgSleepDuration)}
        unit=""
        icon={Moon}
        color="bg-purple-500"
        onClick={() => setShowSleepHeatmap(true)}
      />
      <MetricCard
        title="Sleep Score"
        value={stats.avgSleepScore}
        unit="pts"
        icon={Star}
        color="bg-amber-500"
        onClick={() => setShowSleepScoreHeatmap(true)}
      />
      <MetricCard
        title="Avg Bedtime"
        value={stats.avgBedTime}
        unit=""
        icon={Clock}
        color="bg-indigo-500"
      />
      <MetricCard
        title="Avg Wake-up"
        value={stats.avgWakeTime}
        unit=""
        icon={Zap}
        color="bg-blue-400"
      />
      <div className="card-blur p-8 rounded-3xl text-center">
        <div className="text-gray-400 mb-2">Consistency</div>
        <div className="text-5xl font-black text-emerald-400">High</div>
      </div>
    </div>
  </div>
);

const WrappedView = ({ stats, setShowHeatmap }: any) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const { wrappedInsights } = stats;

  const slides = [
    // Welcome Card
    {
      title: `Your ${stats.year} Journey`,
      gradient: "from-blue-500 to-purple-500",
      content: () => (
        <div className="text-center space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="text-8xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
          >
            {stats.year}
          </motion.div>
          <p className="text-2xl text-gray-300">Let's celebrate your health journey</p>
        </div>
      )
    },

    // Personality: Fitness Type
    {
      title: "Your Fitness Personality",
      gradient: "from-orange-500 to-pink-500",
      content: () => (
        <div className="text-center space-y-6">
          <div className="text-6xl">
            {wrappedInsights.personality.fitnessType === 'Early Bird' ? '🌅' :
              wrappedInsights.personality.fitnessType === 'Night Owl' ? '🦉' : '⚖️'}
          </div>
          <div className="text-5xl font-bold text-orange-400">
            {wrappedInsights.personality.fitnessType}
          </div>
          <p className="text-xl text-gray-300">
            {wrappedInsights.personality.fitnessType === 'Early Bird' ?
              "You crush your workouts before the world wakes up" :
              wrappedInsights.personality.fitnessType === 'Night Owl' ?
                "Evening energy is your superpower" :
                "You adapt your workouts to your day"}
          </p>
        </div>
      )
    },

    // Personality: Workout Style
    {
      title: "Your Workout Style",
      gradient: "from-emerald-500 to-cyan-500",
      content: () => (
        <div className="text-center space-y-6">
          <div className="text-6xl">
            {wrappedInsights.personality.workoutStyle === 'Weekend Warrior' ? '⚔️' :
              wrappedInsights.personality.workoutStyle === 'Consistent Grinder' ? '💪' : '🎯'}
          </div>
          <div className="text-5xl font-bold text-emerald-400">
            {wrappedInsights.personality.workoutStyle}
          </div>
          <p className="text-xl text-gray-300">
            {wrappedInsights.personality.workoutStyle === 'Weekend Warrior' ?
              "Weekends are for crushing goals" :
              wrappedInsights.personality.workoutStyle === 'Consistent Grinder' ?
                "Dedication is your middle name" :
                "Finding your rhythm, one workout at a time"}
          </p>
        </div>
      )
    },

    // Total Steps with Heatmap
    {
      title: "Steps Conquered",
      gradient: "from-blue-500 to-emerald-500",
      content: () => (
        <div className="text-center cursor-pointer group" onClick={() => setShowHeatmap(true)}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="text-8xl font-black bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform"
          >
            {stats.totalSteps.toLocaleString()}
          </motion.div>
          <p className="text-xl text-gray-400 mt-4">steps in {stats.year}</p>
          <p className="text-sm text-gray-500 mt-2">Tap to see your heatmap</p>
        </div>
      )
    },

    // Fun Comparison: Distance
    {
      title: "Distance Traveled",
      gradient: "from-yellow-500 to-orange-500",
      content: () => (
        <div className="text-center space-y-6">
          <div className="text-6xl">🏃</div>
          <div className="text-5xl font-bold text-yellow-400">
            {wrappedInsights.funComparisons.distanceEquivalent}
          </div>
          <p className="text-xl text-gray-300">
            That's {stats.totalDistance.toFixed(1)} km of pure determination
          </p>
        </div>
      )
    },

    // Fun Comparison: Calories
    {
      title: "Calories Burned",
      gradient: "from-red-500 to-pink-500",
      content: () => (
        <div className="text-center space-y-6">
          <div className="text-6xl">🍕</div>
          <div className="text-5xl font-bold text-red-400">
            {wrappedInsights.funComparisons.calorieEquivalent}
          </div>
          <p className="text-xl text-gray-300">
            You earned every single one
          </p>
        </div>
      )
    },

    // Niche Stat: Favorite Day
    {
      title: "Your Power Day",
      gradient: "from-purple-500 to-pink-500",
      content: () => (
        <div className="text-center space-y-6">
          <div className="text-6xl">📅</div>
          <div className="text-5xl font-bold text-purple-400">
            {wrappedInsights.nicheStats.favoriteWorkoutDay}
          </div>
          <p className="text-xl text-gray-300">
            Your most active day of the week
          </p>
        </div>
      )
    },

    // Niche Stat: Most Active Hour
    {
      title: "Peak Performance Time",
      gradient: "from-cyan-500 to-blue-500",
      content: () => (
        <div className="text-center space-y-6">
          <div className="text-6xl">⏰</div>
          <div className="text-5xl font-bold text-cyan-400">
            {wrappedInsights.nicheStats.mostActiveHour}:00
          </div>
          <p className="text-xl text-gray-300">
            {wrappedInsights.patterns.bestWorkoutTime} workouts hit different
          </p>
        </div>
      )
    },

    // Streak
    {
      title: "Consistency King",
      gradient: "from-orange-500 to-red-500",
      content: () => (
        <div className="text-center space-y-6">
          <div className="text-6xl">🔥</div>
          <div className="text-5xl font-bold text-orange-400">
            {wrappedInsights.nicheStats.longestStreak} days
          </div>
          <p className="text-xl text-gray-300">
            Your longest active streak
          </p>
        </div>
      )
    },

    // Sleep Insights
    {
      title: "Sleep Story",
      gradient: "from-indigo-500 to-purple-500",
      content: () => (
        <div className="text-center space-y-6">
          <div className="text-6xl">😴</div>
          <div className="text-5xl font-bold text-indigo-400">
            {wrappedInsights.funComparisons.sleepEquivalent}
          </div>
          <p className="text-xl text-gray-300">
            of restful recovery
          </p>
          <div className="text-sm text-gray-400 mt-4">
            Sleep quality: {wrappedInsights.patterns.sleepQualityTrend === 'improving' ? '📈 Improving' :
              wrappedInsights.patterns.sleepQualityTrend === 'declining' ? '📉 Needs attention' :
                '➡️ Stable'}
          </div>
        </div>
      )
    },

    // Best Month
    {
      title: "Peak Month",
      gradient: "from-green-500 to-emerald-500",
      content: () => (
        <div className="text-center space-y-6">
          <div className="text-6xl">🏆</div>
          <div className="text-5xl font-bold text-green-400">
            {wrappedInsights.patterns.mostProductiveMonth}
          </div>
          <p className="text-xl text-gray-300">
            Your most productive month
          </p>
        </div>
      )
    },

    // Thank You
    {
      title: "Keep Going",
      gradient: "from-pink-500 to-purple-500",
      content: () => (
        <div className="text-center space-y-6">
          <div className="text-6xl">✨</div>
          <div className="text-4xl font-bold text-pink-400">
            You're Incredible
          </div>
          <p className="text-xl text-gray-300">
            Every step, every workout, every rest day matters
          </p>
          <p className="text-lg text-gray-400 mt-4">
            Here's to an even better {parseInt(stats.year) + 1}
          </p>
        </div>
      )
    }
  ];

  return (
    <div className="h-[75vh] flex flex-col items-center justify-center rounded-[3rem] p-12 relative overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${slides[activeSlide].gradient} opacity-20 rounded-[3rem]`} />

      <AnimatePresence mode="wait">
        <motion.div
          key={activeSlide}
          initial={{ x: 100, opacity: 0, scale: 0.9 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          exit={{ x: -100, opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="text-center relative z-10 w-full max-w-2xl"
        >
          <h2 className="text-4xl font-bold mb-12 text-white">{slides[activeSlide].title}</h2>
          {slides[activeSlide].content()}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="absolute bottom-10 flex gap-4 z-20">
        <button
          onClick={() => setActiveSlide(Math.max(0, activeSlide - 1))}
          disabled={activeSlide === 0}
          className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors disabled:opacity-30"
        >
          <ChevronLeft />
        </button>
        <button
          onClick={() => setActiveSlide(Math.min(slides.length - 1, activeSlide + 1))}
          disabled={activeSlide === slides.length - 1}
          className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors disabled:opacity-30"
        >
          <ChevronRight />
        </button>
      </div>

      {/* Progress Dots */}
      <div className="absolute bottom-28 flex gap-2 z-20">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveSlide(idx)}
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              idx === activeSlide ? "bg-white w-8" : "bg-white/30"
            )}
          />
        ))}
      </div>
    </div>
  );
};
const SleepHeatmap = ({ data, year }: { data: { date: string, duration: number }[], year: string }) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const dataMap = new Map(data.map(d => [d.date, d.duration]));

  const currentYear = year === 'All Time' ? new Date().getFullYear() : parseInt(year);
  const startDate = new Date(currentYear, 0, 1);
  const endDate = year === 'All Time' || currentYear === new Date().getFullYear() ? new Date() : new Date(currentYear, 11, 31);

  const allDates: Date[] = [];
  let curr = new Date(startDate);
  curr.setDate(curr.getDate() - curr.getDay());

  while (curr <= endDate || allDates.length % 7 !== 0) {
    allDates.push(new Date(curr));
    curr.setDate(curr.getDate() + 1);
    if (allDates.length > 400) break;
  }

  const getColor = (duration: number) => {
    if (duration === 0) return 'bg-white/5';
    if (duration < 4) return 'bg-purple-900/40';
    if (duration < 6) return 'bg-purple-700/60';
    if (duration < 8) return 'bg-purple-500/80';
    return 'bg-purple-400';
  };

  return (
    <div className="overflow-x-auto pb-4">
      <div className="min-w-[800px]">
        <div className="flex gap-1 mb-2 ml-8 relative">
          {months.map((month, i) => {
            const firstDateOfMonth = allDates.find(d => d.getMonth() === i && d.getFullYear() === currentYear);
            if (!firstDateOfMonth) return null;
            const weekIndex = Math.floor(allDates.indexOf(firstDateOfMonth) / 7);
            return (
              <div key={month} className="text-[10px] text-gray-500 absolute" style={{ left: `${weekIndex * 18}px` }}>
                {month}
              </div>
            );
          })}
        </div>
        <div className="flex gap-1.5 mt-4">
          <div className="flex flex-col justify-between text-[10px] text-gray-500 pr-3 w-10">
            {days.map((day, i) => i % 2 === 1 ? <span key={day}>{day}</span> : <div key={day} className="h-3" />)}
          </div>
          <div className="flex gap-1.5">
            {Array.from({ length: Math.ceil(allDates.length / 7) }).map((_, weekIndex) => {
              const totalWeeks = Math.ceil(allDates.length / 7);

              return (
                <div key={weekIndex} className="flex flex-col gap-1.5">
                  {allDates.slice(weekIndex * 7, (weekIndex + 1) * 7).map((date, dayIdx) => {
                    const dateStr = date.toISOString().split('T')[0];
                    const duration = dataMap.get(dateStr) || 0;
                    const isCurrentYear = date.getFullYear() === currentYear;

                    // Smart tooltip positioning
                    const isLeftEdge = weekIndex < 3;
                    const isRightEdge = weekIndex > totalWeeks - 4;
                    const isTopEdge = dayIdx < 2;
                    const isBottomEdge = dayIdx > 4;

                    return (
                      <div
                        key={dateStr}
                        className={cn(
                          "w-3 h-3 rounded-[3px] transition-all hover:scale-150 hover:z-10 cursor-pointer relative group",
                          isCurrentYear ? getColor(duration) : 'opacity-0 pointer-events-none'
                        )}
                      >
                        <div className={cn(
                          "absolute px-3 py-2 bg-gray-800/95 backdrop-blur-md text-white text-[10px] border border-white/10 rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-all duration-200",
                          // Horizontal positioning
                          isLeftEdge ? "left-full ml-2" : isRightEdge ? "right-full mr-2" : "left-1/2 -translate-x-1/2",
                          // Vertical positioning
                          (isTopEdge && !isLeftEdge && !isRightEdge) ? "top-full mt-2" :
                            (isBottomEdge && !isLeftEdge && !isRightEdge) ? "bottom-full mb-2" :
                              (isLeftEdge || isRightEdge) ? "top-1/2 -translate-y-1/2" : "bottom-full mb-2"
                        )}>
                          <span className="font-bold">{date.toLocaleDateString()}</span>: {formatDuration(duration)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-end gap-2 text-[10px] text-gray-500 mr-8">
        <span>Less</span>
        <div className="w-[11px] h-[11px] rounded-[2px] bg-white/5" />
        <div className="w-[11px] h-[11px] rounded-[2px] bg-purple-900/40" />
        <div className="w-[11px] h-[11px] rounded-[2px] bg-purple-700/60" />
        <div className="w-[11px] h-[11px] rounded-[2px] bg-purple-500/80" />
        <div className="w-[11px] h-[11px] rounded-[2px] bg-purple-400" />
        <span>More</span>
      </div>
    </div>
  );
};

const SleepScoreHeatmap = ({ data, year }: { data: { date: string, score: number }[], year: string }) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const dataMap = new Map(data.map(d => [d.date, d.score]));

  const currentYear = year === 'All Time' ? new Date().getFullYear() : parseInt(year);
  const startDate = new Date(currentYear, 0, 1);
  const endDate = year === 'All Time' || currentYear === new Date().getFullYear() ? new Date() : new Date(currentYear, 11, 31);

  const allDates: Date[] = [];
  let curr = new Date(startDate);
  curr.setDate(curr.getDate() - curr.getDay());

  while (curr <= endDate || allDates.length % 7 !== 0) {
    allDates.push(new Date(curr));
    curr.setDate(curr.getDate() + 1);
    if (allDates.length > 400) break;
  }

  const getColor = (score: number) => {
    if (score === 0) return 'bg-white/5';
    if (score < 60) return 'bg-orange-900/40';
    if (score < 75) return 'bg-orange-700/60';
    if (score < 85) return 'bg-amber-600/80';
    return 'bg-amber-400';
  };

  return (
    <div className="overflow-x-auto pb-4">
      <div className="min-w-[800px]">
        <div className="flex gap-1 mb-2 ml-8 relative">
          {months.map((month, i) => {
            const firstDateOfMonth = allDates.find(d => d.getMonth() === i && d.getFullYear() === currentYear);
            if (!firstDateOfMonth) return null;
            const weekIndex = Math.floor(allDates.indexOf(firstDateOfMonth) / 7);
            return (
              <div key={month} className="text-[10px] text-gray-500 absolute" style={{ left: `${weekIndex * 18}px` }}>
                {month}
              </div>
            );
          })}
        </div>
        <div className="flex gap-1.5 mt-4">
          <div className="flex flex-col justify-between text-[10px] text-gray-500 pr-3 w-10">
            {days.map((day, i) => i % 2 === 1 ? <span key={day}>{day}</span> : <div key={day} className="h-3" />)}
          </div>
          <div className="flex gap-1.5">
            {Array.from({ length: Math.ceil(allDates.length / 7) }).map((_, weekIndex) => {
              const totalWeeks = Math.ceil(allDates.length / 7);

              return (
                <div key={weekIndex} className="flex flex-col gap-1.5">
                  {allDates.slice(weekIndex * 7, (weekIndex + 1) * 7).map((date, dayIdx) => {
                    const dateStr = date.toISOString().split('T')[0];
                    const score = dataMap.get(dateStr) || 0;
                    const isCurrentYear = date.getFullYear() === currentYear;

                    const isLeftEdge = weekIndex < 3;
                    const isRightEdge = weekIndex > totalWeeks - 4;
                    const isTopEdge = dayIdx < 2;
                    const isBottomEdge = dayIdx > 4;

                    return (
                      <div
                        key={dateStr}
                        className={cn(
                          "w-3 h-3 rounded-[3px] transition-all hover:scale-150 hover:z-10 cursor-pointer relative group",
                          isCurrentYear ? getColor(score) : 'opacity-0 pointer-events-none'
                        )}
                      >
                        <div className={cn(
                          "absolute px-3 py-2 bg-gray-800/95 backdrop-blur-md text-white text-[10px] border border-white/10 rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-all duration-200",
                          isLeftEdge ? "left-full ml-2" : isRightEdge ? "right-full mr-2" : "left-1/2 -translate-x-1/2",
                          (isTopEdge && !isLeftEdge && !isRightEdge) ? "top-full mt-2" :
                            (isBottomEdge && !isLeftEdge && !isRightEdge) ? "bottom-full mb-2" :
                              (isLeftEdge || isRightEdge) ? "top-1/2 -translate-y-1/2" : "bottom-full mb-2"
                        )}>
                          <span className="font-bold">{date.toLocaleDateString()}</span>: {score.toFixed(0)} pts
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-end gap-2 text-[10px] text-gray-500 mr-8">
        <span>Lower</span>
        <div className="w-[11px] h-[11px] rounded-[2px] bg-white/5" />
        <div className="w-[11px] h-[11px] rounded-[2px] bg-orange-900/40" />
        <div className="w-[11px] h-[11px] rounded-[2px] bg-orange-700/60" />
        <div className="w-[11px] h-[11px] rounded-[2px] bg-amber-600/80" />
        <div className="w-[11px] h-[11px] rounded-[2px] bg-amber-400" />
        <span>Higher</span>
      </div>
    </div>
  );
};

const StepHeatmap = ({ data, year }: { data: { date: string, count: number }[], year: string }) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const dataMap = new Map(data.map(d => [d.date, d.count]));

  const currentYear = year === 'All Time' ? new Date().getFullYear() : parseInt(year);
  const startDate = new Date(currentYear, 0, 1);
  const endDate = year === 'All Time' || currentYear === new Date().getFullYear() ? new Date() : new Date(currentYear, 11, 31);

  const allDates: Date[] = [];
  let curr = new Date(startDate);
  curr.setDate(curr.getDate() - curr.getDay());

  while (curr <= endDate || allDates.length % 7 !== 0) {
    allDates.push(new Date(curr));
    curr.setDate(curr.getDate() + 1);
    if (allDates.length > 400) break;
  }

  const getColor = (count: number) => {
    if (count === 0) return 'bg-white/5';
    if (count < 5000) return 'bg-blue-900/40';
    if (count < 10000) return 'bg-blue-700/60';
    if (count < 15000) return 'bg-blue-500/80';
    return 'bg-blue-400';
  };

  return (
    <div className="overflow-x-auto pb-4">
      <div className="min-w-[800px]">
        <div className="flex gap-1 mb-2 ml-8 relative">
          {months.map((month, i) => {
            const firstDateOfMonth = allDates.find(d => d.getMonth() === i && d.getFullYear() === currentYear);
            if (!firstDateOfMonth) return null;
            const weekIndex = Math.floor(allDates.indexOf(firstDateOfMonth) / 7);
            return (
              <div key={month} className="text-[10px] text-gray-500 absolute" style={{ left: `${weekIndex * 18}px` }}>
                {month}
              </div>
            );
          })}
        </div>
        <div className="flex gap-1.5 mt-4">
          <div className="flex flex-col justify-between text-[10px] text-gray-500 pr-3 w-10">
            {days.map((day, i) => i % 2 === 1 ? <span key={day}>{day}</span> : <div key={day} className="h-3" />)}
          </div>
          <div className="flex gap-1.5">
            {Array.from({ length: Math.ceil(allDates.length / 7) }).map((_, weekIndex) => {
              const totalWeeks = Math.ceil(allDates.length / 7);

              return (
                <div key={weekIndex} className="flex flex-col gap-1.5">
                  {allDates.slice(weekIndex * 7, (weekIndex + 1) * 7).map((date, dayIdx) => {
                    const dateStr = date.toISOString().split('T')[0];
                    const count = dataMap.get(dateStr) || 0;
                    const isCurrentYear = date.getFullYear() === currentYear;

                    const isLeftEdge = weekIndex < 3;
                    const isRightEdge = weekIndex > totalWeeks - 4;
                    const isTopEdge = dayIdx < 2;
                    const isBottomEdge = dayIdx > 4;

                    return (
                      <div
                        key={dateStr}
                        className={cn(
                          "w-3 h-3 rounded-[3px] transition-all hover:scale-150 hover:z-10 cursor-pointer relative group",
                          isCurrentYear ? getColor(count) : 'opacity-0 pointer-events-none'
                        )}
                      >
                        <div className={cn(
                          "absolute px-3 py-2 bg-gray-800/95 backdrop-blur-md text-white text-[10px] border border-white/10 rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-all duration-200",
                          isLeftEdge ? "left-full ml-2" : isRightEdge ? "right-full mr-2" : "left-1/2 -translate-x-1/2",
                          (isTopEdge && !isLeftEdge && !isRightEdge) ? "top-full mt-2" :
                            (isBottomEdge && !isLeftEdge && !isRightEdge) ? "bottom-full mb-2" :
                              (isLeftEdge || isRightEdge) ? "top-1/2 -translate-y-1/2" : "bottom-full mb-2"
                        )}>
                          <span className="font-bold">{date.toLocaleDateString()}</span>: {count.toLocaleString()} steps
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-end gap-2 text-[10px] text-gray-500 mr-8">
        <span>Less</span>
        <div className="w-[11px] h-[11px] rounded-[2px] bg-white/5" />
        <div className="w-[11px] h-[11px] rounded-[2px] bg-blue-900/40" />
        <div className="w-[11px] h-[11px] rounded-[2px] bg-blue-700/60" />
        <div className="w-[11px] h-[11px] rounded-[2px] bg-blue-500/80" />
        <div className="w-[11px] h-[11px] rounded-[2px] bg-blue-400" />
        <span>More</span>
      </div>
    </div>
  );
};

const StressHeatmap = ({ data, year }: { data: { date: string, value: number }[], year: string }) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const dataMap = new Map(data.map(d => [d.date, d.value]));

  const currentYear = year === 'All Time' ? new Date().getFullYear() : parseInt(year);
  const startDate = new Date(currentYear, 0, 1);
  const endDate = year === 'All Time' || currentYear === new Date().getFullYear() ? new Date() : new Date(currentYear, 11, 31);

  const allDates: Date[] = [];
  let curr = new Date(startDate);
  curr.setDate(curr.getDate() - curr.getDay());

  while (curr <= endDate || allDates.length % 7 !== 0) {
    allDates.push(new Date(curr));
    curr.setDate(curr.getDate() + 1);
    if (allDates.length > 400) break;
  }

  const getColor = (value: number) => {
    if (value === 0) return 'bg-white/5';
    if (value < 20) return 'bg-orange-200/40';
    if (value < 40) return 'bg-orange-400/60';
    if (value < 60) return 'bg-orange-600/80';
    return 'bg-orange-500';
  };

  return (
    <div className="overflow-x-auto pb-4">
      <div className="min-w-[800px]">
        <div className="flex gap-1 mb-2 ml-8 relative">
          {months.map((month, i) => {
            const firstDateOfMonth = allDates.find(d => d.getMonth() === i && d.getFullYear() === currentYear);
            if (!firstDateOfMonth) return null;
            const weekIndex = Math.floor(allDates.indexOf(firstDateOfMonth) / 7);
            return (
              <div key={month} className="text-[10px] text-gray-500 absolute" style={{ left: `${weekIndex * 18}px` }}>
                {month}
              </div>
            );
          })}
        </div>
        <div className="flex gap-1.5 mt-4">
          <div className="flex flex-col justify-between text-[10px] text-gray-500 pr-3 w-10">
            {days.map((day, i) => i % 2 === 1 ? <span key={day}>{day}</span> : <div key={day} className="h-3" />)}
          </div>
          <div className="flex gap-1.5">
            {Array.from({ length: Math.ceil(allDates.length / 7) }).map((_, weekIndex) => {
              const totalWeeks = Math.ceil(allDates.length / 7);

              return (
                <div key={weekIndex} className="flex flex-col gap-1.5">
                  {allDates.slice(weekIndex * 7, (weekIndex + 1) * 7).map((date, dayIdx) => {
                    const dateStr = date.toISOString().split('T')[0];
                    const val = dataMap.get(dateStr) || 0;
                    const isCurrentYear = date.getFullYear() === currentYear;

                    const isLeftEdge = weekIndex < 3;
                    const isRightEdge = weekIndex > totalWeeks - 4;
                    const isTopEdge = dayIdx < 2;
                    const isBottomEdge = dayIdx > 4;

                    return (
                      <div
                        key={dateStr}
                        className={cn(
                          "w-3 h-3 rounded-[3px] transition-all hover:scale-150 hover:z-10 cursor-pointer relative group",
                          isCurrentYear ? getColor(val) : 'opacity-0 pointer-events-none'
                        )}
                      >
                        <div className={cn(
                          "absolute px-3 py-2 bg-gray-800/95 backdrop-blur-md text-white text-[10px] border border-white/10 rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-all duration-200",
                          isLeftEdge ? "left-full ml-2" : isRightEdge ? "right-full mr-2" : "left-1/2 -translate-x-1/2",
                          (isTopEdge && !isLeftEdge && !isRightEdge) ? "top-full mt-2" :
                            (isBottomEdge && !isLeftEdge && !isRightEdge) ? "bottom-full mb-2" :
                              (isLeftEdge || isRightEdge) ? "top-1/2 -translate-y-1/2" : "bottom-full mb-2"
                        )}>
                          <span className="font-bold">{date.toLocaleDateString()}</span>: Stress {val}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-end gap-2 text-[10px] text-gray-500 mr-8">
        <span>Chill</span>
        <div className="w-[11px] h-[11px] rounded-[2px] bg-white/5" />
        <div className="w-[11px] h-[11px] rounded-[2px] bg-orange-200/40" />
        <div className="w-[11px] h-[11px] rounded-[2px] bg-orange-400/60" />
        <div className="w-[11px] h-[11px] rounded-[2px] bg-orange-600/80" />
        <div className="w-[11px] h-[11px] rounded-[2px] bg-orange-500" />
        <span>Peak</span>
      </div>
    </div>
  );
};

const WorkoutHeatmap = ({ data, year }: { data: { date: string, duration: number, calories: number, distance: number }[], year: string }) => {
  const [metric, setMetric] = useState<'duration' | 'calories' | 'distance'>('duration');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const dataMap = new Map(data.map(d => [d.date, d]));

  const currentYear = year === 'All Time' ? new Date().getFullYear() : parseInt(year);
  const startDate = new Date(currentYear, 0, 1);
  const endDate = year === 'All Time' || currentYear === new Date().getFullYear() ? new Date() : new Date(currentYear, 11, 31);

  const allDates: Date[] = [];
  let curr = new Date(startDate);
  curr.setDate(curr.getDate() - curr.getDay());

  while (curr <= endDate || allDates.length % 7 !== 0) {
    allDates.push(new Date(curr));
    curr.setDate(curr.getDate() + 1);
    if (allDates.length > 400) break;
  }

  const getMetricValue = (d: any) => {
    if (!d) return 0;
    if (metric === 'duration') return d.duration;
    if (metric === 'calories') return d.calories;
    if (metric === 'distance') return d.distance;
    return 0;
  };

  const getColor = (value: number) => {
    if (value === 0) return 'bg-white/5';
    if (metric === 'duration') {
      if (value < 30) return 'bg-emerald-200/40';
      if (value < 60) return 'bg-emerald-400/60';
      if (value < 120) return 'bg-emerald-600/80';
      return 'bg-emerald-500';
    }
    if (metric === 'calories') {
      if (value < 200) return 'bg-orange-200/40';
      if (value < 500) return 'bg-orange-400/60';
      if (value < 1000) return 'bg-orange-600/80';
      return 'bg-orange-500';
    }
    if (metric === 'distance') {
      if (value < 2) return 'bg-blue-200/40';
      if (value < 5) return 'bg-blue-400/60';
      if (value < 10) return 'bg-blue-600/80';
      return 'bg-blue-500';
    }
    return 'bg-white/5';
  };

  const getLabel = () => {
    if (metric === 'duration') return 'Intensity (min)';
    if (metric === 'calories') return 'Burn (kcal)';
    if (metric === 'distance') return 'Range (km)';
    return '';
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {(['duration', 'calories', 'distance'] as const).map(m => (
          <button
            key={m}
            onClick={() => setMetric(m)}
            className={cn(
              "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
              metric === m ? "bg-[#bef264] text-black" : "bg-white/5 text-gray-400 hover:bg-white/10"
            )}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="min-w-[800px]">
          <div className="flex gap-1 mb-2 ml-8 relative">
            {months.map((month, i) => {
              const firstDateOfMonth = allDates.find(d => d.getMonth() === i && d.getFullYear() === currentYear);
              if (!firstDateOfMonth) return null;
              const weekIndex = Math.floor(allDates.indexOf(firstDateOfMonth) / 7);
              return (
                <div key={month} className="text-[10px] text-gray-500 absolute" style={{ left: `${weekIndex * 18}px` }}>
                  {month}
                </div>
              );
            })}
          </div>
          <div className="flex gap-1.5 mt-4">
            <div className="flex flex-col justify-between text-[10px] text-gray-500 pr-3 w-10">
              {days.map((day, i) => i % 2 === 1 ? <span key={day}>{day}</span> : <div key={day} className="h-3" />)}
            </div>
            <div className="flex gap-1.5">
              {Array.from({ length: Math.ceil(allDates.length / 7) }).map((_, weekIndex) => {
                const totalWeeks = Math.ceil(allDates.length / 7);

                return (
                  <div key={weekIndex} className="flex flex-col gap-1.5">
                    {allDates.slice(weekIndex * 7, (weekIndex + 1) * 7).map((date, dayIdx) => {
                      const dateStr = date.toISOString().split('T')[0];
                      const dataObj = dataMap.get(dateStr);
                      const val = getMetricValue(dataObj);
                      const isCurrentYear = date.getFullYear() === currentYear;

                      const isLeftEdge = weekIndex < 3;
                      const isRightEdge = weekIndex > totalWeeks - 4;
                      const isTopEdge = dayIdx < 2;
                      const isBottomEdge = dayIdx > 4;

                      return (
                        <div
                          key={dateStr}
                          className={cn(
                            "w-3 h-3 rounded-[3px] transition-all hover:scale-150 hover:z-10 cursor-pointer relative group",
                            isCurrentYear ? getColor(val) : 'opacity-0 pointer-events-none'
                          )}
                        >
                          <div className={cn(
                            "absolute px-3 py-2 bg-gray-800/95 backdrop-blur-md text-white text-[10px] border border-white/10 rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-all duration-200 flex flex-col gap-0.5",
                            isLeftEdge ? "left-full ml-2" : isRightEdge ? "right-full mr-2" : "left-1/2 -translate-x-1/2",
                            (isTopEdge && !isLeftEdge && !isRightEdge) ? "top-full mt-2" :
                              (isBottomEdge && !isLeftEdge && !isRightEdge) ? "bottom-full mb-2" :
                                (isLeftEdge || isRightEdge) ? "top-1/2 -translate-y-1/2" : "bottom-full mb-2"
                          )}>
                            <div className="font-black border-b border-white/10 pb-1 mb-1">{date.toLocaleDateString()}</div>
                            {dataObj ? (
                              <>
                                <div>Duration: {Math.round(dataObj.duration)}m</div>
                                <div>Calories: {Math.round(dataObj.calories)} kcal</div>
                                <div>Distance: {dataObj.distance.toFixed(2)} km</div>
                              </>
                            ) : <div>No workouts</div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-end gap-2 text-[10px] text-gray-500 mr-8">
          <span>{getLabel()}</span>
          <div className="w-[11px] h-[11px] rounded-[2px] bg-white/5" />
          <div className={cn("w-[11px] h-[11px] rounded-[2px]", metric === 'duration' ? 'bg-emerald-200/40' : metric === 'calories' ? 'bg-orange-200/40' : 'bg-blue-200/40')} />
          <div className={cn("w-[11px] h-[11px] rounded-[2px]", metric === 'duration' ? 'bg-emerald-400/60' : metric === 'calories' ? 'bg-orange-400/60' : 'bg-blue-400/60')} />
          <div className={cn("w-[11px] h-[11px] rounded-[2px]", metric === 'duration' ? 'bg-emerald-600/80' : metric === 'calories' ? 'bg-orange-600/80' : 'bg-blue-600/80')} />
          <div className={cn("w-[11px] h-[11px] rounded-[2px]", metric === 'duration' ? 'bg-emerald-500' : metric === 'calories' ? 'bg-orange-500' : 'bg-blue-500')} />
          <span>High</span>
        </div>
      </div>
    </div>
  );
};

export default App;

