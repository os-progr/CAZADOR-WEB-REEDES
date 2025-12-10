const express = require('express');
const cors = require('cors');
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

    // Generate a Job ID (simple timestamp for now)
    const jobId = Date.now().toString();

    // Start the audit asynchronously
    // In a real production app, this would go to a queue (Redis/Bull)
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

app.listen(PORT, () => {
    console.log(`\n🏹 El Cazador API running on http://localhost:${PORT}`);
});
