import React from 'react';
import { Activity, ChevronRight, Globe } from 'lucide-react';

const ClimatePulse = ({ analyticsData, loading, fetchAnalytics, activeTab }) => {
  return (
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
  );
};

export default ClimatePulse;
