
import React, { useState } from 'react';
import { Employee, DeadlineStatus, Category, Deadline } from '../types';

interface PersonnelListProps {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  searchTerm: string;
  isAdmin: boolean;
}

const PersonnelList: React.FC<PersonnelListProps> = ({ employees, setEmployees, searchTerm, isAdmin }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredEmployees = employees.filter(e => 
    `${e.firstName} ${e.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.taxCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (!isAdmin) return alert("Azione non consentita: Solo un Amministratore può eliminare personale.");
    if (confirm("Sei sicuro di voler rimuovere questo dipendente?")) {
      setEmployees(prev => prev.filter(e => e.id !== id));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h3 className="text-2xl font-black dark:text-white uppercase tracking-tight">Anagrafica & Idoneità</h3>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Controllo accessi e validità mansioni.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-8 py-4 rounded-[1.5rem] font-black uppercase text-xs tracking-widest shadow-2xl shadow-blue-500/30 active:scale-95 transition-all">
          <i className="fas fa-user-plus mr-3"></i>Nuovo Dipendente
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredEmployees.map((emp) => {
          const hasExpired = emp.deadlines.some(d => d.status === DeadlineStatus.EXPIRED);
          return (
            <div key={emp.id} className={`bg-white dark:bg-slate-800 rounded-[3rem] shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden group transition-all hover:shadow-2xl border-t-8 ${hasExpired ? 'border-t-red-600' : 'border-t-emerald-500'}`}>
              <div className="p-10 relative">
                {isAdmin && (
                  <button onClick={() => handleDelete(emp.id)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors">
                    <i className="fas fa-trash-alt"></i>
                  </button>
                )}
                
                <div className="flex items-center justify-between mb-8">
                   <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900/50 rounded-2xl flex items-center justify-center font-black text-xl text-slate-800 dark:text-white">
                      {emp.firstName[0]}{emp.lastName[0]}
                   </div>
                   <div className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest shadow-sm ${hasExpired ? 'bg-red-600 text-white' : 'bg-emerald-500 text-white'}`}>
                      {hasExpired ? 'NON IDONEO' : 'IDONEO'}
                   </div>
                </div>

                <h4 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-1">{emp.firstName} {emp.lastName}</h4>
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mb-8">{emp.role}</p>

                <div className="space-y-3">
                   {emp.deadlines.map(d => (
                     <div key={d.id} className={`flex items-center justify-between p-4 rounded-2xl text-[10px] font-black uppercase tracking-tight ${d.status === DeadlineStatus.EXPIRED ? 'bg-red-50 dark:bg-red-900/20 text-red-600' : 'bg-slate-50 dark:bg-slate-900 text-slate-500'}`}>
                        <span>{d.title}</span>
                        <span>{new Date(d.dueDate).toLocaleDateString()}</span>
                     </div>
                   ))}
                </div>

                <button className="w-full mt-8 py-4 bg-slate-900 dark:bg-black text-white rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all">
                  Gestisci Documenti
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PersonnelList;
