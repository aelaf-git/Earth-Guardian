import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Globe, 
  ShieldAlert, 
  Activity, 
  MapPinned
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import NavBar from './components/NavBar';
import EventsMap from './components/EventsMap';
import EcoAgent from './components/EcoAgent';
import ClimatePulse from './components/ClimatePulse';
import SafeRoute from './components/SafeRoute';
const API_BASE = "http://localhost:8000/api";

function App() {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('events-map');
  const [loading, setLoading] = useState(true);
  const [userPos, setUserPos] = useState(null);
  const [briefing, setBriefing] = useState("");
  const [analyticsData, setAnalyticsData] = useState("");
  const [routeResult, setRouteResult] = useState("");
  const [routeData, setRouteData] = useState({ start: "" , end: "" });

  const fetchEventsByCategory = (categoryId) => {
    setLoading(true);
    const url = categoryId 
      ? `${API_BASE}/events?category_id=${categoryId}`
      : `${API_BASE}/events`;
      
    axios.get(url)
      .then(res => {
        setEvents(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch events", err);
        setLoading(false);
      });
  };

  const refreshAll = () => {
    setLoading(true);
    // Fetch categories list
    axios.get(`${API_BASE}/categories`)
      .then(res => {
        setCategories(res.data);
      })
      .catch(err => console.error("Categories fetch failed", err));

    // Fetch events
    axios.get(`${API_BASE}/events`)
      .then(res => {
        setEvents(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Events fetch failed", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    // Fetch initial data
    axios.get(`${API_BASE}/categories`)
      .then(res => {
        setCategories(res.data);
      })
      .catch(err => console.error("Categories fetch failed", err));

    axios.get(`${API_BASE}/events`)
      .then(res => {
        setEvents(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Events fetch failed", err);
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
      <NavBar 
        tabs={tabs} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      <main className="flex-1 relative bg-slate-100 overflow-hidden" id="main-content">
        {activeTab === 'events-map' && (
          <EventsMap 
            events={events} 
            categories={categories} 
            onCategorySelect={fetchEventsByCategory} 
            onRefresh={refreshAll}
            loading={loading}
          />
        )}
        
        {activeTab === 'eco-agent' && (
          <EcoAgent 
            userPos={userPos} 
            briefing={briefing} 
            loading={loading} 
            fetchBriefing={fetchBriefing} 
            activeTab={activeTab} 
          />
        )}

        {activeTab === 'climate-pulse' && (
          <ClimatePulse 
            analyticsData={analyticsData} 
            loading={loading} 
            fetchAnalytics={fetchAnalytics} 
            activeTab={activeTab} 
          />
        )}

        {activeTab === 'safe-route' && (
          <SafeRoute 
            routeData={routeData} 
            setRouteData={setRouteData} 
            routeResult={routeResult} 
            loading={loading} 
            evaluateRoute={evaluateRoute} 
            activeTab={activeTab} 
          />
        )}
      </main>
    </div>
  );
}

export default App;
