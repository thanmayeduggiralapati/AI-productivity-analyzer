// src/App.js
// Main app router — defines all pages and routes

import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import JournalPage from './pages/JournalPage';
import TasksPage from './pages/TasksPage';
import GoalsPage from './pages/GoalsPage';
import FocusPage from './pages/FocusPage';
import AssistantPage from './pages/AssistantPage';
import MockTestPage from './pages/MockTestPage';
import NotesPage from './pages/NotesPage';
import InsightsPage from './pages/InsightsPage';
import TravelPage from './pages/TravelPage';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream dark:bg-dark-bg">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-lavender-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lavender-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) return <Navigate to="/" replace />;
  return children;
};

const App = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Routes */}
      <Route path="/onboarding" element={
        <ProtectedRoute><OnboardingPage /></ProtectedRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute><DashboardPage /></ProtectedRoute>
      } />
      <Route path="/journal" element={
        <ProtectedRoute><JournalPage /></ProtectedRoute>
      } />
      <Route path="/tasks" element={
        <ProtectedRoute><TasksPage /></ProtectedRoute>
      } />
      <Route path="/goals" element={
        <ProtectedRoute><GoalsPage /></ProtectedRoute>
      } />
      <Route path="/focus" element={
        <ProtectedRoute><FocusPage /></ProtectedRoute>
      } />
      <Route path="/assistant" element={
        <ProtectedRoute><AssistantPage /></ProtectedRoute>
      } />
      <Route path="/mocktest" element={
        <ProtectedRoute><MockTestPage /></ProtectedRoute>
      } />
      <Route path="/notes" element={
        <ProtectedRoute><NotesPage /></ProtectedRoute>
      } />
      <Route path="/insights" element={
        <ProtectedRoute><InsightsPage /></ProtectedRoute>
      } />
      <Route path="/travel" element={
        <ProtectedRoute><TravelPage /></ProtectedRoute>
      } />

      {/* 404 */}
      <Route path="*" element={
        <div className="min-h-screen flex items-center justify-center bg-cream dark:bg-dark-bg">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-lavender-400 mb-4">404</h1>
            <p className="text-gray-500 dark:text-dark-muted">Page not found</p>
          </div>
        </div>
      } />
    </Routes>
  );
};

export default App;