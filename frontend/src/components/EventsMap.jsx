import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { 
  Globe, 
  Tag, 
  Calendar, 
  Flame, 
  Wind, 
  Droplets, 
  Mountain, 
  Snowflake, 
  AlertTriangle,
  ChevronRight,
  Info,
  RefreshCw
} from 'lucide-react';

const CATEGORY_STYLES = {
  wildfires: { color: '#ef4444', icon: Flame },
  severeStorms: { color: '#3b82f6', icon: Wind },
  volcanoes: { color: '#f97316', icon: Mountain },
  floods: { color: '#0ea5e9', icon: Droplets },
  icebergs: { color: '#06b6d4', icon: Snowflake },
  seaLakeIce: { color: '#22d3ee', icon: Snowflake },
  landslides: { color: '#a855f7', icon: AlertTriangle },
  default: { color: '#10b981', icon: Globe }
};

const createCustomIcon = (color = '#10b981') => L.divIcon({
  className: 'custom-icon',
  html: `
    <div style="position: relative; width: 14px; height: 14px;">
      <div class="marker-pulse" style="background: ${color};"></div>
      <div style="background: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 15px ${color}66; position: relative; z-index: 2;"></div>
    </div>
  `,
  iconSize: [14, 14],
  iconAnchor: [7, 7]
});

const EventsMap = ({ events, categories = [], onCategorySelect, onRefresh, loading }) => {
  const [selectedCatId, setSelectedCatId] = useState(null);

  const handleCategoryClick = (catId) => {
    setSelectedCatId(catId);
    if (onCategorySelect) {
      onCategorySelect(catId);
    }
  };

  return (
    <div className="map-container-fixed animate-in flex" key="map-view">
      <div className="flex-1 relative h-full w-full">
        <MapContainer 
          center={[20, 0]} 
        zoom={3} 
        scrollWheelZoom={true}
        zoomControl={false}
      >
        <TileLayer 
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {events?.map(event => {
          if (!event.geometry || event.geometry.length === 0) return null;
          // EONET v3 usually uses 'geometry' (singular) or 'geometries' (plural)
          const geometries = event.geometry || event.geometries;
          if (!geometries || geometries.length === 0) return null;
          
          const geometry = geometries[0];
          const position = geometry.type === 'Point' 
            ? [geometry.coordinates[1], geometry.coordinates[0]]
            : Array.isArray(geometry.coordinates[0][0])
              ? [geometry.coordinates[0][0][1], geometry.coordinates[0][0][0]]
              : [geometry.coordinates[0][1], geometry.coordinates[0][0]];

          const catId = event.categories?.[0]?.id;
          const style = CATEGORY_STYLES[catId] || CATEGORY_STYLES.default;
          const CategoryIcon = style.icon;

          return (
            <Marker 
              key={event.id} 
              position={position}
              icon={createCustomIcon(style.color)}
            >
              <Popup className="premium-popup">
                <div className="p-2 max-w-[240px] animate-fade-in">
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
                    <div className="p-1.5 rounded-lg" style={{ background: `${style.color}15` }}>
                      <CategoryIcon className="w-4 h-4" style={{ color: style.color }} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {event.categories?.[0]?.title}
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-sm text-slate-800 mb-2 leading-tight">{event.title}</h3>
                  
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-[11px] text-slate-600">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(geometry.date).toLocaleDateString(undefined, { 
                        year: 'numeric', month: 'short', day: 'numeric' 
                      })}
                    </div>
                  </div>

                  <button className="w-full bg-slate-900 text-white text-[10px] py-2 rounded-lg font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                    <Info className="w-3 h-3" /> ANALYZE THREAT
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Floating Map Legend - Premium Glassmorphism */}
      <div className="absolute top-6 right-6 glass-panel p-4 rounded-2xl z-[1000] min-w-[220px] animate-fade-in shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Map Summary</h4>
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse delay-75"></div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-2xl font-black text-slate-800 leading-none">{events.length}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Active Events</p>
            </div>
            <div className="text-right">
              <button 
                onClick={onRefresh}
                disabled={loading}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-emerald-500 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
          
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full w-[85%] rounded-full shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
          </div>
          
          <p className="text-[10px] text-slate-500 leading-normal italic">
            "Real-time orbital intelligence for planetary preservation."
          </p>
        </div>
      </div>
      </div>

      {/* Side Info Panel - Unified & Premium */}
      <div className="w-[380px] bg-white border-l border-slate-100 overflow-hidden flex flex-col hidden lg:flex flex-shrink-0 z-[1000] shadow-[-20px_0_40px_rgba(0,0,0,0.02)] h-full">
        <div className="p-8 pb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
              <Globe className="text-emerald-500 w-8 h-8" /> Feed
            </h2>
            <div className="px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">V3 Active</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Global environmental monitoring via NASA Earth Observatory Network.
          </p>
        </div>
        
        {/* Categories Tabs */}
        <div className="px-8 mb-6 mt-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 text-center">Event Categories</h3>
          {categories?.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => handleCategoryClick(null)}
                className={`flex items-center gap-2 text-[10px] font-bold py-3 px-4 rounded-xl transition-all border ${
                  selectedCatId === null 
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-200 scale-[1.02]' 
                    : 'bg-slate-50 text-slate-500 border-slate-100 hover:border-emerald-200 hover:text-emerald-600 active:scale-95'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                All Events
              </button>
              {categories.map(cat => {
                const style = CATEGORY_STYLES[cat.id] || CATEGORY_STYLES.default;
                const Icon = style.icon;
                return (
                  <button 
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.id)}
                    className={`flex items-center gap-2 text-[10px] font-bold py-3 px-4 rounded-xl transition-all border ${
                      selectedCatId === cat.id 
                        ? 'text-white border-transparent shadow-xl shadow-slate-100 scale-[1.02]' 
                        : 'bg-slate-50 text-slate-500 border-slate-100 hover:border-emerald-200 hover:text-emerald-600 active:scale-95'
                    }`}
                    style={selectedCatId === cat.id ? { backgroundColor: style.color } : {}}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="truncate">{cat.title}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center animate-fade-in">
              <RefreshCw className={`w-8 h-8 text-slate-300 mx-auto mb-3 ${loading ? 'animate-spin' : ''}`} />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                Satellite Node Throttled <br/> by NASA EONET
              </p>
              <button 
                onClick={onRefresh}
                disabled={loading}
                className="mt-4 w-full bg-white border border-slate-200 text-slate-600 text-[10px] font-black py-2.5 rounded-xl hover:border-emerald-500 hover:text-emerald-600 transition-all active:scale-95"
              >
                RECONNECT TELEMETRY
              </button>
            </div>
          )}
        </div>

        {/* Scrollable Event Feed */}
        <div className="flex-1 overflow-y-auto px-8 custom-scrollbar pb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Latest Updates</h3>
            <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">Showing {events.length}</span>
          </div>
          
          <div className="space-y-3">
            {events?.length > 0 ? (
              events.map(event => {
                const style = CATEGORY_STYLES[event.categories?.[0]?.id] || CATEGORY_STYLES.default;
                return (
                  <div 
                    key={event.id} 
                    className="p-4 bg-white rounded-2xl border border-slate-100 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-50/50 transition-all cursor-pointer group animate-fade-in"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: style.color }} />
                      <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">{event.categories?.[0]?.title}</p>
                    </div>
                    <h3 className="text-sm font-bold text-slate-800 group-hover:text-emerald-600 transition-colors leading-snug">
                      {event.title}
                    </h3>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1">
                        <Calendar className="w-2.5 h-2.5" />
                        {new Date(event.geometry?.[0]?.date || event.geometries?.[0]?.date).toLocaleDateString()}
                      </span>
                      <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-emerald-500 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <Globe className="w-8 h-8 text-slate-200" />
                </div>
                <p className="text-sm font-bold text-slate-400">Scanner active...</p>
                <p className="text-[10px] text-slate-300 mt-1">Waiting for satellite telemetry</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsMap;
