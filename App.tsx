
import React, { useState, useMemo, useEffect } from 'react';
import { UserRole, User, Category, DeadlineStatus, Employee, Vehicle, CorporateDocument, Deadline, AdminProfile, ConstructionSite } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import PersonnelList from './components/PersonnelList';
import VehicleList from './components/VehicleList';
import DocumentList from './components/DocumentList';
import ConstructionSiteList from './components/ConstructionSiteList';
import ActionPlanList from './components/ActionPlanList'; 
import Header from './components/Header';
import Login from './components/Login';
import ProfileSettings from './components/ProfileSettings';
import AIAssistant from './components/AIAssistant';
import { MOCK_EMPLOYEES, MOCK_VEHICLES, MOCK_DOCS } from './constants';

interface AppUser extends User {
  password?: string;
}

const App: React.FC = () => {
  // --- STATO AUTENTICAZIONE ---
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('dp_logged') === 'true';
  });
  
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    const saved = localStorage.getItem('dp_current_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  // --- DATABASE UTENTI ---
  const [users, setUsers] = useState<AppUser[]>(() => {
    const saved = localStorage.getItem('dp_users');
    return saved ? JSON.parse(saved) : [
      { username: 'admin', role: UserRole.ADMIN, name: 'Amministratore', password: 'admin' },
      { username: 'editor', role: UserRole.EDITOR, name: 'Operatore Editor', password: 'editor' }
    ];
  });

  // --- STATI GESTIONE UTENTI (UI) ---
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', username: '', password: '', role: UserRole.EDITOR });

  // --- IMPOSTAZIONI AZIENDALI ---
  const [companyName, setCompanyName] = useState(() => localStorage.getItem('dp_company_name') || 'Mia Azienda S.r.l.');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'personnel' | 'fleet' | 'documents' | 'settings' | 'profile' | 'sites' | 'actions'>('dashboard');
  const [globalSearch, setGlobalSearch] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('dp_theme') as 'light' | 'dark') || 'light');
  
  const [adminProfile, setAdminProfile] = useState<AdminProfile>(() => {
    const saved = localStorage.getItem('dp_profile');
    return saved ? JSON.parse(saved) : {
      name: 'Responsabile Sicurezza',
      email: 'gestione@azienda.it',
      avatarUrl: 'https://api.dicebear.com/7.x/notionists/svg?seed=Felix'
    };
  });

  // --- DATABASE ASSET ---
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('dp_employees');
    return saved ? JSON.parse(saved) : MOCK_EMPLOYEES;
  });
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem('dp_vehicles');
    return saved ? JSON.parse(saved) : MOCK_VEHICLES;
  });
  const [documents, setDocuments] = useState<CorporateDocument[]>(() => {
    const saved = localStorage.getItem('dp_documents');
    return saved ? JSON.parse(saved) : MOCK_DOCS;
  });
  const [sites, setSites] = useState<ConstructionSite[]>(() => {
    const saved = localStorage.getItem('dp_sites');
    return saved ? JSON.parse(saved) : [];
  });

  // --- EFFETTI DI PERSISTENZA ---
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('dp_theme', theme);
  }, [theme]);

  useEffect(() => { localStorage.setItem('dp_employees', JSON.stringify(employees)); }, [employees]);
  useEffect(() => { localStorage.setItem('dp_vehicles', JSON.stringify(vehicles)); }, [vehicles]);
  useEffect(() => { localStorage.setItem('dp_documents', JSON.stringify(documents)); }, [documents]);
  useEffect(() => { localStorage.setItem('dp_sites', JSON.stringify(sites)); }, [sites]);
  useEffect(() => { localStorage.setItem('dp_company_name', companyName); }, [companyName]);
  useEffect(() => { localStorage.setItem('dp_profile', JSON.stringify(adminProfile)); }, [adminProfile]);
  useEffect(() => { localStorage.setItem('dp_users', JSON.stringify(users)); }, [users]);
  
  useEffect(() => { 
    if (isLoggedIn && currentUser) {
      localStorage.setItem('dp_logged', 'true');
      localStorage.setItem('dp_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('dp_logged');
      localStorage.removeItem('dp_current_user');
    }
  }, [isLoggedIn, currentUser]);

  // --- LOGICA DI LOGOUT ---
  const handleLogout = () => {
    // 1. Pulizia fisica immediata del localStorage
    localStorage.removeItem('dp_logged');
    localStorage.removeItem('dp_current_user');
    
    // 2. Reset atomico degli stati per forzare il rendering del componente Login
    setIsLoggedIn(false);
    setCurrentUser(null);
    
    // 3. Reset navigazione e UI
    setActiveTab('dashboard');
    setIsMobileMenuOpen(false);
    setGlobalSearch('');
  };

  const isAdmin = currentUser?.role === UserRole.ADMIN;

  const handleFactoryReset = () => {
    if (!isAdmin) return;
    const adminUser = users.find(u => u.username === 'admin');
    const pwd = prompt("SICUREZZA: Password amministratore per il reset totale:");
    if (pwd === adminUser?.password) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleBackup = () => {
    const data = { companyName, adminProfile, employees, vehicles, documents, sites, users };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_scadenze_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !isAdmin) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.users) setUsers(data.users);
        if (data.employees) setEmployees(data.employees);
        if (data.vehicles) setVehicles(data.vehicles);
        if (data.documents) setDocuments(data.documents);
        alert("Dati ripristinati correttamente.");
      } catch (err) { alert("File di backup non valido."); }
    };
    reader.readAsText(file);
  };

  const allDeadlines = useMemo(() => {
    const today = new Date();
    const checkStatus = (dateStr: string): DeadlineStatus => {
      const d = new Date(dateStr);
      const diffDays = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays < 0) return DeadlineStatus.EXPIRED;
      if (diffDays <= 30) return DeadlineStatus.WARNING;
      return DeadlineStatus.ACTIVE;
    };
    const personnel = employees.flatMap(e => e.deadlines.map(d => ({ ...d, status: checkStatus(d.dueDate), owner: `${e.firstName} ${e.lastName}` })));
    const fleet = vehicles.flatMap(v => v.deadlines.map(d => ({ ...d, status: checkStatus(d.dueDate), owner: v.plate })));
    const docs = documents.map(d => ({ id: d.id, title: d.title, dueDate: d.expiryDate, status: checkStatus(d.expiryDate), category: Category.CORPORATE, description: d.category, owner: 'Azienda' }));
    return [...personnel, ...fleet, ...docs];
  }, [employees, vehicles, documents]);

  // --- LOGICA UTENTI ---
  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.username || !newUser.password) {
      alert("Tutti i campi sono obbligatori.");
      return;
    }
    
    const lowerUsername = newUser.username.toLowerCase().trim();
    if (users.find(u => u.username.toLowerCase() === lowerUsername)) {
      alert("Questo username è già in uso.");
      return;
    }
    
    const userToSave: AppUser = {
      ...newUser,
      username: lowerUsername
    };

    setUsers(prev => [...prev, userToSave]);
    setNewUser({ name: '', username: '', password: '', role: UserRole.EDITOR });
    setIsAddingUser(false);
    alert(`Utente "${userToSave.name}" creato con successo.`);
  };

  const updateUserPassword = (username: string, newPass: string) => {
    setUsers(prev => prev.map(u => u.username === username ? { ...u, password: newPass } : u));
    alert("Password aggiornata correttamente.");
  };

  const deleteUser = (username: string) => {
    if (username === currentUser?.username) return alert("Non puoi eliminare il tuo account mentre sei connesso.");
    if (username === 'admin') return alert("L'amministratore principale non può essere rimosso.");
    if (confirm(`Sei sicuro di voler eliminare l'utente ${username}?`)) {
      setUsers(prev => prev.filter(u => u.username !== username));
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard deadlines={allDeadlines} searchTerm={globalSearch} />;
      case 'actions': return <ActionPlanList deadlines={allDeadlines} />;
      case 'personnel': return <PersonnelList employees={employees} setEmployees={setEmployees} searchTerm={globalSearch} isAdmin={isAdmin} />;
      case 'fleet': return <VehicleList vehicles={vehicles} setVehicles={setVehicles} searchTerm={globalSearch} isAdmin={isAdmin} />;
      case 'documents': return <DocumentList documents={documents} setDocuments={setDocuments} searchTerm={globalSearch} isAdmin={isAdmin} />;
      case 'sites': return <ConstructionSiteList sites={sites} setSites={setSites} searchTerm={globalSearch} isAdmin={isAdmin} />;
      case 'profile': return <ProfileSettings profile={adminProfile} setProfile={setAdminProfile} theme={theme} setTheme={setTheme} />;
      case 'settings':
        if (!isAdmin) return <div className="p-20 text-center font-black uppercase text-slate-300"><h2>Accesso Riservato Amministratore</h2></div>;
        return (
          <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
            <h2 className="text-3xl font-black dark:text-white uppercase tracking-tighter">Impostazioni</h2>
            
            <div className="md:col-span-2 bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] border border-gray-100 dark:border-slate-700 shadow-sm space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-black dark:text-white uppercase tracking-tight flex items-center">
                  <i className="fas fa-users-cog mr-4 text-blue-600"></i> Gestione Utenti & Password
                </h3>
                {!isAddingUser && (
                  <button onClick={() => setIsAddingUser(true)} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all">
                    + Crea Nuovo Profilo
                  </button>
                )}
              </div>

              {isAddingUser && (
                <form onSubmit={handleAddUserSubmit} className="bg-slate-50 dark:bg-slate-900/50 p-8 rounded-[2rem] border-2 border-blue-100 dark:border-blue-900/30 space-y-6 animate-in zoom-in duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Nome Completo</label>
                      <input type="text" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="w-full p-4 bg-white dark:bg-slate-800 rounded-xl font-bold dark:text-white border-none focus:ring-2 focus:ring-blue-500" placeholder="Esempio: Mario Rossi" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Username (per il login)</label>
                      <input type="text" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} className="w-full p-4 bg-white dark:bg-slate-800 rounded-xl font-bold dark:text-white border-none focus:ring-2 focus:ring-blue-500" placeholder="mrossi" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Password Iniziale</label>
                      <input type="text" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="w-full p-4 bg-white dark:bg-slate-800 rounded-xl font-bold dark:text-white border-none focus:ring-2 focus:ring-blue-500" placeholder="Scegli una password" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Ruolo di Accesso</label>
                      <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})} className="w-full p-4 bg-white dark:bg-slate-800 rounded-xl font-bold dark:text-white border-none focus:ring-2 focus:ring-blue-500">
                        <option value={UserRole.EDITOR}>Editor (Gestione Dati)</option>
                        <option value={UserRole.ADMIN}>Admin (Controllo Totale)</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button type="submit" className="flex-1 bg-emerald-600 text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-emerald-700 transition-all">Salva Account</button>
                    <button type="button" onClick={() => setIsAddingUser(false)} className="px-8 py-4 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-red-500">Annulla</button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {users.map(u => (
                  <div key={u.username} className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex flex-col justify-between group transition-all hover:border-blue-200">
                    <div className="flex justify-between items-start mb-4">
                      <span className={`px-4 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest ${u.role === UserRole.ADMIN ? 'bg-blue-600 text-white' : 'bg-slate-400 text-white'}`}>{u.role}</span>
                      {u.username !== 'admin' && (
                        <button onClick={() => deleteUser(u.username)} className="text-slate-300 hover:text-red-500 transition-colors"><i className="fas fa-trash-can"></i></button>
                      )}
                    </div>
                    <p className="font-black dark:text-white text-lg uppercase tracking-tight truncate leading-none">{u.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-widest">Login: @{u.username}</p>
                    
                    <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                       <label className="text-[8px] font-black uppercase text-slate-400 tracking-widest mb-2 block">Modifica Password</label>
                       <div className="flex gap-2">
                         <input 
                           type="text" 
                           defaultValue={u.password} 
                           onBlur={(e) => { 
                             if(e.target.value !== u.password && e.target.value.trim() !== '') {
                               updateUserPassword(u.username, e.target.value); 
                             }
                           }}
                           className="flex-1 bg-white dark:bg-slate-800 border-none rounded-xl px-4 py-2 text-xs font-bold dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                           placeholder="Digita nuova password..." 
                         />
                         <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 flex items-center justify-center rounded-xl text-slate-400">
                           <i className="fas fa-key text-xs"></i>
                         </div>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] border border-gray-100 dark:border-slate-700 shadow-sm space-y-6">
                <h3 className="text-xl font-black dark:text-white uppercase tracking-tight flex items-center"><i className="fas fa-building mr-4 text-blue-600"></i> Nome Azienda</h3>
                <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full p-5 bg-slate-50 dark:bg-slate-900/50 border-none rounded-2xl font-black dark:text-white outline-none focus:ring-4 focus:ring-blue-100" />
              </div>
              <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white shadow-2xl space-y-8">
                <h3 className="text-xl font-black uppercase tracking-tight">Manutenzione Database</h3>
                <div className="flex flex-wrap gap-4">
                   <button onClick={handleBackup} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest active:scale-95"><i className="fas fa-download mr-2"></i>Export JSON</button>
                   <label className="bg-white/10 hover:bg-white/20 px-6 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest cursor-pointer active:scale-95 flex items-center border border-white/10">
                      <i className="fas fa-upload mr-2"></i> Importa Backup
                      <input type="file" accept=".json" onChange={handleRestore} className="hidden" />
                   </label>
                </div>
              </div>
              <div className="md:col-span-2 bg-red-600/5 p-10 rounded-[2.5rem] border border-red-200 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h4 className="text-lg font-black text-red-700 uppercase tracking-tight">Area Critica: Reset Sistema</h4>
                  <p className="text-xs text-red-600/70 font-bold uppercase">Cancellazione di tutti i dati salvati e ritorno alle impostazioni iniziali.</p>
                </div>
                <button onClick={handleFactoryReset} className="bg-red-600 text-white px-10 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-700 shadow-xl active:scale-95">Reset Totale</button>
              </div>
            </div>
          </div>
        );
      default: return <Dashboard deadlines={allDeadlines} searchTerm={globalSearch} />;
    }
  };

  // --- RENDER CONDITION ---
  if (!isLoggedIn || !currentUser) {
    return (
      <Login 
        onLogin={(user) => { 
          const dbUser = users.find(u => u.username.toLowerCase() === user.username.toLowerCase());
          setCurrentUser(dbUser || user);
          setIsLoggedIn(true);
        }} 
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-500">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => { setActiveTab(tab); setIsMobileMenuOpen(false); }} 
        appName="Scadenze+" 
        subtitle={companyName} 
        profile={adminProfile} 
        onLogout={handleLogout} 
        isOpen={isMobileMenuOpen} 
        setIsOpen={setIsMobileMenuOpen} 
        isAdmin={isAdmin} 
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header activeTab={activeTab} search={globalSearch} setSearch={setGlobalSearch} deadlines={allDeadlines} onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">{renderContent()}</div>
          <AIAssistant employees={employees} vehicles={vehicles} sites={sites} documents={documents} />
        </main>
      </div>
    </div>
  );
};

export default App;
