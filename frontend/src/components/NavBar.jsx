import React from 'react';

const NavBar = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <nav className="top-nav flex-shrink-0">
      <div className="logo-container flex-shrink-0">
        <img src="/logo.png" alt="Earth Guardian Logo" className="h-10 w-auto" />
        <div className="flex flex-col">
          <span className="font-bold text-lg leading-none tracking-tight text-slate-800">
            EARTH <span className="text-emerald-500">GUARDIAN</span>
          </span>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">AI SATELLITE NODE</span>
        </div>
      </div>
      
      <div className="nav-tabs-container">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`nav-tab flex items-center gap-2 ${activeTab === tab.id ? 'active' : ''}`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="ml-auto flex items-center gap-4 flex-shrink-0">
        <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold border border-emerald-100 flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          NASA EONET v3 LIVE
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
