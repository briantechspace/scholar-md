/**
 * 📝 SCHOLAR MD - Error & Activity Logger
 * Comprehensive logging system for debugging and monitoring
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Log directories
const LOG_DIR = path.join(__dirname, '..', 'database', 'logs');
const ERROR_LOG = path.join(LOG_DIR, 'errors.json');
const ACTIVITY_LOG = path.join(LOG_DIR, 'activity.json');
const SESSION_LOG = path.join(LOG_DIR, 'sessions.json');
const PAIRING_LOG = path.join(LOG_DIR, 'pairing.json');

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Initialize log files
const initLog = (filePath, defaultValue = []) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2));
  }
};

initLog(ERROR_LOG, []);
initLog(ACTIVITY_LOG, []);
initLog(SESSION_LOG, []);
initLog(PAIRING_LOG, []);

// Safe read/write
const safeRead = (filePath, defaultValue = []) => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data || '[]');
  } catch {
    return defaultValue;
  }
};

const safeWrite = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error('Log write error:', err.message);
    return false;
  }
};

// Trim old logs (keep last N entries)
const trimLog = (logs, maxEntries = 500) => {
  if (logs.length > maxEntries) {
    return logs.slice(-maxEntries);
  }
  return logs;
};

// ═══════════════════════════════════════════════════════════════════
// ERROR LOGGER
// ═══════════════════════════════════════════════════════════════════

export const errorLog = {
  /**
   * Log an error
   * @param {string} source - Where the error originated (e.g., 'menu', 'pairing', 'command')
   * @param {Error|string} error - The error object or message
   * @param {Object} context - Additional context (sender, command, etc.)
   */
  add(source, error, context = {}) {
    const logs = safeRead(ERROR_LOG, []);
    
    const entry = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      timestamp: new Date().toISOString(),
      source,
      message: error?.message || String(error),
      stack: error?.stack || null,
      code: error?.code || null,
      context: {
        ...context,
        sender: context.sender?.split('@')[0] || null
      }
    };
    
    logs.push(entry);
    safeWrite(ERROR_LOG, trimLog(logs, 1000));
    
    // Console output with color
    console.error(`❌ [${source.toUpperCase()}] ${entry.message}`);
    if (context.command) console.error(`   Command: ${context.command}`);
    
    return entry.id;
  },

  /**
   * Get recent errors
   * @param {number} limit - How many to retrieve
   * @param {string} source - Filter by source
   */
  getRecent(limit = 50, source = null) {
    const logs = safeRead(ERROR_LOG, []);
    let filtered = source ? logs.filter(l => l.source === source) : logs;
    return filtered.slice(-limit).reverse();
  },

  /**
   * Get error by ID
   */
  getById(id) {
    const logs = safeRead(ERROR_LOG, []);
    return logs.find(l => l.id === id);
  },

  /**
   * Clear all errors
   */
  clear() {
    safeWrite(ERROR_LOG, []);
  },

  /**
   * Get error stats
   */
  getStats() {
    const logs = safeRead(ERROR_LOG, []);
    const sources = {};
    const last24h = logs.filter(l => new Date(l.timestamp) > new Date(Date.now() - 24*60*60*1000));
    
    logs.forEach(l => {
      sources[l.source] = (sources[l.source] || 0) + 1;
    });
    
    return {
      total: logs.length,
      last24h: last24h.length,
      bySources: sources,
      lastError: logs[logs.length - 1] || null
    };
  }
};

// ═══════════════════════════════════════════════════════════════════
// ACTIVITY LOGGER
// ═══════════════════════════════════════════════════════════════════

export const activityLog = {
  /**
   * Log an activity
   * @param {string} type - Activity type (command, message, connect, etc.)
   * @param {Object} data - Activity data
   */
  add(type, data = {}) {
    const logs = safeRead(ACTIVITY_LOG, []);
    
    const entry = {
      timestamp: new Date().toISOString(),
      type,
      ...data,
      sender: data.sender?.split('@')[0] || null
    };
    
    logs.push(entry);
    safeWrite(ACTIVITY_LOG, trimLog(logs, 2000));
    
    return entry;
  },

  /**
   * Get recent activities
   */
  getRecent(limit = 100, type = null) {
    const logs = safeRead(ACTIVITY_LOG, []);
    let filtered = type ? logs.filter(l => l.type === type) : logs;
    return filtered.slice(-limit).reverse();
  },

  /**
   * Get command usage stats
   */
  getCommandStats() {
    const logs = safeRead(ACTIVITY_LOG, []);
    const commands = logs.filter(l => l.type === 'command');
    const stats = {};
    
    commands.forEach(c => {
      stats[c.command] = (stats[c.command] || 0) + 1;
    });
    
    return {
      total: commands.length,
      byCommand: Object.entries(stats)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
    };
  },

  clear() {
    safeWrite(ACTIVITY_LOG, []);
  }
};

// ═══════════════════════════════════════════════════════════════════
// SESSION LOGGER
// ═══════════════════════════════════════════════════════════════════

export const sessionLog = {
  /**
   * Log session event
   */
  add(event, data = {}) {
    const logs = safeRead(SESSION_LOG, []);
    
    const entry = {
      timestamp: new Date().toISOString(),
      event, // connected, disconnected, pairing_requested, pairing_success, pairing_failed
      ...data
    };
    
    logs.push(entry);
    safeWrite(SESSION_LOG, trimLog(logs, 500));
    
    console.log(`📋 [SESSION] ${event}: ${JSON.stringify(data)}`);
    return entry;
  },

  getRecent(limit = 50) {
    const logs = safeRead(SESSION_LOG, []);
    return logs.slice(-limit).reverse();
  },

  clear() {
    safeWrite(SESSION_LOG, []);
  }
};

// ═══════════════════════════════════════════════════════════════════
// PAIRING LOGGER
// ═══════════════════════════════════════════════════════════════════

export const pairingLog = {
  /**
   * Log pairing attempt
   */
  add(phone, status, details = {}) {
    const logs = safeRead(PAIRING_LOG, []);
    
    const entry = {
      id: Date.now().toString(36),
      timestamp: new Date().toISOString(),
      phone: phone?.slice(-4) ? `***${phone.slice(-4)}` : 'unknown', // Mask phone
      status, // requested, code_generated, success, failed, expired, timeout
      ...details
    };
    
    logs.push(entry);
    safeWrite(PAIRING_LOG, trimLog(logs, 500));
    
    return entry;
  },

  /**
   * Update pairing status
   */
  updateStatus(phone, status, details = {}) {
    const logs = safeRead(PAIRING_LOG, []);
    const masked = `***${phone?.slice(-4) || ''}`;
    
    // Find most recent entry for this phone
    for (let i = logs.length - 1; i >= 0; i--) {
      if (logs[i].phone === masked && logs[i].status !== 'success' && logs[i].status !== 'failed') {
        logs[i].status = status;
        logs[i].updatedAt = new Date().toISOString();
        Object.assign(logs[i], details);
        safeWrite(PAIRING_LOG, logs);
        return logs[i];
      }
    }
    
    // If not found, add new entry
    return this.add(phone, status, details);
  },

  getRecent(limit = 50) {
    const logs = safeRead(PAIRING_LOG, []);
    return logs.slice(-limit).reverse();
  },

  /**
   * Get pairing stats
   */
  getStats() {
    const logs = safeRead(PAIRING_LOG, []);
    const stats = { requested: 0, success: 0, failed: 0, expired: 0, timeout: 0 };
    
    logs.forEach(l => {
      if (stats[l.status] !== undefined) stats[l.status]++;
    });
    
    return {
      total: logs.length,
      ...stats,
      successRate: logs.length ? ((stats.success / logs.length) * 100).toFixed(1) + '%' : '0%'
    };
  },

  clear() {
    safeWrite(PAIRING_LOG, []);
  }
};

// ═══════════════════════════════════════════════════════════════════
// CONSOLE WRAPPER (Captures errors automatically)
// ═══════════════════════════════════════════════════════════════════

const originalConsoleError = console.error;
console.error = (...args) => {
  originalConsoleError.apply(console, args);
  
  // Auto-log errors to file (but avoid infinite loop)
  if (!args[0]?.includes('[') && typeof args[0] === 'string') {
    const message = args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' ');
    if (message.length > 10) {
      const logs = safeRead(ERROR_LOG, []);
      logs.push({
        timestamp: new Date().toISOString(),
        source: 'console',
        message: message.substring(0, 500),
        auto: true
      });
      safeWrite(ERROR_LOG, trimLog(logs, 1000));
    }
  }
};

export default {
  errorLog,
  activityLog,
  sessionLog,
  pairingLog
};
