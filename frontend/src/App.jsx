import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import AdminDashboard from './components/AdminDashboard';
import WorkerLogin from './components/WorkerLogin';
import WorkerPortal from './components/WorkerPortal';

function App() {
  return (
    <Router>
      <div className="bg-slate-950 min-h-screen text-slate-100 font-sans selection:bg-blue-500/30">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/worker-login" element={<WorkerLogin />} />
          <Route path="/worker-portal/:id" element={<WorkerPortal />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;