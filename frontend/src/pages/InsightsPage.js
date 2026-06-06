// pages/InsightsPage.js
import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import Layout from '../components/common/Layout';
import { motion } from 'framer-motion';
import {
  BarChart3, TrendingUp, Clock, CheckSquare,
  Target, AlertTriangle, Calendar
} from 'lucide-react';
import insightService from '../services/insightService';

const InsightsPage = () => {
  const { isDark } = useTheme();

  const [dashboard, setDashboard] = useState(null);
  const [weekly, setWeekly] = useState(null);
  const [trends, setTrends] = useState(null);
  const [habitDrift, setHabitDrift] = useState(null);
  const [loading, setLoading] = useState(true);

  // eslint-disable-next-line
  useEffect(() => { loadInsights(); }, []);

  const loadInsights = async () => {
    try {
      const [dashRes, weekRes, trendRes, driftRes] = await Promise.all([
        insightService.getDashboard(),
        insightService.getWeekly(),
        insightService.getTrends(),
        insightService.getHabitDrift()
      ]);
      setDashboard(dashRes.data.today);
      setWeekly(weekRes.data.dailyStats);
      setTrends(trendRes.data.trends);
      setHabitDrift(driftRes.data.habitDrift);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getDriftColor = (level) => {
    if (level === 'high') return 'text-danger-400 bg-danger-50';
    if (level === 'medium') return 'text-warn-400 bg-warn-50';
    return 'text-success-400 bg-success-50';
  };

  const maxFocusMinutes = weekly
    ? Math.max(...weekly.map(d => d.focusMinutes), 1)
    : 1;

  const maxTasks = weekly
    ? Math.max(...weekly.map(d => d.total), 1)
    : 1;

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">

        {/* Header */}
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
            Insights
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
            Your productivity analytics and trends
          </p>
        </div>

        {/* Today Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            {
              label: 'Completion Rate',
              value: `${dashboard?.completionRate || 0}%`,
              icon: CheckSquare,
              color: 'bg-primary-400',
              textColor: 'text-primary-400',
              bg: 'bg-primary-50'
            },
            {
              label: 'Focus Time',
              value: `${dashboard?.totalFocusMinutes || 0}m`,
              icon: Clock,
              color: 'bg-info-400',
              textColor: 'text-info-400',
              bg: 'bg-info-50'
            },
            {
              label: 'Tasks Done',
              value: dashboard?.completedTasks || 0,
              icon: Target,
              color: 'bg-success-400',
              textColor: 'text-success-400',
              bg: 'bg-success-50'
            },
            {
              label: 'Productivity',
              value: `${dashboard?.productivityScore || 0}`,
              icon: TrendingUp,
              color: 'bg-warn-400',
              textColor: 'text-warn-400',
              bg: 'bg-warn-50'
            }
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-xl p-4 border ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-light-border'}`}
            >
              <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
                <stat.icon size={18} className={stat.textColor} />
              </div>
              <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
              <p className={`text-xs mt-1 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Weekly Chart */}
        <div className={`rounded-xl p-5 border ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-light-border'}`}>
          <h2 className={`text-sm font-500 mb-5 flex items-center gap-2 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
            <BarChart3 size={16} className="text-primary-400" /> Weekly Task Completion
          </h2>
          {weekly && (
            <div className="flex items-end justify-between gap-2 h-32">
              {weekly.map((day, i) => (
                <div key={i} className="flex flex-col items-center gap-1 flex-1">
                  <div className="w-full flex flex-col items-center justify-end h-24 gap-0.5">
                    {/* Completed bar */}
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${day.total > 0 ? (day.completed / maxTasks) * 80 : 0}px` }}
                      transition={{ delay: i * 0.1, duration: 0.4 }}
                      className="w-6 rounded-t-lg bg-primary-400"
                      style={{ minHeight: day.completed > 0 ? '4px' : '0' }}
                    />
                    {/* Total bar background */}
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${day.total > 0 ? (day.total / maxTasks) * 80 : 4}px` }}
                      transition={{ delay: i * 0.1, duration: 0.4 }}
                      className={`w-6 rounded-b-lg ${isDark ? 'bg-dark-border' : 'bg-light-border'}`}
                      style={{ minHeight: '4px' }}
                    />
                  </div>
                  <span className={`text-xs ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2)}
                  </span>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-primary-400" />
              <span className={`text-xs ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>Completed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-full ${isDark ? 'bg-dark-border' : 'bg-light-border'}`} />
              <span className={`text-xs ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>Total</span>
            </div>
          </div>
        </div>

        {/* Weekly Focus Chart */}
        <div className={`rounded-xl p-5 border ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-light-border'}`}>
          <h2 className={`text-sm font-500 mb-5 flex items-center gap-2 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
            <Clock size={16} className="text-info-400" /> Weekly Focus Time (minutes)
          </h2>
          {weekly && (
            <div className="flex items-end justify-between gap-2 h-32">
              {weekly.map((day, i) => (
                <div key={i} className="flex flex-col items-center gap-1 flex-1">
                  <div className="w-full flex flex-col items-center justify-end h-24">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(day.focusMinutes / maxFocusMinutes) * 80}px` }}
                      transition={{ delay: i * 0.1, duration: 0.4 }}
                      className="w-6 rounded-lg bg-info-400"
                      style={{ minHeight: day.focusMinutes > 0 ? '4px' : '0' }}
                    />
                  </div>
                  <span className={`text-xs ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2)}
                  </span>
                  <span className={`text-xs ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                    {day.focusMinutes}m
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-2 gap-6">

          {/* Trends */}
          {trends && (
            <div className={`rounded-xl p-5 border ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-light-border'}`}>
              <h2 className={`text-sm font-500 mb-4 flex items-center gap-2 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                <TrendingUp size={16} className="text-success-400" /> All Time Stats
              </h2>
              <div className="space-y-3">
                {[
                  { label: 'Total Tasks Completed', value: trends.totalCompleted },
                  { label: 'Total Focus Hours', value: `${trends.totalFocusHours}h` },
                  { label: 'Top Category', value: trends.topCategory },
                  { label: 'Mock Tests Taken', value: trends.totalMockTests },
                  { label: 'Avg Mock Score', value: `${trends.avgMockScore}%` },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className={`text-sm ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                      {stat.label}
                    </span>
                    <span className={`text-sm font-500 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Habit Drift */}
          {habitDrift && (
            <div className={`rounded-xl p-5 border ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-light-border'}`}>
              <h2 className={`text-sm font-500 mb-4 flex items-center gap-2 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                <AlertTriangle size={16} className="text-warn-400" /> Habit Drift
              </h2>
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-500 mb-4 ${getDriftColor(habitDrift.driftLevel)}`}>
                {habitDrift.driftLevel === 'high' ? '⚠️' : habitDrift.driftLevel === 'medium' ? '⚡' : '✅'}
                {habitDrift.driftLevel.charAt(0).toUpperCase() + habitDrift.driftLevel.slice(1)} drift
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                    Missed journal days
                  </span>
                  <span className={`text-sm font-500 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                    {habitDrift.missedJournalDays} / 7
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                    Task skip rate
                  </span>
                  <span className={`text-sm font-500 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                    {habitDrift.skipRate}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                    Tasks skipped
                  </span>
                  <span className={`text-sm font-500 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                    {habitDrift.skippedTasks} / {habitDrift.totalTasks}
                  </span>
                </div>
                {habitDrift.missedDays && habitDrift.missedDays.length > 0 && (
                  <div>
                    <p className={`text-xs mb-1 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                      Missed journal on:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {habitDrift.missedDays.map((date, i) => (
                        <span key={i} className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${isDark ? 'bg-dark-border text-dark-muted' : 'bg-light-border text-light-muted'}`}>
                          <Calendar size={10} />
                          {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default InsightsPage;