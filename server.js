import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import QRCode from "qrcode";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const WEBSITE_DIR = path.resolve(__dirname, "website");
const DATABASE_DIR = path.resolve(__dirname, "database", "data");

// Ensure database directory exists
if (!fs.existsSync(DATABASE_DIR)) {
  fs.mkdirSync(DATABASE_DIR, { recursive: true });
}

const safeRead = (f, defaultValue = {}) => {
  try {
    if (!fs.existsSync(f)) {
      fs.writeFileSync(f, JSON.stringify(defaultValue, null, 2));
      return defaultValue;
    }
    const raw = fs.readFileSync(f, "utf8");
    return JSON.parse(raw || "{}");
  } catch (e) {
    return defaultValue;
  }
};

const write = (f, d) => fs.writeFileSync(f, JSON.stringify(d, null, 2));

// Database file paths
const DB = {
  analytics: path.join(DATABASE_DIR, "analytics.json"),
  users: path.join(DATABASE_DIR, "users.json"),
  payments: path.join(DATABASE_DIR, "payments.json"),
  admins: path.join(DATABASE_DIR, "admins.json")
};

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(WEBSITE_DIR));

// Store pairing state globally so bot.js can update it
export const pairingState = {
  qr: null,
  qrDataUrl: null,
  pairingCode: null,
  status: "waiting",
  connectedNumber: null,
  lastUpdated: null,
  requestedPhone: null,
  pairingRequested: false,
  sock: null, // Store socket reference
  codeGeneratedAt: null,
  error: null
};

/* =========================
   API ROUTES
========================= */

// Get current connection status and QR
app.get("/api/status", async (req, res) => {
  const analytics = safeRead(DB.analytics, { connected: false });

  res.json({
    status: analytics.connected ? "connected" : pairingState.status,
    qrDataUrl: pairingState.qrDataUrl,
    pairingCode: pairingState.pairingCode,
    connectedNumber: pairingState.connectedNumber,
    lastUpdated: pairingState.lastUpdated,
    error: pairingState.error,
    hasAuthFiles: pairingState.sock ? true : false
  });
});

// Main pairing endpoint - Generate pairing code for phone number
app.post("/api/pair", async (req, res) => {
  const { phoneNumber, phone } = req.body;
  const phoneNum = phoneNumber || phone;

  if (!phoneNum) {
    return res.status(400).json({
      success: false,
      message: "Phone number required"
    });
  }

  // Clean phone number - remove all non-digits
  const cleanPhone = phoneNum.toString().replace(/[^0-9]/g, "");

  if (cleanPhone.length < 10) {
    return res.status(400).json({
      success: false,
      message: "Invalid phone number. Must be at least 10 digits."
    });
  }

  console.log(`📱 Pairing requested for: ${cleanPhone}`);

  // Log pairing request
  if (pairingLog) {
    pairingLog.add(cleanPhone, 'requested');
  }

  // Check if bot socket is available
  if (!pairingState.sock) {
    if (pairingLog) pairingLog.updateStatus(cleanPhone, 'failed', { reason: 'socket_not_ready' });
    return res.status(503).json({
      success: false,
      message: "Bot is starting up. Please wait a moment and try again."
    });
  }

  // Check if already connected
  if (pairingState.status === "connected") {
    if (pairingLog) pairingLog.updateStatus(cleanPhone, 'failed', { reason: 'already_connected' });
    return res.status(400).json({
      success: false,
      message: "Bot is already connected to a device. Go to /api/session/clear to disconnect first."
    });
  }

  try {
    // Request pairing code from WhatsApp
    const code = await pairingState.sock.requestPairingCode(cleanPhone);

    // Format code as XXXX-XXXX for display
    const formattedCode = code.match(/.{1,4}/g)?.join("-") || code;

    // Update pairing state
    pairingState.pairingCode = formattedCode;
    pairingState.requestedPhone = cleanPhone;
    pairingState.status = "code_ready";
    pairingState.codeGeneratedAt = new Date().toISOString();
    pairingState.lastUpdated = new Date().toISOString();
    pairingState.error = null;

    // Log to session manager
    if (sessionManager) {
      sessionManager.addPendingPairing(cleanPhone, formattedCode);
    }

    console.log(`✅ Pairing code generated: ${formattedCode} for ${cleanPhone}`);

    res.json({
      success: true,
      code: formattedCode,
      message: "Enter this code in WhatsApp to pair",
      expiresIn: 60
    });

  } catch (error) {
    console.error(`❌ Pairing code generation failed:`, error.message);

    // Log error
    if (errorLog) errorLog.add('pairing', error, { phone: cleanPhone });
    if (pairingLog) pairingLog.updateStatus(cleanPhone, 'failed', { reason: error.message });

    pairingState.error = error.message;
    pairingState.status = "error";
    pairingState.lastUpdated = new Date().toISOString();

    // Handle specific errors
    if (error.message.includes("already paired") || error.message.includes("already connected")) {
      return res.status(400).json({
        success: false,
        message: "This device is already connected. Disconnect first to re-pair."
      });
    }

    if (error.message.includes("invalid") || error.message.includes("not registered")) {
      return res.status(400).json({
        success: false,
        message: "This phone number is not registered on WhatsApp."
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to generate pairing code. Please try again."
    });
  }
});

// Legacy endpoint for backwards compatibility
app.post("/api/pair/request", async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ error: "Phone number required" });
  }

  // Redirect to main pair endpoint
  req.body.phoneNumber = phone;
  return app._router.handle(Object.assign(req, { url: '/api/pair', method: 'POST' }), res);
});

// Get QR as image
app.get("/api/qr", async (req, res) => {
  if (!pairingState.qr) {
    return res.status(404).json({ error: "No QR available" });
  }

  try {
    const buffer = await QRCode.toBuffer(pairingState.qr, {
      width: 300,
      margin: 2,
      color: { dark: "#000", light: "#fff" }
    });
    res.set("Content-Type", "image/png");
    res.set("Cache-Control", "no-store");
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: "Failed to generate QR" });
  }
});

// Admin login
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;
  const admins = safeRead(DB.admins, { main: { username: "admin", passwordHash: "" } });

  // Simple check (in production use bcrypt.compare)
  if (username === admins.main?.username && password === "scholar2024") {
    res.json({ success: true, token: "admin-session-token" });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

// Get analytics/stats
app.get("/api/analytics", (req, res) => {
  const analytics = safeRead(DB.analytics, {});
  const users = safeRead(DB.users, {});
  const payments = safeRead(DB.payments, []);

  const userCount = Object.keys(users).length;
  const premiumUsers = Object.values(users).filter(u =>
    u.premiumUntil && new Date(u.premiumUntil) > new Date()
  ).length;

  res.json({
    connected: analytics.connected || false,
    totalUsers: userCount,
    premiumUsers,
    freeUsers: userCount - premiumUsers,
    totalPayments: payments.length,
    revenue: 0
  });
});

// Get users list
app.get("/api/users", (req, res) => {
  const users = safeRead(DB.users, {});
  const userList = Object.entries(users).map(([jid, data]) => ({
    jid,
    phone: jid.split("@")[0],
    ...data
  }));
  res.json(userList);
});

// M-Pesa callback endpoint - REMOVED

/* =========================
   SESSION & LOGS API
========================= */

// Import session manager and logger
let sessionManager, errorLog, activityLog, sessionLog, pairingLog;
try {
  const sm = await import('./lib/sessionManager.js');
  sessionManager = sm.sessionManager;
  const logger = await import('./lib/logger.js');
  errorLog = logger.errorLog;
  activityLog = logger.activityLog;
  sessionLog = logger.sessionLog;
  pairingLog = logger.pairingLog;
} catch (e) {
  console.log('⚠️ Session/Logger modules not yet loaded');
}

// Get session info
app.get("/api/session", (req, res) => {
  if (!sessionManager) {
    return res.json({ error: 'Session manager not loaded' });
  }
  res.json(sessionManager.getStats());
});

// Get session history
app.get("/api/session/history", (req, res) => {
  if (!sessionManager) {
    return res.json([]);
  }
  const limit = parseInt(req.query.limit) || 20;
  res.json(sessionManager.getHistory(limit));
});

// Clear session (logout)
app.post("/api/session/clear", (req, res) => {
  if (!sessionManager) {
    return res.status(500).json({ error: 'Session manager not loaded' });
  }
  sessionManager.clearAuth();
  pairingState.status = 'waiting';
  pairingState.connectedNumber = null;
  res.json({ success: true, message: 'Session cleared. Ready for new pairing.' });
});

// Get error logs
app.get("/api/logs/errors", (req, res) => {
  if (!errorLog) {
    return res.json([]);
  }
  const limit = parseInt(req.query.limit) || 50;
  const source = req.query.source || null;
  res.json(errorLog.getRecent(limit, source));
});

// Get error stats
app.get("/api/logs/errors/stats", (req, res) => {
  if (!errorLog) {
    return res.json({ total: 0 });
  }
  res.json(errorLog.getStats());
});

// Get activity logs
app.get("/api/logs/activity", (req, res) => {
  if (!activityLog) {
    return res.json([]);
  }
  const limit = parseInt(req.query.limit) || 100;
  const type = req.query.type || null;
  res.json(activityLog.getRecent(limit, type));
});

// Get command stats
app.get("/api/logs/commands/stats", (req, res) => {
  if (!activityLog) {
    return res.json({ total: 0, byCommand: [] });
  }
  res.json(activityLog.getCommandStats());
});

// Get session logs
app.get("/api/logs/sessions", (req, res) => {
  if (!sessionLog) {
    return res.json([]);
  }
  const limit = parseInt(req.query.limit) || 50;
  res.json(sessionLog.getRecent(limit));
});

// Get pairing logs
app.get("/api/logs/pairing", (req, res) => {
  if (!pairingLog) {
    return res.json([]);
  }
  const limit = parseInt(req.query.limit) || 50;
  res.json(pairingLog.getRecent(limit));
});

// Get pairing stats
app.get("/api/logs/pairing/stats", (req, res) => {
  if (!pairingLog) {
    return res.json({ total: 0 });
  }
  res.json(pairingLog.getStats());
});

// Clear logs
app.post("/api/logs/clear", (req, res) => {
  const { type } = req.body;
  try {
    if (type === 'errors' && errorLog) errorLog.clear();
    else if (type === 'activity' && activityLog) activityLog.clear();
    else if (type === 'sessions' && sessionLog) sessionLog.clear();
    else if (type === 'pairing' && pairingLog) pairingLog.clear();
    else if (type === 'all') {
      if (errorLog) errorLog.clear();
      if (activityLog) activityLog.clear();
      if (sessionLog) sessionLog.clear();
      if (pairingLog) pairingLog.clear();
    }
    res.json({ success: true, message: `${type} logs cleared` });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* =========================
   STATIC PAGES
========================= */

app.get("/", (_, res) => {
  res.sendFile(path.join(WEBSITE_DIR, "index.html"));
});

app.get("/admin", (_, res) => {
  res.sendFile(path.join(WEBSITE_DIR, "admin.html"));
});

app.get("/login", (_, res) => {
  res.sendFile(path.join(WEBSITE_DIR, "login.html"));
});

app.get("/link", (_, res) => {
  res.sendFile(path.join(WEBSITE_DIR, "link.html"));
});

app.get("/health", (_, res) => {
  res.json({ status: "ok", uptime: process.uptime(), time: Date.now() });
});

/* =========================
   KEEP-ALIVE SYSTEM
   Prevents Render from sleeping due to inactivity
========================= */
const RENDER_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
const PING_INTERVAL = 4 * 60 * 1000; // Ping every 4 minutes (Render sleeps after 15 min inactivity)

let pingCount = 0;
let lastPingTime = null;

const keepAlive = async () => {
  try {
    const response = await fetch(`${RENDER_URL}/health`);
    const data = await response.json();
    pingCount++;
    lastPingTime = new Date().toISOString();
    console.log(`💓 Keep-alive ping #${pingCount} successful at ${lastPingTime}`);
  } catch (error) {
    console.error(`❌ Keep-alive ping failed:`, error.message);
  }
};

// Start keep-alive pings after server starts
const startKeepAlive = () => {
  console.log(`🔄 Starting keep-alive system (pinging every ${PING_INTERVAL / 1000}s)`);
  setInterval(keepAlive, PING_INTERVAL);
  // Initial ping after 30 seconds
  setTimeout(keepAlive, 30000);
};

// Keep-alive status endpoint
app.get("/api/keepalive/status", (_, res) => {
  res.json({
    enabled: true,
    pingInterval: PING_INTERVAL,
    pingCount,
    lastPingTime,
    uptime: process.uptime(),
    renderUrl: RENDER_URL
  });
});

// Manual ping endpoint
app.get("/api/ping", async (_, res) => {
  await keepAlive();
  res.json({ success: true, pingCount, lastPingTime });
});

app.listen(PORT, () => {
  console.log(`🚀 SCHOLAR MD Server running on port ${PORT}`);
  console.log(`🌐 URL: ${RENDER_URL}`);
  startKeepAlive();
});

export default app;
