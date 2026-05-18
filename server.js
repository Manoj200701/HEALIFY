require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OpenAI } = require('openai');
const twilio = require('twilio');

const app = express();
app.use(express.json());
app.use(cors());
app.get('/', (req, res) => {
    res.send('Healify Pro Backend is Running Successfully! 🚀');
});


// --- CONFIGURATION ---
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/healify';
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

// AI Setup
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// SMS Setup
const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

// --- DATABASE SCHEMAS ---
const UserSchema = new mongoose.Schema({
    name: String,
    phone: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    language: { type: String, default: 'en' },
    role: { type: String, enum: ['patient', 'guardian'], default: 'patient' },
    guardianId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    profile: { age: Number, gender: String, location: String }
});

const HealthRecordSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    vitals: { bp: String, temp: String, heartRate: String, weight: String },
    symptoms: String,
    diagnosis: String,
    prescription: String,
    status: { type: String, default: 'Pending' }, 
    createdAt: { type: Date, default: Date.now }
});

const ChatSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    messages: [{ role: String, content: String, timestamp: { type: Date, default: Date.now } }]
});

const User = mongoose.model('User', UserSchema);
const HealthRecord = mongoose.model('HealthRecord', HealthRecordSchema);
const Chat = mongoose.model('Chat', ChatSchema);

// --- MIDDLEWARE: Auth ---
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch (e) { res.status(401).json({ message: "Invalid Token" }); }
};

// --- ROUTES ---

// 1. Auth: Signup & Login
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { name, phone, password, language } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, phone, password: hashedPassword, language });
        res.status(201).json({ message: "User created successfully" });
    } catch (e) { res.status(400).json({ error: e.message }); }
});

app.post('/api/auth/login', async (req, res) => {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone });
    if (!user || !await bcrypt.compare(password, user.password)) {
        return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET);
    res.json({ token, user: { name: user.name, role: user.role, language: user.language } });
});

// 2. Advanced AI Diagnosis Journey
app.post('/api/ai/diagnose', authenticate, async (req, res) => {
    const { symptoms, vitals } = req.body;

    const prompt = `
    ACT AS A SENIOR CLINICAL DIAGNOSTICIAN. 
    Patient Vitals: ${JSON.stringify(vitals)}
    Patient Symptoms: ${symptoms}
    
    REQUIREMENTS:
    1. Provide a Primary Diagnosis.
    2. Suggest generic medications with dosages (TID/BID/QD).
    3. List 3 Critical Do's and 3 Critical Don'ts.
    4. Define 'Red Flag' symptoms for emergency.
    
    FORMAT: Return as a valid JSON object.
    `;

    try {
        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: prompt }],
            model: "gpt-4o",
            response_format: { type: "json_object" }
        });

        const aiResult = JSON.parse(completion.choices[0].message.content);
        
        await HealthRecord.create({
            userId: req.user.id,
            symptoms,
            vitals,
            diagnosis: aiResult.diagnosis,
            prescription: aiResult.prescription,
            status: 'Completed'
        });

        // Rural SMS Notification
        const user = await User.findById(req.user.id);
        await twilioClient.messages.create({
            body: `Healify Pro: AI Diagnosis ready. Diagnosis: ${aiResult.diagnosis}. Check app for script.`,
            from: process.env.TWILIO_PHONE,
            to: user.phone
        });

        res.json(aiResult);
    } catch (e) {
        res.status(500).json({ error: "Clinical AI Engine Failure", details: e.message });
    }
});

// 3. AI Chat Counseling
app.post('/api/chat', authenticate, async (req, res) => {
    const { message } = req.body;
    try {
        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: "You are a helpful medical assistant for rural patients. Use simple language." },
                { role: "user", content: message }
            ],
            model: "gpt-4o",
        });
        const responseText = completion.choices[0].message.content;
        await Chat.findOneAndUpdate(
            { userId: req.user.id },
            { $push: { messages: { role: 'user', content: message }, { role: 'ai', content: responseText } } },
            { upsert: true }
        );
        res.json({ text: responseText });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 4. Emergency SOS Feature (Innovative)
app.post('/api/emergency/sos', authenticate, async (req, res) => {
    const { location, vitals } = req.body;
    try {
        const user = await User.findById(req.user.id);
        const message = `🚨 EMERGENCY ALERT: ${user.name}\nLocation: ${location}\nVitals: ${vitals}\nPlease provide immediate assistance!`;

        let sentTo = [];
        if (user.guardianId) {
            const guardian = await User.findById(user.guardianId);
            await twilioClient.messages.create({
                body: message,
                from: process.env.TWILIO_PHONE,
                to: guardian.phone
            });
            sentTo.push("Guardian");
        }

        // ALWAYS send to a central emergency number as a fallback
        await twilioClient.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE,
            to: process.env.EMERGENCY_CENTER_PHONE // Add this to your .env
        });
        sentTo.push("Emergency Center");

        res.json({ success: true, message: `SOS Alerts sent to ${sentTo.join(' and ')}` });
    } catch (e) {
        res.status(500).json({ error: "SOS Failed" });
    }
});

});

// 5. Guardian Access
app.get('/api/guardian/patient-data', authenticate, async (req, res) => {
    if (req.user.role !== 'guardian') return res.status(403).json({ message: "Forbidden" });
    const guardian = await User.findById(req.user.id);
    const records = await HealthRecord.find({ userId: guardian.guardianId });
    res.json(records);
});
// 6. Medical Knowledge Library
app.get('/api/library', (req, res) => {
    const libraryData = [
        { category: 'Respiratory', title: 'Common Cold vs Flu', content: 'Guide on viral infections...', audioUrl: '/audio/respiratory.mp3' },
        { category: 'Diabetes', title: 'Blood Sugar Management', content: 'How to manage sugar levels...', audioUrl: '/audio/diabetes.mp3' },
        { category: 'Maternal', title: 'Prenatal Care', content: 'Guidelines for healthy pregnancy...', audioUrl: '/audio/maternal.mp3' },
        { category: 'Heart', title: 'Hypertension Basics', content: 'Understanding blood pressure...', audioUrl: '/audio/heart.mp3' },
        { category: 'Skin', title: 'Dermatitis Guide', content: 'Identifying skin rashes...', audioUrl: '/audio/skin.mp3' },
        { category: 'Mental', title: 'Stress Management', content: 'Tips for rural mental wellness...', audioUrl: '/audio/mental.mp3' },
    ];
    res.json(libraryData);
});

// Database Connection
mongoose.connect(MONGO_URI)
    .then(() => console.log("🚀 Healify Pro Backend Connected to MongoDB"))
    .catch(err => console.error("❌ DB Error:", err));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
