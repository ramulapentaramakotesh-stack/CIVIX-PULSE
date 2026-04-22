import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { ShieldAlert, Filter } from 'lucide-react';
import L from 'leaflet';

// Leaflet Marker Icon Fix
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: markerIcon, shadowUrl: markerShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

// 🛑 INSERT YOUR KEYS HERE
const supabase = createClient("https://smkrassnncrlczpwjisl.supabase.co", "sb_publishable_mSQcylgCCClPkePa0z7fKQ_BBvMsBvs");

// 🔥 The component that makes the map physically fly to the selected coordinates
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.5 });
  }, [center, zoom, map]);
  return null;
}

export default function AdminDashboard() {
  const [grievances, setGrievances] = useState([]);
  
  // 🔥 DYNAMIC LOCATIONS STATE
  const [locations, setLocations] = useState([]);
  const [selectedZoneId, setSelectedZoneId] = useState('ALL');
  
  // Coordinates for the MapController to fly to
  const [mapCenter, setMapCenter] = useState([17.3850, 78.4867]); // Default Global (Hyderabad)
  const [mapZoom, setMapZoom] = useState(11);

  useEffect(() => {
    fetchLocations(); // Pull zones from DB
    fetchGrievances();
    
    // Real-time listener for incoming tickets
    const sub = supabase.channel('public:grievances')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'grievances' }, fetchGrievances)
      .subscribe();
      
    return () => supabase.removeChannel(sub);
  }, []);

  async function fetchLocations() {
    const { data, error } = await supabase.from('locations').select('*');
    if (data) setLocations(data);
    else console.error("Error fetching locations:", error);
  }

  async function fetchGrievances() {
    // Fetch all tickets that are Open or Merged
    const { data } = await supabase.from('grievances')
      .select('*')
      .in('status', ['Open', 'Merged'])
      .order('created_at', { ascending: false });
      
    if (data) setGrievances(data);
  }

  // 🔥 DYNAMIC LOCATION SWITCHER
  const handleLocationChange = (zoneId) => {
    setSelectedZoneId(zoneId);
    
    if (zoneId === 'ALL') {
      setMapCenter([17.3850, 78.4867]); // Back to Global View
      setMapZoom(11);
    } else {
      // Find the exact coordinates for the selected zone from the DB data
      const zone = locations.find(loc => loc.id === zoneId);
      if (zone && zone.center_lat && zone.center_lng) {
        setMapCenter([zone.center_lat, zone.center_lng]);
        setMapZoom(14); // Zoom in on the specific town
      }
    }
  };

  // Filter grievances based on the exact location_id
  const filteredGrievances = grievances.filter(g => {
    if (selectedZoneId === 'ALL') return true;
    return g.location_id === selectedZoneId;
  });

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Dynamic Sidebar */}
      <div className="w-1/3 max-w-md border-r border-slate-800 bg-slate-900/80 backdrop-blur-xl flex flex-col z-10 shadow-2xl">
        <div className="p-6 border-b border-slate-800 bg-slate-900">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <ShieldAlert className="text-blue-400 w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-wide">Command Center</h1>
            </div>
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            {/* DYNAMIC DROPDOWN */}
            <select 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl text-sm outline-none transition-all text-slate-200 cursor-pointer"
              value={selectedZoneId}
              onChange={(e) => handleLocationChange(e.target.value)}
            >
              <option value="ALL">Global View (All Locations)</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>{loc.name} Zone</option>
              ))}
            </select>
          </div>
        </div>

        {/* Scrollable Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {filteredGrievances.length === 0 && (
            <p className="text-center text-slate-500 mt-10">No active grievances in this zone.</p>
          )}
          {filteredGrievances.map(item => (
            <div 
              key={item.id} 
              className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800 transition-all cursor-pointer" 
              onClick={() => {
                // If you click a card, fly to that specific pin!
                setMapCenter([item.lat, item.lng]);
                setMapZoom(17); // Super close zoom for exact street view
              }}
            >
              <div className="flex justify-between items-start mb-3">
                <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md ${
                  item.priority_level === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                  item.priority_level === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {item.priority_level}
                </span>
                
                {/* Visual cue if it's a Merged ticket */}
                <span className="text-xs font-mono text-slate-500">
                  {item.status === 'Merged' ? `MERGED: ${item.cluster_id.split('-')[0]}` : `ID: ${item.id.split('-')[0]}`}
                </span>
              </div>
              <h3 className="font-bold text-lg text-slate-100 mb-2">{item.category}</h3>
              <p className="text-sm text-slate-400 line-clamp-2">{item.original_complaint}</p>
            </div>
          ))}
        </div>
      </div>

      {/* MAP */}
      <div className="flex-1 relative bg-slate-900 z-0">
        <MapContainer center={mapCenter} zoom={mapZoom} className="w-full h-full" zoomControl={true}>
          {/* Detailed Street-Level Tiles instead of generic dark ones */}
          <TileLayer 
            url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png" 
            attribution='&copy; Stadia Maps'
          />
          <MapController center={mapCenter} zoom={mapZoom} />
          
          {filteredGrievances.map(item => (
            <Marker key={item.id} position={[item.lat, item.lng]}>
              <Popup>
                <div className="p-1">
                  <h4 className="font-bold text-slate-900">{item.category}</h4>
                  <p className="text-xs text-slate-600 font-medium">{item.extracted_location}</p>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold">{item.status}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}