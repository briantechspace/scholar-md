/**
 * 💾 SCHOLAR MD - Session Manager
 * Handles session persistence, cleanup, and auto-reconnect
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { errorLog, sessionLog, pairingLog } from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const DB_DIR = path.join(__dirname, '..', 'database', 'data');
const SESSIONS_FILE = path.join(DB_DIR, 'sessions.json');
const AUTH_DIR = path.join(__dirname, '..', 'auth_info');
const TEMP_DIR = path.join(__dirname, '..', 'temp');

// Ensure directories exist
[DB_DIR, AUTH_DIR, TEMP_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Safe read/write
const safeRead = (filePath, defaultValue = {}) => {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2));
      return defaultValue;
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return defaultValue;
  }
};

const safeWrite = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    errorLog.add('session_manager', err, { action: 'write', filePath });
    return false;
  }
};

// ═══════════════════════════════════════════════════════════════════
// SESSION MANAGER
// ═══════════════════════════════════════════════════════════════════

class SessionManager {
  constructor() {
    this.sessions = safeRead(SESSIONS_FILE, { active: null, history: [], pending: {} });
    this.cleanupInterval = null;
    this.startCleanupScheduler();
  }

  /**
   * Save current state
   */
  save() {
    return safeWrite(SESSIONS_FILE, this.sessions);
  }

  /**
   * Register a new session when connected
   */
  registerSession(phoneNumber, metadata = {}) {
    const session = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      phone: phoneNumber,
      connectedAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      status: 'connected',
      reconnectAttempts: 0,
      metadata: {
        platform: metadata.platform || 'unknown',
        browser: metadata.browser || 'Chrome',
        pushName: metadata.pushName || null,
        ...metadata
      }
    };

    // Add to history if there was a previous active session
    if (this.sessions.active && this.sessions.active.phone !== phoneNumber) {
      this.sessions.history.push({
        ...this.sessions.active,
        disconnectedAt: new Date().toISOString(),
        reason: 'replaced'
      });
    }

    this.sessions.active = session;
    
    // Keep only last 50 history entries
    if (this.sessions.history.length > 50) {
      this.sessions.history = this.sessions.history.slice(-50);
    }

    this.save();
    sessionLog.add('connected', { phone: phoneNumber, sessionId: session.id });
    
    console.log(`✅ Session registered: ${phoneNumber}`);
    return session;
  }

  /**
   * Update session activity
   */
  updateActivity() {
    if (this.sessions.active) {
      this.sessions.active.lastActive = new Date().toISOString();
      this.save();
    }
  }

  /**
   * Mark session as disconnected
   */
  disconnectSession(reason = 'unknown', shouldReconnect = true) {
    if (!this.sessions.active) return;

    const session = this.sessions.active;
    session.status = 'disconnected';
    session.disconnectedAt = new Date().toISOString();
    session.disconnectReason = reason;
    session.shouldReconnect = shouldReconnect;

    this.sessions.history.push({ ...session });
    
    if (!shouldReconnect) {
      this.sessions.active = null;
    }

    this.save();
    sessionLog.add('disconnected', { phone: session.phone, reason, shouldReconnect });
    
    console.log(`❌ Session disconnected: ${reason}`);
    return session;
  }

  /**
   * Get active session
   */
  getActive() {
    return this.sessions.active;
  }

  /**
   * Check if should auto-reconnect
   */
  shouldAutoReconnect() {
    const session = this.sessions.active;
    if (!session) return false;
    if (session.status === 'connected') return false;
    if (!session.shouldReconnect) return false;
    if (session.reconnectAttempts >= 10) return false;
    return true;
  }

  /**
   * Increment reconnect attempts
   */
  incrementReconnectAttempts() {
    if (this.sessions.active) {
      this.sessions.active.reconnectAttempts++;
      this.save();
      return this.sessions.active.reconnectAttempts;
    }
    return 0;
  }

  /**
   * Reset reconnect attempts on successful connection
   */
  resetReconnectAttempts() {
    if (this.sessions.active) {
      this.sessions.active.reconnectAttempts = 0;
      this.sessions.active.status = 'connected';
      this.save();
    }
  }

  /**
   * Register pending pairing request
   */
  addPendingPairing(phone, code) {
    this.sessions.pending[phone] = {
      code,
      requestedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 60000).toISOString(), // 60 seconds
      status: 'waiting'
    };
    this.save();
    pairingLog.add(phone, 'code_generated', { code: code.substring(0, 4) + '****' });
    return this.sessions.pending[phone];
  }

  /**
   * Mark pairing as successful
   */
  completePairing(phone) {
    if (this.sessions.pending[phone]) {
      this.sessions.pending[phone].status = 'completed';
      this.sessions.pending[phone].completedAt = new Date().toISOString();
      pairingLog.updateStatus(phone, 'success');
    }
    // Clean up pending
    delete this.sessions.pending[phone];
    this.save();
  }

  /**
   * Mark pairing as failed
   */
  failPairing(phone, reason = 'failed') {
    if (this.sessions.pending[phone]) {
      this.sessions.pending[phone].status = 'failed';
      this.sessions.pending[phone].failedAt = new Date().toISOString();
      this.sessions.pending[phone].reason = reason;
      pairingLog.updateStatus(phone, 'failed', { reason });
    }
    delete this.sessions.pending[phone];
    this.save();
  }

  /**
   * Get session history
   */
  getHistory(limit = 20) {
    return this.sessions.history.slice(-limit).reverse();
  }

  /**
   * Check if auth files exist (for reconnect)
   */
  hasAuthFiles() {
    try {
      const files = fs.readdirSync(AUTH_DIR);
      return files.length > 0 && files.some(f => f.includes('creds'));
    } catch {
      return false;
    }
  }

  /**
   * Clear auth files for fresh pairing
   */
  clearAuth() {
    try {
      if (fs.existsSync(AUTH_DIR)) {
        fs.rmSync(AUTH_DIR, { recursive: true, force: true });
        fs.mkdirSync(AUTH_DIR, { recursive: true });
        console.log('🗑️ Auth files cleared');
      }
      this.sessions.active = null;
      this.save();
      return true;
    } catch (err) {
      errorLog.add('session_manager', err, { action: 'clearAuth' });
      return false;
    }
  }

  /**
   * Cleanup expired pending pairings
   */
  cleanupExpiredPairings() {
    const now = Date.now();
    let cleaned = 0;

    Object.entries(this.sessions.pending).forEach(([phone, data]) => {
      if (new Date(data.expiresAt).getTime() < now) {
        pairingLog.updateStatus(phone, 'expired');
        delete this.sessions.pending[phone];
        cleaned++;
      }
    });

    if (cleaned > 0) {
      this.save();
      console.log(`🧹 Cleaned ${cleaned} expired pairing requests`);
    }

    return cleaned;
  }

  /**
   * Cleanup temp files
   */
  cleanupTempFiles() {
    try {
      if (!fs.existsSync(TEMP_DIR)) return 0;
      
      const files = fs.readdirSync(TEMP_DIR);
      const now = Date.now();
      const maxAge = 30 * 60 * 1000; // 30 minutes
      let cleaned = 0;

      files.forEach(file => {
        const filePath = path.join(TEMP_DIR, file);
        try {
          const stats = fs.statSync(filePath);
          if (now - stats.mtimeMs > maxAge) {
            fs.unlinkSync(filePath);
            cleaned++;
          }
        } catch {}
      });

      if (cleaned > 0) {
        console.log(`🧹 Cleaned ${cleaned} temp files`);
      }
      return cleaned;
    } catch (err) {
      errorLog.add('session_manager', err, { action: 'cleanupTemp' });
      return 0;
    }
  }

  /**
   * Cleanup junk messages data (stale cache)
   */
  cleanupJunkData() {
    try {
      // Clean old store files
      const storeFiles = ['store.json', 'baileys_store.json', 'messages.json'];
      let cleaned = 0;

      storeFiles.forEach(file => {
        const filePath = path.join(__dirname, '..', file);
        if (fs.existsSync(filePath)) {
          try {
            const stats = fs.statSync(filePath);
            // If file is larger than 10MB, clear it
            if (stats.size > 10 * 1024 * 1024) {
              fs.writeFileSync(filePath, '{}');
              cleaned++;
              console.log(`🧹 Cleared oversized ${file}`);
            }
          } catch {}
        }
      });

      return cleaned;
    } catch (err) {
      errorLog.add('session_manager', err, { action: 'cleanupJunk' });
      return 0;
    }
  }

  /**
   * Start automatic cleanup scheduler
   */
  startCleanupScheduler() {
    // Run cleanup every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredPairings();
      this.cleanupTempFiles();
    }, 5 * 60 * 1000);

    // Run cleanup every hour for junk data
    setInterval(() => {
      this.cleanupJunkData();
    }, 60 * 60 * 1000);

    // Initial cleanup
    setTimeout(() => {
      this.cleanupExpiredPairings();
      this.cleanupTempFiles();
    }, 10000);

    console.log('🔄 Session cleanup scheduler started');
  }

  /**
   * Stop cleanup scheduler
   */
  stopCleanupScheduler() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Get session stats
   */
  getStats() {
    return {
      hasActive: !!this.sessions.active,
      activePhone: this.sessions.active?.phone?.slice(-4) || null,
      status: this.sessions.active?.status || 'none',
      connectedAt: this.sessions.active?.connectedAt || null,
      lastActive: this.sessions.active?.lastActive || null,
      reconnectAttempts: this.sessions.active?.reconnectAttempts || 0,
      historyCount: this.sessions.history.length,
      pendingPairings: Object.keys(this.sessions.pending).length,
      hasAuthFiles: this.hasAuthFiles()
    };
  }

  /**
   * Export session data for backup
   */
  exportData() {
    return {
      exportedAt: new Date().toISOString(),
      sessions: this.sessions,
      authExists: this.hasAuthFiles()
    };
  }
}

// Singleton instance
export const sessionManager = new SessionManager();

export default sessionManager;
