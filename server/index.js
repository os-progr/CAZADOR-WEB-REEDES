const express = require('express');
const cors = require('cors');
const path = require('path');
const { startAudit } = require('./services/hunter');

const dotenv = require('dotenv');
// Force load .env from current directory
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3000;

console.log('-------------------');

const authRoutes = require('./routes/auth');

const passport = require('./config/passport');

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

app.use('/api/auth', authRoutes);

// Main Audit Endpoint
app.post('/api/audit', async (req, res) => {
    const { targetUrl } = req.body;

    if (!targetUrl) {
        return res.status(400).json({ error: 'Target URL is required' });
    }

    const jobId = Date.now().toString();
    console.log(`[Job ${jobId}] Starting audit for: ${targetUrl}`);

    try {
        const result = await startAudit(targetUrl, jobId);
        res.json({ success: true, jobId, result });
    } catch (error) {
        console.error(`[Job ${jobId}] Failed:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
});

const db = require('./config/db');

app.get('/health', (req, res) => {
    res.json({
        status: 'Hunter is active',
        timestamp: new Date(),
        database: db.type // 'postgres' or 'sqlite'
    });
});

// Serve Frontend in Production
// Cuando estemos en producción, Express servirá los archivos construidos de React
const CLIENT_BUILD_PATH = path.join(__dirname, '../client/dist');

app.use(express.static(CLIENT_BUILD_PATH));

// Cualquier otra ruta que no sea API, devuelve el index.html (para SPA routing)
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(CLIENT_BUILD_PATH, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`\n🏹 El Cazador API running on http://localhost:${PORT}`);
});
