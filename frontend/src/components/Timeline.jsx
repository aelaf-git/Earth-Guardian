import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, Calendar, Database } from 'lucide-react';

const API_BASE = "http://localhost:8000/api";

const Timeline = ({ onSelectSnapshot }) => {
  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchSnapshots = async () => {
      try {
        const res = await axios.get(`${API_BASE}/timeline`);
        if (isMounted) {
          setSnapshots(res.data);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to fetch timeline", err);
        if (isMounted) setLoading(false);
      }
    };

    fetchSnapshots();
    const interval = setInterval(fetchSnapshots, 60000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="h-full w-full bg-slate-50 p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-indigo-500 rounded-xl shadow-lg shadow-indigo-100">
            <Clock className="text-white w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Environmental Timeline</h2>
            <p className="text-slate-500 text-sm">Historical snapshots captured every minute for ML training.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-20">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {snapshots.map((s) => (
              <div 
                key={s.id}
                onClick={() => onSelectSnapshot(s.id)}
                className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-700">
                      {new Date(s.timestamp).toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-400 font-medium flex items-center gap-1">
                      <Database className="w-3 h-3" /> Snapshot ID: {s.id}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-lg font-bold text-indigo-600">{s.event_count}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Events Tracked</div>
                  </div>
                  <div className="px-4 py-2 bg-slate-50 rounded-lg text-xs font-bold text-slate-500 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                    VIEW DATA
                  </div>
                </div>
              </div>
            ))}

            {snapshots.length === 0 && (
              <div className="text-center p-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                <Database className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-medium">Initializing historical database...</p>
                <p className="text-slate-300 text-sm mt-1">First sync will occur within 60 seconds.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Timeline;
