const express = require("express");
const path = require("path");
const { initSocket, generatePairingCode } = require("./bot");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Initialize socket ONCE
initSocket();

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "link.html"));
});

app.post("/api/pair", async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone || !/^\d{10,15}$/.test(phone)) {
      return res.status(400).json({ error: "Invalid phone number" });
    }

    const code = await generatePairingCode(phone);
    res.json({ code });

  } catch (err) {
    console.error("Pairing error:", err.message);
    res.status(500).json({ error: "Failed to generate pairing code" });
  }
});

module.exports = app;
