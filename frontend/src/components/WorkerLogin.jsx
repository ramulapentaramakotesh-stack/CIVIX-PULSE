import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { HardHat, Lock, User, ArrowLeft } from 'lucide-react';

// 🛑 INSERT YOUR KEYS HERE
const supabase = createClient("https://smkrassnncrlczpwjisl.supabase.co", "sb_publishable_mSQcylgCCClPkePa0z7fKQ_BBvMsBvs");

export default function WorkerLogin() {
  const [wid, setWid] = useState('');
  const [pass, setPass] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    const { data } = await supabase.from('workers').select('*').eq('worker_login_id', wid).eq('password', pass).single();
    if (data) navigate(`/worker-portal/${data.id}`, { state: { worker: data } });
    else alert("Invalid Credentials. Access Denied.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 to-black p-6">
      
      <button onClick={() => navigate('/')} className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="w-5 h-5" /> Back to Gateway
      </button>

      <div className="w-full max-w-md">
        <div className="bg-slate-900/60 backdrop-blur-xl p-10 rounded-3xl border border-slate-700/50 shadow-2xl">
          
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-4 border border-emerald-500/20">
              <HardHat className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Field Portal</h2>
            <p className="text-slate-400 text-sm mt-2">Authorized personnel only</p>
          </div>
          
          <div className="space-y-5">
            <div className="relative group">
              <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
              <input 
                className="w-full pl-12 pr-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all text-slate-200"
                placeholder="Worker ID (e.g. W001)"
                onChange={(e) => setWid(e.target.value)}
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
              <input 
                type="password"
                className="w-full pl-12 pr-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all text-slate-200"
                placeholder="Password"
                onChange={(e) => setPass(e.target.value)}
              />
            </div>

            <button 
              onClick={handleLogin}
              className="w-full py-3.5 mt-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold tracking-wide transition-all duration-300 shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.6)]"
            >
              Authenticate
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}