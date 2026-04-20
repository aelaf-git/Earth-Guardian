import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import axios from 'axios';
import { ShieldAlert, Activity, MapPinned, Wind } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const API_BASE = "http://localhost:8000/api";

function App() {
  const [events, setEvents] = useState([]);
  const [briefing, setBriefing] = useState("Click 'Get Briefing' to scan your area...");
  const [loading, setLoading] = useState(false);
  const [routeSafety, setRouteSafety] = useState("");

  useEffect(() => {
    axios.get(`${API_BASE}/events`).then(res => setEvents(res.data));
  }, []);

  const fetchBriefing = async () => {
    setLoading(true);
    const res = await axios.get(`${API_BASE}/eco-briefing?lat=37.77&lon=-122.41`);
    setBriefing(res.data);
    setLoading(false);
  };

  return (
    <div className="flex h-screen w-full bg-slate-900 text-white font-sans">
      {/* Sidebar */}
      <div className="w-1/3 p-6 overflow-y-auto border-r border-slate-700 bg-slate-800 shadow-xl">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-2 text-blue-400">
          <Wind /> Earth Guardian AI
        </h1>

        {/* Eco-Agent Section */}
        <section className="mb-10 bg-slate-700 p-4 rounded-lg shadow-inner">
          <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
            <ShieldAlert className="text-red-400" /> Eco-Agent Briefing
          </h2>
          <p className="text-slate-300 text-sm mb-4 leading-relaxed italic">"{briefing}"</p>
          <button onClick={fetchBriefing} disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-md transition-all text-sm font-medium">
            {loading ? "Analyzing..." : "Sync Local Data"}
          </button>
        </section>

        {/* Climate Pulse */}
        <section className="mb-10 p-4 border border-slate-600 rounded-lg">
          <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
            <Activity className="text-green-400" /> Climate Pulse
          </h2>
          <div className="text-sm text-slate-400">
            <p>• Wildfire frequency up 22% in this region (AI Prediction)</p>
            <p className="mt-2">• Severity of storm surges increasing in North Atlantic.</p>
          </div>
        </section>

        {/* Safe Route */}
        <section className="p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
          <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
            <MapPinned className="text-blue-400" /> Safe-Route AI
          </h2>
          <input className="w-full bg-slate-900 p-2 mb-2 rounded text-sm" placeholder="Start: San Francisco" />
          <input className="w-full bg-slate-900 p-2 mb-2 rounded text-sm" placeholder="End: Seattle" />
          <button className="w-full bg-blue-600 py-2 rounded font-bold">Check Route Safety</button>
        </section>
      </div>

      {/* Main Map Visualization */}
      <div className="flex-1 relative">
        <MapContainer center={[20, 0]} zoom={2} style={{ height: "100%", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {events.map(event => (
            <Marker key={event.id} position={[event.geometries[0].coordinates[1], event.geometries[0].coordinates[0]]}>
              <Popup>
                <strong className="text-black">{event.title}</strong><br/>
                <span className="text-slate-600">{event.categories[0].title}</span>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

export default App;