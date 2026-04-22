import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, HardHat, ChevronRight, Activity } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black p-6">
      
      {/* Branding */}
      <div className="mb-16 text-center animate-fade-in-down">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Activity className="w-12 h-12 text-blue-500" />
          <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            Civix-Pulse
          </h1>
        </div>
        <p className="text-slate-400 text-lg max-w-lg mx-auto">
          Autonomous Municipal Triage & Dispatch System. Select your portal to proceed.
        </p>
      </div>

      {/* Portal Selection Cards */}
      <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl">
        
        {/* Admin Card */}
        <button 
          onClick={() => navigate('/admin')}
          className="group flex-1 text-left bg-slate-900/50 backdrop-blur-md border border-slate-800 hover:border-blue-500/50 p-8 rounded-3xl transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_40px_-10px_rgba(59,130,246,0.3)] relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-4 group-hover:translate-x-0">
            <ChevronRight className="w-8 h-8 text-blue-400" />
          </div>
          <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20 group-hover:scale-110 transition-transform duration-300">
            <ShieldAlert className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Government Admin</h2>
          <p className="text-slate-400 leading-relaxed">
            Access the God-View map, monitor live AI triage streams, and oversee city-wide operations.
          </p>
        </button>

        {/* Worker Card */}
        <button 
          onClick={() => navigate('/worker-login')}
          className="group flex-1 text-left bg-slate-900/50 backdrop-blur-md border border-slate-800 hover:border-emerald-500/50 p-8 rounded-3xl transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)] relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-4 group-hover:translate-x-0">
            <ChevronRight className="w-8 h-8 text-emerald-400" />
          </div>
          <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20 group-hover:scale-110 transition-transform duration-300">
            <HardHat className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Field Worker Portal</h2>
          <p className="text-slate-400 leading-relaxed">
            Log in to view your assigned clusters, manage active tasks, and upload resolution proofs.
          </p>
        </button>

      </div>
    </div>
  );
}