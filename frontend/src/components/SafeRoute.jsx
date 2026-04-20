import React from 'react';
import { MapPinned, Globe } from 'lucide-react';

const SafeRoute = ({ routeData, setRouteData, routeResult, loading, evaluateRoute, activeTab }) => {
  return (
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
  );
};

export default SafeRoute;
