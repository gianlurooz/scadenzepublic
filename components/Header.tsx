
import React, { useState } from 'react';
import { Deadline, DeadlineStatus } from '../types';

interface HeaderProps {
  activeTab: string;
  search: string;
  setSearch: (val: string) => void;
  deadlines: Deadline[];
  onToggleMobileMenu: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, search, setSearch, deadlines, onToggleMobileMenu }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard Analitica';
      case 'actions': return 'Piano d\'Azione Operativo';
      case 'personnel': return 'Gestione Personale';
      case 'fleet': return 'Flotta Aziendale';
      case 'documents': return 'Archivio Documentale';
      case 'sites': return 'Cantieri & Progetti';
      case 'settings': return 'Impostazioni Sistema';
      case 'profile': return 'Profilo Utente';
      default: return 'Scadenze+';
    }
  };

  const criticalDeadlines = deadlines.filter(d => d.status !== DeadlineStatus.ACTIVE);

  return (
    <header className="h-20 bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between px-4 md:px-8 shrink-0 z-30 transition-colors">
      <div className="flex items-center space-x-4">
        <button 
          onClick={onToggleMobileMenu} 
          className="lg:hidden w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all"
        >
          <i className="fas fa-bars text-xl"></i>
        </button>
        <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight hidden sm:block">
          {getTitle()}
        </h2>
      </div>

      <div className="flex items-center space-x-3 md:space-x-6">
        <div className={`relative transition-all duration-500 flex items-center ${isSearchExpanded ? 'w-48 md:w-80' : 'w-10 md:w-10'}`}>
          <div className="absolute left-3 text-slate-400">
            <i className="fas fa-search"></i>
          </div>
          <input 
            type="text" 
            placeholder="Cerca scadenze o asset..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setIsSearchExpanded(true)}
            onBlur={() => !search && setIsSearchExpanded(false)}
            className={`w-full h-10 bg-slate-50 dark:bg-slate-900 border-none rounded-xl pl-10 pr-4 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all dark:text-white ${isSearchExpanded ? 'opacity-100' : 'opacity-0 md:opacity-0 cursor-pointer'}`}
          />
          {!isSearchExpanded && (
            <button 
              onClick={() => setIsSearchExpanded(true)}
              className="absolute inset-0 w-full h-full md:hidden"
            />
          )}
        </div>

        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center relative transition-all ${showNotifications ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-slate-50 dark:bg-slate-900 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
          >
            <i className="fas fa-bell text-lg"></i>
            {criticalDeadlines.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[9px] font-black rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center">
                {criticalDeadlines.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
              <div className="absolute right-0 mt-4 w-80 bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl border border-gray-100 dark:border-slate-700 p-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Notifiche Critiche</h4>
                  <span className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-3 py-1 rounded-full text-[9px] font-black uppercase">
                    {criticalDeadlines.length} Alert
                  </span>
                </div>
                <div className="space-y-3 max-h-72 overflow-y-auto custom-scrollbar pr-2">
                  {criticalDeadlines.length === 0 ? (
                    <div className="py-8 text-center">
                      <i className="fas fa-check-circle text-emerald-400 text-3xl mb-3"></i>
                      <p className="text-[10px] text-slate-400 font-black uppercase italic">Nessun alert attivo</p>
                    </div>
                  ) : (
                    criticalDeadlines.slice(0, 5).map(d => (
                      <div key={d.id} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-blue-200 transition-all cursor-default">
                        <p className="text-[10px] font-black text-slate-800 dark:text-white uppercase truncate tracking-tight">{d.title}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-[8px] font-bold text-slate-400 uppercase">{d.category}</span>
                          <span className={`text-[8px] font-black uppercase ${d.status === DeadlineStatus.EXPIRED ? 'text-red-600' : 'text-amber-600'}`}>
                            {new Date(d.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
