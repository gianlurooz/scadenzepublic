
import React, { useMemo, useState } from 'react';
import { Deadline, DeadlineStatus, Category, ActionGroup, ActionPriority, ActionStatus, Task } from '../types';

interface ActionPlanListProps {
  deadlines: Deadline[];
}

const ActionPlanList: React.FC<ActionPlanListProps> = ({ deadlines }) => {
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});

  const actionGroups = useMemo(() => {
    const critical = deadlines.filter(d => d.status !== DeadlineStatus.ACTIVE);
    const groups: { [key: string]: ActionGroup } = {};

    critical.forEach(d => {
      const key = `${d.category}-${d.title}`;
      if (!groups[key]) {
        // Generazione Task atomici basati sul tipo di scadenza
        let taskTitles: string[] = [];
        if (d.category === Category.PERSONNEL) {
          taskTitles = ["Contattare Medico/Ente", "Verificare Calendario Dipendenti", "Inviare Convocazione", "Caricare Attestato Finale"];
        } else if (d.category === Category.VEHICLE) {
          taskTitles = ["Chiamata Officina/Centro Revisioni", "Consegna Mezzo", "Verifica Fatturazione", "Aggiornamento Libretto"];
        } else {
          taskTitles = ["Verifica Requisiti", "Richiesta Telematica", "Download Documento", "Check Validità"];
        }

        groups[key] = {
          id: `action-${key}`,
          title: d.title,
          category: d.category,
          priority: d.status === DeadlineStatus.EXPIRED ? ActionPriority.CRITICAL : ActionPriority.MEDIUM,
          suggestedDate: d.dueDate,
          involvedItems: [],
          tasks: taskTitles.map((t, i) => ({ id: `${key}-t-${i}`, title: t, isCompleted: false })),
          status: ActionStatus.TODO,
          riskImpact: d.status === DeadlineStatus.EXPIRED ? 80 : 30
        };
      }

      groups[key].involvedItems.push({
        id: d.id,
        name: d.owner || 'N/A',
        dueDate: d.dueDate,
        status: d.status
      });
    });

    return Object.values(groups).sort((a, b) => b.riskImpact - a.riskImpact);
  }, [deadlines]);

  const toggleTask = (taskId: string) => {
    setCompletedTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black dark:text-white uppercase tracking-tight">Action Plan & Task Engine</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Trasformazione automatica delle criticità in attività operative.</p>
        </div>
      </div>

      {actionGroups.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 p-20 rounded-[3rem] border-4 border-dashed border-gray-100 dark:border-slate-700 text-center">
           <i className="fas fa-check-circle text-emerald-400 text-6xl mb-6"></i>
           <h3 className="text-xl font-black dark:text-white uppercase tracking-tight">Azienda 100% Conforme</h3>
           <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-2">Non ci sono criticità che richiedono piani d'azione.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {actionGroups.map((group) => (
            <div key={group.id} className="bg-white dark:bg-slate-800 rounded-[3rem] shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden group hover:shadow-2xl transition-all border-l-[20px]" style={{ borderLeftColor: group.priority === ActionPriority.CRITICAL ? '#ef4444' : '#f59e0b' }}>
              <div className="grid grid-cols-1 lg:grid-cols-12">
                {/* Info Settore */}
                <div className="lg:col-span-4 p-10 bg-slate-50 dark:bg-slate-900/50 border-r dark:border-slate-800">
                  <div className="flex items-center space-x-3 mb-6">
                    <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${group.priority === ActionPriority.CRITICAL ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'}`}>
                      {group.priority === ActionPriority.CRITICAL ? 'Urgenza Massima' : 'Pianificazione'}
                    </span>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{group.category}</span>
                  </div>
                  <h4 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter leading-none mb-6">{group.title}</h4>
                  
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Soggetti Interessati:</p>
                    {group.involvedItems.map(item => (
                      <div key={item.id} className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-600 dark:text-slate-300">{item.name}</span>
                        <span className="text-red-500">{new Date(item.dueDate).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-10 pt-10 border-t dark:border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                       <span className="text-[10px] font-black text-slate-400 uppercase">Impatto Rischio</span>
                       <span className="text-xs font-black text-slate-800 dark:text-white">{group.riskImpact}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                       <div className={`h-full transition-all duration-1000 ${group.priority === ActionPriority.CRITICAL ? 'bg-red-600' : 'bg-amber-500'}`} style={{ width: `${group.riskImpact}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* Task Engine */}
                <div className="lg:col-span-8 p-10">
                  <div className="flex items-center justify-between mb-8">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Work-Flow Operativo (Task Engine)</h5>
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Assegnazione Automatica</span>
                  </div>

                  <div className="space-y-3">
                    {group.tasks.map((task) => (
                      <div 
                        key={task.id} 
                        onClick={() => toggleTask(task.id)}
                        className={`group/task flex items-center justify-between p-5 rounded-2xl border transition-all cursor-pointer ${completedTasks[task.id] ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800' : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 hover:border-blue-400'}`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center border-2 transition-all ${completedTasks[task.id] ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200 dark:border-slate-700 group-hover/task:border-blue-500'}`}>
                            {completedTasks[task.id] && <i className="fas fa-check text-xs"></i>}
                          </div>
                          <span className={`text-xs font-black uppercase tracking-tight ${completedTasks[task.id] ? 'text-emerald-700 dark:text-emerald-400 line-through opacity-50' : 'text-slate-700 dark:text-slate-200'}`}>
                            {task.title}
                          </span>
                        </div>
                        {!completedTasks[task.id] && (
                          <div className="flex items-center space-x-3 opacity-0 group-hover/task:opacity-100 transition-opacity">
                             <button className="text-[8px] font-black uppercase bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-lg">Assegna</button>
                             <button className="text-[8px] font-black uppercase bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-lg">Upload</button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-8 border-t dark:border-slate-800 flex items-center justify-between">
                     <div className="flex space-x-3">
                        <button className="bg-slate-900 dark:bg-black text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all">Report Attività</button>
                        <button className="text-slate-400 hover:text-red-500 text-[10px] font-black uppercase tracking-widest px-6 py-3">Annulla Piano</button>
                     </div>
                     <p className="text-[9px] text-slate-400 font-bold uppercase">Stato: <span className="text-blue-600 font-black">In Esecuzione</span></p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActionPlanList;
