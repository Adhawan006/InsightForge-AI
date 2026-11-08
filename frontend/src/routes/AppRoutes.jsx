import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import ProtectedRoute from './ProtectedRoute';

import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Datasets from '../pages/Datasets';
import DatasetUpload from '../pages/DatasetUpload';
import Intelligence from '../pages/Intelligence';
import SqlGenerator from '../pages/SqlGenerator';
import Charts from '../pages/Charts';
import AnalysisHistory from '../pages/AnalysisHistory';
import Profile from '../pages/Profile';
import Settings from '../pages/Settings';
import NotFound from '../pages/NotFound';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Enterprise Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/datasets" element={<Datasets />} />
          <Route path="/upload" element={<DatasetUpload />} />
          <Route path="/intelligence" element={<Intelligence />} />
          <Route path="/ai-analysis" element={<Intelligence />} />
          <Route path="/sql-generator" element={<SqlGenerator />} />
          <Route path="/charts" element={<Charts />} />
          <Route path="/analytics" element={<Charts />} />
          <Route path="/history" element={<AnalysisHistory />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      {/* Fallback Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
