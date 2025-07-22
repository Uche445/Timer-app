import React, { useState } from 'react';
import { X, Clock, Tag, Type } from 'lucide-react';
import { api } from '../App';

const CreateTimerModal = ({ onClose, onTimerCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    hours: 0,
    minutes: 25,
    seconds: 0,
    category: 'productivity'
  });
  const [loading, setLoading] = useState(false);

  const categories = [
    { value: 'productivity', label: 'Productivity', color: 'from-blue-500 to-purple-600' },
    { value: 'break', label: 'Break', color: 'from-green-500 to-emerald-600' },
    { value: 'tasks', label: 'Tasks', color: 'from-yellow-500 to-orange-600' },
    { value: 'general', label: 'General', color: 'from-gray-500 to-slate-600' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const totalSeconds = (formData.hours * 3600) + (formData.minutes * 60) + formData.seconds;
      
      if (totalSeconds === 0) {
        alert('Please set a valid duration');
        return;
      }

      const timerData = {
        name: formData.name || 'Untitled Timer',
        duration_seconds: totalSeconds,
        category: formData.category
      };

      const response = await api.createTimer(timerData);
      onTimerCreated(response.data);
    } catch (error) {
      console.error('Error creating timer:', error);
      alert('Error creating timer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/20 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Clock className="h-5 w-5 text-purple-400" />
            <span>Create New Timer</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center space-x-2">
              <Type className="h-4 w-4" />
              <span>Timer Name</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter timer name..."
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Duration
            </label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Hours</label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={formData.hours}
                  onChange={(e) => handleInputChange('hours', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-center focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Minutes</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={formData.minutes}
                  onChange={(e) => handleInputChange('minutes', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-center focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Seconds</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={formData.seconds}
                  onChange={(e) => handleInputChange('seconds', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-center focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center space-x-2">
              <Tag className="h-4 w-4" />
              <span>Category</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((category) => (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => handleInputChange('category', category.value)}
                  className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                    formData.category === category.value
                      ? `bg-gradient-to-r ${category.color} border-white/30 text-white`
                      : 'bg-white/5 border-white/20 text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className="font-medium">{category.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-medium transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Timer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTimerModal;