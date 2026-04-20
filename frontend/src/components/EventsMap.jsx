import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Globe, Tag, Calendar } from 'lucide-react';

const createEmeraldIcon = (color = '#10b981') => L.divIcon({
  className: 'custom-icon',
  html: `<div style="background: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 12px rgba(16, 185, 129, 0.4);"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7]
});

const EventsMap = ({ events, categories = [], onCategorySelect }) => {
  const [selectedCatId, setSelectedCatId] = useState(null);

  const handleCategoryClick = (catId) => {
    setSelectedCatId(catId);
    if (onCategorySelect) {
      onCategorySelect(catId);
    }
  };

  return (
    <div className="map-container-fixed animate-in flex" key="map-view">
      <div className="flex-1 relative">
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
      <div className="w-[350px] bg-white border-l border-slate-200 overflow-y-auto p-6 hidden lg:block flex-shrink-0 z-[1000] shadow-[-10px_0_30px_rgba(0,0,0,0.03)] h-full">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Globe className="text-emerald-500" /> Active Feed
        </h2>
        
        {/* Categories Filter UI */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Filter by Category</h3>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => handleCategoryClick(null)}
              className={`text-[10px] uppercase font-bold py-1.5 px-3 rounded-full transition-all border ${
                selectedCatId === null 
                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-200' 
                  : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-emerald-300 hover:text-emerald-600'
              }`}
            >
              All Events
            </button>
            {categories.map(cat => (
              <button 
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`text-[10px] uppercase font-bold py-1.5 px-3 rounded-full transition-all border ${
                  selectedCatId === cat.id 
                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-200' 
                    : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-emerald-300 hover:text-emerald-600'
                }`}
              >
                {cat.title}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {events.slice(0, 15).map(event => (
            <div key={event.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-emerald-200 transition-colors cursor-pointer group">
              <h3 className="text-sm font-semibold group-hover:text-emerald-600 transition-colors truncate">{event.title}</h3>
              <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold">{event.categories?.[0]?.title}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventsMap;
