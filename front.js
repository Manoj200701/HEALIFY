const API_BASE_URL = 'http://localhost:5000/api';

// Application State
const state = {
    page: 'language-select',
    lang: 'en',
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
};

const TRANSLATIONS = {
    en: { welcome: "Welcome to Healify", start: "Get Started", logout: "Log Out", dash: "Dashboard" },
    hi: { welcome: "हीलीफाई में आपका स्वागत है", start: "शुरू करें", logout: "लॉग आउट", dash: "डैशबोर्ड" },
};

// --- Utility: Voice Assistant ---
function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = state.lang === 'hi' ? 'hi-IN' : 'en-US';
    window.speechSynthesis.speak(utterance);
}

// --- Router: Navigation Logic ---
const router = {
    navigate: (page) => {
        state.page = page;
        render();
        window.scrollTo(0, 0);
    }
};

// --- Pages Templates ---
const Pages = {
    'language-select': () => `
        <div class="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
            <div class="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border-t-8 border-teal-600">
                <div class="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i data-lucide="globe" class="text-teal-600 w-10 h-10"></i>
                </div>
                <h1 class="text-3xl font-bold text-slate-800 mb-2">Healify</h1>
                <p class="text-slate-500 mb-8">Select your preferred language</p>
                <div class="grid grid-cols-2 gap-3 mb-8">
                    <button onclick="setLanguage('en')" class="p-4 border-2 rounded-xl hover:border-teal-600 hover:bg-teal-50 font-medium">English</button>
                    <button onclick="setLanguage('hi')" class="p-4 border-2 rounded-xl hover:border-teal-600 hover:bg-teal-50 font-medium">हिन्दी</button>
                </div>
            </div>
        </div>
    `,
    'login': () => `
        <div class="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
            <div class="max-w-md w-full bg-white rounded-3xl shadow-xl p-8">
                <h2 class="text-2xl font-bold text-teal-600 mb-6">${TRANSLATIONS[state.lang].welcome}</h2>
                <div class="space-y-4">
                    <input id="login-phone" type="text" placeholder="Phone Number" class="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-teal-500">
                    <input id="login-pass" type="password" placeholder="Password" class="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-teal-500">
                    <button onclick="handleLogin()" class="w-full py-4 bg-teal-600 text-white rounded-xl font-bold shadow-lg">${TRANSLATIONS[state.lang].start}</button>
                </div>
            </div>
        </div>
    `,
    'dashboard': () => `
        <nav class="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
            <div class="flex items-center gap-2 cursor-pointer" onclick="router.navigate('dashboard')">
                <div class="bg-teal-600 p-1.5 rounded-lg"><i data-lucide="shield" class="text-white w-5 h-5"></i></div>
                <span class="text-xl font-bold text-teal-600">Healify</span>
            </div>
            <div class="flex items-center gap-4">
                <button onclick="handleLogout()" class="text-red-500 font-medium flex items-center gap-2"><i data-lucide="log-out" class="w-4 h-4"></i> ${TRANSLATIONS[state.lang].logout}</button>
            </div>
        </nav>
        <div class="p-6 max-w-7xl mx-auto space-y-8">
            <header>
                <h1 class="text-2xl font-bold text-slate-800">Hello, ${state.user?.name || 'User'}! 👋</h1>
                <p class="text-slate-500">How are you feeling today?</p>
            </header>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div onclick="router.navigate('ai-chat')" class="cursor-pointer bg-purple-50 p-6 rounded-3xl border-l-4 border-purple-500 card-shadow transition-all">
                    <div class="bg-purple-500 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-purple-200"><i data-lucide="message-square" class="text-white"></i></div>
                    <h3 class="text-lg font-bold text-slate-800">AI Counselor</h3>
                    <p class="text-slate-500 text-sm">Instant AI medical guidance</p>
                </div>
                <div onclick="router.navigate('prescriptions')" class="cursor-pointer bg-orange-50 p-6 rounded-3xl border-l-4 border-orange-500 card-shadow transition-all">
                    <div class="bg-orange-500 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-orange-200"><i data-lucide="clipboard-list" class="text-white"></i></div>
                    <h3 class="text-lg font-bold text-slate-800">Prescriptions</h3>
                    <p class="text-slate-500 text-sm">View AI-generated scripts</p>
                </div>
                <div onclick="router.navigate('vitals')" class="cursor-pointer bg-teal-50 p-6 rounded-3xl border-l-4 border-teal-500 card-shadow transition-all">
                    <div class="bg-teal-500 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-teal-200"><i data-lucide="heart" class="text-white"></i></div>
                    <h3 class="text-lg font-bold text-slate-800">Health Tracker</h3>
                    <p class="text-slate-500 text-sm">Log your daily vitals</p>
                </div>
            </div>
        </div>
    `,
    'ai-chat': () => `
        <nav class="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
             <button onclick="router.navigate('dashboard')" class="flex items-center gap-2 text-teal-600 font-medium"><i data-lucide="arrow-left" class="w-4 h-4"></i> Back</button>
             <span class="font-bold text-slate-800">AI Counselor</span>
             <div class="w-10"></div>
        </nav>
        <div class="flex flex-col h-[calc(100vh-64px)] bg-slate-50">
            <div id="chat-box" class="flex-1 overflow-y-auto p-6 space-y-4">
                <div class="flex justify-start">
                    <div class="max-w-[80%] p-4 rounded-2xl bg-white text-slate-800 rounded-tl-none border-l-4 border-purple-500 shadow-sm">
                        Hello! Describe your symptoms.
                    </div>
                </div>
            </div>
            <div class="p-4 bg-white border-t flex gap-3 items-center">
                <input id="chat-input" class="flex-1 p-3 border rounded-full outline-none focus:ring-2 focus:ring-purple-500" placeholder="Type symptoms...">
                <button onclick="sendChat()" class="p-3 bg-purple-600 text-white rounded-full shadow-lg"><i data-lucide="send" class="w-5 h-5"></i></button>
            </div>
        </div>
    `,
    'prescriptions': () => `
        <nav class="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
             <button onclick="router.navigate('dashboard')" class="flex items-center gap-2 text-teal-600 font-medium"><i data-lucide="arrow-left" class="w-4 h-4"></i> Back</button>
             <span class="font-bold text-slate-800">My Prescriptions</span>
             <div class="w-10"></div>
        </nav>
        <div class="p-6 max-w-4xl mx-auto space-y-6">
            <div class="bg-white p-6 rounded-3xl border shadow-sm space-y-4">
                <div class="flex justify-between items-start">
                    <h3 class="font-bold text-lg">Seasonal Flu Protocol</h3>
                    <span class="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-bold">Active</span>
                </div>
                <p class="text-slate-600">Paracetamol (500mg) - Twice a day. Drink warm fluids.</p>
                <button onclick="speak('Your prescription is Paracetamol 500mg twice a day. Drink warm fluids.')" class="flex items-center gap-2 text-xs font-bold text-teal-600 bg-teal-50 px-3 py-2 rounded-lg"><i data-lucide="volume-2" class="w-4 h-4"></i> READ ALOUD</button>
            </div>
        </div>
    `,
    'vitals': () => `
        <nav class="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
             <button onclick="router.navigate('dashboard')" class="flex items-center gap-2 text-teal-600 font-medium"><i data-lucide="arrow-left" class="w-4 h-4"></i> Back</button>
             <span class="font-bold text-slate-800">Log Vitals</span>
             <div class="w-10"></div>
        </nav>
        <div class="p-6 max-w-2xl mx-auto">
            <div class="bg-white p-6 rounded-3xl border shadow-sm space-y-6">
                <div>
                    <label class="text-xs font-bold text-slate-500 uppercase">Blood Pressure</label>
                    <input type="text" class="w-full p-3 border rounded-xl mt-1">
                </div>
                <div>
                    <label class="text-xs font-bold text-slate-500 uppercase">Symptoms</label>
                    <textarea class="w-full p-3 border rounded-xl h-32"></textarea>
                </div>
                <button onclick="router.navigate('dashboard')" class="w-full py-4 bg-teal-600 text-white rounded-xl font-bold">Submit Record</button>
            </div>
        </div>
    `
};

// --- Logic Handlers ---
function setLanguage(l) {
    state.lang = l;
    router.navigate('login');
}

async function handleLogin() {
    const phone = document.getElementById('login-phone').value;
    const password = document.getElementById('login-pass').value;

    try {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, password })
        });
        const data = await res.json();
        if(data.token) {
            state.token = data.token;
            state.user = data.user;
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            router.navigate('dashboard');
        } else {
            alert("Login failed");
        }
    } catch (e) {
        console.error(e);
        alert("Server not connected. Using Demo Mode.");
        state.user = { name: "Demo Patient" };
        router.navigate('dashboard');
    }
}

function handleLogout() {
    localStorage.clear();
    state.token = null;
    state.user = null;
    router.navigate('language-select');
}

async function sendChat() {
    const input = document.getElementById('chat-input');
    const box = document.getElementById('chat-box');
    const text = input.value;
    if(!text) return;

    box.innerHTML += `<div class="flex justify-end"><div class="max-w-[80%] p-4 rounded-2xl bg-purple-600 text-white rounded-tr-none shadow-sm">${text}</div></div>`;
    input.value = '';

    try {
        const res = await fetch(`${API_BASE_URL}/chat`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${state.token}` 
            },
            body: JSON.stringify({ message: text })
        });
        const data = await res.json();
        box.innerHTML += `<div class="flex justify-start"><div class="max-w-[80%] p-4 rounded-2xl bg-white text-slate-800 rounded-tl-none border-l-4 border-purple-500 shadow-sm">${data.text}</div></div>`;
    } catch (e) {
        box.innerHTML += `<div class="flex justify-start"><div class="max-w-[80%] p-4 rounded-2xl bg-white text-slate-800 rounded-tl-none border-l-4 border-purple-500 shadow-sm">Demo AI: I am analyzing your symptoms. It seems like a common cold.</div></div>`;
    }
    lucide.createIcons();
}

function render() {
    const app = document.getElementById('app');
    app.innerHTML = Pages[state.page]();
    
    // Show/Hide Mobile Nav
    const nav = document.getElementById('mobile-nav');
    if(state.page === 'dashboard' || state.page === 'prescriptions' || state.page === 'ai-chat' || state.page === 'vitals') {
        nav.classList.remove('hidden');
    } else {
        nav.classList.add('hidden');
    }
    
    lucide.createIcons();
}

// Init
render();
const { createApp } = Vue;

createApp({
    data() {
        return {
            currentPage: 'language-select',
            isLoggedIn: false,
            isListening: false,
            lang: 'en',
            user: null,
            token: null,
            aiStep: 1, // 1: Vitals, 2: Symptoms, 3: Analysis, 4: Result
            aiData: { vitals: {}, symptoms: '', result: null },
            languages: [
                { code: 'en', name: 'English' }, { code: 'hi', name: 'हिन्दी' },
                { code: 'bn', name: 'বাংলা' }, { code: 'ta', name: 'தமிழ்' }
            ],
            healthTrends: [72, 78, 74, 82, 70, 75, 71]
        }
    },
    computed: {
        pages() {
            return {
                languageSelect: `
                    <div class="min-h-screen bg-[#F0F4F8] flex flex-col items-center justify-center p-6">
                        <div class="max-w-md w-full bg-white rounded-[48px] shadow-2xl p-12 text-center border-t-8 border-[#008B8B]">
                            <div class="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                                <i data-lucide="globe" class="text-[#008B8B] w-12 h-12"></i>
                            </div>
                            <h1 class="text-4xl font-black text-slate-800 mb-3 tracking-tight">Healify</h1>
                            <p class="text-slate-500 mb-10 font-medium">Bridging the gap between rural areas and healthcare.</p>
                            <div class="grid grid-cols-2 gap-4">
                                ${this.languages.map(l => `<button onclick="app.setLanguage('${l.code}')" class="p-5 border-2 rounded-2xl hover:border-[#008B8B] hover:bg-teal-50 transition-all font-bold text-slate-700 shadow-sm">${l.name}</button>`).join('')}
                            </div>
                        </div>
                    </div>
                `,
                login: `
                    <div class="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
                        <div class="max-w-md w-full bg-white rounded-[48px] shadow-2xl p-12">
                            <h2 class="text-4xl font-black text-[#008B8B] mb-2">Welcome</h2>
                            <p class="text-slate-400 mb-10 font-medium">Secure access to your health portal</p>
                            <div class="space-y-6">
                                <div class="relative">
                                    <i data-lucide="phone" class="absolute left-4 top-4 w-5 h-5 text-slate-400"></i>
                                    <input id="login-phone" type="text" class="w-full p-4 pl-12 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#008B8B] transition-all" placeholder="Mobile Number">
                                </div>
                                <div class="relative">
                                    <i data-lucide="lock" class="absolute left-4 top-4 w-5 h-5 text-slate-400"></i>
                                    <input id="login-pass" type="password" class="w-full p-4 pl-12 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#008B8B] transition-all" placeholder="Password">
                                </div>
                                <button onclick="app.handleLogin()" class="w-full py-4 bg-[#008B8B] text-white rounded-2xl font-bold text-xl shadow-xl shadow-teal-200 hover:bg-teal-700 transition-all">Sign In</button>
                            </div>
                        </div>
                    </div>
                `,
                dashboard: `
                    <div class="p-6 max-w-7xl mx-auto space-y-10">
                        <header class="flex justify-between items-center">
                            <div>
                                <h1 class="text-4xl font-black text-slate-800">Hello, ${this.user?.name || 'Patient'}! 👋</h1>
                                <div class="flex items-center gap-2 mt-2">
                                    <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    <p class="text-slate-500 font-medium">Health Status: <span class="text-green-600 font-bold">Stable</span></p>
                                </div>
                            </div>
                            <button onclick="app.toggleVoiceCommand()" class="p-4 bg-white rounded-2xl shadow-sm border hover:bg-purple-50 transition-all">
                                <i data-lucide="mic" class="w-6 h-6 ${this.isListening ? 'text-purple-600' : 'text-slate-400'}"></i>
                            </button>
                        </header>

                        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div onclick="app.currentPage='ai-journey'" class="innovation-card bg-purple-600 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
                                <div class="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-all"></div>
                                <div class="bg-white/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6"><i data-lucide="wand-2" class="text-white"></i></div>
                                <h3 class="text-2xl font-bold mb-2">AI Diagnosis</h3>
                                <p class="text-purple-100 text-sm mb-6">Step-by-step clinical analysis for instant results</p>
                                <div class="bg-white text-purple-600 px-4 py-2 rounded-xl font-bold text-sm inline-block">Start Journey <i data-lucide="chevron-right" class="inline w-4 h-4"></i></div>
                            </div>
                            <div onclick="app.currentPage='prescriptions'" class="innovation-card bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm group">
                                <div class="bg-orange-100 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-500 group-hover:text-white transition-all"><i data-lucide="pill"></i></div>
                                <h3 class="text-2xl font-bold text-slate-800 mb-2">My Scripts</h3>
                                <p class="text-slate-500 text-sm mb-6">Manage digital prescriptions & pharmacy</p>
                                <div class="text-orange-600 font-bold text-sm flex items-center gap-1">View Records <i data-lucide="chevron-right" class="w-4 h-4"></i></div>
                            </div>
                            <div onclick="app.currentPage='guardian'" class="innovation-card bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm group">
                                <div class="bg-teal-100 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-teal-500 group-hover:text-white transition-all"><i data-lucide="users"></i></div>
                                <h3 class="text-2xl font-bold text-slate-800 mb-2">Guardian Portal</h3>
                                <p class="text-slate-500 text-sm mb-6">Link family accounts for care monitoring</p>
                                <div class="text-teal-600 font-bold text-sm flex items-center gap-1">Manage Access <i data-lucide="chevron-right" class="w-4 h-4"></i></div>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div class="lg:col-span-2 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                                <div class="flex justify-between items-center mb-8">
                                    <h3 class="text-xl font-black text-slate-800">Health Analytics</h3>
                                    <div class="flex gap-2">
                                        <span class="px-3 py-1 bg-teal-100 text-teal-600 text-[10px] font-bold rounded-full">BPM</span>
                                    </div>
                                </div>
                                <canvas id="trendChart" height="120"></canvas>
                            </div>
                            <div class="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
                                <h3 class="text-xl font-black text-slate-800">Vital Snapshot</h3>
                                <div class="space-y-4">
                                    <div class="flex justify-between p-4 bg-slate-50 rounded-2xl border-l-4 border-green-500">
                                        <span class="text-slate-500 font-medium">BP</span>
                                        <span class="font-bold">120/80</span>
                                    </div>
                                    <div class="flex justify-between p-4 bg-slate-50 rounded-2xl border-l-4 border-blue-500">
                                        <span class="text-slate-500 font-medium">Heart Rate</span>
                                        <span class="font-bold">72 bpm</span>
                                    </div>
                                    <div class="flex justify-between p-4 bg-slate-50 rounded-2xl border-l-4 border-orange-500">
                                        <span class="text-slate-500 font-medium">Temp</span>
                                        <span class="font-bold">98.6°F</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `,
                aiJourney: `
                    <div class="p-6 max-w-3xl mx-auto space-y-6">
                        <div class="flex items-center justify-between mb-8">
                            <button onclick="app.currentPage='dashboard'" class="p-2 text-slate-400"><i data-lucide="arrow-left"></i></button>
                            <h2 class="text-2xl font-black text-slate-800">AI Diagnosis Journey</h2>
                            <div class="w-10"></div>
                        </div>

                        <div class="flex gap-2 mb-10">
                            <div class="step-indicator ${this.aiStep >= 1 ? 'step-active' : ''}"></div>
                            <div class="step-indicator ${this.aiStep >= 2 ? 'step-active' : ''}"></div>
                            <div class="step-indicator ${this.aiStep >= 3 ? 'step-active' : ''}"></div>
                            <div class="step-indicator ${this.aiStep >= 4 ? 'step-active' : ''}"></div>
                        </div>

                        <div class="bg-white p-8 rounded-[40px] shadow-xl border border-slate-100 min-h-[400px] flex flex-col justify-center">
                            ${this.aiStep === 1 ? `
                                <div class="text-center space-y-6">
                                    <div class="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4"><i data-lucide="activity" class="text-purple-600 w-10 h-10"></i></div>
                                    <h3 class="text-2xl font-bold">Step 1: Vital Check</h3>
                                    <p class="text-slate-500">Please provide your current vitals for a more accurate AI analysis.</p>
                                    <div class="grid grid-cols-2 gap-4 text-left">
                                        <div><label class="text-xs font-bold text-slate-400 uppercase">BP</label><input onchange="app.aiData.vitals.bp=this.value" class="w-full p-4 bg-slate-50 rounded-2xl border-none" placeholder="120/80"></div>
                                        <div><label class="text-xs font-bold text-slate-400 uppercase">Temp</label><input onchange="app.aiData.vitals.temp=this.value" class="w-full p-4 bg-slate-50 rounded-2xl border-none" placeholder="98.6"></div>
                                    </div>
                                    <button onclick="app.aiStep=2" class="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold shadow-lg shadow-purple-200">Continue to Symptoms</button>
                                </div>
                            ` : this.aiStep === 2 ? `
                                <div class="text-center space-y-6">
                                    <div class="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4"><i data-lucide="message-circle" class="text-purple-600 w-10 h-10"></i></div>
                                    <h3 class="text-2xl font-bold">Step 2: Symptom Description</h3>
                                    <p class="text-slate-500">Tell us how you're feeling. You can type or use voice.</p>
                                    <textarea onchange="app.aiData.symptoms=this.value" class="w-full p-4 bg-slate-50 rounded-2xl h-40 outline-none" placeholder="e.g. I've had a dry cough and mild fever for 3 days..."></textarea>
                                    <button onclick="app.runAIDiagnosis()" class="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold shadow-lg shadow-purple-200">Run AI Analysis</button>
                                </div>
                            ` : this.aiStep === 3 ? `
                                <div class="text-center space-y-6">
                                    <div class="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 ai-mic-glow"><i data-lucide="cpu" class="text-white w-12 h-12 animate-spin"></i></div>
                                    <h3 class="text-2xl font-bold">Analyzing Health Data...</h3>
                                    <p class="text-slate-500">Cross-referencing symptoms with 10,000+ medical records</p>
                                </div>
                            ` : `
                                <div class="space-y-6">
                                    <div class="flex items-center gap-3 text-green-600 font-bold mb-4"><i data-lucide="check-circle"></i> Analysis Complete</div>
                                    <h3 class="text-3xl font-black text-slate-800">Diagnosis: Viral Flu</h3>
                                    <div class="p-6 bg-slate-50 rounded-3xl border-l-4 border-purple-500 space-y-4">
                                        <p class="text-slate-700 font-medium">The AI suggests a mild upper respiratory infection. Based on your vitals, no immediate emergency is required.</p>
                                    </div>
                                    <div class="grid grid-cols-2 gap-4">
                                        <div class="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                                            <p class="text-xs font-bold text-orange-400 uppercase">Suggested Meds</p>
                                            <p class="text-sm font-bold">Paracetamol 500mg (TID)</p>
                                        </div>
                                        <div class="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                            <p class="text-xs font-bold text-blue-400 uppercase">Care Tip</p>
                                            <p class="text-sm font-bold">Warm saline gargle 3x day</p>
                                        </div>
                                    </div>
                                    <button onclick="app.currentPage='prescriptions'" class="w-full py-4 bg-[#008B8B] text-white rounded-2xl font-bold">View Full Digital Prescription</button>
                                </div>
                            `}
                        </div>
                    </div>
                `,
                prescriptions: `
                    <div class="p-6 max-w-4xl mx-auto space-y-6">
                        <div class="flex justify-between items-center mb-6">
                            <h2 class="text-3xl font-black text-slate-800">Digital Pharmacy</h2>
                            <button onclick="app.currentPage='dashboard'" class="p-2 text-slate-400"><i data-lucide="arrow-left"></i></button>
                        </div>
                        <div class="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100 relative overflow-hidden">
                            <div class="absolute top-0 right-0 bg-teal-500 text-white px-6 py-2 rounded-bl-3xl text-xs font-bold uppercase">Verified AI Script</div>
                            <div class="flex items-center gap-4 mb-10">
                                <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center"><i data-lucide="file-text" class="text-slate-400"></i></div>
                                <div>
                                    <h3 class="text-xl font-bold">Patient: ${this.user?.name || 'User'}</h3>
                                    <p class="text-slate-400 text-sm">Script ID: #HF-99201 • Oct 2023</p>
                                </div>
                            </div>
                            <div class="space-y-8">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div class="space-y-4">
                                        <p class="text-xs font-black text-slate-400 uppercase tracking-widest">Medications</p>
                                        <div class="flex justify-between p-4 bg-slate-50 rounded-2xl font-bold">
                                            <span>Paracetamol 500mg</span>
                                            <span class="text-[#008B8B]">1-0-1</span>
                                        </div>
                                        <div class="flex justify-between p-4 bg-slate-50 rounded-2xl font-bold">
                                            <span>Vitamin C (Slow Release)</span>
                                            <span class="text-[#008B8B]">0-1-0</span>
                                        </div>
                                    </div>
                                    <div class="space-y-4">
                                        <p class="text-xs font-black text-slate-400 uppercase tracking-widest">Guidelines</p>
                                        <div class="p-4 bg-green-50 rounded-2xl text-sm text-green-700 font-medium">✅ Drink 3L water daily</div>
                                        <div class="p-4 bg-red-50 rounded-2xl text-sm text-red-700 font-medium">❌ Avoid cold beverages</div>
                                    </div>
                                </div>
                            </div>
                            <div class="mt-10 pt-6 border-t flex gap-4">
                                <button onclick="app.speak('Your prescription is Paracetamol 500mg twice a day. Drink plenty of water.')" class="flex-1 py-4 bg-teal-50 text-[#008B8B] rounded-2xl font-bold flex items-center justify-center gap-2"><i data-lucide="volume-2" class="w-5 h-5"></i> READ ALOUD</button>
                                <button class="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2"><i data-lucide="download" class="w-5 h-5"></i> SAVE PDF</button>
                            </div>
                        </div>
                    </div>
                `,
                guardian: `
                    <div class="p-6 max-w-6xl mx-auto space-y-10">
                        <div class="flex justify-between items-center">
                            <h2 class="text-3xl font-black text-slate-800">Guardian Portal</h2>
                            <button onclick="app.currentPage='dashboard'" class="p-2 text-slate-400"><i data-lucide="arrow-left"></i></button>
                        </div>
                        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div class="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 text-center">
                                <div class="w-24 h-24 bg-slate-200 rounded-full mx-auto mb-4 overflow-hidden">
                                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=patient" />
                                </div>
                                <h3 class="text-xl font-bold">Rajesh Kumar</h3>
                                <p class="text-slate-400 text-sm mb-6">Patient ID: #HL-1022</p>
                                <div class="flex justify-center gap-2">
                                    <span class="px-3 py-1 bg-green-100 text-green-600 text-xs font-bold rounded-full">Stable</span>
                                    <span class="px-3 py-1 bg-blue-100 text-blue-600 text-xs font-bold rounded-full">Sycning</span>
                                </div>
                            </div>
                            <div class="lg:col-span-2 space-y-6">
                                <h3 class="text-xl font-bold text-slate-800">Real-time Health Alerts</h3>
                                <div class="bg-red-50 p-6 rounded-[32px] border-l-8 border-red-500 flex justify-between items-center">
                                    <div>
                                        <p class="font-black text-red-800">New AI Diagnosis</p>
                                        <p class="text-sm text-red-600">AI detected Viral Flu. Prescription issued.</p>
                                    </div>
                                    <button class="bg-white px-4 py-2 rounded-xl text-xs font-bold text-red-600 shadow-sm">Review</button>
                                </div>
                                <div class="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 h-64 flex items-center justify-center text-slate-400 italic">
                                    [Live Vital Stream Chart]
                                </div>
                            </div>
                        </div>
                    </div>
                `,
                library: `
                    <div class="p-6 max-w-6xl mx-auto space-y-10">
                        <h2 class="text-4xl font-black text-slate-800">Medical Library</h2>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                            ${['Respiratory', 'Diabetes', 'Maternal', 'Heart', 'Skin', 'Mental'].map(item => `
                                <div class="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:border-[#008B8B] cursor-pointer transition-all group">
                                    <div class="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-teal-100 transition-all"><i data-lucide="book-open" class="text-slate-400 group-hover:text-[#008B8B]"></i></div>
                                    <h4 class="text-xl font-bold text-slate-800">${item} Health</h4>
                                    <p class="text-sm text-slate-400 mt-2">Comprehensive guide on symptoms, prevention, and home care.</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `
            }
        }
    },
    methods: {
        setLanguage(l) {
            this.lang = l;
            this.currentPage = 'login';
            this.$nextTick(() => lucide.createIcons());
        },
        handleLogin() {
            this.isLoggedIn = true;
            this.user = { name: 'Rajesh Kumar' };
            this.currentPage = 'dashboard';
            this.$nextTick(() => {
                lucide.createIcons();
                this.initChart();
            });
        },
        logout() {
            this.isLoggedIn = false;
            this.currentPage = 'language-select';
        },
        speak(text) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = this.lang === 'hi' ? 'hi-IN' : 'en-US';
            window.speechSynthesis.speak(utterance);
        },
        toggleVoiceCommand() {
            this.isListening = !this.isListening;
            if(this.isListening) {
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                const recognition = new SpeechRecognition();
                recognition.lang = this.lang === 'hi' ? 'hi-IN' : 'en-US';
                recognition.start();
                recognition.onresult = (event) => {
                    const command = event.results[0][0].transcript.toLowerCase();
                    if(command.includes('home') || command.includes('dashboard')) this.currentPage = 'dashboard';
                    if(command.includes('scripts') || command.includes('prescription')) this.currentPage = 'prescriptions';
                    if(command.includes('chat') || command.includes('ai')) this.currentPage = 'ai-journey';
                    this.isListening = false;
                    lucide.createIcons();
                };
                recognition.onend = () => { this.isListening = false; };
            }
        },
        async runAIDiagnosis() {
            this.aiStep = 3;
            this.$nextTick(() => lucide.createIcons());
            
            // Simulate Advanced AI Analysis Delay
            setTimeout(() => {
                this.aiStep = 4;
                this.$nextTick(() => lucide.createIcons());
            }, 3000);
        },
        initChart() {
            const ctx = document.getElementById('trendChart');
            if(!ctx) return;
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                        label: 'Heart Rate',
                        data: this.healthTrends,
                        borderColor: '#008B8B',
                        tension: 0.4,
                        fill: true,
                        backgroundColor: 'rgba(0, 139, 139, 0.1)',
                        borderWidth: 4,
                        pointRadius: 5,
                        pointBackgroundColor: '#fff',
                        pointBorderColor: '#008B8B'
                    }]
                },
                options: { 
                    plugins: { legend: { display: false } }, 
                    scales: { 
                        y: { beginAtZero: false, grid: { display: false } }, 
                        x: { grid: { display: false } } 
                    } 
                }
            });
        }
    },
    mounted() { lucide.createIcons(); },
    updated() { lucide.createIcons(); }
}).mount('#app');

