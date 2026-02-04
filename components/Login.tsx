
import React, { useState } from 'react';
import { User, UserRole } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Recupera gli utenti dal localStorage per permettere il login ai nuovi account creati
    const savedUsers = localStorage.getItem('dp_users');
    const users = savedUsers ? JSON.parse(savedUsers) : [
      { username: 'admin', password: 'admin', role: UserRole.ADMIN, name: 'Amministratore' },
      { username: 'editor', password: 'editor', role: UserRole.EDITOR, name: 'Operatore Editor' }
    ];

    const account = users.find((a: any) => 
      a.username.toLowerCase() === username.toLowerCase() && 
      (a.password === password || (a.pass === password)) // Supporto per entrambi i formati di salvataggio passati
    );
    
    if (account) {
      onLogin({
        username: account.username,
        role: account.role,
        name: account.name
      });
    } else {
      setError('Credenziali non valide. Verifica username e password.');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6 relative overflow-hidden">
      {/* Background decorativo */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-10 left-10 w-96 h-96 bg-blue-600 blur-[150px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-600 blur-[150px] rounded-full animate-pulse delay-700"></div>
      </div>

      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-[3rem] shadow-2xl overflow-hidden p-12 animate-in fade-in zoom-in duration-500 relative z-10 border border-white/5">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-white text-4xl shadow-2xl shadow-blue-500/40 border-4 border-white/10 italic font-black">
            S+
          </div>
          <h2 className="text-4xl font-black text-gray-800 dark:text-white uppercase tracking-tighter">Scadenze +</h2>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-3 text-center">Gestore Conformità & Sicurezza Aziendale</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[10px] font-black uppercase rounded-2xl border border-red-100 dark:border-red-900/30 flex items-center animate-shake">
              <i className="fas fa-exclamation-triangle mr-3"></i>
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Utente</label>
            <input 
              type="text"
              required
              autoFocus
              className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all dark:text-white font-bold"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Password</label>
            <input 
              type="password" 
              required
              className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all dark:text-white font-bold"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/30 active:scale-95"
            >
              Accedi al Sistema
            </button>
          </div>
        </form>

        <div className="mt-12 pt-8 border-t border-gray-100 dark:border-slate-700 text-center">
           <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest italic">Piattaforma Protetta - Accesso Riservato</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
