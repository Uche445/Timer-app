import React, { useState, useEffect } from 'react';
import { X, Play, Pause, Square, Minimize2, Maximize2 } from 'lucide-react'; // Added Maximize2 for clarity
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { api } from '../App';

const FocusMode = ({ timer, onExit }) => {
  const [currentTimer, setCurrentTimer] = useState(timer);
  // Initial state for fullscreen. Typically, when entering focus mode, it starts maximized.
  // The `isFullscreen` state in this component controls the *padding* of the container,
  // not the actual browser fullscreen API, which would require a different approach (e.g., document.documentElement.requestFullscreen()).
  // For the purpose of UI responsiveness, we can toggle padding.
  const [isCompactMode, setIsCompactMode] = useState(false); // Renamed for clarity: controls padding/compactness

  useEffect(() => {
    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Update timer every second if running
    const interval = setInterval(() => {
      setCurrentTimer(prev => {
        if (!prev || prev.status !== 'running') {
          return prev; // Stop updating if timer is null or not running
        }
        const newRemaining = Math.max(0, prev.remaining_seconds - 1);
        if (newRemaining === 0) {
          completeTimer();
          return { ...prev, remaining_seconds: 0, status: 'completed' };
        }
        return { ...prev, remaining_seconds: newRemaining };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentTimer?.status]); // Depend on currentTimer.status to re-run effect when it changes

  const completeTimer = async () => {
    try {
      if (currentTimer) { // Ensure currentTimer exists before API call
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
      }
    } catch (error) {
      console.error('Error completing timer:', error);
    }
  };

  const toggleTimer = async () => {
    try {
      if (currentTimer) {
        const newStatus = currentTimer.status === 'running' ? 'paused' : 'running';
        const response = await api.updateTimer(currentTimer.id, { status: newStatus });
        setCurrentTimer(response.data);
      }
    } catch (error) {
      console.error('Error toggling timer:', error);
    }
  };

  const stopTimer = async () => {
    try {
      if (currentTimer) {
        const response = await api.updateTimer(currentTimer.id, {
          status: 'stopped',
          remaining_seconds: currentTimer.duration_seconds
        });
        setCurrentTimer(response.data);
      }
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
    if (!currentTimer || currentTimer.duration_seconds === 0) return 0;
    return ((currentTimer.duration_seconds - currentTimer.remaining_seconds) / currentTimer.duration_seconds) * 100;
  };

  const getStatusColor = () => {
    switch (currentTimer?.status) { // Use optional chaining
      case 'running': return '#10b981'; // green
      case 'paused': return '#f59e0b'; // yellow
      case 'completed': return '#8b5cf6'; // purple
      default: return '#6b7280'; // gray
    }
  };

  const getStatusMessage = () => {
    switch (currentTimer?.status) { // Use optional chaining
      case 'running': return 'Stay focused! You\'re doing great.';
      case 'paused': return 'Take a breath. Resume when ready.';
      case 'completed': return '🎉 Congratulations! Timer completed!';
      default: return 'Ready to start your focused session?';
    }
  };

  if (!currentTimer) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 sm:p-8"> {/* Added responsive padding */}
        <div className="text-center">
          <p className="text-white text-xl sm:text-2xl mb-4">No timer selected for focus mode</p> {/* Responsive font size */}
          {/* Responsive font size */}
          <button
            onClick={onExit}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 text-base sm:text-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col transition-all duration-300 ${isCompactMode ? 'p-4 sm:p-8' : 'p-0'}`}> {/* Responsive padding based on compact mode */}
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-6 w-full"> {/* Stack on mobile, row on sm+ */}
        <div className="order-last sm:order-first mt-4 sm:mt-0"> {/* Reorder on mobile */}
          <button
            onClick={() => setIsCompactMode(!isCompactMode)}
            className="p-2 sm:p-3 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
            title={isCompactMode ? "Enter Fullscreen (padded)" : "Exit Fullscreen (minimal padding)"}
          >
            {isCompactMode ? <Maximize2 className="h-5 w-5 sm:h-6 sm:w-6" /> : <Minimize2 className="h-5 w-5 sm:h-6 sm:w-6" />} {/* Responsive icon size */}
          </button>
        </div>

        <div className="text-center flex-grow"> {/* Allows title to take available space */}
          <h1 className="text-2xl sm:text-4xl font-bold text-white truncate px-4">
            {currentTimer.name}
          </h1> {/* Responsive font size, truncate long names */}
          <p className="text-gray-400 capitalize text-sm sm:text-base">
            {currentTimer.category} Session
          </p> {/* Responsive font size */}
        </div>

        <div className="order-first sm:order-last mb-4 sm:mb-0"> {/* Reorder on mobile */}
          <button
            onClick={onExit}
            className="p-2 sm:p-3 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
            title="Exit Focus Mode"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" /> {/* Responsive icon size */}
          </button>
        </div>
      </div>

      {/* Main Timer Display */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6"> {/* Added padding for overall content */}
        <div className="text-center max-w-lg w-full"> {/* Ensure it takes full width for centering */}
          {/* Progress Circle */}
          <div className="w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 mb-8 mx-auto"> {/* Responsive size for circular progress bar */}
            <CircularProgressbar
              value={getProgressPercentage()}
              text={formatTime(currentTimer.remaining_seconds)}
              styles={buildStyles({
                textSize: '16px', // This is relative to the circle size, fixed is fine.
                pathColor: getStatusColor(),
                textColor: '#ffffff',
                trailColor: '#374151',
                strokeLinecap: 'round',
                textWeight: 'bold',
              })}
            />
          </div>

          {/* Status Message */}
          <div className="mb-8 px-4"> {/* Added horizontal padding */}
            <p className="text-xl sm:text-2xl text-gray-300 mb-2">{getStatusMessage()}</p> {/* Responsive font size */}
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
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 px-4"> {/* Stack on mobile, row on sm+, added padding */}
            <button
              onClick={toggleTimer}
              disabled={currentTimer.status === 'completed'}
              className={`flex items-center justify-center space-x-2 px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-medium text-lg transition-all duration-200 shadow-lg w-full sm:w-auto ${ /* Responsive padding, full width on mobile */
                currentTimer.status === 'running'
                  ? 'bg-yellow-600 hover:bg-yellow-700 text-white shadow-yellow-600/25'
                  : 'bg-green-600 hover:bg-green-700 text-white shadow-green-600/25'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {currentTimer.status === 'running' ? (
                <>
                  <Pause className="h-5 w-5 sm:h-6 sm:w-6" /> {/* Responsive icon size */}
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 sm:h-6 sm:w-6" /> {/* Responsive icon size */}
                  <span>Start</span>
                </>
              )}
            </button>

            <button
              onClick={stopTimer}
              disabled={currentTimer.status === 'completed'}
              className="flex items-center justify-center space-x-2 px-6 py-3 sm:px-8 sm:py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium text-lg transition-all duration-200 shadow-lg shadow-red-600/25 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {/* Responsive padding, full width on mobile */}
              <Square className="h-5 w-5 sm:h-6 sm:w-6" /> {/* Responsive icon size */}
              <span>Stop</span>
            </button>
          </div>

          {/* Progress Info */}
          <div className="mt-8 text-gray-400 text-sm sm:text-base px-4"> {/* Responsive font size, added padding */}
            <p>
              Progress: {Math.round(getProgressPercentage())}% •
              Remaining: {formatTime(currentTimer.remaining_seconds)} •
              Total: {formatTime(currentTimer.duration_seconds)}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center p-4 sm:p-6"> {/* Responsive padding */}
        <p className="text-gray-500 text-xs sm:text-sm">Focus mode • Minimize distractions and stay productive</p> {/* Responsive font size */}
      </div>
    </div>
  );
};

export default FocusMode;