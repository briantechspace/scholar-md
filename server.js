import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import QRCode from "qrcode";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const STATIC_DIR = path.resolve(__dirname, "public");
const ANALYTICS = "./analytics.json";
const USERS = "./users.json";
const PAYMENTS = "./payments.json";
const ADMINS = "./admins.json";

const safeRead = (f, defaultValue = {}) => {
  try {
    const raw = fs.readFileSync(f, "utf8");
    return JSON.parse(raw || "{}");
  } catch (e) {
    try {
      fs.writeFileSync(f, JSON.stringify(defaultValue, null, 2));
    } catch (writeErr) {}
    return defaultValue;
  }
};

const write = (f, d) => fs.writeFileSync(f, JSON.stringify(d, null, 2));

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(STATIC_DIR));

// Store pairing state globally so bot.js can update it
export const pairingState = {
  qr: null,
  qrDataUrl: null,
  pairingCode: null,
  status: "disconnected",
  connectedNumber: null,
  lastUpdated: null,
  requestedPhone: null,
  pairingRequested: false
};

/* =========================
   API ROUTES
========================= */

// Get current connection status and QR
app.get("/api/status", async (req, res) => {
  const analytics = safeRead(ANALYTICS, { connected: false });
  
  res.json({
    status: analytics.connected ? "connected" : pairingState.status,
    qrDataUrl: pairingState.qrDataUrl,
    pairingCode: pairingState.pairingCode,
    connectedNumber: pairingState.connectedNumber,
    lastUpdated: pairingState.lastUpdated
  });
});

// Request pairing code for a phone number
app.post("/api/pair/request", async (req, res) => {
  const { phone } = req.body;
  
  if (!phone) {
    return res.status(400).json({ error: "Phone number required" });
  }
  
  // Clean phone number
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  
  if (cleanPhone.length < 10) {
    return res.status(400).json({ error: "Invalid phone number" });
  }
  
  // Store request - bot.js will handle actual pairing
  pairingState.requestedPhone = cleanPhone;
  pairingState.pairingRequested = true;
  pairingState.lastUpdated = new Date().toISOString();
  
  res.json({ 
    success: true, 
    message: "Pairing initiated. Check status for QR or pairing code.",
    phone: cleanPhone
  });
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
  const admins = safeRead(ADMINS, { main: { username: "admin", passwordHash: "" } });
  
  // Simple check (in production use bcrypt.compare)
  if (username === admins.main?.username && password === "scholar2024") {
    res.json({ success: true, token: "admin-session-token" });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

// Get analytics/stats
app.get("/api/analytics", (req, res) => {
  const analytics = safeRead(ANALYTICS, {});
  const users = safeRead(USERS, {});
  const payments = safeRead(PAYMENTS, []);
  
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
    revenue: payments.reduce((sum, p) => sum + (p.amount || 0), 0)
  });
});

// Get users list
app.get("/api/users", (req, res) => {
  const users = safeRead(USERS, {});
  const userList = Object.entries(users).map(([jid, data]) => ({
    jid,
    phone: jid.split("@")[0],
    ...data
  }));
  res.json(userList);
});

// M-Pesa callback endpoint
app.post("/api/mpesa/callback", (req, res) => {
  console.log("M-Pesa Callback:", JSON.stringify(req.body, null, 2));
  
  const { Body } = req.body;
  if (Body?.stkCallback) {
    const { ResultCode, ResultDesc, CallbackMetadata } = Body.stkCallback;
    
    if (ResultCode === 0 && CallbackMetadata) {
      const items = CallbackMetadata.Item || [];
      const payment = {
        timestamp: new Date().toISOString(),
        amount: items.find(i => i.Name === "Amount")?.Value,
        phone: items.find(i => i.Name === "PhoneNumber")?.Value,
        receipt: items.find(i => i.Name === "MpesaReceiptNumber")?.Value,
        status: "success"
      };
      
      const payments = safeRead(PAYMENTS, []);
      payments.push(payment);
      write(PAYMENTS, payments);
      
      // Upgrade user to premium
      if (payment.phone) {
        const users = safeRead(USERS, {});
        const userJid = `${payment.phone}@s.whatsapp.net`;
        if (users[userJid]) {
          users[userJid].premiumUntil = new Date(Date.now() + 30*24*60*60*1000).toISOString();
          write(USERS, users);
        }
      }
    }
  }
  
  res.json({ ResultCode: 0, ResultDesc: "Success" });
});

/* =========================
   STATIC PAGES
========================= */

app.get("/", (_, res) => {
  res.sendFile(path.join(STATIC_DIR, "link.html"));
});

app.get("/admin", (_, res) => {
  res.sendFile(path.join(STATIC_DIR, "admin.html"));
});

app.get("/login", (_, res) => {
  res.sendFile(path.join(STATIC_DIR, "login.html"));
});

app.get("/health", (_, res) => {
  res.json({ status: "ok", uptime: process.uptime(), time: Date.now() });
});

app.listen(PORT, () => {
  console.log(`🚀 SCHOLAR MD Server running on port ${PORT}`);
});

export default app;
