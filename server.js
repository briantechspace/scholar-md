const fs = require("fs");
const path = require("path");
const express = require("express");
const qrcode = require("qrcode");
const { Client, LocalAuth } = require("whatsapp-web.js");

const PORT = process.env.PORT || 3000;
const STATIC_DIR = path.resolve(__dirname, "public");
const SESSIONS_DIR = path.resolve(__dirname, "sessions");

// Ensure sessions directory exists
if (!fs.existsSync(SESSIONS_DIR)) {
  fs.mkdirSync(SESSIONS_DIR, { recursive: true });
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(STATIC_DIR));

/* =========================
   PAIRING STATE
========================= */

const pairings = new Map();

function generatePairCode(len = 8) {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < len; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

function makeClientForCode(code) {
  const client = new Client({
    authStrategy: new LocalAuth({
      clientId: code,
      dataPath: SESSIONS_DIR,
    }),
    puppeteer: {
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
  });

  pairings.set(code, {
    client,
    status: "initializing",
    qrDataUrl: null,
    connectedNumber: null,
    lastError: null,
    createdAt: Date.now(),
  });

  client.on("qr", async (qr) => {
    try {
      const dataUrl = await qrcode.toDataURL(qr, { width: 300, margin: 1 });
      const p = pairings.get(code);
      if (p) {
        p.qrDataUrl = dataUrl;
        p.status = "qr";
      }
      console.log(`[pair:${code}] QR generated`);
    } catch (err) {
      console.error("QR error:", err);
    }
  });

  client.on("ready", () => {
    const p = pairings.get(code);
    if (p) p.status = "connected";
    console.log(`[pair:${code}] READY`);
  });

  client.on("authenticated", () => {
    const p = pairings.get(code);
    if (p) p.status = "authenticated";
    console.log(`[pair:${code}] AUTHENTICATED`);
  });

  client.on("auth_failure", (msg) => {
    const p = pairings.get(code);
    if (p) {
      p.status = "failed";
      p.lastError = msg;
    }
    console.error(`[pair:${code}] AUTH FAILURE`, msg);
  });

  client.on("disconnected", (reason) => {
    const p = pairings.get(code);
    if (p) {
      p.status = "disconnected";
      p.lastError = reason;
    }
    console.warn(`[pair:${code}] DISCONNECTED`, reason);
  });

  client.initialize().catch((err) => {
    const p = pairings.get(code);
    if (p) {
      p.status = "failed";
      p.lastError = err.message;
    }
    console.error("INIT ERROR:", err);
  });

  return client;
}

/* =========================
   ROUTES
========================= */

app.get("/pair", (req, res) => {
  const code = generatePairCode();
  makeClientForCode(code);

  res.json({
    code,
    qr_url: `/pair/${code}/qr`,
    status_url: `/pair/${code}/status`,
  });
});

app.get("/pair/:code/qr", (req, res) => {
  const p = pairings.get(req.params.code);
  if (!p) return res.status(404).json({ error: "Invalid code" });
  if (!p.qrDataUrl) return res.status(202).json({ status: p.status });

  const base64 = p.qrDataUrl.split(",")[1];
  const buffer = Buffer.from(base64, "base64");

  res.set("Content-Type", "image/png");
  res.set("Cache-Control", "no-store");
  res.send(buffer);
});

app.get("/pair/:code/status", (req, res) => {
  const p = pairings.get(req.params.code);
  if (!p) return res.status(404).json({ error: "Invalid code" });

  res.json({
    status: p.status,
    createdAt: new Date(p.createdAt).toISOString(),
    lastError: p.lastError,
  });
});

/* =========================
   STATIC PAGES
========================= */

app.get("/", (_, res) => {
  const file = path.join(STATIC_DIR, "link.html");
  fs.existsSync(file) ? res.sendFile(file) : res.send("OK");
});

app.get("/admin", (_, res) => {
  const file = path.join(STATIC_DIR, "admin.html");
  fs.existsSync(file) ? res.sendFile(file) : res.send("Admin OK");
});

app.get("/health", (_, res) => {
  res.json({ status: "ok", time: Date.now() });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
