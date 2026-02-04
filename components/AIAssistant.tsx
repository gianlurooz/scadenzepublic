
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Employee, Vehicle, ConstructionSite, CorporateDocument } from '../types';

interface AIAssistantProps {
  employees: Employee[];
  vehicles: Vehicle[];
  sites: ConstructionSite[];
  documents: CorporateDocument[];
}

const AIAssistant: React.FC<AIAssistantProps> = ({ employees, vehicles, sites, documents }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([
    { role: 'model', text: 'Buongiorno! Sono il tuo consulente Scadenze+. Come posso supportarti oggi nella gestione delle scadenze o nella compilazione dei dati?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Prepariamo il contesto dei dati attuali per l'IA
      const context = {
        n_dipendenti: employees.length,
        n_mezzi: vehicles.length,
        n_cantieri: sites.length,
        n_documenti: documents.length,
        scadenze_critiche: employees.flatMap(e => e.deadlines.filter(d => d.status !== 'ACTIVE').map(d => `${e.firstName} ${e.lastName}: ${d.title}`)),
        cantieri_attivi: sites.map(s => s.name)
      };

      const systemInstruction = `
        Agisci come un Consulente Senior esperto in gestione aziendale per PMI italiane. 
        Tuo compito è supportare l'utente nell'uso del gestionale Scadenze+ e fornire consigli esperti su:
        1. Sicurezza sul lavoro (D.Lgs 81/08): visite mediche, formazione, DPI.
        2. Gestione Mezzi: scadenze tecniche, revisioni, bolli.
        3. Cantieristica: conformità POS, allegati, subappalti, DURC, occupazione suolo pubblico.
        4. Documentazione: Certificazioni ISO, CCIAA, Regolarità contributiva.

        CONTESTO ATTUALE DELL'AZIENDA:
        ${JSON.stringify(context)}

        REGOLE:
        - Sii professionale, preciso e cordiale.
        - Se l'utente chiede come compilare qualcosa, spiega i passaggi logici.
        - Se noti scadenze critiche nel contesto, falle presente se pertinente.
        - Usa un linguaggio tecnico ma accessibile.
        - Rispondi sempre in italiano.
        - Riferisciti all'app sempre come "Scadenze+".
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [...messages.map(m => ({ role: m.role, parts: [{ text: m.text }] })), { role: 'user', parts: [{ text: userMessage }] }],
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        },
      });

      const aiText = response.text || "Mi scuso, ho avuto un problema nel processare la richiesta.";
      setMessages(prev => [...prev, { role: 'model', text: aiText }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Errore di connessione con l'assistente AI. Verifica la tua chiave API." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[350px] md:w-[450px] h-[550px] bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 duration-300">
          {/* Header */}
          <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <i className="fas fa-robot text-lg"></i>
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-tight">Expert Advisor</p>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mr-2"></span>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">AI Online</p>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50 dark:bg-slate-900/50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                <div className={`max-w-[85%] p-4 rounded-[1.5rem] text-sm shadow-sm ${
                  m.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-none border border-gray-100 dark:border-slate-700'
                }`}>
                  <p className="leading-relaxed font-medium">{m.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-[1.5rem] border border-gray-100 dark:border-slate-700 flex space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-slate-800 border-t dark:border-slate-700">
            <div className="relative">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Chiedi supporto esperto..."
                className="w-full pl-6 pr-14 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-[1.5rem] text-sm font-bold focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all dark:text-white"
              />
              <button 
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute right-2 top-2 w-10 h-10 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/40 hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                <i className="fas fa-paper-plane text-xs"></i>
              </button>
            </div>
            <p className="text-[8px] text-center text-slate-400 mt-3 font-black uppercase tracking-widest">
              Potenziato da Gemini 3 Expert AI
            </p>
          </form>
        </div>
      )}

      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl transition-all duration-500 active:scale-90 group relative ${isOpen ? 'bg-slate-900 rotate-90' : 'bg-blue-600 hover:bg-blue-700'}`}
      >
        <i className={`fas ${isOpen ? 'fa-times' : 'fa-robot'} text-2xl`}></i>
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
          </span>
        )}
      </button>
    </div>
  );
};

export default AIAssistant;
