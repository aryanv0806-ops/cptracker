import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import PlatformDetails from './pages/PlatformDetails';

function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen bg-skeuo-bg flex flex-col items-center justify-center gap-4">
        <img src="https://media1.tenor.com/m/dIPinX-49CsAAAAC/anime-vtuber.gif" alt="Loading..." className="w-20 h-20 rounded-2xl skeuo-raised" />
        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 font-mono tracking-widest uppercase">Initializing CP Tracker...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen bg-skeuo-bg flex flex-col items-center justify-center gap-4">
        <img src="https://media1.tenor.com/m/dIPinX-49CsAAAAC/anime-vtuber.gif" alt="Loading..." className="w-20 h-20 rounded-2xl skeuo-raised" />
        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 font-mono tracking-widest uppercase">Initializing CP Tracker...</p>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <PublicRoute>
            <Landing />
          </PublicRoute>
        } 
      />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/platform/:platformId" 
        element={
          <ProtectedRoute>
            <PlatformDetails />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
