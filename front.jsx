import React, { useState, useEffect } from 'react';
import { 
  Mic, Volume2, Globe, LogOut, MessageSquare, 
  Stethoscope, ClipboardList, BookOpen, User, 
  PlusCircle, Heart, AlertCircle, ChevronRight, 
  Menu, X, ArrowLeft, Send, FileText, Shield
} from 'lucide-react';

// --- Mock Data & Translations ---
const LANGUAGES = [
  { code: 'en', name: 'English' }, { code: 'hi', name: 'हिन्दी' },
  { code: 'bn', name: 'বাংলা' }, { code: 'te', name: 'తెలుగు' },
  { code: 'mr', name: 'मराठी' }, { code: 'ta', name: 'தமிழ்' },
  // ... add all 22 as needed
];

const TRANSLATIONS = {
  en: { welcome: "Welcome to Healify", start: "Get Started", dashboard: "Dashboard", chat: "AI Counselor", prescriptions: "Prescriptions", vitals: "Health Tracker", library: "Medical Library", logout: "Log Out" },
  hi: { welcome: "हीलीफाई में आपका स्वागत है", start: "शुरू करें", dashboard: "डैशबोर्ड", chat: "AI परामर्शदाता", prescriptions: "नुस्खे", vitals: "स्वास्थ्य ट्रैकर", library: "चिकित्सा पुस्तकालय", logout: "लॉग आउट" },
};

export default function HealifyApp() {
  const [page, setPage] = useState('language-select'); // language-select -> login -> dashboard
  const [lang, setLang] = useState('en');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  // --- Accessibility: Text to Speech ---
  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const t = (key) => TRANSLATIONS[lang]?.[key] || TRANSLATIONS['en'][key];

  // --- Components ---

  const LanguageSelect = () => (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border-t-8 border-teal-600">
        <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Globe className="text-teal-600 w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Healify</h1>
        <p className="text-slate-500 mb-8">Please select your preferred language</p>
        <div className="grid grid-cols-2 gap-3 mb-8">
          {LANGUAGES.map((l) => (
            <button 
              key={l.code}
              onClick={() => { setLang(l.code); setPage('login'); }}
              className="p-4 text-left border-2 rounded-xl hover:border-teal-600 hover:bg-teal-50 transition-all font-medium text-slate-700"
            >
              {l.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const LoginPage = () => (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-teal-600">{t('welcome')}</h2>
          <button onClick={() => setPage('language-select')} className="text-slate-400"><ArrowLeft size={20}/></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Phone Number / ID</label>
            <input type="text" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Enter your details" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Password</label>
            <input type="password" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="••••••••" />
          </div>
          <button 
            onClick={() => { setUser({name: 'Rajesh Kumar'}); setPage('dashboard'); }}
            className="w-full py-4 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-200"
          >
            {t('start')}
          </button>
        </div>
      </div>
    </div>
  );

  const Navbar = () => (
    <nav className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-3">
        <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2"><Menu /></button>
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setPage('dashboard')}>
          <div className="bg-teal-600 p-1.5 rounded-lg"><Shield className="text-white w-5 h-5" /></div>
          <span className="text-xl font-bold text-teal-600 tracking-tight">Healify</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border">
          <Globe size={16} className="text-slate-500" />
          <select 
            value={lang} 
            onChange={(e) => setLang(e.target.value)} 
            className="bg-transparent text-sm font-medium outline-none cursor-pointer"
          >
            {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
          </select>
        </div>
        <button 
          onClick={() => { if(window.confirm("Are you sure you want to log out?")) setPage('login'); }}
          className="flex items-center gap-2 text-red-500 font-medium hover:bg-red-50 px-3 py-2 rounded-lg transition-all border border-transparent hover:border-red-200"
        >
          <LogOut size={18} /> <span className="hidden sm:inline">{t('logout')}</span>
        </button>
      </div>
    </nav>
  );

  const Dashboard = () => (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-800">Hello, {user?.name}! 👋</h1>
        <p className="text-slate-500">How are you feeling today?</p>
      </header>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div onClick={() => setPage('ai-chat')} className="group cursor-pointer bg-purple-50 p-6 rounded-3xl border-l-4 border-purple-500 hover:shadow-md transition-all">
          <div className="bg-purple-500 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-purple-200">
            <MessageSquare className="text-white" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">{t('chat')}</h3>
          <p className="text-slate-500 text-sm mb-4">Get instant AI medical guidance</p>
          <div className="flex items-center text-purple-600 font-semibold text-sm group-hover:gap-2 transition-all">
            Start Chat <ChevronRight size={16} />
          </div>
        </div>

        <div onClick={() => setPage('prescriptions')} className="group cursor-pointer bg-orange-50 p-6 rounded-3xl border-l-4 border-orange-500 hover:shadow-md transition-all">
          <div className="bg-orange-500 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-orange-200">
            <ClipboardList className="text-white" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">{t('prescriptions')}</h3>
          <p className="text-slate-500 text-sm mb-4">View your AI-generated scripts</p>
          <div className="flex items-center text-orange-600 font-semibold text-sm group-hover:gap-2 transition-all">
            View All <ChevronRight size={16} />
          </div>
        </div>

        <div onClick={() => setPage('vitals')} className="group cursor-pointer bg-teal-50 p-6 rounded-3xl border-l-4 border-teal-500 hover:shadow-md transition-all">
          <div className="bg-teal-500 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-teal-200">
            <Heart className="text-white" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">{t('vitals')}</h3>
          <p className="text-slate-500 text-sm mb-4">Track your daily health metrics</p>
          <div className="flex items-center text-teal-600 font-semibold text-sm group-hover:gap-2 transition-all">
            Log Vitals <ChevronRight size={16} />
          </div>
        </div>
      </div>

      {/* Vital Trends Section */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">Health Summary</h2>
          <button className="text-teal-600 text-sm font-medium">View Detailed Report</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Blood Pressure', value: '120/80', status: 'Normal', color: 'text-green-500' },
            { label: 'Heart Rate', value: '72 bpm', status: 'Normal', color: 'text-green-500' },
            { label: 'Temperature', value: '98.6°F', status: 'Normal', color: 'text-green-500' },
            { label: 'Weight', value: '75 kg', status: 'Stable', color: 'text-blue-500' },
          ].map((item, i) => (
            <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-xs text-slate-500 font-medium mb-1">{item.label}</p>
              <p className="text-lg font-bold text-slate-800">{item.value}</p>
              <p className={`text-[10px] font-bold uppercase ${item.color}`}>{item.status}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const AIChat = () => {
    const [messages, setMessages] = useState([
      { role: 'ai', text: 'Hello! I am your Healify AI Assistant. Please describe your symptoms or ask a medical question.' }
    ]);
    const [input, setInput] = useState('');

    const sendMsg = () => {
      if(!input) return;
      setMessages([...messages, { role: 'user', text: input }]);
      setInput('');
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'ai', text: 'I am analyzing your symptoms. Based on the data, it seems you have a mild seasonal flu. I recommend resting and staying hydrated. I am generating a preliminary prescription for you now...' }]);
      }, 1000);
    };

    return (
      <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${m.role === 'ai' ? 'bg-white text-slate-800 rounded-tl-none border-l-4 border-purple-500' : 'bg-purple-600 text-white rounded-tr-none'}`}>
                <p className="text-sm leading-relaxed">{m.text}</p>
                {m.role === 'ai' && (
                  <button onClick={() => speak(m.text)} className="mt-2 flex items-center gap-1 text-xs text-purple-500 font-bold uppercase">
                    <Volume2 size={12} /> Listen
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 bg-white border-t flex gap-3 items-center">
          <button className="p-3 bg-slate-100 rounded-full text-slate-500 hover:bg-purple-100 hover:text-purple-600 transition-all">
            <Mic size={20} />
          </button>
          <input 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyPress={(e) => e.key === 'Enter' && sendMsg()}
            className="flex-1 p-3 border rounded-full outline-none focus:ring-2 focus:ring-purple-500" 
            placeholder="Type your symptoms..." 
          />
          <button onClick={sendMsg} className="p-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 shadow-lg shadow-purple-200">
            <Send size={20} />
          </button>
        </div>
      </div>
    );
  };

  const PrescriptionsPage = () => (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">My Prescriptions</h2>
        <button className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium">+ New Request</button>
      </div>
      
      {[1, 2].map(i => (
        <div key={i} className="bg-white p-6 rounded-3xl border shadow-sm space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg text-slate-800">Seasonal Flu Protocol</h3>
              <p className="text-sm text-slate-500">Issued by AI-Health Engine • 24 Oct 2023</p>
            </div>
            <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-bold">Active</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 border-y border-slate-50">
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Medications</p>
              <div className="flex items-center gap-3 text-slate-700">
                <div className="w-2 h-2 bg-teal-500 rounded-full" />
                <span>Paracetamol (500mg) - Twice a day</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <div className="w-2 h-2 bg-teal-500 rounded-full" />
                <span>Vitamin C (1000mg) - Once a day</span>
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Do's & Don'ts</p>
              <p className="text-sm text-slate-600">✅ Drink warm fluids, rest 8+ hours.</p>
              <p className="text-sm text-slate-600">❌ Avoid cold drinks and smoking.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => speak("Your prescription includes Paracetamol 500mg twice a day and Vitamin C once a day. Please drink warm fluids and avoid cold drinks.")} className="flex items-center gap-2 text-xs font-bold text-teal-600 uppercase px-3 py-2 bg-teal-50 rounded-lg">
              <Volume2 size={14} /> Read Aloud
            </button>
            <button className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase px-3 py-2 bg-slate-100 rounded-lg">
              <FileText size={14} /> Download PDF
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  // --- Main Router ---
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {page === 'language-select' && <LanguageSelect />}
      {page === 'login' && <LoginPage />}
      
      {page !== 'language-select' && page !== 'login' && (
        <>
          <Navbar />
          <main className="pb-20 lg:pb-0">
            {page === 'dashboard' && <Dashboard />}
            {page === 'ai-chat' && <AIChat />}
            {page === 'prescriptions' && <PrescriptionsPage />}
            {page === 'vitals' && <div className="p-10 text-center text-slate-500">Vitals Tracker Page Coming Soon...</div>}
          </main>

          {/* Mobile Bottom Nav */}
          <div className="lg:hidden fixed bottom-0 w-full bg-white border-t flex justify-around py-3 px-2 shadow-2xl">
            <button onClick={() => setPage('dashboard')} className={`flex flex-col items-center gap-1 ${page === 'dashboard' ? 'text-teal-600' : 'text-slate-400'}`}>
              <User size={20} /> <span className="text-[10px] font-medium">Home</span>
            </button>
            <button onClick={() => setPage('prescriptions')} className={`flex flex-col items-center gap-1 ${page === 'prescriptions' ? 'text-teal-600' : 'text-slate-400'}`}>
              <ClipboardList size={20} /> <span className="text-[10px] font-medium">Scripts</span>
            </button>
            <button onClick={() => setPage('ai-chat')} className={`flex flex-col items-center gap-1 ${page === 'ai-chat' ? 'text-teal-600' : 'text-slate-400'}`}>
              <MessageSquare size={20} /> <span className="text-[10px] font-medium">AI Chat</span>
            </button>
            <button onClick={() => setPage('vitals')} className={`flex flex-col items-center gap-1 ${page === 'vitals' ? 'text-teal-600' : 'text-slate-400'}`}>
              <Heart size={20} /> <span className="text-[10px] font-medium">Health</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
