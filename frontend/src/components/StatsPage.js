import React, { useState, useEffect } from 'react';
import { BarChart3, Clock, Calendar, Target, TrendingUp, Award } from 'lucide-react';
import { api } from '../App';

const StatsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await api.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatTimeDetailed = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'productivity': return 'from-blue-500 to-purple-600';
      case 'break': return 'from-green-500 to-emerald-600';
      case 'tasks': return 'from-yellow-500 to-orange-600';
      default: return 'from-gray-500 to-slate-600';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'productivity': return '🧠';
      case 'break': return '☕';
      case 'tasks': return '⚡';
      default: return '⏰';
    }
  };

  if (loading) {
    return (
      <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"> {/* Added responsive padding and max-width */}
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  if (!stats || stats.total_sessions === 0) {
    return (
      <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"> {/* Added responsive padding and max-width */}
        <div className="text-center py-16">
          <BarChart3 className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl sm:text-2xl font-medium text-gray-400 mb-2">No statistics yet</h3> {/* Responsive font size */}
          <p className="text-gray-500 text-base sm:text-lg">Complete some timer sessions to see your productivity stats!</p> {/* Responsive font size */}
        </div>
      </div>
    );
  }

  const sortedCategories = Object.entries(stats.categories).sort(([, a], [, b]) => b - a);
  const totalCategoryTime = Object.values(stats.categories).reduce((sum, time) => sum + time, 0);

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"> {/* Added responsive padding and max-width */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Statistics</h1> {/* Responsive font size */}
        <p className="text-gray-400 text-base sm:text-lg">Track your productivity and time management</p> {/* Responsive font size */}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"> {/* Changed md to sm for smaller screen column break */}
        {/* Each card implicitly responsive due to grid */}
        <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Target className="h-6 w-6 text-white" />
            </div>
            <span className="text-blue-200 text-sm font-medium">Total Sessions</span>
          </div>
          <div className="text-3xl sm:text-4xl font-bold text-white mb-1">{stats.total_sessions}</div> {/* Responsive font size */}
          <p className="text-blue-200 text-sm sm:text-base">Completed timers</p> {/* Responsive font size */}
        </div>

        <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <span className="text-green-200 text-sm font-medium">Total Time</span>
          </div>
          <div className="text-3xl sm:text-4xl font-bold text-white mb-1">{formatTime(stats.total_time_seconds)}</div> {/* Responsive font size */}
          <p className="text-green-200 text-sm sm:text-base">{formatTimeDetailed(stats.total_time_seconds)}</p> {/* Responsive font size */}
        </div>

        <div className="bg-gradient-to-br from-yellow-600 to-orange-700 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <span className="text-yellow-200 text-sm font-medium">Today</span>
          </div>
          <div className="text-3xl sm:text-4xl font-bold text-white mb-1">{stats.today_sessions}</div> {/* Responsive font size */}
          <p className="text-yellow-200 text-sm sm:text-base">{formatTime(stats.today_time_seconds)} today</p> {/* Responsive font size */}
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-pink-700 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <span className="text-purple-200 text-sm font-medium">Average</span>
          </div>
          <div className="text-3xl sm:text-4xl font-bold text-white mb-1">{formatTime(Math.round(stats.average_session_duration))}</div> {/* Responsive font size */}
          <p className="text-purple-200 text-sm sm:text-base">Per session</p> {/* Responsive font size */}
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 sm:p-8 shadow-2xl"> {/* Responsive padding */}
        <div className="flex items-center space-x-2 mb-6">
          <Award className="h-6 w-6 text-purple-400" />
          <h2 className="text-xl sm:text-2xl font-bold text-white">Category Breakdown</h2> {/* Responsive font size */}
        </div>

        <div className="space-y-4">
          {sortedCategories.map(([category, timeSpent]) => {
            const percentage = totalCategoryTime > 0 ? (timeSpent / totalCategoryTime) * 100 : 0;

            return (
              <div key={category} className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4"> {/* Stack on mobile */}
                <div className="flex items-center space-x-3 flex-1 w-full sm:w-auto"> {/* Ensure flex takes full width on small screens */}
                  <div className="text-2xl">{getCategoryIcon(category)}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white font-medium capitalize text-base sm:text-lg">{category}</span> {/* Responsive font size */}
                      <div className="text-right">
                        <span className="text-white font-semibold text-base sm:text-lg">{formatTime(timeSpent)}</span> {/* Responsive font size */}
                        <span className="text-gray-400 text-sm ml-2">({Math.round(percentage)}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full bg-gradient-to-r ${getCategoryColor(category)} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {sortedCategories.length === 0 && (
          <div className="text-center py-8 px-4"> {/* Added horizontal padding */}
            <BarChart3 className="h-12 w-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 text-base sm:text-lg">No category data available</p> {/* Responsive font size */}
          </div>
        )}
      </div>

      {/* Productivity Insights */}
      <div className="mt-8 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 sm:p-8 shadow-2xl"> {/* Responsive padding */}
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 flex items-center space-x-2"> {/* Responsive font size */}
          <TrendingUp className="h-6 w-6 text-purple-400" />
          <span>Productivity Insights</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="text-lg sm:text-xl font-semibold text-white">🎯 Your Progress</h3> {/* Responsive font size */}
            <div className="space-y-2 text-gray-300 text-sm sm:text-base"> {/* Responsive font size */}
              <p>• You've completed <strong className="text-white">{stats.total_sessions}</strong> timer sessions</p>
              <p>• Total focused time: <strong className="text-white">{formatTimeDetailed(stats.total_time_seconds)}</strong></p>
              <p>• Average session: <strong className="text-white">{formatTime(Math.round(stats.average_session_duration))}</strong></p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg sm:text-xl font-semibold text-white">📊 Today's Summary</h3> {/* Responsive font size */}
            <div className="space-y-2 text-gray-300 text-sm sm:text-base"> {/* Responsive font size */}
              <p>• Sessions completed today: <strong className="text-white">{stats.today_sessions}</strong></p>
              <p>• Time focused today: <strong className="text-white">{formatTime(stats.today_time_seconds)}</strong></p>
              {stats.today_sessions > 0 && (
                <p>• Keep up the great work! 🚀</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsPage;