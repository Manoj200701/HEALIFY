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
