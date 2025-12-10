const { Pool } = require('pg');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Adapter Pattern to handle both SQLite (Dev) and Postgres (Prod)
class DBAdapter {
  constructor() {
    this.type = process.env.DATABASE_URL ? 'postgres' : 'sqlite';

    if (this.type === 'postgres') {
      this.pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
      });
      console.log("🔌 Connected to PostgreSQL (Railway)");
      this.initPostgres();
    } else {
      // CRITICAL WARNING FOR RAILWAY USERS
      if (process.env.RAILWAY_ENVIRONMENT || process.env.NODE_ENV === 'production') {
        console.warn("\n⚠️  WARNING: Running in Production/Railway but DATABASE_URL is missing!");
        console.warn("⚠️  The app is falling back to SQLite (Ephemeral Storage).");
        console.warn("⚠️  Your data will vanish on restart. Please attach a PostgreSQL Database.\n");
      }

      const dbPath = path.resolve(__dirname, '../../database.sqlite');
      this.sqlite = new Database(dbPath);
      console.log("📂 Connected to SQLite (Local)");
      this.initSqlite();
    }
  }

  async initPostgres() {
    const query = `
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username TEXT UNIQUE,
                email TEXT UNIQUE,
                password TEXT,
                recovery_key TEXT,
                google_id TEXT,
                is_premium BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
    try {
      await this.pool.query(query);
      // Alter table for existing users
      try {
        await this.pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id TEXT');
      } catch (e) { /* ignore */ }

      console.log("✅ Postgres Tables Initialized");
    } catch (err) {
      console.error("Failed to init Postgres tables:", err);
    }
  }

  initSqlite() {
    this.sqlite.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE,
                email TEXT UNIQUE,
                password TEXT,
                recovery_key TEXT,
                google_id TEXT,
                is_premium BOOLEAN DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);
    try {
      // Check if column exists, if not add it (sqlite doesn't have IF NOT EXISTS for ADD COLUMN in older versions)
      const columns = this.sqlite.prepare("PRAGMA table_info(users)").all();
      const hasGoogleId = columns.some(c => c.name === 'google_id');
      if (!hasGoogleId) {
        this.sqlite.exec('ALTER TABLE users ADD COLUMN google_id TEXT');
      }
    } catch (e) { /* ignore */ }
  }

  // Generic Query Method
  async findUserByEmail(email) {
    if (this.type === 'postgres') {
      const res = await this.pool.query('SELECT * FROM users WHERE email = $1', [email]);
      return res.rows[0];
    } else {
      return this.sqlite.prepare('SELECT * FROM users WHERE email = ?').get(email);
    }
  }

  async findUserByGoogleId(googleId) {
    if (this.type === 'postgres') {
      const res = await this.pool.query('SELECT * FROM users WHERE google_id = $1', [googleId]);
      return res.rows[0];
    } else {
      return this.sqlite.prepare('SELECT * FROM users WHERE google_id = ?').get(googleId);
    }
  }

  async createUser(username, email, hash, recoveryKey) {
    if (this.type === 'postgres') {
      const res = await this.pool.query(
        'INSERT INTO users (username, email, password, recovery_key) VALUES ($1, $2, $3, $4) RETURNING id, username, email',
        [username, email, hash, recoveryKey]
      );
      return { lastInsertRowid: res.rows[0].id, ...res.rows[0] };
    } else {
      const stmt = this.sqlite.prepare('INSERT INTO users (username, email, password, recovery_key) VALUES (?, ?, ?, ?)');
      const info = stmt.run(username, email, hash, recoveryKey);
      return { lastInsertRowid: info.lastInsertRowid, username, email };
    }
  }

  async createGoogleUser(username, email, googleId) {
    if (this.type === 'postgres') {
      const res = await this.pool.query(
        'INSERT INTO users (username, email, google_id) VALUES ($1, $2, $3) RETURNING id, username, email',
        [username, email, googleId]
      );
      return { lastInsertRowid: res.rows[0].id, ...res.rows[0] };
    } else {
      const stmt = this.sqlite.prepare('INSERT INTO users (username, email, google_id) VALUES (?, ?, ?)');
      const info = stmt.run(username, email, googleId);
      return { lastInsertRowid: info.lastInsertRowid, username, email };
    }
  }

  async updateUserPassword(id, newHash) {
    if (this.type === 'postgres') {
      await this.pool.query('UPDATE users SET password = $1 WHERE id = $2', [newHash, id]);
    } else {
      this.sqlite.prepare('UPDATE users SET password = ? WHERE id = ?').run(newHash, id);
    }
  }
}

const db = new DBAdapter();
module.exports = db;
