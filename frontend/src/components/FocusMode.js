import React, { useState, useEffect } from 'react';
import { X, Play, Pause, Square, Minimize2 } from 'lucide-react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { api } from '../App';

const FocusMode = ({ timer, onExit }) => {
  const [currentTimer, setCurrentTimer] = useState(timer);
  const [isFullscreen, setIsFullscreen] = useState(true);

  useEffect(() => {
    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Update timer every second if running
    const interval = setInterval(() => {
      if (currentTimer?.status === 'running') {
        setCurrentTimer(prev => {
          const newRemaining = Math.max(0, prev.remaining_seconds - 1);
          if (newRemaining === 0) {
            completeTimer();
            return { ...prev, remaining_seconds: 0, status: 'completed' };
          }
          return { ...prev, remaining_seconds: newRemaining };
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentTimer?.status]);

  const completeTimer = async () => {
    try {
      await api.updateTimer(currentTimer.id, { status: 'completed' });
      
      // Show notification
      if (Notification.permission === 'granted') {
        new Notification('🎉 Timer Completed!', {
          body: `${currentTimer.name} has finished. Great work!`,
          icon: '/favicon.ico'
        });
      }
      
      // Play completion sound (you can add actual audio here)
      console.log('Timer completed in focus mode!');
    } catch (error) {
      console.error('Error completing timer:', error);
    }
  };

  const toggleTimer = async () => {
    try {
      const newStatus = currentTimer.status === 'running' ? 'paused' : 'running';
      const response = await api.updateTimer(currentTimer.id, { status: newStatus });
      setCurrentTimer(response.data);
    } catch (error) {
      console.error('Error toggling timer:', error);
    }
  };

  const stopTimer = async () => {
    try {
      const response = await api.updateTimer(currentTimer.id, { 
        status: 'stopped',
        remaining_seconds: currentTimer.duration_seconds
      });
      setCurrentTimer(response.data);
    } catch (error) {
      console.error('Error stopping timer:', error);
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

  const getProgressPercentage = () => {
    return ((currentTimer.duration_seconds - currentTimer.remaining_seconds) / currentTimer.duration_seconds) * 100;
  };

  const getStatusColor = () => {
    switch (currentTimer.status) {
      case 'running': return '#10b981'; // green
      case 'paused': return '#f59e0b'; // yellow
      case 'completed': return '#8b5cf6'; // purple
      default: return '#6b7280'; // gray
    }
  };

  const getStatusMessage = () => {
    switch (currentTimer.status) {
      case 'running': return 'Stay focused! You\'re doing great.';
      case 'paused': return 'Take a breath. Resume when ready.';
      case 'completed': return '🎉 Congratulations! Timer completed!';
      default: return 'Ready to start your focused session?';
    }
  };

  if (!currentTimer) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <p className="text-white text-xl mb-4">No timer selected for focus mode</p>
          <button
            onClick={onExit}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col ${isFullscreen ? 'p-0' : 'p-8'}`}>
      {/* Header Controls */}
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-3 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            <Minimize2 className="h-5 w-5" />
          </button>
        </div>
        
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">{currentTimer.name}</h1>
          <p className="text-gray-400 capitalize">{currentTimer.category} Session</p>
        </div>
        
        <button
          onClick={onExit}
          className="p-3 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
          title="Exit Focus Mode"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Main Timer Display */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-lg">
          {/* Progress Circle */}
          <div className="w-80 h-80 mb-8 mx-auto">
            <CircularProgressbar
              value={getProgressPercentage()}
              text={formatTime(currentTimer.remaining_seconds)}
              styles={buildStyles({
                textSize: '16px',
                pathColor: getStatusColor(),
                textColor: '#ffffff',
                trailColor: '#374151',
                strokeLinecap: 'round',
                textWeight: 'bold',
              })}
            />
          </div>

          {/* Status Message */}
          <div className="mb-8">
            <p className="text-xl text-gray-300 mb-2">{getStatusMessage()}</p>
            <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
              currentTimer.status === 'running' ? 'bg-green-600/20 text-green-400' :
              currentTimer.status === 'paused' ? 'bg-yellow-600/20 text-yellow-400' :
              currentTimer.status === 'completed' ? 'bg-purple-600/20 text-purple-400' :
              'bg-gray-600/20 text-gray-400'
            }`}>
              {currentTimer.status.charAt(0).toUpperCase() + currentTimer.status.slice(1)}
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={toggleTimer}
              disabled={currentTimer.status === 'completed'}
              className={`flex items-center space-x-2 px-8 py-4 rounded-xl font-medium text-lg transition-all duration-200 shadow-lg ${
                currentTimer.status === 'running'
                  ? 'bg-yellow-600 hover:bg-yellow-700 text-white shadow-yellow-600/25'
                  : 'bg-green-600 hover:bg-green-700 text-white shadow-green-600/25'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {currentTimer.status === 'running' ? (
                <>
                  <Pause className="h-5 w-5" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" />
                  <span>Start</span>
                </>
              )}
            </button>
            
            <button
              onClick={stopTimer}
              disabled={currentTimer.status === 'completed'}
              className="flex items-center space-x-2 px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium text-lg transition-all duration-200 shadow-lg shadow-red-600/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Square className="h-5 w-5" />
              <span>Stop</span>
            </button>
          </div>

          {/* Progress Info */}
          <div className="mt-8 text-gray-400">
            <p className="text-sm">
              Progress: {Math.round(getProgressPercentage())}% • 
              Remaining: {formatTime(currentTimer.remaining_seconds)} • 
              Total: {formatTime(currentTimer.duration_seconds)}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center p-6">
        <p className="text-gray-500 text-sm">Focus mode • Minimize distractions and stay productive</p>
      </div>
    </div>
  );
};

export default FocusMode;