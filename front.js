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
                    <div class="p-6 max-w-7xl mx-
