import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} from "@whiskeysockets/baileys";
import P from "pino";
import fs from "fs";

let sock = null;
let latestPairingCode = null;
let isConnecting = false;

// ===============================
// START BOT
// ===============================
export async function startBot(phoneNumber = null) {
  if (isConnecting) return sock;
  isConnecting = true;

  const { state, saveCreds } = await useMultiFileAuthState("auth_info");
  const { version } = await fetchLatestBaileysVersion();

  sock = makeWASocket({
    version,
    logger: P({ level: "silent" }),
    auth: state,
    browser: ["SCHOLAR MD", "Chrome", "1.0.0"],
    printQRInTerminal: false
  });

  sock.ev.on("creds.update", saveCreds);

  // ===============================
  // PAIRING CODE GENERATION
  // ===============================
  if (!state.creds.registered && phoneNumber) {
    try {
      latestPairingCode = await sock.requestPairingCode(phoneNumber);
      console.log("PAIRING CODE:", latestPairingCode);
    } catch (err) {
      console.error("Failed to generate pairing code:", err.message);
    }
  }

  // ===============================
  // CONNECTION HANDLING
  // ===============================
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "open") {
      console.log("✅ WhatsApp connected");
      latestPairingCode = null;
      isConnecting = false;
    }

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !==
        DisconnectReason.loggedOut;

      console.log("❌ Connection closed");

      if (shouldReconnect) {
        isConnecting = false;
        startBot();
      } else {
        console.log("Logged out. Delete auth_info to relink.");
      }
    }
  });

  // ===============================
  // MESSAGE HANDLER (SAFE BASE)
  // ===============================
  sock.ev.on("messages.upsert", async ({ messages }) => {
    try {
      const msg = messages[0];
      if (!msg.message || msg.key.fromMe) return;

      const from = msg.key.remoteJid;
      const text =
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text;

      if (!text) return;

      // BASIC HEALTH CHECK COMMAND
      if (text === ".alive") {
        await sock.sendMessage(from, {
          text: "✅ SCHOLAR MD is running"
        });
      }

      // PLACEHOLDER FOR YOUR COMMAND SYSTEM
      // (menus, admin, premium, anti-features etc. stay intact)

    } catch (err) {
      console.error("Message error:", err.message);
    }
  });

  return sock;
}

// ===============================
// PAIRING CODE ACCESSOR
// ===============================
export function getLatestPairingCode() {
  return latestPairingCode;
}
