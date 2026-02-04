
import React, { useState } from 'react';
import { Vehicle, DeadlineStatus, Category, Deadline } from '../types';

interface VehicleListProps {
  vehicles: Vehicle[];
  setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>;
  searchTerm: string;
  isAdmin: boolean;
}

const VehicleList: React.FC<VehicleListProps> = ({ vehicles, setVehicles, searchTerm, isAdmin }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeadlineModalOpen, setIsDeadlineModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [selectedVehId, setSelectedVehId] = useState<string | null>(null);
  const [selectedTitle, setSelectedTitle] = useState('Revisione');

  const filteredVehicles = vehicles.filter(v => 
    v.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.assignedTo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.deadlines.some(d => d.title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const exportPDF = () => {
    const { jsPDF } = (window as any).jspdf;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Flotta Aziendale - Registro Scadenze", 14, 20);
    const tableData = vehicles.map(v => [
      v.plate, v.model, v.type, v.assignedTo || 'Non Assegnato', v.deadlines.length.toString()
    ]);
    (doc as any).autoTable({
      startY: 30,
      head: [['Targa', 'Modello', 'Tipologia', 'Assegnatario', 'Scadenze Attive']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] }
    });
    doc.save(`Flotta_Aziendale_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleDelete = (id: string) => {
    if (!isAdmin) return alert("Azione non consentita: Solo un Amministratore può eliminare mezzi.");
    if(confirm("Rimuovere questo mezzo dalla flotta?")) {
      setVehicles(prev => prev.filter(v => v.id !== id));
    }
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const deadlines = editingVehicle?.deadlines || [];
    const isStreetLegal = !deadlines.some(d => d.status === DeadlineStatus.EXPIRED);
    const newVeh: Vehicle = {
      id: editingVehicle?.id || `veh-${Date.now()}`,
      plate: (formData.get('plate') as string).toUpperCase(),
      model: formData.get('model') as string,
      type: formData.get('type') as string,
      assignedTo: formData.get('assignedTo') as string,
      deadlines: deadlines,
      isStreetLegal: isStreetLegal
    };
    if (editingVehicle) setVehicles(prev => prev.map(v => v.id === editingVehicle.id ? newVeh : v));
    else setVehicles(prev => [...prev, newVeh]);
    setIsModalOpen(false);
    setEditingVehicle(null);
  };

  const handleAddDeadline = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedVehId) return;
    const formData = new FormData(e.currentTarget);
    let title = formData.get('title') as string;
    if (title === 'Altro') title = formData.get('customTitle') as string;
    const date = formData.get('dueDate') as string;
    if (!title || !date) return alert("Inserire titolo e data");
    const newD: Deadline = {
      id: `vd-${Date.now()}`,
      title,
      dueDate: date,
      status: DeadlineStatus.ACTIVE,
      category: Category.VEHICLE,
      description: 'Manutenzione'
    };
    setVehicles(prev => prev.map(v => v.id === selectedVehId ? { ...v, deadlines: [...v.deadlines, newD] } : v));
    setIsDeadlineModalOpen(false);
    setSelectedVehId(null);
    setSelectedTitle('Revisione');
  };

  const removeDeadline = (vehId: string, dId: string) => {
    if(confirm("Rimuovere questa scadenza?")) {
      setVehicles(prev => prev.map(v => v.id === vehId ? { ...v, deadlines: v.deadlines.filter(d => d.id !== dId) } : v));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-tight">Mezzi Aziendali</h3>
          <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Monitoraggio flotta, bolli e revisioni periodiche.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={exportPDF} className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-6 py-3.5 rounded-2xl border border-gray-100 dark:border-slate-700 hover:bg-slate-50 transition-all flex items-center space-x-3 shadow-sm font-black uppercase text-xs tracking-widest"><i className="fas fa-file-pdf"></i><span>Export PDF</span></button>
          <button onClick={() => { setEditingVehicle(null); setIsModalOpen(true); }} className="bg-emerald-600 text-white px-8 py-3.5 rounded-2xl hover:bg-emerald-700 transition-all flex items-center space-x-3 shadow-2xl shadow-emerald-500/30 font-black uppercase text-xs tracking-widest active:scale-95"><i className="fas fa-truck-pickup"></i><span>Nuovo Mezzo</span></button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map((veh) => (
          <div key={veh.id} className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-all group">
            <div className="p-8 bg-slate-50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-800 relative">
              <div className="absolute top-4 right-4 space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => { setEditingVehicle(veh); setIsModalOpen(true); }} className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-800 text-blue-600 rounded-xl shadow-sm hover:bg-blue-50"><i className="fas fa-edit"></i></button>
                {isAdmin && <button onClick={() => handleDelete(veh.id)} className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-800 text-red-600 rounded-xl shadow-sm hover:bg-red-50"><i className="fas fa-trash"></i></button>}
              </div>
              <div className="flex justify-between items-center mb-6">
                <span className="bg-slate-800 text-white px-4 py-1.5 rounded-xl text-xs font-mono font-black tracking-[0.2em] shadow-lg">{veh.plate}</span>
                <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{veh.type}</span>
              </div>
              <h4 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tight leading-none">{veh.model}</h4>
            </div>
            <div className="p-8 space-y-6">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Scadenze:</p>
              {veh.deadlines.map((d) => (
                <div key={d.id} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-gray-100 dark:border-slate-800">
                  <div className="flex-1 min-w-0"><p className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight truncate">{d.title}</p><span className="block text-[10px] text-blue-600 dark:text-blue-400 font-black mt-1 uppercase tracking-widest">{new Date(d.dueDate).toLocaleDateString('it-IT')}</span></div>
                  <button onClick={() => removeDeadline(veh.id, d.id)} className="text-red-300 hover:text-red-500 transition-colors ml-4"><i className="fas fa-times"></i></button>
                </div>
              ))}
              <button onClick={() => { setSelectedVehId(veh.id); setIsDeadlineModalOpen(true); }} className="w-full py-4 text-[10px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-widest border-2 border-dashed border-emerald-100 dark:border-emerald-900/40 rounded-2xl hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all">+ Aggiungi Scadenza</button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-[3rem] w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in duration-300 border border-white/10">
            <div className="p-10 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
              <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">{editingVehicle ? 'Modifica Mezzo' : 'Inserimento Mezzo'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-all text-xl"><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={handleSave} className="p-10 space-y-8">
              <input name="plate" defaultValue={editingVehicle?.plate} placeholder="TARGA" required className="w-full p-5 bg-slate-50 dark:bg-slate-700 border-none rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 font-black font-mono uppercase dark:text-white" />
              <input name="model" defaultValue={editingVehicle?.model} placeholder="Modello" required className="w-full p-5 bg-slate-50 dark:bg-slate-700 border-none rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 font-black dark:text-white" />
              <div className="pt-6"><button type="submit" className="w-full px-8 py-5 bg-emerald-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-2xl hover:bg-emerald-700 transition-all active:scale-95">Salva Dati Mezzo</button></div>
            </form>
          </div>
        </div>
      )}

      {isDeadlineModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-slate-800 rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <div className="p-8 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50"><h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Nuova Scadenza Mezzo</h3><button onClick={() => setIsDeadlineModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-all"><i className="fas fa-times"></i></button></div>
            <form onSubmit={handleAddDeadline} className="p-10 space-y-8">
              <select name="title" className="w-full p-5 bg-slate-50 dark:bg-slate-700 border-none rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 font-black dark:text-white" value={selectedTitle} onChange={(e) => setSelectedTitle(e.target.value)}>
                 <option value="Revisione">Revisione Ministeriale</option>
                 <option value="Bollo">Pagamento Bollo</option>
                 <option value="Assicurazione">Rinnovo Assicurazione</option>
                 <option value="Tagliando">Manutenzione (Tagliando)</option>
                 <option value="Altro">Altro...</option>
              </select>
              <input name="dueDate" type="date" required className="w-full p-5 bg-slate-50 dark:bg-slate-700 border-none rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 font-black dark:text-white" />
              <div className="pt-6"><button type="submit" className="w-full px-8 py-5 bg-emerald-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-2xl active:scale-95">Programma Scadenza</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleList;
