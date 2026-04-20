import React from 'react';
import { ShieldAlert, Activity, Info, Navigation } from 'lucide-react';

const EcoAgent = ({ userPos, briefing, loading, fetchBriefing, activeTab }) => {
  return (
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
  );
};

export default EcoAgent;
