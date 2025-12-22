const express = require("express");
const path = require("path");
const { startBot, getLatestPairingCode } = require("./bot");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, "public")));

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
// PAIRING API (GENERATES NEW CODE EACH REQUEST)
// ===============================
app.post("/api/pair", async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone || !/^\d{10,15}$/.test(phone)) {
      return res.status(400).json({ error: "Invalid phone number" });
    }

    // Force pairing mode → new code every time
    await startBot(phone, true);

    setTimeout(() => {
      const code = getLatestPairingCode();

      if (!code) {
        return res.status(500).json({ error: "Pairing code not ready" });
      }

      res.json({ code });
    }, 2500);

  } catch (err) {
    console.error("Pairing error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

module.exports = app;
