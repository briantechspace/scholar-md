import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { startBot, getLatestPairingCode } from "./bot.js";

const app = express();
const PORT = process.env.PORT || 3000;

// ===============================
// PATH SETUP (ESM SAFE)
// ===============================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===============================
// MIDDLEWARE
// ===============================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// ===============================
// GLOBAL BOT START (NO PAIRING)
// ===============================
// This keeps the bot alive after first link
startBot();

// ===============================
// PAIRING API (USED BY link.html)
// ===============================
app.post("/api/pair", async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone || !/^\d{10,15}$/.test(phone)) {
      return res.status(400).json({
        error: "Invalid phone number format"
      });
    }

    // Start bot in pairing mode
    await startBot(phone);

    // Give Baileys time to generate code
    setTimeout(() => {
      const code = getLatestPairingCode();

      if (!code) {
        return res.status(500).json({
          error: "Pairing code not ready. Try again."
        });
      }

      return res.json({ code });
    }, 2500);

  } catch (err) {
    console.error("Pairing error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ===============================
// ROUTES
// ===============================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "link.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

// ===============================
// HEALTH CHECK
// ===============================
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "SCHOLAR MD",
    uptime: process.uptime()
  });
});

// ===============================
// START SERVER
// ===============================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
