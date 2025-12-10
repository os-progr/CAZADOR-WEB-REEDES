const express = require('express');
const cors = require('cors');
const path = require('path');
const { startAudit } = require('./services/hunter');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

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

app.get('/health', (req, res) => {
    res.json({ status: 'Hunter is active', timestamp: new Date() });
});

// Serve Frontend in Production
// Cuando estemos en producción, Express servirá los archivos construidos de React
const CLIENT_BUILD_PATH = path.join(__dirname, '../client/dist');

app.use(express.static(CLIENT_BUILD_PATH));

// Cualquier otra ruta que no sea API, devuelve el index.html (para SPA routing)
app.get('*', (req, res) => {
    res.sendFile(path.join(CLIENT_BUILD_PATH, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`\n🏹 El Cazador API running on http://localhost:${PORT}`);
});
