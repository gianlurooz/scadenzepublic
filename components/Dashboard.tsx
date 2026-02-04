
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Deadline, DeadlineStatus, Category, ActionPriority } from '../types';

interface DashboardProps {
  deadlines: Deadline[];
  searchTerm: string;
}

const Dashboard: React.FC<DashboardProps> = ({ deadlines, searchTerm }) => {
  const stats = {
    total: deadlines.length,
    active: deadlines.filter(d => d.status === DeadlineStatus.ACTIVE).length,
    warning: deadlines.filter(d => d.status === DeadlineStatus.WARNING).length,
    expired: deadlines.filter(d => d.status === DeadlineStatus.EXPIRED).length,
  };

  // Calcolo Rischio Aziendale (0-100)
  const riskIndex = Math.min(100, (stats.expired * 15) + (stats.warning * 5));
  const riskColor = riskIndex > 70 ? 'text-red-600' : riskIndex > 30 ? 'text-amber-500' : 'text-emerald-500';

  const pieData = [
    { name: 'In Regola', value: stats.active, color: '#10b981' },
    { name: 'In Scadenza', value: stats.warning, color: '#f59e0b' },
    { name: 'Scaduti', value: stats.expired, color: '#ef4444' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Azienda Oggi */}
      <div className="bg-slate-900 dark:bg-black rounded-[3rem] p-10 text-white flex flex-col md:flex-row items-center justify-between shadow-2xl border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full -translate-y-32 translate-x-32 blur-3xl"></div>
        <div className="z-10">
          <h2 className="text-3xl font-black uppercase tracking-tighter">Stato Azienda Oggi</h2>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">Monitor di Conformità Legale e Operativa</p>
          <div className="flex items-center space-x-6 mt-8">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-500 uppercase">Rischio Complessivo</span>
              <span className={`text-4xl font-black ${riskColor}`}>{riskIndex}%</span>
            </div>
            <div className="h-12 w-[1px] bg-slate-800"></div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-500 uppercase">Azioni Urgenti</span>
              <span className="text-4xl font-black text-white">{stats.expired}</span>
            </div>
          </div>
        </div>
        <div className="mt-8 md:mt-0 z-10 text-center md:text-right">
           <div className={`px-8 py-4 rounded-3xl border-2 font-black uppercase tracking-widest text-xs ${riskIndex > 50 ? 'border-red-500 text-red-500 bg-red-500/10' : 'border-emerald-500 text-emerald-500 bg-emerald-500/10'}`}>
             {riskIndex > 50 ? 'Criticità Rilevate' : 'Livello Sicuro'}
           </div>
           <p className="text-[8px] text-slate-500 mt-3 font-black uppercase tracking-widest">Ultimo aggiornamento: {new Date().toLocaleTimeString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-gray-100 dark:border-slate-700 shadow-sm transition-all hover:shadow-2xl">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Totale Scadenze Monitorate</p>
          <div className="flex items-end justify-between">
            <h3 className="text-4xl font-black text-slate-800 dark:text-white">{stats.total}</h3>
            <i className="fas fa-list-check text-blue-500 opacity-20 text-3xl"></i>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-gray-100 dark:border-slate-700 shadow-sm transition-all hover:shadow-2xl">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Elementi Conformi</p>
          <div className="flex items-end justify-between">
            <h3 className="text-4xl font-black text-emerald-500">{stats.active}</h3>
            <span className="text-emerald-500 font-black text-xs uppercase tracking-widest">In Regola</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-gray-100 dark:border-slate-700 shadow-sm transition-all hover:shadow-2xl">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Elementi Fuori Norma</p>
          <div className="flex items-end justify-between">
            <h3 className="text-4xl font-black text-red-500">{stats.expired}</h3>
            <span className="text-red-500 font-black text-xs uppercase tracking-widest">Bloccati</span>
          </div>
        </div>
      </div>

      {/* Grafici e Liste Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] border border-gray-100 dark:border-slate-700 shadow-sm">
           <h4 className="text-xl font-black mb-8 dark:text-white uppercase tracking-tight">Distribuzione Criticità</h4>
           <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
           </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] border border-gray-100 dark:border-slate-700 shadow-sm">
           <h4 className="text-xl font-black mb-8 dark:text-white uppercase tracking-tight">Focus Scadenze Imminenti</h4>
           <div className="space-y-4 max-h-64 overflow-y-auto custom-scrollbar">
              {deadlines.filter(d => d.status !== DeadlineStatus.ACTIVE).length === 0 ? (
                <div className="h-48 flex flex-col items-center justify-center text-slate-300">
                  <i className="fas fa-shield-check text-4xl mb-4 opacity-30"></i>
                  <p className="text-[10px] font-black uppercase">Nessuna urgenza rilevata</p>
                </div>
              ) : (
                deadlines.filter(d => d.status !== DeadlineStatus.ACTIVE).slice(0, 5).map(d => (
                  <div key={d.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border-l-4 border-l-amber-500">
                    <span className="text-[10px] font-black uppercase text-slate-800 dark:text-white truncate pr-4">{d.title}</span>
                    <span className="text-[10px] font-black text-amber-600">{new Date(d.dueDate).toLocaleDateString()}</span>
                  </div>
                ))
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
