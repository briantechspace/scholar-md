import makeWASocket, { useMultiFileAuthState, DisconnectReason } from "@whiskeysockets/baileys";
import Pino from "pino";
import fs from "fs";
import { config } from "./config.js";
import { store } from "./store.js";

const USERS = "./users.json";
const ANALYTICS = "./analytics.json";

/**
 * Safe read that returns defaultValue and creates the file if missing/corrupt.
 */
const safeRead = (f, defaultValue = {}) => {
  try {
    const raw = fs.readFileSync(f, "utf8");
    return JSON.parse(raw || "{}");
  } catch (e) {
    try {
      fs.writeFileSync(f, JSON.stringify(defaultValue, null, 2));
    } catch (writeErr) {
      // ignore
    }
    return defaultValue;
  }
};

const write = (f, d) => fs.writeFileSync(f, JSON.stringify(d, null, 2));

function nowEAT() {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: config.timezone })
  );
}

export async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info");

  const sock = makeWASocket({
    auth: state,
    logger: Pino({ level: "silent" }),
    printQRInTerminal: true
  });

  // Persist credentials when they change
  sock.ev.on("creds.update", saveCreds);

  // Connection and pairing handling
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;
    const a = safeRead(ANALYTICS, { connected: false });

    // If a QR is emitted, persist it so an external pairing bridge/UI can fetch it.
    if (qr) {
      a.qr = qr;
      a.qrUpdatedAt = new Date().toISOString();
      // Keep a small hint in logs; printQRInTerminal is still true so terminal will show QR.
      console.log("Pairing QR generated (also saved to analytics.json).");
    }

    if (connection === "open") {
      a.connected = true;
    }

    if (connection === "close") {
      a.connected = false;
      // Save lastDisconnect for debugging/observability
      a.lastDisconnect = lastDisconnect ? (lastDisconnect.error ? String(lastDisconnect.error) : JSON.stringify(lastDisconnect)) : null;

      // If we were logged out from WhatsApp, clear local auth so a fresh pairing can occur.
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      if (!shouldReconnect) {
        console.log("Logged out. Clearing auth_info so a fresh pairing can be performed.");
        try {
          fs.rmSync("auth_info", { recursive: true, force: true });
        } catch (err) {
          console.error("Failed clearing auth_info:", err);
        }
      }
    }

    write(ANALYTICS, a);
  });

  // Message handling
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg?.message || msg.key.fromMe) return;

    const sender = msg.key.participant || msg.key.remoteJid;
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
    if (!text) return;

    const users = safeRead(USERS, {});
    const now = nowEAT();

    if (!users[sender]) {
      users[sender] = {
        freeUntil: new Date(now.getTime() + 3*24*60*60*1000).toISOString(),
        premiumUntil: null
      };
    }

    const user = users[sender];

    if (
      (!user.premiumUntil || now > new Date(user.premiumUntil)) &&
      now > new Date(user.freeUntil)
    ) {
      await sock.sendMessage(sender, {
        text: "❌ Free plan expired. Use .addprem to upgrade."
      });
      write(USERS, users);
      return;
    }

    if (text === ".menu") {
      await sock.sendMessage(sender, {
        text: `${config.botName}\n${config.edition}\nType .help`
      });
    }

    if (text === ".help") {
      await sock.sendMessage(sender, {
        text: "Use .menu to see commands.\nFree: 3 days\nPremium: 50 KES / 30 days"
      });
    }

    write(USERS, users);
  });
}
