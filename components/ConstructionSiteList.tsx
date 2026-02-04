
import React, { useState } from 'react';
import { ConstructionSite, SiteStatus, DocStatus, Subcontractor, SAL } from '../types';

interface ConstructionSiteListProps {
  sites: ConstructionSite[];
  setSites: React.Dispatch<React.SetStateAction<ConstructionSite[]>>;
  searchTerm: string;
  // Added isAdmin property to match App.tsx usage
  isAdmin: boolean;
}

type TabType = 'GENERAL' | 'DOCS' | 'FINANCE' | 'SECURITY';

const DEFAULT_SITE: Omit<ConstructionSite, 'id'> = {
  name: '',
  client: '',
  designer: '',
  address: '',
  startDate: new Date().toISOString().split('T')[0],
  endDate: '',
  status: SiteStatus.ACTIVE,
  totalAmount: 0,
  subcontractors: [],
  salHistory: [],
  docs: {
    dnl: DocStatus.MISSING,
    cartello: DocStatus.MISSING,
    contratto: DocStatus.MISSING,
    docIdentita: DocStatus.MISSING,
    certificatoQuadro: DocStatus.MISSING,
    analisiRifiuti: DocStatus.MISSING,
    formulariDiscarica: DocStatus.MISSING,
    fineLavoriIdrica: DocStatus.MISSING,
    fineLavoriElettrica: DocStatus.MISSING,
    posAppaltatrice: DocStatus.MISSING,
    psc: DocStatus.MISSING,
    sciaCila: DocStatus.MISSING
  },
  publicGroundOccupation: {
    active: false,
    expiryDate: ''
  }
};

const ConstructionSiteList: React.FC<ConstructionSiteListProps> = ({ sites, setSites, searchTerm, isAdmin }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('GENERAL');
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'CLOSED'>('ACTIVE');
  const [localSite, setLocalSite] = useState<ConstructionSite | null>(null);

  const [newSal, setNewSal] = useState({ title: '', amount: '' });
  const [newSub, setNewSub] = useState({ name: '', amount: '' });

  const filteredSites = sites.filter(s => {
    const searchStr = searchTerm.toLowerCase();
    const matchesSearch = s.name.toLowerCase().includes(searchStr) || 
                         s.client.toLowerCase().includes(searchStr) ||
                         (s.designer || '').toLowerCase().includes(searchStr);
    const matchesFilter = filter === 'ALL' || s.status === filter;
    return matchesSearch && matchesFilter;
  });

  const calculateDocProgress = (site: ConstructionSite) => {
    const docs = Object.values(site.docs);
    const completed = docs.filter(d => d === DocStatus.OK).length;
    return Math.round((completed / docs.length) * 100);
  };

  const exportPDF = () => {
    const { jsPDF } = (window as any).jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text("Registro Cantieri & Progetti", 14, 20);
    
    const tableData = sites.map(s => [
      s.name,
      s.client,
      s.status === SiteStatus.ACTIVE ? 'ATTIVO' : 'CHIUSO',
      `${calculateDocProgress(s)}%`,
      `${s.totalAmount.toLocaleString('it-IT')} €`
    ]);
    
    (doc as any).autoTable({
      startY: 30,
      head: [['Cantiere', 'Committente', 'Stato', 'Doc %', 'Importo Totale']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42] }
    });
    
    doc.save(`Registro_Cantieri_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleOpenModal = (site?: ConstructionSite) => {
    if (site) {
      setLocalSite(JSON.parse(JSON.stringify(site)));
    } else {
      setLocalSite({ ...JSON.parse(JSON.stringify(DEFAULT_SITE)), id: `site-${Date.now()}` });
    }
    setNewSal({ title: '', amount: '' });
    setNewSub({ name: '', amount: '' });
    setActiveTab('GENERAL');
    setIsModalOpen(true);
  };

  const handleFinalSave = () => {
    if (!localSite || !localSite.name || !localSite.client) {
      alert("Inserire almeno nome cantiere e cliente.");
      return;
    }
    setSites(prev => {
      const exists = prev.find(s => s.id === localSite.id);
      if (exists) return prev.map(s => s.id === localSite.id ? localSite : s);
      else return [...prev, localSite];
    });
    setIsModalOpen(false);
    setLocalSite(null);
  };

  const toggleSiteStatus = (siteId: string) => {
    setSites(prev => prev.map(s => {
      if (s.id === siteId) {
        const newStatus = s.status === SiteStatus.ACTIVE ? SiteStatus.CLOSED : SiteStatus.ACTIVE;
        return { ...s, status: newStatus };
      }
      return s;
    }));
  };

  const updateLocalField = (field: keyof ConstructionSite, value: any) => {
    if (!localSite) return;
    setLocalSite({ ...localSite, [field]: value });
  };

  const updateLocalDoc = (key: keyof ConstructionSite['docs'], status: DocStatus) => {
    if (!localSite) return;
    setLocalSite({ ...localSite, docs: { ...localSite.docs, [key]: status } });
  };

  const addSAL = () => {
    if (!localSite || !newSal.title || !newSal.amount) return;
    const amount = parseFloat(newSal.amount);
    if (isNaN(amount)) return;
    setLocalSite({ ...localSite, salHistory: [...localSite.salHistory, { id: `sal-${Date.now()}`, title: newSal.title, amount, date: new Date().toISOString().split('T')[0], isPaid: false }] });
    setNewSal({ title: '', amount: '' });
  };

  const addSubcontractor = () => {
    if (!localSite || !newSub.name || !newSub.amount) return;
    const amount = parseFloat(newSub.amount);
    if (isNaN(amount)) return;
    setLocalSite({ ...localSite, subcontractors: [...localSite.subcontractors, { id: `sub-${Date.now()}`, name: newSub.name, amount, posStatus: DocStatus.MISSING, attachmentsStatus: DocStatus.MISSING }] });
    setNewSub({ name: '', amount: '' });
  };

  const toggleSalPaid = (salId: string) => {
    if (!localSite) return;
    setLocalSite({ ...localSite, salHistory: localSite.salHistory.map(s => s.id === salId ? { ...s, isPaid: !s.isPaid } : s) });
  };

  const removeSal = (id: string) => { if (!localSite) return; setLocalSite({ ...localSite, salHistory: localSite.salHistory.filter(s => s.id !== id) }); };
  const removeSub = (id: string) => { if (!localSite) return; setLocalSite({ ...localSite, subcontractors: localSite.subcontractors.filter(s => s.id !== id) }); };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-tight">Monitoraggio Cantieri</h3>
          <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Gestione Tecnica, Contabile e Documentale Centralizzata.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={exportPDF}
            className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-6 py-3.5 rounded-2xl border border-gray-100 dark:border-slate-700 hover:bg-slate-50 transition-all flex items-center space-x-3 shadow-sm font-black uppercase text-xs tracking-widest"
          >
            <i className="fas fa-file-pdf"></i>
            <span>Export PDF</span>
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-slate-900 dark:bg-black text-white px-8 py-3.5 rounded-2xl hover:bg-slate-800 transition-all flex items-center space-x-3 shadow-2xl shadow-slate-900/40 font-black uppercase text-xs tracking-widest active:scale-95"
          >
            <i className="fas fa-plus"></i>
            <span>Nuovo Cantiere</span>
          </button>
        </div>
      </div>

      <div className="flex bg-white dark:bg-slate-800 p-2 rounded-2xl border border-gray-100 dark:border-slate-700 w-fit shadow-sm">
        <button onClick={() => setFilter('ACTIVE')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'ACTIVE' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 dark:text-slate-500 hover:text-slate-800'}`}>Aperti</button>
        <button onClick={() => setFilter('CLOSED')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'CLOSED' ? 'bg-slate-600 text-white shadow-lg' : 'text-slate-400 dark:text-slate-500 hover:text-slate-800'}`}>Chiusi</button>
        <button onClick={() => setFilter('ALL')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'ALL' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 dark:text-slate-500 hover:text-slate-800'}`}>Tutti</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredSites.map((site) => (
          <div key={site.id} className={`bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden hover:shadow-2xl transition-all group flex flex-col h-full border-t-8 ${site.status === SiteStatus.ACTIVE ? 'border-t-slate-800' : 'border-t-slate-400 opacity-90'}`}>
            <div className="p-8 flex-1">
              <div className="flex justify-between items-start mb-8">
                <div className="flex-1 min-w-0 mr-6">
                  <h4 className="text-xl font-black text-slate-800 dark:text-white truncate leading-tight uppercase tracking-tight">{site.name}</h4>
                  <p className="text-[10px] text-blue-600 dark:text-blue-400 font-black uppercase tracking-[0.2em] mt-2 truncate opacity-80">{site.client}</p>
                </div>
                <div className={`w-16 h-16 rounded-[1.25rem] border-4 flex flex-col items-center justify-center text-[10px] font-black shrink-0 shadow-inner ${calculateDocProgress(site) === 100 ? 'border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'border-amber-400 text-amber-600 bg-amber-50 dark:bg-amber-900/20'}`}>
                  <span className="text-sm">{calculateDocProgress(site)}%</span>
                  <span className="text-[6px] opacity-60">DOCS</span>
                </div>
              </div>
              <div className="space-y-4 mb-8">
                <div className="flex items-center text-[10px] font-black text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <i className="fas fa-user-tie w-8 text-blue-500 text-lg"></i>
                  <span className="truncate uppercase tracking-tight">{site.designer || 'DL non definita'}</span>
                </div>
                <div className="flex items-center text-[10px] font-black text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <i className="fas fa-map-location-dot w-8 text-blue-500 text-lg"></i>
                  <span className="truncate uppercase tracking-tight">{site.address}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] bg-slate-900 dark:bg-black text-white p-5 rounded-[1.5rem] shadow-xl">
                  <span className="font-black opacity-40 uppercase tracking-[0.2em]">Budget Contrattuale</span>
                  <span className="text-base font-black tracking-tight">{site.totalAmount.toLocaleString('it-IT')} €</span>
                </div>
              </div>
            </div>
            <div className="p-8 bg-slate-50 dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 flex flex-col space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex space-x-3">
                  <button onClick={() => handleOpenModal(site)} className="bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 px-6 py-3 rounded-2xl border-2 border-blue-50 dark:border-blue-900/30 font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-95"><i className="fas fa-folder-tree mr-2 text-xs"></i>Gestione</button>
                  {/* Gate delete button with isAdmin check */}
                  {isAdmin && (
                    <button onClick={() => { if(confirm("Cancellare il cantiere e tutti i dati correlati?")) setSites(prev => prev.filter(s => s.id !== site.id)) }} className="w-12 h-12 flex items-center justify-center text-red-300 hover:text-white hover:bg-red-500 rounded-2xl transition-all border-2 border-red-50 dark:border-red-900/20 active:scale-95"><i className="fas fa-trash-can"></i></button>
                  )}
                </div>
                <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-md ${site.status === SiteStatus.ACTIVE ? 'bg-emerald-500 text-white' : 'bg-slate-400 text-white'}`}>{site.status === SiteStatus.ACTIVE ? 'In Corso' : 'Concluso'}</div>
              </div>
              <button onClick={() => toggleSiteStatus(site.id)} className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95 ${site.status === SiteStatus.ACTIVE ? 'bg-slate-800 dark:bg-black text-white hover:bg-red-600' : 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200'}`}><i className={`fas ${site.status === SiteStatus.ACTIVE ? 'fa-lock' : 'fa-lock-open'} mr-3`}></i>{site.status === SiteStatus.ACTIVE ? 'Chiudi Cantierazione' : 'Ripristina Apertura'}</button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && localSite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-[3rem] w-full max-w-6xl shadow-2xl animate-in zoom-in duration-300 overflow-hidden flex flex-col md:flex-row max-h-[95vh] border border-white/10">
            <div className="md:w-80 bg-slate-50 dark:bg-slate-900 p-12 flex flex-col border-r border-gray-100 dark:border-slate-800 shrink-0">
              <div className="mb-12">
                <div className="w-20 h-20 bg-slate-900 dark:bg-black rounded-[2rem] flex items-center justify-center text-white mb-8 shadow-2xl border border-white/10"><i className="fas fa-helmet-safety text-3xl"></i></div>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white leading-tight uppercase tracking-tight">Setup Cantiere</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-3">Configurazione Tecnica</p>
              </div>
              <div className="space-y-3 flex-1">
                {[{ id: 'GENERAL', icon: 'fa-info-circle', label: 'Anagrafica' }, { id: 'DOCS', icon: 'fa-file-signature', label: 'Checklist Doc' }, { id: 'FINANCE', icon: 'fa-coins', label: 'Contabilità (SAL)' }, { id: 'SECURITY', icon: 'fa-shield-halved', label: 'Sicurezza & POS' }].map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id as TabType)} className={`w-full flex items-center space-x-5 px-8 py-5 rounded-[1.5rem] text-[10px] uppercase tracking-widest font-black transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-2xl shadow-blue-500/40 -translate-y-1' : 'text-slate-500 dark:text-slate-500 hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl'}`}>
                    <i className={`fas ${tab.icon} w-6 text-center text-lg`}></i><span>{tab.label}</span>
                  </button>
                ))}
              </div>
              <div className="mt-12 space-y-4">
                <button onClick={handleFinalSave} className="w-full bg-emerald-500 text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-emerald-500/30 hover:bg-emerald-600 transition-all active:scale-95"><i className="fas fa-check-double mr-3 text-sm"></i>Applica Modifiche</button>
                <button onClick={() => { setIsModalOpen(false); setLocalSite(null); }} className="w-full py-5 text-slate-400 font-black text-[9px] uppercase tracking-widest hover:text-red-500 transition-colors text-center">Esci senza salvare</button>
              </div>
            </div>
            <div className="flex-1 p-12 md:p-16 overflow-y-auto bg-white dark:bg-slate-800 custom-scrollbar">
              {activeTab === 'GENERAL' && (
                <div className="space-y-12 animate-in fade-in slide-in-from-right-8 duration-500">
                  <div className="flex justify-between items-center border-b-4 border-slate-900 dark:border-white pb-6">
                    <h3 className="text-4xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Dati Contrattuali</h3>
                    <select value={localSite.status} onChange={e => updateLocalField('status', e.target.value)} className="bg-slate-100 dark:bg-slate-900 border-none rounded-2xl px-6 py-3 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-blue-100 dark:text-white"><option value={SiteStatus.ACTIVE}>Attivo</option><option value={SiteStatus.CLOSED}>Concluso</option></select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-3"><label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Titolo Identificativo</label><input value={localSite.name} onChange={e => updateLocalField('name', e.target.value)} placeholder="Titolo Cantiere..." className="w-full p-6 bg-slate-50 dark:bg-slate-900/50 border-none rounded-[1.5rem] outline-none focus:ring-4 focus:ring-blue-100 font-black dark:text-white text-sm" /></div>
                    <div className="space-y-3"><label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Committenza / Cliente</label><input value={localSite.client} onChange={e => updateLocalField('client', e.target.value)} placeholder="Committente..." className="w-full p-6 bg-slate-50 dark:bg-slate-900/50 border-none rounded-[1.5rem] outline-none focus:ring-4 focus:ring-blue-100 font-black dark:text-white text-sm" /></div>
                    <div className="space-y-3"><label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Professionista (DL)</label><input value={localSite.designer} onChange={e => updateLocalField('designer', e.target.value)} placeholder="Direttore Lavori..." className="w-full p-6 bg-slate-50 dark:bg-slate-900/50 border-none rounded-[1.5rem] outline-none focus:ring-4 focus:ring-blue-100 font-black dark:text-white text-sm" /></div>
                    <div className="space-y-3"><label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Totale Appalto (€)</label><input type="number" value={localSite.totalAmount} onChange={e => updateLocalField('totalAmount', Number(e.target.value))} className="w-full p-6 bg-slate-50 dark:bg-slate-900/50 border-none rounded-[1.5rem] outline-none focus:ring-4 focus:ring-blue-100 font-black dark:text-white text-sm" /></div>
                    <div className="space-y-3"><label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Data Inizio</label><input type="date" value={localSite.startDate} onChange={e => updateLocalField('startDate', e.target.value)} className="w-full p-6 bg-slate-50 dark:bg-slate-900/50 border-none rounded-[1.5rem] outline-none focus:ring-4 focus:ring-blue-100 font-black dark:text-white text-sm" /></div>
                    <div className="space-y-3"><label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Data Fine Presunta</label><input type="date" value={localSite.endDate} onChange={e => updateLocalField('endDate', e.target.value)} className="w-full p-6 bg-slate-50 dark:bg-slate-900/50 border-none rounded-[1.5rem] outline-none focus:ring-4 focus:ring-blue-100 font-black dark:text-white text-sm" /></div>
                  </div>
                  <div className="space-y-3"><label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Indirizzo Cantiere</label><input value={localSite.address} onChange={e => updateLocalField('address', e.target.value)} placeholder="Ubicazione lavori..." className="w-full p-6 bg-slate-50 dark:bg-slate-900/50 border-none rounded-[1.5rem] outline-none focus:ring-4 focus:ring-blue-100 font-black dark:text-white text-sm" /></div>
                </div>
              )}
              {activeTab === 'DOCS' && (
                <div className="space-y-12 animate-in fade-in slide-in-from-right-8 duration-500">
                  <div className="flex justify-between items-end border-b-4 border-slate-900 dark:border-white pb-6"><h3 className="text-4xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Checklist Documentale</h3><div className="px-8 py-3 bg-blue-600 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest">Conformità: {calculateDocProgress(localSite)}%</div></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    {Object.keys(localSite.docs).map((key) => (
                      <div key={key} className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-900/50 rounded-[1.5rem] border border-transparent hover:border-blue-200 transition-all group">
                        <span className="text-xs font-black text-slate-700 dark:text-slate-300 pr-4 uppercase tracking-tight">{key.toUpperCase()}</span>
                        <select value={localSite.docs[key as keyof ConstructionSite['docs']]} onChange={(e) => updateLocalDoc(key as any, e.target.value as any)} className={`text-[9px] font-black uppercase border-none rounded-xl p-3 outline-none shadow-sm transition-all ${localSite.docs[key as keyof ConstructionSite['docs']] === DocStatus.OK ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white'}`}><option value={DocStatus.MISSING}>Assente</option><option value={DocStatus.OK}>Presente</option><option value={DocStatus.EXPIRING}>In Scadenza</option></select>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activeTab === 'FINANCE' && (
                <div className="space-y-12 animate-in fade-in slide-in-from-right-8 duration-500">
                  <h3 className="text-4xl font-black text-slate-800 dark:text-white uppercase tracking-tighter border-b-4 border-slate-900 pb-6 inline-block">Contabilità Lavori (SAL)</h3>
                  <div className="p-10 bg-slate-900 dark:bg-black rounded-[3rem] text-white space-y-8"><h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Nuovo SAL</h4><div className="flex flex-col md:flex-row gap-6"><input value={newSal.title} onChange={e => setNewSal({...newSal, title: e.target.value})} placeholder="Descrizione SAL..." className="flex-1 p-5 bg-white/10 border-none rounded-2xl outline-none font-black" /><input type="number" value={newSal.amount} onChange={e => setNewSal({...newSal, amount: e.target.value})} placeholder="€" className="w-full md:w-48 p-5 bg-white/10 border-none rounded-2xl outline-none font-black" /><button onClick={addSAL} className="bg-blue-600 px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs">Registra</button></div></div>
                  <div className="space-y-6">{localSite.salHistory.map(sal => (<div key={sal.id} className="flex items-center justify-between p-8 bg-white dark:bg-slate-900/50 border border-slate-100 rounded-[2.5rem] shadow-xl border-l-[12px] border-l-emerald-500"><div><p className="font-black text-slate-800 dark:text-white text-xl uppercase tracking-tight leading-none mb-2">{sal.title}</p><p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{new Date(sal.date).toLocaleDateString('it-IT')}</p></div><div className="flex items-center space-x-10"><div className="text-right"><p className="text-2xl font-black text-emerald-600 mb-2">{sal.amount.toLocaleString('it-IT')} €</p><button onClick={() => toggleSalPaid(sal.id)} className={`text-[9px] font-black uppercase px-6 py-2.5 rounded-full ${sal.isPaid ? 'bg-emerald-500 text-white' : 'bg-red-50 text-red-600'}`}>{sal.isPaid ? 'Saldato' : 'Sospeso'}</button></div><button onClick={() => removeSal(sal.id)} className="w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-300 hover:text-red-600 rounded-2xl"><i className="fas fa-trash-can"></i></button></div></div>))}</div>
                </div>
              )}
              {activeTab === 'SECURITY' && (
                <div className="space-y-12 animate-in fade-in slide-in-from-right-8 duration-500">
                  <h3 className="text-4xl font-black text-slate-800 dark:text-white uppercase tracking-tighter border-b-4 border-slate-900 pb-6 inline-block">Subappalti & POS</h3>
                  <div className="p-10 bg-blue-900 rounded-[3rem] text-white space-y-8"><h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Accredita Impresa</h4><div className="flex flex-col md:flex-row gap-6"><input value={newSub.name} onChange={e => setNewSub({...newSub, name: e.target.value})} placeholder="Ragione Sociale..." className="flex-1 p-5 bg-white/10 border-none rounded-2xl outline-none font-black" /><input type="number" value={newSub.amount} onChange={e => setNewSub({...newSub, amount: e.target.value})} placeholder="€" className="w-full md:w-48 p-5 bg-white/10 border-none rounded-2xl outline-none font-black" /><button onClick={addSubcontractor} className="bg-emerald-500 px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs">Accredita</button></div></div>
                  <div className="grid grid-cols-1 gap-8">{localSite.subcontractors.map(sub => (<div key={sub.id} className="p-10 bg-white dark:bg-slate-900/50 border border-slate-100 rounded-[3rem] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-10 border-l-[12px] border-l-blue-600"><div className="flex-1"><h5 className="font-black text-slate-800 dark:text-white text-2xl mb-2 uppercase tracking-tight">{sub.name}</h5><div className="flex items-center space-x-3"><span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Importo:</span><span className="text-lg font-black dark:text-white">{sub.amount.toLocaleString('it-IT')} €</span></div></div><div className="flex items-center space-x-12"><div className="flex flex-col gap-4 text-right"><div><label className="text-[9px] font-black uppercase text-slate-400 block mb-2">P.O.S.</label><select value={sub.posStatus} onChange={(e) => { const newSubs = localSite.subcontractors.map(it => it.id === sub.id ? { ...it, posStatus: e.target.value as DocStatus } : it); updateLocalField('subcontractors', newSubs); }} className={`text-[10px] font-black uppercase px-6 py-3 border-none rounded-2xl outline-none transition-all ${sub.posStatus === DocStatus.OK ? 'bg-emerald-500 text-white' : 'bg-red-600 text-white'}`}><option value={DocStatus.MISSING}>POS Assente</option><option value={DocStatus.OK}>POS OK</option></select></div><div><label className="text-[9px] font-black uppercase text-slate-400 block mb-2">Allegati</label><select value={sub.attachmentsStatus || DocStatus.MISSING} onChange={(e) => { const newSubs = localSite.subcontractors.map(it => it.id === sub.id ? { ...it, attachmentsStatus: e.target.value as DocStatus } : it); updateLocalField('subcontractors', newSubs); }} className={`text-[10px] font-black uppercase px-6 py-3 border-none rounded-2xl outline-none transition-all ${sub.attachmentsStatus === DocStatus.OK ? 'bg-emerald-500 text-white' : 'bg-red-600 text-white'}`}><option value={DocStatus.MISSING}>No Allegati</option><option value={DocStatus.OK}>Allegati OK</option></select></div></div><button onClick={() => removeSub(sub.id)} className="w-16 h-16 flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-300 hover:text-red-600 rounded-3xl"><i className="fas fa-user-minus"></i></button></div></div>))}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConstructionSiteList;
