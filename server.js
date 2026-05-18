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
    images: [String], // URLs to uploaded images
    diagnosis: String,
    prescription: String,
    status: { type: String, default: 'Pending' }, // Pending, Completed
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

// 2. Health Data Submission
app.post('/api/health/submit', authenticate, async (req, res) => {
    try {
        const record = await HealthRecord.create({
            userId: req.user.id,
            ...req.body
        });
        res.json({ message: "Health data submitted successfully", recordId: record._id });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// 3. AI Diagnosis & Prescription (The Core Feature)
app.post('/api/ai/diagnose', authenticate, async (req, res) => {
    const { symptoms, vitals } = req.body;

    const prompt = `
    You are a professional medical AI. Based on these symptoms: ${symptoms} 
    and these vitals: ${JSON.stringify(vitals)}, provide:
    1. A likely diagnosis.
    2. A safe, generic medication prescription (with dosages).
    3. Detailed Do's and Don'ts.
    4. Warning signs for emergency.
    Format the response as JSON: { "diagnosis": "...", "prescription": "...", "guidelines": "..." }
    `;

    try {
        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: prompt }],
            model: "gpt-4o", 
        });

        const aiResult = JSON.parse(completion.choices[0].message.content);
        
        // Save to Database
        await HealthRecord.create({
            userId: req.user.id,
            symptoms,
            vitals,
            diagnosis: aiResult.diagnosis,
            prescription: aiResult.prescription,
            status: 'Completed'
        });

        // Send SMS Notification (Requirement 2.10)
        const user = await User.findById(req.user.id);
        await twilioClient.messages.create({
            body: `Healify: Your AI prescription is ready! Diagnosis: ${aiResult.diagnosis}. Please check the app for details.`,
            from: process.env.TWILIO_PHONE,
            to: user.phone
        });

        res.json(aiResult);
    } catch (e) {
        res.status(500).json({ error: "AI processing failed", details: e.message });
    }
});

// 4. AI Chat Counseling
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
        
        // Save chat history
        await Chat.findOneAndUpdate(
            { userId: req.user.id },
            { $push: { messages: { role: 'user', content: message }, { role: 'ai', content: responseText } } },
            { upsert: true }
        );

        res.json({ text: responseText });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// 5. Guardian Access (Requirement 2.9)
app.get('/api/guardian/patient-data', authenticate, async (req, res) => {
    if (req.user.role !== 'guardian') return res.status(403).json({ message: "Forbidden" });
    
    const guardian = await User.findById(req.user.id);
    const records = await HealthRecord.find({ userId: guardian.guardianId });
    res.json(records);
});

// Database Connection
mongoose.connect(MONGO_URI)
    .then(() => console.log("🚀 Healify Backend Connected to MongoDB"))
    .catch(err => console.error("❌ DB Error:", err));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const handleLogin = async () => {
  const response = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '1234567890', password: 'password123' })
  });
  const data = await response.json();
  localStorage.setItem('token', data.token); // Save token for other requests
  setPage('dashboard');
};

const sendMsg = async () => {
  const response = await fetch('http://localhost:5000/api/chat', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}` 
    },
    body: JSON.stringify({ message: input })
  });
  const data = await response.json();
  setMessages([...messages, { role: 'ai', text: data.text }]);
};

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();
app.use(express.json());
app.use(cors());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Structured Medical Response System
async function generateMedicalAnalysis(vitals, symptoms) {
    const prompt = `
    ACT AS A SENIOR CLINICAL DIAGNOSTICIAN. 
    Patient Vitals: ${JSON.stringify(vitals)}
    Patient Symptoms: ${symptoms}
    
    REQUIREMENTS:
    1. Provide a Primary Diagnosis.
    2. Provide a Secondary Differential Diagnosis.
    3. Suggest generic medications with dosages (TID/BID/QD).
    4. List 3 Critical Do's and 3 Critical Don'ts.
    5. Define the 'Red Flag' symptoms that require immediate ER visit.
    
    FORMAT: Return only as a valid JSON object.
    `;

    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "system", content: prompt }],
        response_format: { type: "json_object" }
    });
    return JSON.parse(response.choices[0].message.content);
}

app.post('/api/ai/diagnose', async (req, res) => {
    try {
        const { vitals, symptoms } = req.body;
        const result = await generateMedicalAnalysis(vitals, symptoms);
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: "Clinical AI Engine Failure" });
    }
});

mongoose.connect(process.env.MONGO_URI).then(() => {
    app.listen(5000, () => console.log("Advanced Backend Running on Port 5000"));
});

