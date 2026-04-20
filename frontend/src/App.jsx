import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { 
  Globe, 
  ShieldAlert, 
  Activity, 
  MapPinned, 
  Wind,
  Info,
  Calendar,
  Tag,
  ChevronRight,
  Navigation
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const API_BASE = "http://localhost:8000/api";

// Custom Emerald Marker Icon
const createEmeraldIcon = (color = '#10b981') => L.divIcon({
  className: 'custom-icon',
  html: `<div style="background: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 12px rgba(16, 185, 129, 0.4);"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7]
});

function App() {
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('events-map');
  const [loading, setLoading] = useState(false);
  const [userPos, setUserPos] = useState(null);
  const [briefing, setBriefing] = useState("");
  const [analyticsData, setAnalyticsData] = useState("");
  const [routeResult, setRouteResult] = useState("");
  const [routeData, setRouteData] = useState({ start: "" , end: "" });

  useEffect(() => {
    setLoading(true);
    axios.get(`${API_BASE}/events`)
      .then(res => {
        setEvents(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch events", err);
        setLoading(false);
      });

    // Detect User Location for Eco-Agent
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserPos([pos.coords.latitude, pos.coords.longitude]);
      });
    }
  }, []);

  const fetchBriefing = async () => {
    if (!userPos) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/eco-briefing?lat=${userPos[0]}&lon=${userPos[1]}`);
      setBriefing(res.data);
    } catch {
      setBriefing("Environmental analytical systems are currently recalibrating. Please try again soon.");
    }
    setLoading(false);
  };

  const fetchAnalytics = async (category) => {
    setLoading(true);
    try {
      // Re-using the logic from our services
      const res = await axios.get(`${API_BASE}/climate-pulse?category=${category}`);
      setAnalyticsData(res.data);
    } catch {
      setAnalyticsData("Historical data stream from EONET node interrupted.");
    }
    setLoading(false);
  };

  const evaluateRoute = async () => {
    if (!routeData.start || !routeData.end) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/safe-route`, { 
        start: routeData.start, 
        end: routeData.end 
      });
      setRouteResult(res.data);
    } catch {
      setRouteResult("Geospatial route evaluation failed.");
    }
    setLoading(false);
  };

  const tabs = [
    { id: 'events-map', label: 'Events Map', icon: Globe },
    { id: 'eco-agent', label: 'Eco-Agent', icon: ShieldAlert },
    { id: 'climate-pulse', label: 'Climate Pulse', icon: Activity },
    { id: 'safe-route', label: 'Safe-Route', icon: MapPinned },
  ];

  return (
    <div className="app-container">
      {/* Top Navigation */}
      <nav className="top-nav">
        <div className="flex items-center gap-3 mr-12 h-full">
          <img src="/logo.png" alt="Earth Guardian Logo" className="h-10 w-auto" />
          <div className="flex flex-col">
            <span className="font-bold text-lg leading-none tracking-tight text-slate-800">
              EARTH <span className="text-emerald-500">GUARDIAN</span>
            </span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">AI SATELLITE NODE</span>
          </div>
        </div>
        
        <div className="flex h-full">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`nav-tab flex items-center gap-2 ${activeTab === tab.id ? 'active' : ''}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-4">
          <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold border border-emerald-100 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            NASA EONET v2.1 LIVE
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 relative bg-slate-100 overflow-hidden" id="main-content">
        
        {activeTab === 'events-map' && (
          <div className="absolute inset-0 flex animate-in" key="map-view">
            {/* Map Area */}
            <div className="flex-1 relative bg-[#e5e7eb] overflow-hidden">
              <MapContainer 
                center={[20, 0]} 
                zoom={3} 
                style={{ height: "100%", width: "100%", background: "#f1f5f9" }}
                zoomControl={false}
              >
                <TileLayer 
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                
                {events.map(event => {
                  if (!event.geometries || event.geometries.length === 0) return null;
                  const geometry = event.geometries[0];
                  const position = geometry.type === 'Point' 
                    ? [geometry.coordinates[1], geometry.coordinates[0]]
                    : [geometry.coordinates[0][0][1], geometry.coordinates[0][0][0]];

                  return (
                    <Marker 
                      key={event.id} 
                      position={position}
                      icon={createEmeraldIcon()}
                    >
                      <Popup>
                        <div className="p-1 max-w-[200px]">
                          <h3 className="font-bold text-sm text-slate-800 mb-2">{event.title}</h3>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-[10px] text-slate-500">
                              <Tag className="w-3 h-3 text-emerald-500" />
                              {event.categories?.[0]?.title || 'Environmental Event'}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500">
                              <Calendar className="w-3 h-3 text-emerald-500" />
                              {new Date(geometry.date).toLocaleDateString()}
                            </div>
                          </div>
                          <button className="mt-3 w-full bg-emerald-500 text-white text-[10px] py-1.5 rounded font-bold hover:bg-emerald-600 transition-colors">
                            VIEW DETAILS
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>

              {/* Floating Legend/Summary */}
              <div className="absolute bottom-6 right-6 glass-panel p-4 rounded-2xl z-[1000] min-w-[200px]">
                <h4 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Map Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Events</span>
                    <span className="text-sm font-bold text-emerald-600">{events.length}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[70%]" />
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight mt-1">
                    Showing current active events from NASA EONET v2.1 feed.
                  </p>
                </div>
              </div>
            </div>

            {/* Side Info Panel for Events-Map */}
            <div className="w-[350px] bg-white border-l border-slate-200 overflow-y-auto p-6 hidden lg:block">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Globe className="text-emerald-500" /> Active Feed
              </h2>
              <div className="space-y-4">
                {events.slice(0, 10).map(event => (
                  <div key={event.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-emerald-200 transition-colors cursor-pointer group">
                    <h3 className="text-sm font-semibold group-hover:text-emerald-600 transition-colors truncate">{event.title}</h3>
                    <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold">{event.categories?.[0]?.title}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'eco-agent' && (
          <div className="h-full w-full flex items-center justify-center p-8 animate-in">
            <div className="max-w-2xl w-full">
              <div className="bg-white rounded-[2rem] shadow-2xl p-10 border border-slate-100 relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-50 rounded-full blur-3xl opacity-50" />
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-4 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-200">
                      <ShieldAlert className="text-white w-8 h-8" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-slate-800">Eco-Agent Intelligence</h2>
                      <p className="text-slate-500">Localized environmental hazard sensing.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-slate-400 font-bold uppercase text-[10px] block mb-1">Status</span>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${userPos ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`} />
                        <span className="font-semibold">{userPos ? 'Geolocation Active' : 'Sensing Location...'}</span>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-slate-400 font-bold uppercase text-[10px] block mb-1">Coordinates</span>
                      <span className="font-mono">{userPos ? `${userPos[0].toFixed(2)}, ${userPos[1].toFixed(2)}` : 'Scanning...'}</span>
                    </div>
                  </div>
                  <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100 min-h-[180px] flex flex-col items-center justify-center text-center">
                    {loading && activeTab === 'eco-agent' ? (
                      <div className="space-y-4">
                        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-emerald-700 font-medium animate-pulse">Consulting NASA EONET data...</p>
                      </div>
                    ) : briefing ? (
                      <div className="text-left w-full">
                        <h4 className="text-xs font-bold text-emerald-600 uppercase mb-2 tracking-widest flex items-center gap-2">
                          <Activity className="w-3 h-3" /> AI GENERATED BRIEFING
                        </h4>
                        <p className="text-slate-700 leading-relaxed font-light italic">"{briefing}"</p>
                      </div>
                    ) : (
                      <>
                        <Info className="text-emerald-300 w-12 h-12 mb-4" />
                        <p className="text-emerald-700 font-medium">Ready to analyze environmental threats at your location.</p>
                      </>
                    )}
                  </div>
                  <button 
                    onClick={fetchBriefing}
                    disabled={loading || !userPos}
                    className="w-full mt-8 bg-emerald-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-200 disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    <Navigation className="w-5 h-5" />
                    {loading ? 'ANALYZING...' : 'SYNC LOCAL INTELLIGENCE'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'climate-pulse' && (
          <div className="h-full w-full flex items-center justify-center p-8 animate-in">
            <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
              <div className="bg-white rounded-[2rem] shadow-xl p-6 border border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest">Select Category</h3>
                <div className="space-y-2">
                  {['Wildfires', 'Storms', 'Floods', 'Volcanoes', 'Icebergs'].map(cat => (
                    <button 
                      key={cat}
                      onClick={() => fetchAnalytics(cat)}
                      className="w-full text-left p-4 rounded-xl border border-slate-50 hover:border-emerald-200 hover:bg-emerald-50 transition-all group"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-slate-700 group-hover:text-emerald-700">{cat}</span>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-[2rem] shadow-xl p-8 border border-slate-100 flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600">
                    <Activity className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">Historical Perspective</h2>
                </div>

                <div className="flex-1 bg-slate-50 rounded-2xl p-6 border border-slate-100 overflow-y-auto">
                  {loading && activeTab === 'climate-pulse' ? (
                    <div className="h-full flex flex-col items-center justify-center space-y-4">
                      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-slate-500 animate-pulse">Parsing multi-source NASA archives...</p>
                    </div>
                  ) : analyticsData ? (
                    <div className="prose prose-slate max-w-none">
                      <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{analyticsData}</p>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                      <Globe className="w-16 h-16 mb-4" />
                      <p className="text-sm font-medium">Select a hazard category to view AI-synthesized trend analysis.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'safe-route' && (
          <div className="h-full w-full flex items-center justify-center p-8 animate-in">
            <div className="max-w-2xl w-full">
              <div className="bg-white rounded-[2rem] shadow-2xl p-10 border border-slate-100">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-4 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-200">
                    <MapPinned className="text-white w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-slate-800">Safe-Route Navigator</h2>
                    <p className="text-slate-500">Environmental path verification system.</p>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <input 
                      className="w-full bg-slate-50 border border-slate-100 p-4 pl-12 rounded-2xl text-sm focus:border-emerald-300 focus:bg-white transition-all outline-none" 
                      placeholder="Enter starting point..." 
                      value={routeData.start}
                      onChange={(e) => setRouteData({...routeData, start: e.target.value})}
                    />
                  </div>
                  <div className="relative">
                    <MapPinned className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <input 
                      className="w-full bg-slate-50 border border-slate-100 p-4 pl-12 rounded-2xl text-sm focus:border-emerald-300 focus:bg-white transition-all outline-none" 
                      placeholder="Enter destination..." 
                      value={routeData.end}
                      onChange={(e) => setRouteData({...routeData, end: e.target.value})}
                    />
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 min-h-[120px] flex items-center justify-center text-center">
                  {loading && activeTab === 'safe-route' ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-emerald-700 font-medium">Scanning intersecting hazards...</p>
                    </div>
                  ) : routeResult ? (
                    <div className="text-left w-full border-l-4 border-emerald-500 pl-4 py-2">
                       <p className="text-slate-700 leading-relaxed font-light italic">"{routeResult}"</p>
                    </div>
                  ) : (
                    <p className="text-slate-400 italic">Enter route details to initialize environmental safety check.</p>
                  )}
                </div>

                <button 
                  onClick={evaluateRoute}
                  disabled={loading || !routeData.start || !routeData.end}
                  className="w-full mt-8 bg-slate-800 text-white py-4 rounded-2xl font-bold text-lg hover:bg-slate-900 transition-all shadow-xl disabled:opacity-50"
                >
                  {loading ? 'CALCULATING...' : 'VERIFY ROUTE SAFETY'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
