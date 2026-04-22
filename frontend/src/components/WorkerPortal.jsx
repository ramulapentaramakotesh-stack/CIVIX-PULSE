import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { UploadCloud, CheckCircle2, MapPin, LogOut } from 'lucide-react';

// 🛑 INSERT YOUR KEYS HERE
const supabase = createClient("https://smkrassnncrlczpwjisl.supabase.co", "sb_publishable_mSQcylgCCClPkePa0z7fKQ_BBvMsBvs");

export default function WorkerPortal() {
  const location = useLocation();
  const navigate = useNavigate();
  const worker = location.state?.worker;
  
  const [tasks, setTasks] = useState([]);
  const [uploadingId, setUploadingId] = useState(null);
  
  // 🔥 DYNAMIC LOCATIONS STATE
  const [locations, setLocations] = useState([]);
  const [activeZone, setActiveZone] = useState(worker?.location_id || "");

  useEffect(() => {
    // Kick them out if they didn't log in
    if (!worker) {
      navigate('/worker-login');
      return;
    }
    
    fetchTasks();
    fetchLocations(); // Pull all zones from Supabase on load
    
    // Auto-refresh if new tasks are assigned to them!
    const sub = supabase.channel('worker_tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'grievances' }, fetchTasks)
      .subscribe();
    return () => supabase.removeChannel(sub);
  }, [worker]);

  // 🌍 FETCH ALL LOCATIONS DYNAMICALLY
  async function fetchLocations() {
    const { data, error } = await supabase.from('locations').select('*');
    if (data) {
      setLocations(data);
    } else {
      console.error("Failed to load locations:", error);
    }
  }

  async function fetchTasks() {
    // Only fetch OPEN tasks that match this specific worker's UUID
    const { data } = await supabase.from('grievances').select('*')
      .eq('status', 'Open')
      .eq('assigned_worker', worker.id)
      .order('priority_level', { ascending: false });
    
    if (data) setTasks(data);
  }

  // 🔄 UPDATE WORKER'S ZONE IN REAL-TIME
  const handleZoneChange = async (e) => {
    const newZoneId = e.target.value;
    setActiveZone(newZoneId);
    
    // Update the worker's active location in Supabase so Python knows where they are
    const { error } = await supabase
      .from('workers')
      .update({ location_id: newZoneId })
      .eq('id', worker.id);
      
    if (error) {
      alert("Failed to update zone. Check connection.");
    }
  };

const handleResolve = async (taskId, file) => {
    if (!file) return;
    setUploadingId(taskId);
    try {
      // 1. Upload the photo to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `resolved-${taskId}-${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('repair-photos').upload(fileName, file);
      if (uploadError) throw uploadError;

      // 2. Get the public URL of the uploaded image
      const { data: { publicUrl } } = supabase.storage.from('repair-photos').getPublicUrl(fileName);
      
      // 🔥 3. PASS THE TORCH TO PYTHON (No local DB update here)
      try {
        await fetch('http://localhost:8000/agent-workflow/verify-resolution', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            task_id: taskId, // Let Python find the cluster!
            resolution_image_url: publicUrl,
            worker_id: worker.id
          })
        });
      } catch (agentErr) {
        console.error("Agent API trigger failed:", agentErr);
      }

      alert("✅ Task Resolved! Photo broadcasted to all citizens in cluster.");
      fetchTasks(); // Refresh UI
      
    } catch (error) {
      alert("Upload failed. Check bucket permissions.");
      console.error(error);
    } finally {
      setUploadingId(null);
    }
  };
  if (!worker) return null;

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-10 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 rounded-3xl border border-slate-700/50 mb-10 flex flex-col md:flex-row justify-between items-start md:items-center shadow-2xl">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center gap-3 mb-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <p className="text-emerald-400 font-bold text-sm tracking-widest uppercase">Active Duty</p>
            </div>
            <h1 className="text-3xl font-extrabold text-white mb-3">{worker.name}</h1>
            
            <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-400">
              <span className="bg-slate-900 px-4 py-1.5 rounded-lg border border-slate-700 shadow-inner">
                Unit: <span className="text-white">{worker.skill_category}</span>
              </span>
              
              {/* 🔥 DYNAMIC LOCATION DROPDOWN 🔥 */}
              <div className="flex items-center gap-2 bg-slate-900 px-3 py-1 rounded-lg border border-slate-700 shadow-inner">
                <span>Zone:</span>
                <select 
                  value={activeZone}
                  onChange={handleZoneChange}
                  className="bg-transparent text-white border-none focus:ring-0 cursor-pointer outline-none"
                >
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id} className="bg-slate-800 text-white">
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

          </div>
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2 bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 px-5 py-3 rounded-xl transition-all border border-slate-700 hover:border-red-500/30 font-semibold"
          >
            <LogOut className="w-4 h-4" /> Sign Off
          </button>
        </div>

        {/* Task Grid */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-200">Pending Dispatches</h2>
          <span className="bg-emerald-500/10 text-emerald-400 px-4 py-1.5 rounded-full text-sm font-bold border border-emerald-500/20">
            {tasks.length} {tasks.length === 1 ? 'Task' : 'Tasks'}
          </span>
        </div>

        {tasks.length === 0 ? (
          <div className="p-16 text-center bg-slate-900/50 rounded-3xl border border-slate-800 border-dashed flex flex-col items-center justify-center">
             <CheckCircle2 className="w-20 h-20 text-emerald-500/30 mb-6" />
             <h3 className="text-2xl font-bold text-slate-300 mb-2">Zone is Clear</h3>
             <p className="text-slate-500 max-w-sm">No active dispatches. Stay on standby. New high-priority tasks will appear here automatically.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {tasks.map(task => (
              <div key={task.id} className="bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-700 shadow-xl relative overflow-hidden">
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${task.priority_level === 'CRITICAL' ? 'bg-red-500' : task.priority_level === 'HIGH' ? 'bg-orange-500' : 'bg-blue-500'}`}></div>
                
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 pl-2">
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-md ${
                        task.priority_level === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/20' : 
                        task.priority_level === 'HIGH' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/20' : 
                        'bg-blue-500/20 text-blue-400 border border-blue-500/20'
                      }`}>
                        {task.priority_level} PRIORITY
                      </span>
                      <span className="text-xs text-slate-500 font-mono bg-slate-950 px-2 py-1 rounded">ID: {task.id.split('-')[0]}</span>
                    </div>
                    
                    <p className="text-xl text-slate-200 font-medium leading-relaxed mb-5">{task.original_complaint}</p>
                    
                    <div className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-500/10 w-fit px-4 py-2.5 rounded-xl border border-emerald-500/20 font-semibold">
                      <MapPin className="w-4 h-4" />
                      {task.extracted_location}
                    </div>
                  </div>

                  {/* Upload Action Panel */}
                  <div className="w-full md:w-auto flex flex-col items-center md:items-end border-t md:border-t-0 md:border-l border-slate-800 pt-6 md:pt-0 md:pl-8">
                    <input 
                      type="file" accept="image/*" id={`file-${task.id}`} className="hidden"
                      onChange={(e) => handleResolve(task.id, e.target.files[0])}
                    />
                    <label 
                      htmlFor={`file-${task.id}`}
                      className={`flex items-center justify-center gap-2 w-full md:w-56 px-6 py-4 rounded-xl font-bold cursor-pointer transition-all duration-300 ${
                        uploadingId === task.id 
                        ? 'bg-slate-800 text-slate-500 cursor-wait' 
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)] hover:-translate-y-1 hover:shadow-[0_0_25px_-5px_rgba(16,185,129,0.6)]'
                      }`}
                    >
                      <UploadCloud className="w-5 h-5" />
                      {uploadingId === task.id ? 'Uploading...' : 'Upload Fix Proof'}
                    </label>
                    <p className="text-xs text-slate-500 mt-3 text-center">Capture photo to close task</p>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}