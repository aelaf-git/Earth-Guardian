import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { 
  ShieldAlert, 
  Activity, 
  MapPinned, 
  Wind, 
  Navigation, 
  Layers, 
  AlertTriangle,
  Info,
  ChevronRight
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const API_BASE = "http://localhost:8000/api";

// Custom Marker Helper
const createCustomIcon = (color, isPulse = false) => L.divIcon({
  className: 'custom-icon',
  html: `<div class="hazard-container" style="background: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px ${color}; ${isPulse ? 'animation: pulse-hazard 2s infinite;' : ''}"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6]
});

const EVENT_COLORS = {
  'Wildfires': '#ef4444',
  'Severe Storms': '#3b82f6',
  'Floods': '#06b6d4',
  'Volcanoes': '#f97316',
  'Icebergs': '#94a3b8',
  'default': '#10b981'
};

function MapCentering({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, 5);
  }, [center, map]);
  return null;
}

function App() {
  const [events, setEvents] = useState([]);
  const [briefing, setBriefing] = useState("");
  const [loading, setLoading] = useState(false);
  const [userPos, setUserPos] = useState([37.77, -122.41]); // Default to SF
  const [activeTab, setActiveTab] = useState('briefing');
  const [routeData, setRouteData] = useState({ start: "", end: "" });
  const [analyticsData, setAnalyticsData] = useState("");
  const [routeResult, setRouteResult] = useState("");

  useEffect(() => {
    // Initial data fetch
    axios.get(`${API_BASE}/events`).then(res => setEvents(res.data));
    
    // Attempt geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserPos([pos.coords.latitude, pos.coords.longitude]);
      });
    }
  }, []);

  const fetchBriefing = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/eco-briefing?lat=${userPos[0]}&lon=${userPos[1]}`);
      setBriefing(res.data);
    } catch (err) {
      setBriefing("Unable to connect to Earth Guardian systems.");
    }
    setLoading(false);
  };

  const fetchAnalytics = async (category) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/climate-pulse?category=${category}`);
      setAnalyticsData(res.data);
    } catch (err) {
      setAnalyticsData("Analytics engine temporarily unavailable.");
    }
    setLoading(false);
  };

  const evaluateRoute = async () => {
    if (!routeData.start || !routeData.end) return;
    setLoading(true);
    try {
      // Note: In a real app, we'd geocode strings to coordinates. 
      // For this demo, we'll pass the labels and let Gemini reason or use placeholders.
      const res = await axios.post(`${API_BASE}/safe-route`, { 
        start: routeData.start, 
        end: routeData.end 
      });
      setRouteResult(res.data);
    } catch (err) {
      setRouteResult("Route calculation failed.");
    }
    setLoading(false);
  };

  return (
    <div className="flex h-screen w-full bg-[#0a0b10] text-[#f8fafc] font-sans overflow-hidden">
      
      {/* Premium Sidebar */}
      <div className="w-[450px] glass-panel z-[1000] flex flex-col border-r border-white/5">
        
        {/* Header */}
        <div className="p-8 border-b border-white/5 bg-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Wind className="text-blue-400 w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tighter">
              EARTH <span className="text-blue-400">GUARDIAN</span>
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            NASA EONET LIVE FEED STABLE
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex px-4 py-2 bg-black/20 gap-2">
          {['briefing', 'analytics', 'navigation'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${activeTab === tab ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Dynamic Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {activeTab === 'briefing' && (
            <div className="animate-in fade-in slide-in-from-left-4 duration-500">
              <div className="glass-card mb-4 border-l-2 border-l-blue-500">
                <h2 className="text-sm font-bold flex items-center gap-2 mb-4">
                  <ShieldAlert className="text-blue-400 w-4 h-4" /> LOCAL ECO-STATUS
                </h2>
                <div className="text-sm text-slate-300 leading-relaxed min-h-[100px] font-light">
                  {briefing ? (
                    <div className="space-y-3">
                      <p className="whitespace-pre-wrap">{briefing}</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-24 text-slate-500 italic">
                      <Info className="w-8 h-8 mb-2 opacity-20" />
                      Run local scan for AI evaluation
                    </div>
                  )}
                </div>
              </div>
              <button 
                onClick={fetchBriefing} 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 py-4 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                {loading && activeTab === 'briefing' ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : <Activity className="w-4 h-4" />}
                {(loading && activeTab === 'briefing') ? "PROCESSING..." : "ANALYZE LOCAL RADIUS"}
              </button>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-left-4">
               <h3 className="text-xs font-bold text-slate-500 flex items-center gap-2">
                <Activity className="w-3 h-3" /> CLIMATE PULSE TRENDS
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {['Wildfires', 'Storms', 'Floods', 'Drought'].map(cat => (
                  <button 
                    key={cat}
                    onClick={() => fetchAnalytics(cat)}
                    className="glass-card text-xs hover:bg-blue-500/10 hover:border-blue-500/30 transition-all text-left"
                  >
                    {cat} Analysis
                  </button>
                ))}
              </div>
              
              <div className="glass-card mt-4 border-l-2 border-l-green-500">
                <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {loading && activeTab === 'analytics' ? "Crunching historical NASA sets..." : (analyticsData || "Select a category to view multi-decade trend analysis powered by Gemini 1.5.")}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'navigation' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-left-4">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <MapPinned className="text-blue-400 w-4 h-4" /> SAFE-ROUTE NAV
              </h2>
              <div className="space-y-2">
                <div className="relative">
                  <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    className="w-full bg-white/5 border border-white/10 p-3 pl-10 rounded-xl text-sm focus:bg-white/10 transition-all font-light" 
                    placeholder="Origin" 
                    value={routeData.start}
                    onChange={(e) => setRouteData({...routeData, start: e.target.value})}
                  />
                </div>
                <div className="relative">
                  <MapPinned className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    className="w-full bg-white/5 border border-white/10 p-3 pl-10 rounded-xl text-sm focus:bg-white/10 transition-all font-light" 
                    placeholder="Destination" 
                    value={routeData.end}
                    onChange={(e) => setRouteData({...routeData, end: e.target.value})}
                  />
                </div>
              </div>
              <button 
                onClick={evaluateRoute}
                disabled={loading || !routeData.start || !routeData.end}
                className="w-full bg-slate-100 text-black py-4 rounded-xl font-bold text-sm hover:bg-white transition-all disabled:opacity-50"
              >
                {(loading && activeTab === 'navigation') ? "CALCULATING THREATS..." : "EVALUATE PATH SAFETY"}
              </button>

              {routeResult && (
                <div className="glass-card border-l-2 border-l-amber-500 text-xs text-slate-300 whitespace-pre-wrap">
                  {routeResult}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div className="p-4 bg-black/40 border-t border-white/5 grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase font-bold">Latency</span>
            <span className="text-xs font-mono text-green-400">12ms (Direct)</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase font-bold">API Version</span>
            <span className="text-xs font-mono text-slate-300">G-1.5-FLASH</span>
          </div>
        </div>
      </div>

      {/* Map Visualization */}
      <div className="flex-1 relative">
        <MapContainer 
          center={[20, 0]} 
          zoom={2} 
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          <TileLayer 
             url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
             attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          <MapCentering center={userPos} />
          
          {/* User Marker */}
          <Marker position={userPos} icon={createCustomIcon('#3b82f6', true)}>
            <Popup>
              <div className="p-2">
                <span className="text-xs font-bold text-slate-400">YOUR LOCATION</span>
                <p className="text-sm">Scan radius active.</p>
              </div>
            </Popup>
          </Marker>

          {events.map(event => {
            const category = event.categories?.[0]?.title || 'default';
            const color = EVENT_COLORS[category] || EVENT_COLORS['default'];
            const [lon, lat] = event.geometries[0].coordinates;

            return (
              <Marker 
                key={event.id} 
                position={[lat, lon]}
                icon={createCustomIcon(color)}
              >
                <Popup className="premium-popup">
                  <div className="p-1">
                    <h3 className="font-bold text-sm mb-1">{event.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase px-2 py-0.5 rounded-full" style={{ background: color + '33', color: color }}>
                        {category}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(event.geometries[0].date).toLocaleDateString()}
                      </span>
                    </div>
                    <button className="mt-3 w-full text-[10px] font-bold text-white uppercase flex items-center justify-between group">
                      Detailed Intel <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Map Controls Floating */}
        <div className="absolute top-6 right-6 flex flex-col gap-2 z-[1000]">
          <button className="p-3 glass-panel rounded-xl hover:bg-white/10 transition-all">
            <Layers className="w-5 h-5" />
          </button>
          <button className="p-3 glass-panel rounded-xl hover:bg-white/10 transition-all">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;