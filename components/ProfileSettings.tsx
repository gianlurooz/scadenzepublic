
import React, { useState } from 'react';
import { AdminProfile } from '../types';

interface ProfileSettingsProps {
  profile: AdminProfile;
  setProfile: (profile: AdminProfile) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

const AVATAR_PRESETS = [
  'https://api.dicebear.com/7.x/notionists/svg?seed=Admin',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Manager',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Director',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Analyst',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Felix',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Sarah',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Toby',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Max',
];

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ profile, setProfile, theme, setTheme }) => {
  const [email, setEmail] = useState(profile.email);
  const [name, setName] = useState(profile.name);
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatarUrl);

  const handleSave = () => {
    setProfile({
      name,
      email,
      avatarUrl: selectedAvatar
    });
    alert('Profilo aggiornato con successo!');
  };

  return (
    <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom-4 duration-500 space-y-8">
      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
        <div className="p-10 border-b border-gray-100 dark:border-slate-700 bg-gradient-to-r from-slate-900 to-slate-800 text-white relative">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8 text-center md:text-left">
            <div className="relative">
              <img 
                src={selectedAvatar} 
                alt="Avatar" 
                className="w-32 h-32 rounded-[2rem] border-4 border-white/20 bg-slate-700 shadow-2xl backdrop-blur-md" 
              />
              <div className="absolute -bottom-2 -right-2 bg-blue-600 w-10 h-10 rounded-2xl flex items-center justify-center border-4 border-slate-900 shadow-xl">
                <i className="fas fa-pencil text-xs"></i>
              </div>
            </div>
            <div className="pt-2">
              <h2 className="text-3xl font-black tracking-tight">{name}</h2>
              <p className="text-slate-400 font-bold text-sm mt-2 uppercase tracking-widest">{email}</p>
              <div className="mt-4 inline-flex items-center px-4 py-1.5 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-tighter">
                <i className="fas fa-shield-check mr-2 text-blue-400"></i> Account Amministratore
              </div>
            </div>
          </div>
        </div>

        <div className="p-10 space-y-10">
          <div className="space-y-6">
            <h3 className="text-xl font-black text-gray-800 dark:text-white flex items-center">
              <i className="fas fa-id-card mr-3 text-blue-500"></i>
              Anagrafica Utente
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Nome Completo</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-700/50 border-none rounded-2xl focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 outline-none text-sm font-bold transition-all dark:text-white"
                  placeholder="Il tuo nome"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Email Aziendale</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-700/50 border-none rounded-2xl focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 outline-none text-sm font-bold transition-all dark:text-white"
                  placeholder="la-tua-email@azienda.it"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-black text-gray-800 dark:text-white flex items-center">
              <i className="fas fa-palette mr-3 text-blue-500"></i>
              Preferenze Interfaccia
            </h3>
            <div className="p-6 bg-slate-50 dark:bg-slate-700/30 rounded-3xl border border-slate-100 dark:border-slate-700/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <p className="text-sm font-black dark:text-white">Modalità Visiva</p>
                <p className="text-xs text-slate-400 font-bold uppercase mt-1">Scegli tra tema chiaro o scuro</p>
              </div>
              <div className="flex bg-white dark:bg-slate-800 p-1.5 rounded-2xl shadow-sm w-fit border border-gray-100 dark:border-slate-700">
                <button 
                  onClick={() => setTheme('light')}
                  className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center ${theme === 'light' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}
                >
                  <i className="fas fa-sun mr-2 text-sm"></i> Chiaro
                </button>
                <button 
                  onClick={() => setTheme('dark')}
                  className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center ${theme === 'dark' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}
                >
                  <i className="fas fa-moon mr-2 text-sm"></i> Scuro
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-black text-gray-800 dark:text-white flex items-center">
              <i className="fas fa-user-tie mr-3 text-blue-500"></i>
              Avatar Professionale
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-4">
              {AVATAR_PRESETS.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedAvatar(url)}
                  className={`relative w-full aspect-square rounded-2xl border-4 transition-all overflow-hidden ${
                    selectedAvatar === url ? 'border-blue-500 scale-110 shadow-2xl z-10' : 'border-transparent hover:border-gray-200 dark:hover:border-slate-600 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt={`Preset ${idx}`} className="w-full h-full bg-slate-50 dark:bg-slate-900" />
                  {selectedAvatar === url && (
                    <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                         <i className="fas fa-check text-white text-[10px]"></i>
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-8 border-t border-gray-100 dark:border-slate-700 flex justify-end">
            <button 
              onClick={handleSave}
              className="px-10 py-5 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-2xl shadow-blue-500/30 hover:bg-blue-700 transition-all flex items-center space-x-3 active:scale-95"
            >
              <i className="fas fa-save"></i>
              <span>Aggiorna Profilo</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 p-8 rounded-[2rem] flex items-start space-x-6">
        <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg">
          <i className="fas fa-info-circle text-xl"></i>
        </div>
        <div>
          <h4 className="font-black text-blue-900 dark:text-blue-400 text-lg uppercase tracking-tight">Sicurezza & Privacy</h4>
          <p className="text-blue-800 dark:text-blue-300 text-sm mt-1 font-medium">
            I tuoi dati di profilo e le preferenze del tema sono salvati localmente. Nessuna informazione personale viene trasmessa a server esterni, garantendo la conformità GDPR per il tuo account.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
