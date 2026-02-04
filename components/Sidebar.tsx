
import React from 'react';
import { AdminProfile } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  appName: string;
  subtitle: string;
  onLogout: () => void;
  profile: AdminProfile;
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  isAdmin: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, appName, subtitle, onLogout, profile, isOpen, setIsOpen, isAdmin }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-line' },
    { id: 'actions', label: 'Piano d\'Azione', icon: 'fa-list-check' },
    { id: 'sites', label: 'Cantieri', icon: 'fa-helmet-safety' },
    { id: 'personnel', label: 'Personale', icon: 'fa-users' },
    { id: 'fleet', label: 'Mezzi Aziendali', icon: 'fa-truck' },
    { id: 'documents', label: 'Documenti', icon: 'fa-file-contract' },
  ];

  if (isAdmin) {
    menuItems.push({ id: 'settings', label: 'Impostazioni', icon: 'fa-cog' });
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity duration-300" onClick={() => setIsOpen(false)}></div>
      )}

      <aside className={`fixed inset-y-0 left-0 w-72 bg-slate-900 dark:bg-black text-white min-h-screen z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 flex flex-col ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <div className="p-8 flex items-center justify-between border-b border-slate-800/50 shrink-0">
          <div className="flex items-center space-x-4 overflow-hidden">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl shadow-blue-500/40 border-2 border-white/10">
              <span className="text-2xl font-black italic select-none">S+</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-black tracking-tight truncate leading-tight">{appName}</h1>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest truncate leading-none mt-1">{subtitle}</p>
            </div>
          </div>
          <button className="lg:hidden text-slate-400 hover:text-white p-2" onClick={() => setIsOpen(false)}><i className="fas fa-times text-xl"></i></button>
        </div>
        
        <nav className="flex-1 px-5 py-8 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id)} 
              className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all duration-300 group ${activeTab === item.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30 -translate-y-0.5' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <i className={`fas ${item.icon} w-6 text-center text-lg ${activeTab === item.id ? 'text-white' : 'group-hover:text-blue-400'}`}></i>
              <span className={`font-black uppercase text-[10px] tracking-widest ${activeTab === item.id ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-800/50 bg-slate-900/50 dark:bg-black/50 shrink-0">
          <div onClick={() => setActiveTab('profile')} className={`group bg-slate-800/40 dark:bg-slate-900/50 rounded-3xl p-5 cursor-pointer hover:bg-slate-800 transition-all border-2 border-transparent mb-6 ${activeTab === 'profile' ? 'border-blue-500/50 bg-slate-800 shadow-2xl' : ''}`}>
            <div className="flex items-center space-x-4">
              <img src={profile.avatarUrl} alt="User" className="w-14 h-14 rounded-2xl border-2 border-blue-500 bg-slate-700 shadow-xl object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black truncate uppercase tracking-tight">{profile.name}</p>
                <p className="text-[9px] text-slate-500 truncate uppercase font-bold tracking-wider mt-0.5">{isAdmin ? 'Amministratore' : 'Operatore Editor'}</p>
              </div>
            </div>
          </div>
          
          <button 
            type="button" 
            onClick={() => onLogout()} 
            className="w-full py-4 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all flex items-center justify-center space-x-3 border-2 border-red-500/20 active:scale-95 shadow-lg"
          >
            <i className="fas fa-power-off text-sm"></i>
            <span>Disconnetti Sessione</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
