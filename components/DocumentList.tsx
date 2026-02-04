
import React, { useState } from 'react';
import { CorporateDocument, DeadlineStatus } from '../types';

interface DocumentListProps {
  documents: CorporateDocument[];
  setDocuments: React.Dispatch<React.SetStateAction<CorporateDocument[]>>;
  searchTerm: string;
  // Added isAdmin property to match App.tsx usage
  isAdmin: boolean;
}

const DocumentList: React.FC<DocumentListProps> = ({ documents, setDocuments, searchTerm, isAdmin }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredDocs = documents.filter(d => 
    d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const exportPDF = () => {
    const { jsPDF } = (window as any).jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text("Archivio Documentazione Aziendale", 14, 20);
    
    const tableData = documents.map(d => [
      d.title,
      d.category,
      d.version,
      new Date(d.expiryDate).toLocaleDateString('it-IT'),
      d.tags.join(', ')
    ]);
    
    (doc as any).autoTable({
      startY: 30,
      head: [['Documento', 'Categoria', 'Vers.', 'Scadenza', 'Tag']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] }
    });
    
    doc.save(`Archivio_Documenti_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleDelete = (id: string) => {
    // Only admins are allowed to delete documents
    if (!isAdmin) return alert("Azione non consentita: Solo un Amministratore può eliminare documenti.");
    if(confirm("Eliminare definitivamente questo documento?")) {
      setDocuments(prev => prev.filter(d => d.id !== id));
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const file = (formData.get('pdfFile') as File);
    let fileData = '';
    let fileName = '';
    if (file && file.size > 0) {
      fileName = file.name;
      const reader = new FileReader();
      fileData = await new Promise((resolve) => {
        reader.onload = (re) => resolve(re.target?.result as string);
        reader.readAsDataURL(file);
      });
    }
    const newDoc: CorporateDocument = {
      id: `doc-${Date.now()}`,
      title: formData.get('title') as string,
      category: formData.get('category') as string,
      version: formData.get('version') as string || '1.0',
      expiryDate: formData.get('expiryDate') as string,
      tags: (formData.get('tags') as string).split(',').map(t => t.trim()),
      status: DeadlineStatus.ACTIVE,
      fileData,
      fileName
    };
    setDocuments(prev => [...prev, newDoc]);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-tight">Archivio Documentale</h3>
          <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Gestione certificazioni e conformità societaria.</p>
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
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl hover:bg-blue-700 transition-all flex items-center space-x-3 shadow-2xl shadow-blue-500/30 font-black uppercase text-xs tracking-widest active:scale-95"
          >
            <i className="fas fa-file-upload"></i>
            <span>Carica Documento</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredDocs.map((doc) => (
          <div key={doc.id} className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between group transition-all hover:border-blue-300">
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center text-2xl shadow-inner">
                <i className="fas fa-file-pdf"></i>
              </div>
              <div>
                <h5 className="font-black text-gray-900 dark:text-white uppercase tracking-tight text-lg leading-none">{doc.title}</h5>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{doc.category}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Versione {doc.version}</span>
                  {doc.fileName && <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold uppercase truncate max-w-[150px]"><i className="fas fa-paperclip mr-1"></i> {doc.fileName}</span>}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-10 mt-6 md:mt-0">
              <div className="text-right">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Data Scadenza</p>
                <p className="text-sm font-black text-slate-800 dark:text-slate-200">{new Date(doc.expiryDate).toLocaleDateString('it-IT')}</p>
              </div>
              <div className="flex space-x-3">
                {doc.fileData && (
                  <a href={doc.fileData} download={doc.fileName || 'documento.pdf'} className="w-12 h-12 flex items-center justify-center rounded-2xl text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                    <i className="fas fa-download"></i>
                  </a>
                )}
                {/* Gate delete button with isAdmin check */}
                {isAdmin && (
                  <button onClick={() => handleDelete(doc.id)} className="w-12 h-12 flex items-center justify-center rounded-2xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all border border-transparent dark:border-slate-700">
                    <i className="fas fa-trash-alt"></i>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {filteredDocs.length === 0 && (
          <div className="p-32 text-center bg-white dark:bg-slate-800 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-slate-700">
             <i className="fas fa-folder-open text-slate-200 dark:text-slate-700 text-6xl mb-6"></i>
             <p className="text-slate-400 dark:text-slate-500 font-black uppercase text-xs tracking-[0.2em]">Nessun documento in archivio</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-slate-800 rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in duration-300 border border-white/10">
            <div className="p-10 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
              <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Archiviazione Documento</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-all text-xl"><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={handleSave} className="p-10 space-y-8">
              <input name="title" required placeholder="Titolo Documento (es: DURC, Visura...)" className="w-full p-5 bg-slate-50 dark:bg-slate-700 border-none rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 font-black dark:text-white" />
              <div className="grid grid-cols-2 gap-6">
                <select name="category" className="w-full p-5 bg-slate-50 dark:bg-slate-700 border-none rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 font-black dark:text-white">
                  <option>Amministrativo</option>
                  <option>Certificazioni</option>
                  <option>Sicurezza</option>
                  <option>Contrattualistica</option>
                  <option>Altro</option>
                </select>
                <input name="version" placeholder="Versione (es: 1.0, 2024.1...)" className="w-full p-5 bg-slate-50 dark:bg-slate-700 border-none rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 font-black dark:text-white" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-2 tracking-widest">Data Scadenza Validità</label>
                  <input name="expiryDate" type="date" required className="w-full p-5 bg-slate-50 dark:bg-slate-700 border-none rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 font-black dark:text-white" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-2 tracking-widest">Carica File PDF</label>
                  <input name="pdfFile" type="file" accept=".pdf" className="w-full p-5 bg-slate-50 dark:bg-slate-700 border-none rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 font-black dark:text-white text-xs" />
                </div>
              </div>
              <input name="tags" placeholder="Tag associati (es: INPS, CCIAA, INAIL...)" className="w-full p-5 bg-slate-50 dark:bg-slate-700 border-none rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 font-black dark:text-white" />
              <div className="pt-6 flex space-x-6">
                <button type="submit" className="flex-1 px-8 py-5 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-2xl shadow-blue-500/30 hover:bg-blue-700 transition-all active:scale-95"><i className="fas fa-check-circle mr-3"></i>Salva in Archivio</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentList;
