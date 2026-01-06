 url=https://github.com/briantechspace/scholar-md/blob/d4920cb4e0f88355bcfcdc87a800b328db25d60f/server.js
import fs from "fs";
import path from "path";
import express from "express";
import qrcode from "qrcode";
import { Client, LocalAuth } from "whatsapp-web.js";

const PORT = process.env.PORT || 3000;
const STATIC_DIR = path.resolve("./public");
const SESSIONS_DIR = path.resolve("./sessions");

// Ensure sessions directory exists for LocalAuth persistence
if (!fs.existsSync(SESSIONS_DIR)) {
  fs.mkdirSync(SESSIONS_DIR, { recursive: true });
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(STATIC_DIR));

/*
  Pairing flow implemented here:

  - GET  /pair
      Creates a one-time pairing code and starts a WhatsApp client
      (whatsapp-web.js) that uses LocalAuth with clientId set to the code.
      The client will emit a QR string which we convert to a PNG data URL
      and store in memory for retrieval.

  - GET  /pair/:code/qr
      Returns PNG image of the QR code for the pairing code (if available).

  - GET  /pair/:code/status
      Returns JSON status: { status: "pending"|"connected"|"failed", connectedNumber?: "...", message?: "..." }

  Notes:
  - Sessions persist to ./sessions (LocalAuth) so once paired the bot will auto-reconnect.
  - You must install dependencies and have the environment required by whatsapp-web.js (Chromium or Puppeteer).
*/

const pairings = new Map(); // code => { client, status, qrDataUrl, connectedNumber, lastError, createdAt }

// utility to generate short pairing codes
function generatePairCode(len = 8) {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

function makeClientForCode(code) {
  // create client with LocalAuth clientId so credentials are stored under sessions/<clientId>
  const client = new Client({
    authStrategy: new LocalAuth({ clientId: code, dataPath: SESSIONS_DIR }),
    puppeteer: {
      headless: true,
      // optional: you can tune args if you're on a serverless host
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
  });

  // state
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
      const dataUrl = await qrcode.toDataURL(qr, { margin: 1, width: 300 });
      const p = pairings.get(code);
      if (p) {
        p.qrDataUrl = dataUrl;
        p.status = "qr";
        p.lastError = null;
      }
      console.log(`[pair:${code}] QR received.`);
    } catch (err) {
      console.error(`[pair:${code}] Failed to convert QR:`, err);
      const p = pairings.get(code);
      if (p) p.lastError = String(err);
    }
  });

  client.on("ready", () => {
    const p = pairings.get(code);
    if (p) {
      p.status = "connected";
      p.lastError = null;
    }
    console.log(`[pair:${code}] WhatsApp client ready.`);
  });

  client.on("authenticated", () => {
    const p = pairings.get(code);
    if (p) {
      p.status = "authenticated";
    }
    console.log(`[pair:${code}] authenticated.`);
  });

  client.on("auth_failure", (msg) => {
    const p = pairings.get(code);
    if (p) {
      p.status = "failed";
      p.lastError = `auth_failure: ${msg}`;
    }
    console.error(`[pair:${code}] auth failure: ${msg}`);
  });

  client.on("disconnected", (reason) => {
    const p = pairings.get(code);
    if (p) {
      p.status = "disconnected";
      p.lastError = `disconnected: ${reason}`;
    }
    console.warn(`[pair:${code}] disconnected: ${reason}`);
    // client.destroy(); // keep LocalAuth files for re-init if desired
  });

  // basic incoming message handler (customize as needed)
  client.on("message", async (message) => {
    console.log(`[pair:${code}] message from ${message.from}: ${message.body}`);
    // Example automatic reply:
    // if (message.body.toLowerCase().includes("hi")) {
    //   await client.sendMessage(message.from, "Hello! This is the bot.");
    // }
  });

  // initialize (start puppeteer & session flow)
  client.initialize().catch((err) => {
    const p = pairings.get(code);
    if (p) {
      p.status = "failed";
      p.lastError = String(err);
    }
    console.error(`[pair:${code}] failed to initialize client:`, err);
  });

  return client;
}

// Create a new pairing code and start client
app.get("/pair", (req, res) => {
  const code = generatePairCode(8);
  // create a client for this code
  makeClientForCode(code);

  res.json({
    code,
    qr_url: `/pair/${code}/qr`,
    status_url: `/pair/${code}/status`,
    note: "Fetch the QR at qr_url and scan it with WhatsApp (use WhatsApp mobile -> Settings -> Linked Devices -> Link a Device). The session will be persisted to ./sessions.",
  });
});

// Return QR PNG (image/png)
app.get("/pair/:code/qr", (req, res) => {
  const code = req.params.code;
  const p = pairings.get(code);
  if (!p) {
    res.status(404).json({ error: "pairing code not found" });
    return;
  }
  if (!p.qrDataUrl) {
    res.status(202).json({ status: p.status, message: "QR not ready yet. Check status endpoint." });
    return;
  }
  // data URL: data:image/png;base64,.... -> extract base64 and send
  const matches = p.qrDataUrl.match(/^data:image\/png;base64,(.+)$/);
  if (!matches) {
    res.status(500).json({ error: "QR image not available" });
    return;
  }
  const buffer = Buffer.from(matches[1], "base64");
  res.setHeader("Content-Type", "image/png");
  res.setHeader("Cache-Control", "no-store");
  res.send(buffer);
});

// Return pairing status
app.get("/pair/:code/status", (req, res) => {
  const code = req.params.code;
  const p = pairings.get(code);
  if (!p) {
    res.status(404).json({ error: "pairing code not found" });
    return;
  }
  res.json({
    status: p.status,
    createdAt: new Date(p.createdAt).toISOString(),
    lastError: p.lastError,
    connectedNumber: p.connectedNumber,
  });
});

// Existing routes from original server.js preserved
app.get("/", (req, res) => {
  const file = path.join(STATIC_DIR, "link.html");
  if (fs.existsSync(file)) {
    res.setHeader("Content-Type", "text/html");
    return res.sendFile(file);
  }
  res.status(404).send("link.html not found");
});

app.get("/admin/login", (req, res) => {
  const file = path.join(STATIC_DIR, "login.html");
  if (fs.existsSync(file)) return res.sendFile(file);
  res.status(404).send("login.html not found");
});

app.get("/admin", (req, res) => {
  const file = path.join(STATIC_DIR, "admin.html");
  if (fs.existsSync(file)) return res.sendFile(file);
  res.status(404).send("admin.html not found");
});

// Optional: simple health check
app.get("/health", (req, res) => res.json({ status: "ok", time: Date.now() }));

app.use((req, res) => {
  res.status(404).send("Not Found");
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`Pairing endpoints: GET /pair  -> create; GET /pair/:code/qr -> QR image; GET /pair/:code/status -> status`);
});
