import React, { useState } from 'react';
import { X, Clock, Brain, Coffee, Zap, Play } from 'lucide-react';
import { api } from '../App';

const TemplateSelector = ({ templates, onClose, onTimerCreated }) => {
  const [loading, setLoading] = useState(null);

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'productivity': return <Brain className="h-5 w-5" />;
      case 'break': return <Coffee className="h-5 w-5" />;
      case 'tasks': return <Zap className="h-5 w-5" />;
      default: return <Clock className="h-5 w-5" />;
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

  const createTimerFromTemplate = async (template) => {
    setLoading(template.id);
    try {
      const response = await api.createTimerFromTemplate(template.id);
      onTimerCreated(response.data);
    } catch (error) {
      console.error('Error creating timer from template:', error);
      alert('Error creating timer. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/20 rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Clock className="h-5 w-5 text-purple-400" />
            <span>Quick Start Templates</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${getCategoryColor(template.category)}`}>
                    {getCategoryIcon(template.category)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{template.name}</h3>
                    <p className="text-sm text-gray-400 capitalize">{template.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{template.duration_minutes}m</p>
                </div>
              </div>

              <p className="text-sm text-gray-300 mb-4">{template.description}</p>

              <button
                onClick={() => createTimerFromTemplate(template)}
                disabled={loading === template.id}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading === template.id ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    <span>Start Timer</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        {templates.length === 0 && (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No templates available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateSelector;