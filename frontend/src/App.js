import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";
import TimerDashboard from "./components/TimerDashboard";
import FocusMode from "./components/FocusMode";
import StatsPage from "./components/StatsPage";
import NavigationBar from "./components/NavigationBar";
import "./App.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const API = BACKEND_URL; // Now API is directly "http://localhost:8000/api"
// API functions
export const api = {
  // Timers
  getTimers: () => axios.get(`${API}/timers`),
  createTimer: (data) => axios.post(`${API}/timers`, data),
  updateTimer: (id, data) => axios.patch(`${API}/timers/${id}`, data),
  deleteTimer: (id) => axios.delete(`${API}/timers/${id}`),
  
  // Templates
  getTemplates: () => axios.get(`${API}/templates`),
  createTimerFromTemplate: (templateId, name) => 
    axios.post(`${API}/templates/${templateId}/create-timer`, {}, { params: { name } }),
  initTemplates: () => axios.post(`${API}/init-templates`),
  
  // Stats
  getStats: () => axios.get(`${API}/stats`),
};

function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [focusTimer, setFocusTimer] = useState(null);
  
  // Initialize default templates on first load
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await api.initTemplates();
      } catch (error) {
        console.error("Error initializing templates:", error);
      }
    };
    
    initializeApp();
  }, []);

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <TimerDashboard onFocusMode={setFocusTimer} />;
      case "focus":
        return <FocusMode timer={focusTimer} onExit={() => setCurrentPage("dashboard")} />;
      case "stats":
        return <StatsPage />;
      default:
        return <TimerDashboard onFocusMode={setFocusTimer} />;
    }
  };

  return (
    <div className="App min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Toaster position="top-right" />
      
      {currentPage !== "focus" && (
        <NavigationBar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      )}
      
      <main className="container mx-auto px-4">
        {renderCurrentPage()}
      </main>
    </div>
  );
}

export default App;