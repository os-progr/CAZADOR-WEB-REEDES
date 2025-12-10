const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Register
router.post('/register', async (req, res) => {
    const { username, email, password, recovery_key } = req.body;

    if (!username || !email || !password || !recovery_key) {
        return res.status(400).json({ error: 'All fields including Recovery Key are required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        // Store recovery key (in a real app, hash this too!)
        const stmt = db.prepare('INSERT INTO users (username, email, password, recovery_key) VALUES (?, ?, ?, ?)');
        const info = stmt.run(username, email, hashedPassword, recovery_key);

        const token = jwt.sign({ id: info.lastInsertRowid, email }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(201).json({ success: true, token, user: { id: info.lastInsertRowid, username, email } });
    } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(400).json({ error: 'Email or Username already exists' });
        }
        res.status(500).json({ error: 'Database error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
        const user = stmt.get(email);

        if (!user) {
            // Anti-timing attack (fake comparison)
            await bcrypt.compare('dummy', '$2b$10$dummyhashdummyhashdummyhashdummyhashdummyhashdummyhash');
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ success: true, token, user: { id: user.id, username: user.username, email: user.email, is_premium: user.is_premium } });

    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
    const { email, recovery_key, new_password } = req.body;

    if (!email || !recovery_key || !new_password) {
        return res.status(400).json({ error: 'All fields required' });
    }

    try {
        const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
        const user = stmt.get(email);

        if (!user || user.recovery_key !== recovery_key) {
            return res.status(400).json({ error: 'Invalid Email or Recovery Key' });
        }

        const hashedPassword = await bcrypt.hash(new_password, 10);
        const updateStmt = db.prepare('UPDATE users SET password = ? WHERE id = ?');
        updateStmt.run(hashedPassword, user.id);

        res.json({ success: true, message: 'Password reset successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
