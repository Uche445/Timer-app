import React, { useState, useEffect } from 'react';
import { Plus, Play, Pause, Square, Trash2, Maximize2, Clock, Coffee, Brain, Zap } from 'lucide-react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { api } from '../App';
import CreateTimerModal from './CreateTimerModal';
import TemplateSelector from './TemplateSelector';

const TimerDashboard = ({ onFocusMode }) => {
  const [timers, setTimers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    
    // Update timers every second
    const interval = setInterval(updateActiveTimers, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [timersRes, templatesRes] = await Promise.all([
        api.getTimers(),
        api.getTemplates()
      ]);
      setTimers(timersRes.data);
      setTemplates(templatesRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateActiveTimers = () => {
    setTimers(currentTimers => 
      currentTimers.map(timer => {
        if (timer.status === 'running') {
          const newRemaining = Math.max(0, timer.remaining_seconds - 1);
          if (newRemaining === 0) {
            // Timer completed
            completeTimer(timer.id);
            return { ...timer, remaining_seconds: 0, status: 'completed' };
          }
          return { ...timer, remaining_seconds: newRemaining };
        }
        return timer;
      })
    );
  };

  const completeTimer = async (timerId) => {
    try {
      await api.updateTimer(timerId, { status: 'completed' });
      // Play completion sound (you can add actual sound here)
      console.log('Timer completed!');
      // Show notification
      if (Notification.permission === 'granted') {
        new Notification('Timer Completed!', {
          body: 'Your timer has finished.',
          icon: '/favicon.ico'
        });
      }
    } catch (error) {
      console.error('Error completing timer:', error);
    }
  };

  const toggleTimer = async (timer) => {
    try {
      const newStatus = timer.status === 'running' ? 'paused' : 'running';
      const response = await api.updateTimer(timer.id, { status: newStatus });
      setTimers(timers.map(t => t.id === timer.id ? response.data : t));
    } catch (error) {
      console.error('Error toggling timer:', error);
    }
  };

  const stopTimer = async (timer) => {
    try {
      const response = await api.updateTimer(timer.id, { 
        status: 'stopped',
        remaining_seconds: timer.duration_seconds
      });
      setTimers(timers.map(t => t.id === timer.id ? response.data : t));
    } catch (error) {
      console.error('Error stopping timer:', error);
    }
  };

  const deleteTimer = async (timerId) => {
    try {
      await api.deleteTimer(timerId);
      setTimers(timers.filter(t => t.id !== timerId));
    } catch (error) {
      console.error('Error deleting timer:', error);
    }
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = (timer) => {
    return ((timer.duration_seconds - timer.remaining_seconds) / timer.duration_seconds) * 100;
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'productivity': return <Brain className="h-4 w-4" />;
      case 'break': return <Coffee className="h-4 w-4" />;
      case 'tasks': return <Zap className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'productivity': return 'from-blue-500 to-purple-600';
      case 'break': return 'from-green-500 to-emerald-600';
      case 'tasks': return 'from-yellow-500 to-orange-600';
      default: return 'from-gray-500 to-slate-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Timer Dashboard</h1>
          <p className="text-gray-400">Manage your time with precision and style</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowTemplates(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 shadow-lg shadow-purple-600/25"
          >
            <Clock className="h-4 w-4" />
            <span>Quick Start</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 shadow-lg shadow-emerald-600/25"
          >
            <Plus className="h-4 w-4" />
            <span>New Timer</span>
          </button>
        </div>
      </div>

      {timers.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-400 mb-2">No timers yet</h3>
          <p className="text-gray-500 mb-6">Create your first timer to get started</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200"
          >
            Create Timer
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {timers.map((timer) => (
            <div
              key={timer.id}
              className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl hover:shadow-purple-500/10 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${getCategoryColor(timer.category)}`}>
                    {getCategoryIcon(timer.category)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white truncate">{timer.name}</h3>
                    <p className="text-xs text-gray-400 capitalize">{timer.category}</p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => onFocusMode(timer)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                    title="Focus Mode"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteTimer(timer.id)}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-white/10 rounded-lg transition-all duration-200"
                    title="Delete Timer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-center mb-6">
                <div className="w-32 h-32">
                  <CircularProgressbar
                    value={getProgressPercentage(timer)}
                    text={formatTime(timer.remaining_seconds)}
                    styles={buildStyles({
                      textSize: '12px',
                      pathColor: timer.status === 'running' ? '#8b5cf6' : '#6b7280',
                      textColor: '#ffffff',
                      trailColor: '#374151',
                      strokeLinecap: 'round',
                    })}
                  />
                </div>
              </div>

              <div className="flex justify-center space-x-2">
                <button
                  onClick={() => toggleTimer(timer)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    timer.status === 'running'
                      ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {timer.status === 'running' ? (
                    <>
                      <Pause className="h-4 w-4" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      <span>Start</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => stopTimer(timer)}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200"
                >
                  <Square className="h-4 w-4" />
                  <span>Stop</span>
                </button>
              </div>

              <div className={`mt-4 px-3 py-1 rounded-full text-xs font-medium text-center ${
                timer.status === 'running' ? 'bg-green-600/20 text-green-400' :
                timer.status === 'paused' ? 'bg-yellow-600/20 text-yellow-400' :
                timer.status === 'completed' ? 'bg-purple-600/20 text-purple-400' :
                'bg-gray-600/20 text-gray-400'
              }`}>
                {timer.status.charAt(0).toUpperCase() + timer.status.slice(1)}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateTimerModal
          onClose={() => setShowCreateModal(false)}
          onTimerCreated={(newTimer) => {
            setTimers([...timers, newTimer]);
            setShowCreateModal(false);
          }}
        />
      )}

      {showTemplates && (
        <TemplateSelector
          templates={templates}
          onClose={() => setShowTemplates(false)}
          onTimerCreated={(newTimer) => {
            setTimers([...timers, newTimer]);
            setShowTemplates(false);
          }}
        />
      )}
    </div>
  );
};

export default TimerDashboard;